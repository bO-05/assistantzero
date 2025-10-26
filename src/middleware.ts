import { NextResponse, type NextRequest } from 'next/server';

import { auth0 } from '@/lib/auth0';

/**
 * Middleware to handle authentication using Auth0
 */
export async function middleware(request: NextRequest) {
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
