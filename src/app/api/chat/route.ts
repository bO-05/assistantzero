import { NextRequest } from 'next/server';
import {
  streamText,
  type UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  stepCountIs,
  generateId,
} from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { setAIContext } from '@auth0/ai-vercel';
import { errorSerializer, withInterruptions } from '@auth0/ai-vercel/interrupts';

import { exaSearchTool } from '@/lib/tools/exa';
import { getUserInfoTool } from '@/lib/tools/user-info';
import { gmailDraftTool, gmailSearchTool, gmailSendTool } from '@/lib/tools/gmail';
import { getCalendarEventsTool, createCalendarEventTool } from '@/lib/tools/google-calender';
import { shopOnlineTool } from '@/lib/tools/shop-online';
import { getContextDocumentsTool } from '@/lib/tools/context-docs';
import { auth0 } from '@/lib/auth0';
import { AuditLogger, type AuditContext } from '@/lib/audit/logger';
import { assessRisk } from '@/lib/risk/assessor';
import { ensureDefaultWorkspace } from '@/lib/workspaces/helpers';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema/chat-messages';

const date = new Date().toISOString();
const mistralModelId = process.env.MISTRAL_CHAT_MODEL ?? 'mistral-small-latest';

const AGENT_SYSTEM_TEMPLATE = `You are a personal assistant named Assistant0. You are a helpful assistant that can answer questions and help with tasks.

You have access to a set of tools. When using tools, you MUST provide valid JSON arguments. Always format tool call arguments as proper JSON objects.
For example, when calling shop_online tool, format like this:
{"product": "iPhone", "qty": 1, "priceLimit": 1000}

Use the tools as needed to answer the user's question. Render the email body as a markdown block, do not wrap it in code blocks.

**CRITICAL Tool Usage Rules:**
- When user asks about emails (read, search, find), use gmailSearchTool to search Gmail
- When user asks to send an email or draft an email, use gmailDraftTool - this creates a draft ready to send
- When user asks to CREATE or SCHEDULE a calendar event/meeting, use createCalendarEventTool - this actually creates the event
- When user asks to CHECK calendar events, use getCalendarEventsTool - this only reads events
- After creating a draft email, tell the user: "I've created a draft email in your Gmail. Please review and click Send when ready."

**CRITICAL RESPONSE RULES:**
- ALWAYS provide a detailed response after using tools
- NEVER end your turn immediately after a tool call - always explain what you found or did
- When searching emails, summarize the results and ask if the user wants you to proceed
- Chain multiple tool calls when needed to complete a complex task

**Important Security Notes:**
- If a tool response includes { "status": "requires_step_up" }, explain to the user that Auth0 Guardian/WebAuthn verification is required, instruct them to approve the request, and wait for their confirmation before retrying. Do not attempt to run that tool again automatically.
- If you encounter an error about "Token Vault" or "google-oauth2", it means the user needs to connect their Google account first. A popup will appear to guide them through the authorization process. DO NOT retry the tool call - wait for them to complete the authorization.
- When appropriate, let the user know that the action has been logged in Mission Control for auditability.

Today is ${date}.`;

const TOOL_AGENT_ROLES: Record<string, string> = {
  exaSearchTool: 'knowledge-agent',
  getUserInfoTool: 'profile-agent',
  gmailSearchTool: 'communication-agent',
  gmailDraftTool: 'communication-agent',
  // gmailSendTool: 'communication-agent', - Disabled due to OAuth issues
  getCalendarEventsTool: 'scheduler-agent',
  createCalendarEventTool: 'scheduler-agent',
  shopOnlineTool: 'commerce-agent',
  getContextDocumentsTool: 'knowledge-agent',
};

