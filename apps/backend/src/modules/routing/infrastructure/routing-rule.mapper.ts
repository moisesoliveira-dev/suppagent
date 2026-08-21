import type { RoutingRule as PrismaRoutingRule } from '../../../generated/client';
import { RoutingRule } from '../domain/routing-rule';

export function toDomainRoutingRule(record: PrismaRoutingRule): RoutingRule {
  return RoutingRule.reconstitute({
    id: record.id,
    name: record.name,
    keywords: record.keywords,
    category: record.category,
    agentHandle: record.agentHandle,
    enabled: record.enabled,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPrismaRoutingData(rule: RoutingRule) {
  return {
    id: rule.id,
    name: rule.name,
    keywords: rule.keywords,
    category: rule.category,
    agentHandle: rule.agentHandle,
    enabled: rule.enabled,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}
