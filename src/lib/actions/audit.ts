'use server';
import { auth0 } from '@/lib/auth0';
import { getAuditLogs } from '@/lib/audit/logger';
import type { AuditLogParams } from '@/lib/db/schema/audit-logs';

export async function getAuditLogsForUser(workspaceId?: string, limit = 100): Promise<AuditLogParams[]> {
  const session = await auth0.getSession();
  const user = session?.user!;

  try {
    const logs = await getAuditLogs(user.sub, limit, workspaceId);
    return logs;
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }
}
