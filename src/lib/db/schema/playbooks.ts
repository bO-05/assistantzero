import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { nanoid } from '@/utils/nano-id';

export const playbooks = pgTable('playbooks', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar('name', { length: 300 }).notNull(),
  description: text('description'),
  prompt: text('prompt').notNull(),
  schedule: varchar('schedule', { length: 100 }),
  isActive: boolean('is_active').default(true),
  toolsAllowed: varchar('tools_allowed', { length: 100 }).array(),
  workspaceId: varchar('workspace_id', { length: 191 }),
  lastRunAt: timestamp('last_run_at'),
  nextRunAt: timestamp('next_run_at'),
  runCount: integer('run_count').default(0),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp('updated_at')
    .notNull()
    .default(sql`now()`),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userEmail: varchar('user_email', { length: 191 }).notNull(),
});

export const playbookSchema = createSelectSchema(playbooks).extend({});

export const insertPlaybookSchema = playbookSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  userEmail: true,
  lastRunAt: true,
  runCount: true,
});

export type PlaybookParams = z.infer<typeof playbookSchema>;
export type NewPlaybookParams = z.infer<typeof insertPlaybookSchema>;
