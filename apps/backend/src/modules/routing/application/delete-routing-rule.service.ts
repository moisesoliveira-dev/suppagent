import { Inject, Injectable } from '@nestjs/common';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../domain/routing-rule.repository';
import { RoutingRuleNotFoundError } from '../domain/routing.errors';

@Injectable()
export class DeleteRoutingRuleService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const rule = await this.rules.findById(id);
    if (!rule) throw new RoutingRuleNotFoundError(id);
    await this.rules.delete(id);
  }
}
