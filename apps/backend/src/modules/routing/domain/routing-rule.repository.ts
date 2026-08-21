import type { RoutingRule } from './routing-rule';

export const ROUTING_RULE_REPOSITORY = Symbol('ROUTING_RULE_REPOSITORY');

export interface RoutingRuleRepository {
  findAll(): Promise<RoutingRule[]>;
  findById(id: string): Promise<RoutingRule | null>;
  save(rule: RoutingRule): Promise<void>;
  delete(id: string): Promise<void>;
}
