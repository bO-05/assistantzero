import { NextRequest } from 'next/server';
import {
  streamText,
  type UIMessage,
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
} from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { setAIContext } from '@auth0/ai-vercel';
import { errorSerializer, withInterruptions } from '@auth0/ai-vercel/interrupts';

import { exaSearchTool } from '@/lib/tools/exa';
import { getUserInfoTool } from '@/lib/tools/user-info';
import { gmailDraftTool, gmailSearchTool } from '@/lib/tools/gmail';
import { getCalendarEventsTool } from '@/lib/tools/google-calender';
import { shopOnlineTool } from '@/lib/tools/shop-online';
import { getContextDocumentsTool } from '@/lib/tools/context-docs';
import { auth0 } from '@/lib/auth0';
import { AuditLogger, type AuditContext } from '@/lib/audit/logger';
import { assessRisk } from '@/lib/risk/assessor';
import { ensureDefaultWorkspace } from '@/lib/workspaces/helpers';

const date = new Date().toISOString();
const mistralModelId = process.env.MISTRAL_CHAT_MODEL ?? 'mistral-small-latest';

const AGENT_SYSTEM_TEMPLATE = `You are a personal assistant named Assistant0. You are a helpful assistant that can answer questions and help with tasks.
You have access to a set of tools. When using tools, you MUST provide valid JSON arguments. Always format tool call arguments as proper JSON objects.
For example, when calling shop_online tool, format like this:
{"product": "iPhone", "qty": 1, "priceLimit": 1000}
Use the tools as needed to answer the user's question. Render the email body as a markdown block, do not wrap it in code blocks.
If a tool response includes { "status": "requires_step_up" }, explain to the user that Auth0 Guardian/WebAuthn verification is required, instruct them to approve the request, and wait for their confirmation before retrying. Do not attempt to run that tool again automatically.
When appropriate, let the user know that the action has been logged in Mission Control for auditability.
Today is ${date}.`;

const TOOL_AGENT_ROLES: Record<string, string> = {
  exaSearchTool: 'knowledge-agent',
  getUserInfoTool: 'profile-agent',
  gmailSearchTool: 'communication-agent',
  gmailDraftTool: 'communication-agent',
  getCalendarEventsTool: 'scheduler-agent',
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
              await logger.logToolError((error as Error).message ?? 'Unknown error', toolName);
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

  const baseTools = {
    exaSearchTool,
    getUserInfoTool,
    gmailSearchTool,
    gmailDraftTool,
    getCalendarEventsTool,
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
          onFinish: (output) => {
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
      console.log(err);
      return `An error occurred! ${(err as Error).message}`;
    }),
  });

  return createUIMessageStreamResponse({ stream });
}