function createAuditedTools(toolDefinitions: Record<string, any>, baseContext: AuditContext) {
  return Object.fromEntries(
    Object.entries(toolDefinitions).map(([toolName, definition]) => {
      const agentRole = TOOL_AGENT_ROLES[toolName] ?? 'generalist-agent';
      const originalExecute = definition.execute?.bind(definition);

      return [
        toolName,
        {
          ...definition,
          execute: async (...args: any[]) => {
            const input = args[0];
            const logger = new AuditLogger(baseContext);
            const risk = await assessRisk(toolName, input, { userId: baseContext.userId });

            await logger.logToolStart(toolName, input, agentRole, risk.level, risk.requiresStepUp);

            if (risk.requiresStepUp) {
              await logger.logAction('step_up_required', 'pending', {
                toolName,
                agentRole,
                inputs: input,
                riskScore: risk.level,
              });

              return {
                status: 'requires_step_up',
                message:
                  'This action was flagged as high risk and requires Auth0 Guardian verification. Approve the request and ask me to continue once you are done.',
                riskLevel: risk.level,
              };
            }

            try {
              const result = await originalExecute?.(...args);
              await logger.logToolSuccess(result);
              return result;
            } catch (error) {
              // Check if this is a TokenVaultInterrupt or other Auth0 interrupt
              // These should NOT be logged as errors - they're user prompts
              const errorName = (error as any)?.constructor?.name;
              if (errorName === 'TokenVaultInterrupt' || errorName === 'AccessDeniedInterrupt' || (error as any)?.__interrupt) {
                // This is an interrupt, not an error - let it bubble up to the interrupt handler
                throw error;
              }
              
              const errorMessage = (error as Error).message ?? 'Unknown error';
              await logger.logToolError(errorMessage, toolName);
              
              throw error;
            }
          },
        },
      ];
    }),
  );
}

/**
 * This handler initializes and calls a tool-calling agent with risk-aware auditing.
 */
export async function POST(req: NextRequest) {
  const { id, messages }: { id: string; messages: Array<UIMessage> } = await req.json();

  setAIContext({ threadID: id });

  const session = await auth0.getSession();
  const user = session?.user;

  let workspaceId: string | undefined;
  if (user?.sub && user.email) {
    const workspace = await ensureDefaultWorkspace(user.sub, user.email);
    workspaceId = workspace?.id;
  }

  // Save user message to database
  const lastMessage = messages[messages.length - 1];
  if (user?.sub && lastMessage?.role === 'user') {
    try {
      await db.insert(chatMessages).values({
        id: lastMessage.id || generateId(),
        userId: user.sub,
        threadId: id, // Use chat thread ID
        role: 'user',
        content: lastMessage as any, // Store full message
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to save user message:', error);
      // Don't block chat if save fails
    }
  }

  const baseTools = {
    exaSearchTool,
    getUserInfoTool,
    gmailSearchTool,
    gmailDraftTool,
    // gmailSendTool, - Disabled due to Token Vault OAuth issues
    getCalendarEventsTool,
    createCalendarEventTool,
    shopOnlineTool,
    getContextDocumentsTool,
  };

  const auditContext: AuditContext = {
    userId: user?.sub ?? 'anonymous',
    userEmail: user?.email ?? 'anonymous@example.com',
    workspaceId,
    threadId: id,
  };

  const auditedTools = createAuditedTools(baseTools, auditContext);

  const modelMessages = convertToModelMessages(messages);

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: withInterruptions(
      async ({ writer }) => {
        const result = streamText({
          model: mistral(mistralModelId),
          system: AGENT_SYSTEM_TEMPLATE,
          messages: modelMessages,
          tools: auditedTools as any,
          stopWhen: stepCountIs(10),
          onFinish: async (output) => {
            // Save assistant response to database
            if (user?.sub) {
              try {
                await db.insert(chatMessages).values({
                  id: generateId(),
                  userId: user.sub,
                  threadId: id,
                  role: 'assistant',
                  content: { parts: output.content } as any,
                  createdAt: new Date(),
                });
              } catch (error) {
                console.error('Failed to save assistant message:', error);
              }
            }

            if (output.finishReason === 'tool-calls') {
              const lastMessage = output.content[output.content.length - 1];
              if (lastMessage?.type === 'tool-error') {
                const { toolName, toolCallId, error, input } = lastMessage;
                const serializableError = {
                  cause: error,
                  toolCallId: toolCallId,
                  toolName: toolName,
                  toolArgs: input,
                };

                throw serializableError;
              }
            }
          },
        });

        writer.merge(
          result.toUIMessageStream({
            sendReasoning: true,
          }),
        );
      },
      {
        messages: messages,
        tools: auditedTools as any,
      },
    ),
    onError: errorSerializer((err) => {
      console.error('Chat error:', err);
      console.error('Error type:', (err as any)?.constructor?.name);
      console.error('Error message:', (err as Error)?.message);
      console.error('Is interrupt?:', (err as any)?.__interrupt);
      
      // Don't show generic error for interrupts
      const errorName = (err as any)?.constructor?.name;
      if (errorName === 'TokenVaultInterrupt' || errorName === 'AccessDeniedInterrupt') {
        return ''; // Interrupt will be handled by TokenVaultInterruptHandler
      }
      
      const errorMessage = (err as Error)?.message || 'An unknown error occurred';
      return `An error occurred: ${errorMessage}`;
    }),
  });

  return createUIMessageStreamResponse({ stream });
}
