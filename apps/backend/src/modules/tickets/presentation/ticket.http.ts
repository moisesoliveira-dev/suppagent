import { Ticket } from '../domain/ticket';
import {
  formatElapsed,
  formatHistoryTime,
  formatOpenedAt,
  priorityToHttp,
  statusToHttp,
} from './ticket-format';

export type TicketMessageHttp = {
  id: string;
  time: string;
  text: string;
  author: 'requester' | 'agent';
  authorName: string;
  note?: boolean;
  deleted?: boolean;
  edited?: boolean;
  pinned?: boolean;
  replyToId?: string;
  replyToText?: string;
  replyToAuthorName?: string;
  forwarded?: boolean;
  forwardedFromName?: string;
};

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
  history: TicketMessageHttp[];
};

export function toTicketHttp(ticket: Ticket, now = new Date()): TicketHttp {
  const agent = ticket.agentId ?? 'livre';
  const byId = new Map(ticket.history.map((entry) => [entry.id, entry]));

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
    history: ticket.history.map((entry) => {
      const reply = entry.replyToId ? byId.get(entry.replyToId) : undefined;
      return {
        id: entry.id,
        time: formatHistoryTime(entry.occurredAt),
        text: entry.deletedAt ? '' : entry.text,
        author: entry.author,
        authorName: ticket.authorDisplayName(entry),
        ...(entry.isInternalNote ? { note: true } : {}),
        ...(entry.deletedAt ? { deleted: true } : {}),
        ...(entry.editedAt && !entry.deletedAt ? { edited: true } : {}),
        ...(entry.pinnedAt && !entry.deletedAt
          ? {
              pinned: true,
              pinnedTime: formatHistoryTime(entry.pinnedAt),
            }
          : {}),
        ...(entry.replyToId ? { replyToId: entry.replyToId } : {}),
        ...(reply && !reply.deletedAt
          ? {
              replyToText: reply.text,
              replyToAuthorName: ticket.authorDisplayName(reply),
            }
          : reply
            ? {
                replyToText: 'mensagem apagada',
                replyToAuthorName: ticket.authorDisplayName(reply),
              }
            : {}),
        ...(entry.forwardedFromName
          ? {
              forwarded: true,
              forwardedFromName: entry.forwardedFromName,
            }
          : {}),
      };
    }),
  };
}
