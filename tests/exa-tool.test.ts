import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exaSearchTool } from '@/lib/tools/exa';
const fetchMock = vi.fn();
const options = { toolCallId: 'offline-fixture', messages: [] };
beforeEach(() => {
  vi.stubEnv('EXA_API_KEY', 'offline-fixture-key');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe('Exa transport, mocked HTTP only', () => {
  it('uses the fixed HTTPS search endpoint with bounded contents and no fabricated author', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ results: [
      { title: 'Fictional fixture', url: 'https://example.invalid/fixture', text: 'Fixture excerpt' },
    ] }), { status: 200 }));
    const result = await exaSearchTool.execute!({ query: 'fixture', numResults: 5, type: 'auto' }, options);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.exa.ai/search');
    expect(init.redirect).toBe('error');
    expect(JSON.parse(init.body)).toMatchObject({
      query: 'fixture', numResults: 5, contents: { text: { maxCharacters: 1000 } },
    });
    expect(result).toMatchObject({ numResults: 1, results: [{ author: null, publishedDate: null }] });
  });
  it('rejects oversized requests before HTTP', async () => {
    await expect(exaSearchTool.execute!({ query: 'fixture', numResults: 1000, type: 'auto' }, options))
      .rejects.toBeDefined();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('never claims results or exposes provider details on failure', async () => {
    fetchMock.mockRejectedValueOnce(new Error('private fixture detail'));
    const result = await exaSearchTool.execute!({ query: 'fixture', numResults: 1, type: 'auto' }, options);
    expect(result).toMatchObject({ error: 'Search is unavailable. No results were retrieved.', results: [] });
    expect(JSON.stringify(result)).not.toContain('private fixture detail');
  });
  it('refuses active-content result URLs', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      results: [{ title: 'Fictional fixture', url: 'javascript:alert(1)' }],
    })));
    const result = await exaSearchTool.execute!({ query: 'fixture', numResults: 1, type: 'auto' }, options);
    expect(result).toMatchObject({ results: [] });
  });
});
