import { Inject, Injectable } from '@nestjs/common';
import { AutomationRule } from '../domain/automation-rule';
import {
  AUTOMATION_RULE_REPOSITORY,
  type AutomationRuleRepository,
} from '../domain/automation-rule.repository';

export type CreateAutomationRuleCommand = {
  name: string;
  trigger: string;
  condition: string;
  action: string;
  authorName: string;
  enabled?: boolean;
};

@Injectable()
export class CreateAutomationRuleService {
  constructor(
    @Inject(AUTOMATION_RULE_REPOSITORY)
    private readonly rules: AutomationRuleRepository,
  ) {}

  async execute(command: CreateAutomationRuleCommand): Promise<AutomationRule> {
    const rule = AutomationRule.create(command);
    await this.rules.save(rule);
    return rule;
  }
}
