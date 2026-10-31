import { beforeEach, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

const h = vi.hoisted(() => ({ session: vi.fn(), persistence: vi.fn(), parser: vi.fn() }));
vi.mock('@/lib/auth0', () => ({ auth0: { getSession: h.session } }));
vi.mock('@/lib/actions/documents', () => {
  h.persistence();
  throw new Error('private fixture persistence initialization failure');
});
vi.mock('pdf-parse', () => {
  h.parser();
  throw new Error('private fixture native parser initialization failure');
});
import { POST } from '@/app/api/documents/upload/route';

beforeEach(() => { h.session.mockReset(); h.persistence.mockClear(); h.parser.mockClear(); });
function request(file?: File) {
  const form = new FormData();
  if (file) form.set('file', file);
  return { formData: vi.fn(async () => form) } as unknown as NextRequest;
}

it('loads the anonymous upload boundary without parser or persistence initialization', async () => {
  h.session.mockResolvedValue(null);
  const response = await POST(request());
  expect(response.status).toBe(401);
  expect(h.persistence).not.toHaveBeenCalled();
  expect(h.parser).not.toHaveBeenCalled();
});

it('contains an authorized persistence initialization failure without loading the PDF parser', async () => {
  h.session.mockResolvedValue({ user: { sub: 'auth0|fixture-owner', email: 'owner@example.invalid' } });
  const response = await POST(request(new File(['Fictional text'], 'fixture.txt', { type: 'text/plain' })));
  expect(response.status).toBe(500);
  expect(h.persistence).toHaveBeenCalledOnce();
  expect(h.parser).not.toHaveBeenCalled();
  expect(JSON.stringify(await response.json())).not.toContain('private fixture');
});

it('contains native PDF initialization failure before persistence', async () => {
  h.session.mockResolvedValue({ user: { sub: 'auth0|fixture-owner', email: 'owner@example.invalid' } });
  const response = await POST(request(new File(['Fictional PDF bytes'], 'fixture.pdf', { type: 'application/pdf' })));
  expect(response.status).toBe(500);
  expect(h.parser).toHaveBeenCalledOnce();
  expect(h.persistence).not.toHaveBeenCalled();
  expect(JSON.stringify(await response.json())).not.toContain('private fixture');
});
