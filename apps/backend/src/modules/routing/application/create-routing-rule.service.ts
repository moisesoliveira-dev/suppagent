import { Inject, Injectable } from '@nestjs/common';
import { RoutingRule } from '../domain/routing-rule';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../domain/routing-rule.repository';

export type CreateRoutingRuleCommand = {
  name: string;
  keywords: string[];
  category: string;
  agentHandle?: string | null;
  enabled?: boolean;
};

@Injectable()
export class CreateRoutingRuleService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
  ) {}

  async execute(command: CreateRoutingRuleCommand): Promise<RoutingRule> {
    const rule = RoutingRule.create(command);
    await this.rules.save(rule);
    return rule;
  }
}
