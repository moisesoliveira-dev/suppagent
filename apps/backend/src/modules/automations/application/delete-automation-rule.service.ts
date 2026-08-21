import { Inject, Injectable } from '@nestjs/common';
import {
  AUTOMATION_RULE_REPOSITORY,
  type AutomationRuleRepository,
} from '../domain/automation-rule.repository';
import { AutomationRuleNotFoundError } from '../domain/automation.errors';

@Injectable()
export class DeleteAutomationRuleService {
  constructor(
    @Inject(AUTOMATION_RULE_REPOSITORY)
    private readonly rules: AutomationRuleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const rule = await this.rules.findById(id);
    if (!rule) throw new AutomationRuleNotFoundError(id);
    await this.rules.delete(id);
  }
}
