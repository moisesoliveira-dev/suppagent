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

@Injectable()
export class GetRoutingBoardService {
  constructor(
    @Inject(ROUTING_RULE_REPOSITORY)
    private readonly rules: RoutingRuleRepository,
    @Inject(ROUTING_TICKET_PORT)
    private readonly tickets: RoutingTicketPort,
  ) {}

  async execute() {
    const [rules, tickets, agentNames] = await Promise.all([
      this.rules.findAll(),
      this.tickets.listOpen(),
      this.tickets.listAgentNames(),
    ]);

    const ruleInputs = rules.map((rule) => ({
      id: rule.id,
      name: rule.name,
      keywords: rule.keywords,
      category: rule.category,
      agentHandle: rule.agentHandle,
      enabled: rule.enabled,
    }));

    const items = tickets.map((ticket) => {
      const suggestion = suggestRouting(ticket, ruleInputs, agentNames);
      const agentLabel = suggestion.agentHandle
        ? (agentNames[suggestion.agentHandle] ?? suggestion.agentHandle)
        : '— revisar —';
      const prior =
        ticket.priorByCategory[suggestion.category.toLowerCase()] ?? 0;
      return {
        id: String(ticket.id),
        ticketId: ticket.id,
        subject: ticket.subject,
        requesterName: ticket.requesterName,
        currentCategory: ticket.category,
        currentAgentId: ticket.agentId,
        meta: `chamado nº ${ticket.id} · ${suggestion.category}`,
        title: ticket.subject,
        sub: `${ticket.requesterName} · ${
          prior > 0
            ? `cliente com histórico de ${prior} chamado(s)`
            : 'sem histórico anterior de chamados'
        }`,
        suggestion: {
          ...suggestion,
          agentLabel,
          confidenceLabel: `${suggestion.confidence}%`,
        },
      };
    });

    items.sort((a, b) => {
      const rank = { revisao: 0, pendente: 1, aplicado: 2 } as const;
      const diff =
        rank[a.suggestion.status] - rank[b.suggestion.status];
      if (diff !== 0) return diff;
      return b.ticketId - a.ticketId;
    });

    return {
      generatedAt: new Date().toISOString(),
      items,
    };
  }
}
