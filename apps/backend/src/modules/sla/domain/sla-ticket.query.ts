import type { SlaPriority } from './sla-policy';

export type SlaTicketSnapshot = {
  id: number;
  subject: string;
  priority: SlaPriority;
  status: 'open' | 'in_progress' | 'waiting' | 'resolved';
  openedAt: Date;
  firstAgentReplyAt: Date | null;
  resolvedAt: Date | null;
};

export const SLA_TICKET_QUERY = Symbol('SLA_TICKET_QUERY');

export interface SlaTicketQuery {
  listForBoard(): Promise<SlaTicketSnapshot[]>;
}
