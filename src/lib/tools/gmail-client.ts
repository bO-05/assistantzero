import { google, type gmail_v1 } from 'googleapis';
import { getAccessTokenFromTokenVault } from '@auth0/ai-vercel';
import { z } from 'zod';

export const gmailSearchSchema = z.object({
  query: z.string().max(10000),
  maxResults: z.number().int().min(1).max(50).optional(),
  resource: z.enum(['messages', 'threads']).optional(),
});

export const gmailMessageSchema = z.object({
  message: z.string().min(1).max(1000000),
  to: z.array(z.string().trim().email().max(254)).min(1).max(100),
  subject: z.string().min(1).max(998).refine((value) => !/[\r\n]/.test(value), 'Invalid subject'),
  cc: z.array(z.string().trim().email().max(254)).max(100).optional(),
  bcc: z.array(z.string().trim().email().max(254)).max(100).optional(),
});

async function connectedGmail() {
  const accessToken = await getAccessTokenFromTokenVault();
  if (!accessToken) throw new Error('Google connection required.');
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: 'v1', auth });
}

function encodedSubject(subject: string) {
  const chunks: string[] = [];
  let current = '';
  for (const character of subject) {
    if (Buffer.byteLength(current + character, 'utf8') > 42) {
      chunks.push(current);
      current = '';
    }
    current += character;
  }
  if (current) chunks.push(current);
  return chunks.map((chunk) => `=?UTF-8?B?${Buffer.from(chunk, 'utf8').toString('base64')}?=`).join('\r\n ');
}

export function createGmailRawMessage(input: z.infer<typeof gmailMessageSchema>) {
  const message = gmailMessageSchema.parse(input);
  const headers = [
    `To: ${message.to.join(',\r\n ')}`,
    ...(message.cc?.length ? [`Cc: ${message.cc.join(',\r\n ')}`] : []),
    ...(message.bcc?.length ? [`Bcc: ${message.bcc.join(',\r\n ')}`] : []),
    `Subject: ${encodedSubject(message.subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
  ];
  const body = Buffer.from(message.message, 'utf8').toString('base64').match(/.{1,76}/g)?.join('\r\n') ?? '';
  return Buffer.from(headers.join('\r\n') + '\r\n\r\n' + body, 'utf8').toString('base64url');
}

function messageText(part: gmail_v1.Schema$MessagePart | undefined): string {
  if (!part) return '';
  if (part.mimeType === 'text/plain' && part.body?.data) return Buffer.from(part.body.data, 'base64url').toString('utf8');
  const plain = part.parts?.filter((item) => item.mimeType === 'text/plain') ?? [];
  const children = plain.length ? plain : (part.parts ?? []);
  const nested = children.map(messageText).filter(Boolean).join('\n');
  if (nested) return nested;
  return part.mimeType === 'text/html' && part.body?.data
    ? Buffer.from(part.body.data, 'base64url').toString('utf8')
    : '';
}

function summarizeMessage(message: gmail_v1.Schema$Message) {
  const header = (name: string) => message.payload?.headers?.find((item) => item.name?.toLowerCase() === name)?.value ?? '';
  return {
    id: message.id, threadId: message.threadId, snippet: message.snippet,
    subject: header('subject'), from: header('from'), to: header('to'),
    body: messageText(message.payload),
  };
}

export async function searchConnectedGmail(input: z.infer<typeof gmailSearchSchema>) {
  const args = gmailSearchSchema.parse(input);
  const gmail = await connectedGmail();
  const options = { userId: 'me', q: args.query, maxResults: args.maxResults ?? 10 };
  if (args.resource === 'threads') {
    const result = await gmail.users.threads.list(options);
    const threads = [];
    for (const thread of result.data.threads ?? []) {
      if (!thread.id) continue;
      const { data } = await gmail.users.threads.get({ userId: 'me', id: thread.id, format: 'full' });
      threads.push({ id: data.id, messages: data.messages?.map(summarizeMessage) ?? [] });
    }
    return JSON.stringify(threads);
  }
  const result = await gmail.users.messages.list(options);
  const messages = [];
  for (const message of result.data.messages ?? []) {
    if (!message.id) continue;
    const { data } = await gmail.users.messages.get({ userId: 'me', id: message.id, format: 'full' });
    messages.push(summarizeMessage(data));
  }
  return JSON.stringify(messages);
}

export async function createConnectedGmailDraft(input: z.infer<typeof gmailMessageSchema>) {
  const raw = createGmailRawMessage(input);
  const gmail = await connectedGmail();
  const result = await gmail.users.drafts.create({ userId: 'me', requestBody: { message: { raw } } });
  return JSON.stringify(result.data);
}

export async function sendConnectedGmailMessage(input: z.infer<typeof gmailMessageSchema>) {
  const raw = createGmailRawMessage(input);
  const gmail = await connectedGmail();
  const result = await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  return JSON.stringify(result.data);
}
