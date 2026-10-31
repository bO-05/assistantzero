import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

const h = vi.hoisted(() => ({ session: vi.fn(), handler: vi.fn() }));
vi.mock('@/lib/auth0', () => ({ auth0: { getSession: h.session } }));
vi.mock('@/app/api/chat/handler', () => ({ POST: h.handler }));
import { POST } from '@/app/api/chat/route';
import { GET as retiredDiagnostic } from '@/app/api/migrate/route';

beforeEach(() => {
  h.session.mockReset().mockResolvedValue(null);
  h.handler.mockReset().mockResolvedValue(NextResponse.json({ fixture: true }));
});

describe('private chat and retired diagnostics', () => {
  it('rejects anonymous chat before parsing, importing the handler, or calling a provider, even with the legacy demo flag', async () => {
    vi.stubEnv('NEXT_PUBLIC_DEMO', 'true');
    try {
      const request = new NextRequest('https://fixture.invalid/api/chat', { method: 'POST' });
      const parse = vi.spyOn(request, 'json');
      expect((await POST(request)).status).toBe(401);
      expect(parse).not.toHaveBeenCalled();
      expect(h.handler).not.toHaveBeenCalled();
    } finally { vi.unstubAllEnvs(); }
  });
  it('passes only the session-derived actor to the private handler', async () => {
    h.session.mockResolvedValue({ user: {
      sub: 'auth0|fixture-owner', email: 'owner@example.invalid', email_verified: true,
    } });
    const request = new NextRequest('https://fixture.invalid/api/chat', { method: 'POST' });
    expect((await POST(request)).status).toBe(200);
    expect(h.handler).toHaveBeenCalledWith(request, {
      userId: 'auth0|fixture-owner', email: 'owner@example.invalid', emailVerified: true,
    });
  });
  it('hides authentication and provider-initialization errors', async () => {
    h.session.mockRejectedValueOnce(new Error('private fixture detail'));
    const request = new NextRequest('https://fixture.invalid/api/chat', { method: 'POST' });
    const response = await POST(request);
    expect(response.status).toBe(503);
    expect(JSON.stringify(await response.json())).not.toContain('private fixture detail');
    expect(h.handler).not.toHaveBeenCalled();
  });
  it('retires the URL-secret database probe without loading a database', async () => {
    const response = await retiredDiagnostic();
    expect(response.status).toBe(410);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(h.session).not.toHaveBeenCalled();
    expect(h.handler).not.toHaveBeenCalled();
  });
});
