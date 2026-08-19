import {
  TicketPriority as PrismaTicketPriority,
  TicketStatus as PrismaTicketStatus,
} from '../../../generated/client';
import { Ticket } from '../domain/ticket';
import type { TicketPriority } from '../domain/ticket-priority';
import type { TicketStatus } from '../domain/ticket-status';

type TicketRecord = {
  id: number;
  subject: string;
  status: PrismaTicketStatus;
  priority: PrismaTicketPriority;
  agentId: string | null;
  category: string;
  requesterName: string;
  requesterEmail: string;
  createdAt: Date;
  events: {
    id: string;
    occurredAt: Date;
    text: string;
    isInternalNote: boolean;
  }[];
};

const STATUS_TO_PRISMA: Record<TicketStatus, PrismaTicketStatus> = {
  open: PrismaTicketStatus.OPEN,
  in_progress: PrismaTicketStatus.IN_PROGRESS,
  waiting: PrismaTicketStatus.WAITING,
  resolved: PrismaTicketStatus.RESOLVED,
};

const STATUS_FROM_PRISMA: Record<PrismaTicketStatus, TicketStatus> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING: 'waiting',
  RESOLVED: 'resolved',
};

const PRIORITY_TO_PRISMA: Record<TicketPriority, PrismaTicketPriority> = {
  urgent: PrismaTicketPriority.URGENT,
  high: PrismaTicketPriority.HIGH,
  medium: PrismaTicketPriority.MEDIUM,
  low: PrismaTicketPriority.LOW,
};

const PRIORITY_FROM_PRISMA: Record<PrismaTicketPriority, TicketPriority> = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export function toPrismaStatus(status: TicketStatus): PrismaTicketStatus {
  return STATUS_TO_PRISMA[status];
}

export function toPrismaPriority(
  priority: TicketPriority,
): PrismaTicketPriority {
  return PRIORITY_TO_PRISMA[priority];
}

export function toDomainTicket(record: TicketRecord): Ticket {
  return Ticket.reconstitute({
    id: record.id,
    subject: record.subject,
    status: STATUS_FROM_PRISMA[record.status],
    priority: PRIORITY_FROM_PRISMA[record.priority],
    agentId: record.agentId,
    category: record.category,
    requesterName: record.requesterName,
    requesterEmail: record.requesterEmail,
    createdAt: record.createdAt,
    history: record.events
      .slice()
      .sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime())
      .map((event) => ({
        id: event.id,
        occurredAt: event.occurredAt,
        text: event.text,
        isInternalNote: event.isInternalNote,
      })),
  });
}
