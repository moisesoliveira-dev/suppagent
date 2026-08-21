import { Inject, Injectable } from '@nestjs/common';
import type { RoutingRule } from '../domain/routing-rule';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../domain/routing-rule.repository';
import { RoutingRuleNotFoundError } from '../domain/routing.errors';

export type UpdateRoutingRuleCommand = {
  id: string;
  name?: string;
  keywords?: string[];
  category?: string;
  agentHandle?: string | null;
  enabled?: boolean;
};

@Injectable()
export class UpdateRoutingRuleService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
  ) {}

  async execute(command: UpdateRoutingRuleCommand): Promise<RoutingRule> {
    const rule = await this.rules.findById(command.id);
    if (!rule) throw new RoutingRuleNotFoundError(command.id);
    rule.update({
      name: command.name,
      keywords: command.keywords,
      category: command.category,
      agentHandle: command.agentHandle,
      enabled: command.enabled,
    });
    await this.rules.save(rule);
    return rule;
  }
}
