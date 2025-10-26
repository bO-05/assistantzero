import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable, boolean } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { nanoid } from '@/utils/nano-id';

export const workspaces = pgTable('workspaces', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar('name', { length: 300 }).notNull(),
  description: text('description'),
  icon: varchar('icon', { length: 50 }).default('briefcase'),
  color: varchar('color', { length: 50 }).default('blue'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userEmail: varchar('user_email', { length: 191 }).notNull(),
});

export const workspaceSchema = createSelectSchema(workspaces).extend({});

export const insertWorkspaceSchema = workspaceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  userEmail: true,
});

export type WorkspaceParams = z.infer<typeof workspaceSchema>;
export type NewWorkspaceParams = z.infer<typeof insertWorkspaceSchema>;
