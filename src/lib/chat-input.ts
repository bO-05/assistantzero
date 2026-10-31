import { z } from 'zod';

const MAX_CHAT_BYTES = 128 * 1024;
const inputSchema = z.object({
  id: z.string().min(1).max(191),
  messages: z.array(z.object({
    id: z.string().min(1).max(191),
    role: z.enum(['user', 'assistant']),
    parts: z.array(z.object({
      type: z.string().min(1).max(100).refine((type) => type !== 'file' && type !== 'image'),
    }).passthrough()).max(32),
  }).passthrough()).min(1).max(40),
});

export class ChatInputError extends Error {
  constructor(message: string, public readonly status: 400 | 413 | 415) { super(message); }
}

function checkCollectionBounds(input: unknown) {
  const stack = [{ value: input, depth: 0 }];
  let nodes = 0;
  while (stack.length) {
    const { value, depth } = stack.pop()!;
    if (++nodes > 5000 || depth > 24) throw new ChatInputError('Chat context is too complex.', 400);
    if (value && typeof value === 'object') {
      const children = Array.isArray(value) ? value : Object.values(value);
      if (children.length > 100) throw new ChatInputError('Chat collections are too large.', 400);
      for (const child of children) stack.push({ value: child, depth: depth + 1 });
    }
  }
}

export async function readChatInput(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
    throw new ChatInputError('Chat requests must use JSON.', 415);
  }
  if (Number(request.headers.get('content-length')) > MAX_CHAT_BYTES) {
    throw new ChatInputError('Chat request is too large. Start a new conversation.', 413);
  }
  const reader = request.body?.getReader();
  if (!reader) throw new ChatInputError('A chat request body is required.', 400);
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > MAX_CHAT_BYTES) {
      await reader.cancel().catch(() => undefined);
      throw new ChatInputError('Chat request is too large. Start a new conversation.', 413);
    }
    chunks.push(value);
  }
  try {
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    checkCollectionBounds(input);
    return inputSchema.parse(input);
  } catch {
    throw new ChatInputError('Invalid chat request. Use text messages and the document uploader for files.', 400);
  }
}
