import { tool } from 'ai';
import { z } from 'zod';
import { GmailCreateDraft, GmailSearch, GmailSendMessage } from '@langchain/community/tools/gmail';

import { getAccessToken, withGoogleConnection } from '../auth0-ai';

// Provide the access token to the Gmail tools
const gmailParams = {
  credentials: {
    accessToken: getAccessToken,
  },
};

const gmailSearch = new GmailSearch(gmailParams);

export const gmailSearchTool = withGoogleConnection(
  tool({
    description: gmailSearch.description,
    inputSchema: z.object({
      query: z.string(),
      maxResults: z.number().optional(),
      resource: z.enum(['messages', 'threads']).optional(),
    }),
    execute: async (args) => {
      const result = await gmailSearch._call(args);
      return result;
    },
  }),
);

const gmailDraft = new GmailCreateDraft(gmailParams);

export const gmailDraftTool = withGoogleConnection(
  tool({
    description: 'Create a DRAFT email in Gmail that is NOT sent. Use this ONLY when the user explicitly asks to create a draft for review. DO NOT use this for sending emails - use gmailSendTool instead.',
    inputSchema: z.object({
      message: z.string(),
      to: z.array(z.string()),
      subject: z.string(),
      cc: z.array(z.string()).optional(),
      bcc: z.array(z.string()).optional(),
    }),
    execute: async (args) => {
      const result = await gmailDraft._call(args);
      return result;
    },
  }),
);

const gmailSend = new GmailSendMessage(gmailParams);

export const gmailSendTool = withGoogleConnection(
  tool({
    description: 'SEND an email message immediately through Gmail. Use this tool when the user asks to send, email, or message someone. This actually delivers the email to recipients. The email will be sent immediately.',
    inputSchema: z.object({
      message: z.string().describe('The body/content of the email'),
      to: z.array(z.string()).describe('Array of recipient email addresses'),
      subject: z.string().describe('The email subject line'),
      cc: z.array(z.string()).optional().describe('Optional CC recipients'),
      bcc: z.array(z.string()).optional().describe('Optional BCC recipients'),
    }),
    execute: async (args) => {
      const result = await gmailSend._call(args);
      return result;
    },
  }),
);
