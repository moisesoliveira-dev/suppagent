import { Inject, Injectable } from '@nestjs/common';
import { parseTicketFilter } from '../domain/ticket-filter';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

export type ListTicketsQuery = {
  filter?: string;
  agent?: string;
  search?: string;
  page?: string | number;
  pageSize?: string | number;
};

export const DEFAULT_AGENT = 'c.reis';
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

@Injectable()
export class ListTicketsService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(query: ListTicketsQuery) {
    const filter = parseTicketFilter(query.filter);
    const currentAgent = query.agent?.trim() || DEFAULT_AGENT;
    const page = parsePositiveInt(query.page, 1);
    const pageSize = Math.min(
      parsePositiveInt(query.pageSize, DEFAULT_PAGE_SIZE),
      MAX_PAGE_SIZE,
    );
    const search = query.search?.trim() || undefined;

    const [listed, counts] = await Promise.all([
      this.tickets.findMany({
        filter,
        currentAgent,
        search,
        page,
        pageSize,
      }),
      this.tickets.counts(currentAgent),
    ]);

    const totalPages = Math.max(1, Math.ceil(listed.total / pageSize));

    return {
      items: listed.items,
      total: listed.total,
      page,
      pageSize,
      totalPages,
      counts,
      filter,
      agent: currentAgent,
      search: search ?? '',
    };
  }
}

function parsePositiveInt(value: string | number | undefined, fallback: number) {
  const n =
    typeof value === 'number' ? value : Number.parseInt(String(value ?? ''), 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.floor(n);
}
