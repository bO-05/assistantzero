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

    // Get all messages and group them in JS (simpler than complex SQL)
    const allMessages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt));

    // Group by threadId
    const conversationsMap = new Map<string, any>();
    
    for (const msg of allMessages) {
      const threadId = msg.threadId || 'assistant0-chat';
      
      if (!conversationsMap.has(threadId)) {
        // Extract first message text for preview
        let lastMessage = 'New conversation';
        try {
          const content = msg.content as any;
          if (typeof content === 'string') {
            lastMessage = content.substring(0, 100);
          } else if (Array.isArray(content?.parts)) {
            const firstText = content.parts.find((p: any) => p?.text || p?.content);
            lastMessage = (firstText?.text || firstText?.content || '').substring(0, 100);
          }
        } catch (e) {
          // ignore
        }

        conversationsMap.set(threadId, {
          threadId,
          title: msg.title || `Chat ${new Date(msg.createdAt).toLocaleDateString()}`,
          messageCount: 1,
          lastMessage,
          createdAt: msg.createdAt,
        });
      } else {
        conversationsMap.get(threadId).messageCount++;
      }
    }

    const conversations = Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to load conversations:', error);
    return NextResponse.json({ error: 'Failed to load conversations' }, { status: 500 });
  }
}
