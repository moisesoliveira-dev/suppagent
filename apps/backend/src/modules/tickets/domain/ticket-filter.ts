export const TICKET_FILTERS = [
  'todos',
  'meus',
  'naoatribuidos',
  'urgentes',
] as const;

export type TicketFilter = (typeof TICKET_FILTERS)[number];

export type TicketListCriteria = {
  filter: TicketFilter;
  currentAgent: string;
};

export class InvalidTicketFilterError extends Error {
  constructor(value: string) {
    super(`filtro de chamados inválido: ${value}`);
  }
}

export function parseTicketFilter(value: string | undefined): TicketFilter {
  const filter = value ?? 'todos';
  if ((TICKET_FILTERS as readonly string[]).includes(filter)) {
    return filter as TicketFilter;
  }
  throw new InvalidTicketFilterError(filter);
}

export function matchesTicketFilter(
  ticket: { agentId: string | null; priority: string },
  filter: TicketFilter,
  currentAgent: string,
): boolean {
  if (filter === 'meus') return ticket.agentId === currentAgent;
  if (filter === 'naoatribuidos') return ticket.agentId === null;
  if (filter === 'urgentes') return ticket.priority === 'urgent';
  return true;
}
