import type { AutomationRule } from '../domain/automation-rule';

export type AutomationRuleHttp = {
  id: string;
  name: string;
  trigger: string;
  condition: string;
  action: string;
  enabled: boolean;
  authorName: string;
  runCount: number;
  lastRunAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export function toAutomationRuleHttp(rule: AutomationRule): AutomationRuleHttp {
  return {
    id: rule.id,
    name: rule.name,
    trigger: rule.trigger,
    condition: rule.condition,
    action: rule.action,
    enabled: rule.enabled,
    authorName: rule.authorName,
    runCount: rule.runCount,
    lastRunAt: rule.lastRunAt?.toISOString() ?? null,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}
