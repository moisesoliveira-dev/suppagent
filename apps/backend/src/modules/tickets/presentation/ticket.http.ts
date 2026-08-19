import { Ticket } from '../domain/ticket';
import {
  formatElapsed,
  formatHistoryTime,
  formatOpenedAt,
  priorityToHttp,
  statusToHttp,
} from './ticket-format';

export type TicketHttp = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  agent: string;
  agentLabel: string;
  time: string;
  category: string;
  requester: string;
  email: string;
  openedAt: string;
  history: { time: string; text: string; note?: boolean }[];
};

export function toTicketHttp(ticket: Ticket, now = new Date()): TicketHttp {
  const agent = ticket.agentId ?? 'livre';
  return {
    id: String(ticket.id),
    subject: ticket.subject,
    status: statusToHttp(ticket.status),
    priority: priorityToHttp(ticket.priority),
    agent,
    agentLabel: ticket.agentId ?? '— livre —',
    time: formatElapsed(ticket.createdAt, now),
    category: ticket.category,
    requester: ticket.requesterName,
    email: ticket.requesterEmail,
    openedAt: formatOpenedAt(ticket.createdAt, now),
    history: ticket.history.map((entry) => ({
      time: formatHistoryTime(entry.occurredAt),
      text: entry.text,
      ...(entry.isInternalNote ? { note: true } : {}),
    })),
  };
}
