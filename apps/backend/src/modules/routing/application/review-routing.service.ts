import { Inject, Injectable } from '@nestjs/common';
import { suggestRouting } from '../domain/routing-engine';
import {
  ROUTING_RULE_REPOSITORY,
  type RoutingRuleRepository,
} from '../domain/routing-rule.repository';
import {
  ROUTING_TICKET_PORT,
  type RoutingTicketPort,
} from '../domain/routing-ticket.port';
import { RoutingTicketNotFoundError } from '../domain/routing.errors';

@Injectable()
export class ReviewRoutingService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
    @Inject(ROUTING_TICKET_PORT)
    private readonly tickets: RoutingTicketPort,
  ) {}

  async execute(ticketId: number) {
    const [rules, open, agentNames] = await Promise.all([
      this.rules.findAll(),
      this.tickets.listOpen(),
      this.tickets.listAgentNames(),
    ]);
    const ticket = open.find((item) => item.id === ticketId);
    if (!ticket) throw new RoutingTicketNotFoundError(ticketId);
    const suggestion = suggestRouting(
      ticket,
      rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        keywords: rule.keywords,
        category: rule.category,
        agentHandle: rule.agentHandle,
        enabled: rule.enabled,
      })),
      agentNames,
    );
    await this.tickets.markForReview({
      ticketId,
      category:
        suggestion.category === 'indefinido'
          ? ticket.category
          : suggestion.category,
    });
    return suggestion;
  }
}
