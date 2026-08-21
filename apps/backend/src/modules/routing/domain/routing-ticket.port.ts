export type RoutingTicketSnapshot = {
  id: number;
  subject: string;
  category: string;
  agentId: string | null;
  requesterName: string;
  requesterEmail: string;
  textBlob: string;
  priorByCategory: Record<string, number>;
  status: string;
};

export const ROUTING_TICKET_PORT = Symbol('ROUTING_TICKET_PORT');

export interface RoutingTicketPort {
  listOpen(): Promise<RoutingTicketSnapshot[]>;
  listAgentNames(): Promise<Record<string, string>>;
  applyRouting(input: {
    ticketId: number;
    category: string;
    agentId: string | null;
  }): Promise<void>;
  markForReview(input: {
    ticketId: number;
    category: string;
  }): Promise<void>;
}
