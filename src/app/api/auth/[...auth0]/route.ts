import { auth0 } from '@/lib/auth0';
import { NextRequest } from 'next/server';

// Handle all Auth0 routes: /api/auth/login, /api/auth/callback, /api/auth/logout, /api/auth/me
export async function GET(request: NextRequest) {
  return auth0.handleAuth(request);
}
