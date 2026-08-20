export const TICKET_SOURCE_PORT = Symbol('TICKET_SOURCE_PORT');

export type ClosedTicketSource = {
  id: number;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  agentId: string | null;
  publicMessages: { author: 'requester' | 'agent'; text: string }[];
};

export interface TicketSourcePort {
  findById(id: number): Promise<ClosedTicketSource | null>;
}
