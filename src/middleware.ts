import { NextResponse, type NextRequest } from 'next/server';

import { GUEST_DEMO_ASSETS, GUEST_DEMO_CSP } from '@/lib/guest-demo';

/**
 * Middleware to handle authentication using Auth0
 */
export async function middleware(request: NextRequest) {
  if (GUEST_DEMO_ASSETS.has(request.nextUrl.pathname)) {
    const response = NextResponse.next();
    response.headers.set('Content-Security-Policy', GUEST_DEMO_CSP);
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'no-referrer');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
    return response;
  }
  const { auth0 } = await import('@/lib/auth0');
  // Let Auth0 middleware handle all routes (including /api/auth/*)
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|images|favicon.[ico|png]|sitemap.xml|robots.txt|$).*)',
  ],
};
