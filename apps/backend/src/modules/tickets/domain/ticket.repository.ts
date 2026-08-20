import type { TicketFilter } from './ticket-filter';
import type { Ticket } from './ticket';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export type TicketCounts = {
  todos: number;
  meus: number;
  naoatribuidos: number;
  urgentes: number;
  abertos: number;
};

export interface TicketRepository {
  findById(id: number): Promise<Ticket | null>;
  findMany(filter: TicketFilter, currentAgent: string): Promise<Ticket[]>;
  counts(currentAgent: string): Promise<TicketCounts>;
  save(ticket: Ticket): Promise<Ticket>;
}
