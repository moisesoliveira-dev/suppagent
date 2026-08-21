import type { AutomationRule } from './automation-rule';

export const AUTOMATION_RULE_REPOSITORY = Symbol('AUTOMATION_RULE_REPOSITORY');

export interface AutomationRuleRepository {
  findAll(): Promise<AutomationRule[]>;
  findById(id: string): Promise<AutomationRule | null>;
  save(rule: AutomationRule): Promise<void>;
  delete(id: string): Promise<void>;
}
