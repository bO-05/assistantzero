export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskAssessment {
  level: RiskLevel;
  score: number;
  factors: string[];
  requiresStepUp: boolean;
}

const SENSITIVE_TOOLS = ['gmailDraftTool', 'shopOnlineTool', 'gmailSearchTool'];
const HIGH_RISK_ACTIONS = ['send', 'purchase', 'delete', 'share'];

export async function assessRisk(toolName: string, args: any, context: { userId: string }): Promise<RiskAssessment> {
  let score = 0;
  const factors: string[] = [];

  if (SENSITIVE_TOOLS.includes(toolName)) {
    score += 30;
    factors.push('sensitive_tool');
  }

  const argsStr = JSON.stringify(args).toLowerCase();
  if (HIGH_RISK_ACTIONS.some((action) => argsStr.includes(action))) {
    score += 40;
    factors.push('high_risk_action');
  }

  if (args?.priceLimit && args.priceLimit > 500) {
    score += 30;
    factors.push('high_value_transaction');
  }

  if (args?.recipients && Array.isArray(args.recipients) && args.recipients.length > 10) {
    score += 20;
    factors.push('bulk_operation');
  }

  let level: RiskLevel = 'low';
  if (score >= 70) {
    level = 'high';
  } else if (score >= 40) {
    level = 'medium';
  }

  const requiresStepUp = level === 'high' || (level === 'medium' && factors.includes('high_value_transaction'));

  return {
    level,
    score,
    factors,
    requiresStepUp,
  };
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':
      return 'red';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'green';
  }
}

export function getRiskMessage(assessment: RiskAssessment): string {
  if (assessment.requiresStepUp) {
    return 'This action requires additional verification for security';
  }
  if (assessment.level === 'medium') {
    return 'This action involves sensitive operations';
  }
  return 'This action has been assessed as low risk';
}
