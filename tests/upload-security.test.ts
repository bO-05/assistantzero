import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const h = vi.hoisted(() => ({
  session: vi.fn(), create: vi.fn(), parser: vi.fn(), text: vi.fn(), destroy: vi.fn(),
}));
vi.mock('@/lib/auth0', () => ({ auth0: { getSession: h.session } }));
vi.mock('@/lib/actions/documents', () => ({ createDocument: h.create }));
vi.mock('pdf-parse', () => ({
  PDFParse: class {
    constructor(options: unknown) { h.parser(options); }
    getText = h.text;
    destroy = h.destroy;
  },
}));
import { POST } from '@/app/api/documents/upload/route';

function request(file?: File) {
  const form = new FormData();
  if (file) form.set('file', file);
  const parse = vi.fn(async () => form);
  return { request: { formData: parse } as unknown as NextRequest, parse };
}

beforeEach(() => {
  h.session.mockReset().mockResolvedValue({
    user: { sub: 'auth0|fixture-owner', email: 'owner@example.invalid', email_verified: true },
  });
  h.create.mockReset().mockResolvedValue(true);
  h.parser.mockClear();
  h.text.mockReset().mockResolvedValue({ text: 'Fictional PDF fixture' });
  h.destroy.mockReset().mockResolvedValue(undefined);
});

describe('upload boundary, no providers', () => {
  it('rejects anonymous uploads before parsing multipart data or PDFs', async () => {
    h.session.mockResolvedValue(null);
    const fixture = request();
    expect((await POST(fixture.request)).status).toBe(401);
    expect(fixture.parse).not.toHaveBeenCalled();
    expect(h.parser).not.toHaveBeenCalled();
    expect(h.create).not.toHaveBeenCalled();
  });

  it('does not disclose authentication errors', async () => {
    h.session.mockRejectedValue(new Error('private fixture detail'));
    const fixture = request();
    const response = await POST(fixture.request);
    expect(response.status).toBe(500);
    expect(JSON.stringify(await response.json())).not.toContain('private fixture detail');
    expect(fixture.parse).not.toHaveBeenCalled();
  });

  it('refuses unsupported files before extraction or persistence', async () => {
    const fixture = request(new File(['fixture'], 'fixture.svg', { type: 'image/svg+xml' }));
    expect((await POST(fixture.request)).status).toBe(400);
    expect(h.parser).not.toHaveBeenCalled();
    expect(h.create).not.toHaveBeenCalled();
  });

  it('preserves original plain-text bytes for the authorized action', async () => {
    const fixture = request(new File(['Fictional text ✓'], 'fixture.txt', { type: 'text/plain' }));
    expect((await POST(fixture.request)).status).toBe(200);
    expect(h.create.mock.calls[0][0].content).toEqual(Buffer.from('Fictional text ✓'));
    expect(h.create.mock.calls[0][1]).toBe('Fictional text ✓');
  });

  it('destroys the PDF parser even when extraction fails and hides private errors', async () => {
    h.text.mockRejectedValueOnce(new Error('private fixture parser detail'));
    const fixture = request(new File(['not a real PDF, mocked parser'], 'fixture.pdf', { type: 'application/pdf' }));
    const response = await POST(fixture.request);
    expect(response.status).toBe(500);
    expect(h.destroy).toHaveBeenCalledOnce();
    expect(h.create).not.toHaveBeenCalled();
    expect(JSON.stringify(await response.json())).not.toContain('private fixture parser detail');
  });
});
