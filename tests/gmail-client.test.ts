import { beforeEach, describe, expect, it, vi } from 'vitest';

const h = vi.hoisted(() => ({
  token: 'offline-fixture-token' as string | undefined,
  credentials: vi.fn(), client: vi.fn(),
  list: vi.fn(), get: vi.fn(), send: vi.fn(), draft: vi.fn(),
  threads: vi.fn(), thread: vi.fn(),
}));
vi.mock('@auth0/ai-vercel', () => ({ getAccessTokenFromTokenVault: () => h.token }));
vi.mock('googleapis', () => ({
  google: {
    auth: { OAuth2: class { setCredentials = h.credentials; } },
    gmail: h.client,
  },
}));
import {
  createGmailRawMessage, searchConnectedGmail, createConnectedGmailDraft, sendConnectedGmailMessage,
} from '@/lib/tools/gmail-client';

const message = {
  to: ['recipient@example.invalid'], subject: 'Offline fixture ✓',
  message: 'Fictional fixture body.\nNo message is sent by this test.',
};
beforeEach(() => {
  h.token = 'offline-fixture-token';
  vi.clearAllMocks();
  h.list.mockReset().mockResolvedValue({ data: { messages: [] } });
  h.get.mockReset();
  h.send.mockReset().mockResolvedValue({ data: { id: 'fixture-message-id' } });
  h.draft.mockReset().mockResolvedValue({ data: { id: 'fixture-draft-id' } });
  h.threads.mockReset().mockResolvedValue({ data: { threads: [] } });
  h.thread.mockReset();
  h.client.mockReturnValue({ users: {
    messages: { list: h.list, get: h.get, send: h.send },
    drafts: { create: h.draft },
    threads: { list: h.threads, get: h.thread },
  } });
});

describe('Gmail adapter, mocked provider only', () => {
  it('encodes a UTF-8 plain-text MIME body and folded Unicode subject without losing characters', () => {
    const subject = 'Fictional ✓ 📎 '.repeat(30);
    const raw = createGmailRawMessage({ ...message, subject, cc: ['copy@example.invalid'] });
    const mime = Buffer.from(raw, 'base64url').toString('utf8');
    const [headers, body] = mime.split('\r\n\r\n');
    const decodedSubject = [...headers.matchAll(/=\?UTF-8\?B\?([^?]+)\?=/g)]
      .map((match) => Buffer.from(match[1], 'base64').toString('utf8')).join('');
    expect(decodedSubject).toBe(subject);
    expect(Buffer.from(body.replace(/\r\n/g, ''), 'base64').toString('utf8')).toBe(message.message);
    expect(headers).toContain('Content-Type: text/plain; charset=UTF-8');
    expect(headers).toContain('Cc: copy@example.invalid');
    expect(headers.split('\r\n').every((line) => line.length <= 998)).toBe(true);
    expect(h.client).not.toHaveBeenCalled();
  });

  it.each([
    { ...message, to: ['*'] },
    { ...message, to: ['recipient@example.invalid\r\nBcc: other@example.invalid'] },
    { ...message, subject: 'Subject\r\nBcc: other@example.invalid' },
    { ...message, to: [] },
  ])('rejects invalid outgoing headers before constructing a provider client', async (input) => {
    await expect(sendConnectedGmailMessage(input)).rejects.toBeDefined();
    expect(h.client).not.toHaveBeenCalled();
    expect(h.credentials).not.toHaveBeenCalled();
    expect(h.send).not.toHaveBeenCalled();
  });

  it('requires a connected token before search, draft, or send', async () => {
    h.token = undefined;
    for (const action of [
      () => searchConnectedGmail({ query: 'fictional' }),
      () => createConnectedGmailDraft(message),
      () => sendConnectedGmailMessage(message),
    ]) await expect(action()).rejects.toThrow('Google connection required.');
    expect(h.client).not.toHaveBeenCalled();
    expect(h.credentials).not.toHaveBeenCalled();
  });

  it('keeps drafts separate from sends and returns only the mocked API response', async () => {
    expect(JSON.parse(await createConnectedGmailDraft(message))).toEqual({ id: 'fixture-draft-id' });
    expect(h.draft).toHaveBeenCalledWith({
      userId: 'me', requestBody: { message: { raw: createGmailRawMessage(message) } },
    });
    expect(h.send).not.toHaveBeenCalled();
  });

  it('submits only through the connected account and propagates provider failure', async () => {
    expect(JSON.parse(await sendConnectedGmailMessage(message))).toEqual({ id: 'fixture-message-id' });
    expect(h.send).toHaveBeenCalledWith({
      userId: 'me', requestBody: { raw: createGmailRawMessage(message) },
    });
    h.send.mockRejectedValueOnce(new Error('offline provider failure'));
    await expect(sendConnectedGmailMessage(message)).rejects.toThrow('offline provider failure');
  });

  it('searches with bounded results and decodes plain text without fetching attachments', async () => {
    h.list.mockResolvedValueOnce({ data: { messages: [{ id: 'fixture-mail' }] } });
    h.get.mockResolvedValueOnce({ data: {
      id: 'fixture-mail', threadId: 'fixture-thread', snippet: 'Fictional',
      payload: {
        mimeType: 'multipart/mixed', headers: [{ name: 'Subject', value: 'Fictional fixture' }],
        parts: [
          { mimeType: 'text/plain', body: { data: Buffer.from('Fixture body').toString('base64url') } },
          { mimeType: 'image/png', body: { data: Buffer.from('Not text').toString('base64url') } },
        ],
      },
    } });
    const result = JSON.parse(await searchConnectedGmail({ query: 'subject:fictional', maxResults: 2 }));
    expect(h.list).toHaveBeenCalledWith({ userId: 'me', q: 'subject:fictional', maxResults: 2 });
    expect(result[0]).toMatchObject({ id: 'fixture-mail', body: 'Fixture body', subject: 'Fictional fixture' });
    await expect(searchConnectedGmail({ query: '', maxResults: 1000 })).rejects.toBeDefined();
  });

  it('supports thread searches without sending or drafting', async () => {
    h.threads.mockResolvedValueOnce({ data: { threads: [{ id: 'fixture-thread' }] } });
    h.thread.mockResolvedValueOnce({ data: { id: 'fixture-thread', messages: [] } });
    expect(JSON.parse(await searchConnectedGmail({ query: 'fictional', resource: 'threads' })))
      .toEqual([{ id: 'fixture-thread', messages: [] }]);
    expect(h.send).not.toHaveBeenCalled();
    expect(h.draft).not.toHaveBeenCalled();
  });
});
