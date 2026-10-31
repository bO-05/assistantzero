import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { middleware } from '@/middleware';
import { GUEST_DEMO_ASSETS } from '@/lib/guest-demo';

const h = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock('@/lib/auth0', () => ({ auth0: { middleware: h.auth } }));

beforeEach(() => h.auth.mockReset().mockResolvedValue(NextResponse.next()));

describe('disconnected guest boundary', () => {
  it.each([...GUEST_DEMO_ASSETS])('serves only exact guest asset %s without Auth0', async (path) => {
    const response = await middleware(new NextRequest(`https://fixture.invalid${path}`));
    expect(h.auth).not.toHaveBeenCalled();
    expect(response.headers.get('content-security-policy')).toContain("connect-src 'none'");
    expect(response.headers.get('content-security-policy')).toContain("form-action 'none'");
    expect(response.headers.get('content-security-policy')).not.toContain('unsafe-inline');
    expect(response.headers.get('referrer-policy')).toBe('no-referrer');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it.each(['/demo', '/demo/index.html/private', '/demo/api/chat', '/api/documents/upload', '/documents'])(
    'does not broaden the guest exception to %s', async (path) => {
      await middleware(new NextRequest(`https://fixture.invalid${path}`));
      expect(h.auth).toHaveBeenCalledOnce();
    },
  );

  it('keeps the static module disconnected from service, storage, and dynamic-code APIs', async () => {
    const source = await readFile(new URL('../public/demo/demo.mjs', import.meta.url), 'utf8');
    expect(source).not.toMatch(/\b(fetch|XMLHttpRequest|WebSocket|EventSource|localStorage|sessionStorage|indexedDB|eval)\b|\bimport\s*\(/);
    expect(source).not.toContain('document.cookie');
    expect(source).not.toContain('innerHTML');
    const html = await readFile(new URL('../public/demo/index.html', import.meta.url), 'utf8');
    expect(html).toContain('not a live AI session');
    expect(html).toContain('does not test hosted Auth0 or OpenFGA');
    expect(html).not.toMatch(/<form\b|<iframe\b|<script(?![^>]*src=)/);
  });
});
