import { sql } from 'drizzle-orm';
import { text, varchar, timestamp, pgTable, jsonb, boolean } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { nanoid } from '@/utils/nano-id';

export const auditLogs = pgTable('audit_logs', {
  id: varchar('id', { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  action: varchar('action', { length: 100 }).notNull(),
  toolName: varchar('tool_name', { length: 100 }),
  agentRole: varchar('agent_role', { length: 100 }),
  status: varchar('status', { length: 50 }).notNull(),
  inputs: jsonb('inputs'),
  outputs: jsonb('outputs'),
  errorMessage: text('error_message'),
  workspaceId: varchar('workspace_id', { length: 191 }),
  threadId: varchar('thread_id', { length: 191 }),
  riskScore: varchar('risk_score', { length: 50 }),
  requiresApproval: boolean('requires_approval').default(false),
  approvalStatus: varchar('approval_status', { length: 50 }),
  durationMs: varchar('duration_ms', { length: 50 }),
  createdAt: timestamp('created_at')
    .notNull()
    .default(sql`now()`),
  userId: varchar('user_id', { length: 191 }).notNull(),
  userEmail: varchar('user_email', { length: 191 }).notNull(),
});

export const auditLogSchema = createSelectSchema(auditLogs).extend({});

export const insertAuditLogSchema = auditLogSchema.omit({
  id: true,
  createdAt: true,
});

export type AuditLogParams = z.infer<typeof auditLogSchema>;
export type NewAuditLogParams = z.infer<typeof insertAuditLogSchema>;
