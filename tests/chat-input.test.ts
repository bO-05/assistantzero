import { describe, expect, it } from 'vitest';
import { readChatInput } from '@/lib/chat-input';

const message = { id: 'fixture-message', role: 'user', parts: [{ type: 'text', text: 'Fictional fixture' }] };
function request(body: unknown) {
  return new Request('https://fixture.invalid/api/chat', {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
}
describe('bounded private chat input', () => {
  it('preserves normal text and tool-context fields for SDK validation', async () => {
    const body = { id: 'fixture-thread', messages: [message] };
    expect(await readChatInput(request(body))).toEqual(body);
  });
  it('bounds actual UTF-8 bytes even without a Content-Length header', async () => {
    await expect(readChatInput(request({
      id: 'fixture-thread', messages: [{ ...message, parts: [{ type: 'text', text: '✓'.repeat(50000) }] }],
    }))).rejects.toMatchObject({ status: 413 });
  });
  it('refuses oversized collection counts', async () => {
    await expect(readChatInput(request({ id: 'fixture-thread', messages: Array(41).fill(message) })))
      .rejects.toMatchObject({ status: 400 });
    await expect(readChatInput(request({
      id: 'fixture-thread', messages: [{ ...message, parts: Array(33).fill({ type: 'text', text: 'fixture' }) }],
    }))).rejects.toMatchObject({ status: 400 });
  });
  it('bounds nested arrays and depth before passing context to SDK validators', async () => {
    await expect(readChatInput(request({
      id: 'fixture-thread', messages: [{ ...message, metadata: { nested: Array(101).fill('fixture') } }],
    }))).rejects.toMatchObject({ status: 400 });
    let nested: unknown = 'fixture';
    for (let i = 0; i < 30; i++) nested = { nested };
    await expect(readChatInput(request({
      id: 'fixture-thread', messages: [{ ...message, metadata: nested }],
    }))).rejects.toMatchObject({ status: 400 });
  });
  it.each(['file', 'image'])('rejects %s parts before any model download', async (type) => {
    await expect(readChatInput(request({
      id: 'fixture-thread', messages: [{ ...message, parts: [{ type, url: 'https://example.invalid/fixture' }] }],
    }))).rejects.toMatchObject({ status: 400 });
  });
  it('rejects client system messages and non-JSON bodies', async () => {
    await expect(readChatInput(request({ id: 'fixture-thread', messages: [{ ...message, role: 'system' }] })))
      .rejects.toMatchObject({ status: 400 });
    await expect(readChatInput(new Request('https://fixture.invalid', { method: 'POST', body: 'fixture' })))
      .rejects.toMatchObject({ status: 415 });
  });
});
