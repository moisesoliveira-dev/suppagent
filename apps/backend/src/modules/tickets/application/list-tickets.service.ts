import { Inject, Injectable } from '@nestjs/common';
import { parseTicketFilter } from '../domain/ticket-filter';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

export type ListTicketsQuery = {
  filter?: string;
  agent?: string;
};

export const DEFAULT_AGENT = 'c.reis';

@Injectable()
export class ListTicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(query: ListTicketsQuery) {
    const filter = parseTicketFilter(query.filter);
    const currentAgent = query.agent?.trim() || DEFAULT_AGENT;
    const [items, counts] = await Promise.all([
      this.tickets.findMany(filter, currentAgent),
      this.tickets.counts(currentAgent),
    ]);
    return { items, counts, filter, agent: currentAgent };
  }
}
