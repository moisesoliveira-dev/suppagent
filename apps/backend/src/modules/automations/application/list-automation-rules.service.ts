import { Inject, Injectable } from '@nestjs/common';
import {
  AUTOMATION_RULE_REPOSITORY,
  type AutomationRuleRepository,
} from '../domain/automation-rule.repository';
import type { AutomationRule } from '../domain/automation-rule';

@Injectable()
export class ListAutomationRulesService {
  constructor(
    @Inject(AUTOMATION_RULE_REPOSITORY)
    private readonly rules: AutomationRuleRepository,
  ) {}

  execute(): Promise<AutomationRule[]> {
    return this.rules.findAll();
  }
}
