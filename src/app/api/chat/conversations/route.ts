import { NextResponse } from 'next/server';
import { desc, eq, sql } from 'drizzle-orm';

import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema/chat-messages';

/**
 * GET /api/chat/conversations
 * Returns list of conversations grouped by threadId
 */
export async function GET() {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get conversations with message count and last message
    const conversations = await db
      .select({
        threadId: chatMessages.threadId,
        title: chatMessages.title,
        messageCount: sql<number>`count(*)::int`,
        lastMessage: sql<string>`substring(cast(${chatMessages.content}->>'content' as text), 1, 100)`,
        createdAt: sql<Date>`max(${chatMessages.createdAt})`,
      })
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .groupBy(chatMessages.threadId, chatMessages.title)
      .orderBy(desc(sql`max(${chatMessages.createdAt})`))
      .limit(20);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}
