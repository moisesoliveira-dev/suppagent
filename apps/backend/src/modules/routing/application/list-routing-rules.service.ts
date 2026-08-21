import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../domain/routing-rule.repository';
import type { RoutingRule } from '../domain/routing-rule';

@Injectable()
export class ListRoutingRulesService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
  ) {}

  execute(): Promise<RoutingRule[]> {
    return this.rules.findAll();
  }
}
