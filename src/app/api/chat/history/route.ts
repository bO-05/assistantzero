import { NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';

import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema/chat-messages';

/**
 * GET /api/chat/history
 * Returns chat message history for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 50 messages for this user
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(50);

    // Return in chronological order (oldest first)
    return NextResponse.json(history.reverse());
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
