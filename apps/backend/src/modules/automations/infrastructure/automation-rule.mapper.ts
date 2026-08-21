import type { AutomationRule as PrismaAutomationRule } from '../../../generated/client';
import { AutomationRule } from '../domain/automation-rule';

export function toDomainAutomationRule(
  record: PrismaAutomationRule,
): AutomationRule {
  return AutomationRule.reconstitute({
    id: record.id,
    name: record.name,
    trigger: record.trigger,
    condition: record.condition,
    action: record.action,
    enabled: record.enabled,
    authorName: record.authorName,
    runCount: record.runCount,
    lastRunAt: record.lastRunAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPrismaAutomationData(rule: AutomationRule) {
  return {
    id: rule.id,
    name: rule.name,
    trigger: rule.trigger,
    condition: rule.condition,
    action: rule.action,
    enabled: rule.enabled,
    authorName: rule.authorName,
    runCount: rule.runCount,
    lastRunAt: rule.lastRunAt,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}
