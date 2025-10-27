import { pgTable, varchar, timestamp, jsonb, text } from 'drizzle-orm/pg-core';

/**
 * Chat messages table for persisting conversations
 * Stores full UIMessage objects for perfect reconstruction
 */
export const chatMessages = pgTable('chat_messages', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  threadId: varchar('thread_id', { length: 255 }).default('assistant0-chat'), // Conversation ID, default for existing rows
  role: varchar('role', { length: 50 }).notNull(), // 'user' | 'assistant' | 'tool'
  content: jsonb('content').notNull(), // Full message content
  title: text('title'), // Auto-generated conversation title
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
