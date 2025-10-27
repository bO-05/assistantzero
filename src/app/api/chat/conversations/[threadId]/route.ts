import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';

import { auth0 } from '@/lib/auth0';
import { db } from '@/lib/db';
import { chatMessages } from '@/lib/db/schema/chat-messages';

/**
 * DELETE /api/chat/conversations/[threadId]
 * Deletes all messages in a conversation
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const session = await auth0.getSession();
    const userId = session?.user?.sub;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { threadId } = await params;

    await db
      .delete(chatMessages)
      .where(
        and(
          eq(chatMessages.userId, userId),
          eq(chatMessages.threadId, threadId)
        )
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
  }
}
