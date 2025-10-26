import { db } from '@/lib/db';
import { auditLogs, type NewAuditLogParams } from '@/lib/db/schema/audit-logs';
import { eq, and, desc } from 'drizzle-orm';

export interface AuditContext {
  userId: string;
  userEmail: string;
  workspaceId?: string;
  threadId?: string;
}

export class AuditLogger {
  private startTime: number;
  private context: AuditContext;
  private logId?: string;
  private currentTool?: string;
  private riskScore?: string;
  private agentRole?: string;
  private requiresApproval?: boolean;

  constructor(context: AuditContext) {
    this.context = context;
    this.startTime = Date.now();
  }

  async logToolStart(
    toolName: string,
    inputs: any,
    agentRole?: string,
    riskScore?: string,
    requiresApproval = false,
  ) {
    this.currentTool = toolName;
    this.riskScore = riskScore;
    this.agentRole = agentRole;
    this.requiresApproval = requiresApproval;

    const log = await db
      .insert(auditLogs)
      .values({
        action: 'tool_start',
        toolName,
        agentRole,
        status: 'pending',
        inputs,
        riskScore,
        requiresApproval,
        ...this.context,
      })
      .returning();

    this.logId = log[0]?.id;
    return this.logId;
  }

  async logToolSuccess(outputs: any) {
    const duration = Date.now() - this.startTime;

    await db
      .insert(auditLogs)
      .values({
        action: 'tool_success',
        toolName: this.currentTool,
        agentRole: this.agentRole,
        status: 'success',
        outputs,
        riskScore: this.riskScore,
        requiresApproval: this.requiresApproval,
        durationMs: duration.toString(),
        ...this.context,
      });
  }

  async logToolError(error: string, toolName?: string) {
    const duration = Date.now() - this.startTime;

    await db
      .insert(auditLogs)
      .values({
        action: 'tool_error',
        toolName: toolName ?? this.currentTool,
        agentRole: this.agentRole,
        status: 'failure',
        errorMessage: error,
        riskScore: this.riskScore,
        requiresApproval: this.requiresApproval,
        durationMs: duration.toString(),
        ...this.context,
      });
  }

  async logAction(
    action: string,
    status: string,
    metadata?: {
      toolName?: string;
      agentRole?: string;
      inputs?: any;
      outputs?: any;
      errorMessage?: string;
      riskScore?: string;
    },
  ) {
    await db
      .insert(auditLogs)
      .values({
        action,
        status,
        ...metadata,
        ...this.context,
      });
  }
}

export async function createAuditLog(params: NewAuditLogParams) {
  const log = await db.insert(auditLogs).values(params).returning();
  return log[0];
}

export async function getAuditLogs(userId: string, limit = 100, workspaceId?: string) {
  const conditions = workspaceId
    ? and(eq(auditLogs.userId, userId), eq(auditLogs.workspaceId, workspaceId))
    : eq(auditLogs.userId, userId);

  const logs = await db
    .select()
    .from(auditLogs)
    .where(conditions)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);

  return logs;
}
