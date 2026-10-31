import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';
import { DocumentAuthenticationError, requireDocumentActor } from '@/lib/document-access';

export async function POST(request: NextRequest) {
  let actor;
  try {
    actor = requireDocumentActor((await auth0.getSession())?.user);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof DocumentAuthenticationError
        ? 'Sign in to use the assistant. Guest preview: /demo/index.html'
        : 'Unable to authenticate this request.' },
      { status: error instanceof DocumentAuthenticationError ? 401 : 503 },
    );
  }
  try {
    const { POST: handleAuthenticatedChat } = await import('./handler');
    return await handleAuthenticatedChat(request, actor);
  } catch {
    return NextResponse.json({ error: 'The assistant service is unavailable.' }, { status: 503 });
  }
}
