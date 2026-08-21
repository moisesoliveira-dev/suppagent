import type { RoutingRule } from '../domain/routing-rule';

export type RoutingRuleHttp = {
  id: string;
  name: string;
  keywords: string[];
  keywordsLabel: string;
  category: string;
  agentHandle: string | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export function toRoutingRuleHttp(rule: RoutingRule): RoutingRuleHttp {
  return {
    id: rule.id,
    name: rule.name,
    keywords: rule.keywords,
    keywordsLabel: rule.keywords.join(', '),
    category: rule.category,
    agentHandle: rule.agentHandle,
    enabled: rule.enabled,
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  };
}

export function parseKeywords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item));
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,;]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}
