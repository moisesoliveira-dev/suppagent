import { Inject, Injectable } from '@nestjs/common';
import type { AutomationRule } from '../domain/automation-rule';
import {
  AUTOMATION_RULE_REPOSITORY,
  type AutomationRuleRepository,
} from '../domain/automation-rule.repository';
import { AutomationRuleNotFoundError } from '../domain/automation.errors';

export type UpdateAutomationRuleCommand = {
  id: string;
  name?: string;
  trigger?: string;
  condition?: string;
  action?: string;
  enabled?: boolean;
};

@Injectable()
export class UpdateAutomationRuleService {
  constructor(
    @Inject(AUTOMATION_RULE_REPOSITORY)
    private readonly rules: AutomationRuleRepository,
  ) {}

  async execute(command: UpdateAutomationRuleCommand): Promise<AutomationRule> {
    const rule = await this.rules.findById(command.id);
    if (!rule) throw new AutomationRuleNotFoundError(command.id);
    rule.update({
      name: command.name,
      trigger: command.trigger,
      condition: command.condition,
      action: command.action,
      enabled: command.enabled,
    });
    await this.rules.save(rule);
    return rule;
  }
}
