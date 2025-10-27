import { NextRequest, NextResponse } from 'next/server';
import { desc, eq, and } from 'drizzle-orm';

import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema/chat-messages';

/**
 * GET /api/chat/history?thread=xxx
 * Returns chat message history for a specific thread
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const threadId = req.nextUrl.searchParams.get('thread') || 'assistant0-chat';

    // Get messages for this thread
    const history = await db
      .select()
      .from(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          eq(chatMessages.threadId, threadId)
        )
      )
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);

    // Return in chronological order (oldest first)
    return NextResponse.json(history.reverse());
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
