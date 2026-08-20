import { Injectable } from '@nestjs/common';
import {
  TicketStatus as PrismaTicketStatus,
} from '../../../generated/client';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type {
  ClosedTicketSource,
  TicketSourcePort,
} from '../domain/ticket-source.port';

const STATUS_FROM_PRISMA: Record<
  PrismaTicketStatus,
  ClosedTicketSource['status']
> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING: 'waiting',
  RESOLVED: 'resolved',
};

@Injectable()
export class PrismaTicketSourceAdapter implements TicketSourcePort {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<ClosedTicketSource | null> {
    const record = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        events: { orderBy: { occurredAt: 'asc' } },
      },
    });
    if (!record) return null;

    return {
      id: record.id,
      subject: record.subject,
      category: record.category,
      status: STATUS_FROM_PRISMA[record.status],
      agentId: record.agentId,
      publicMessages: record.events
        .filter((event) => !event.isInternalNote)
        .map((event) => ({
          author: event.author === 'AGENT' ? ('agent' as const) : ('requester' as const),
          text: event.text,
        })),
    };
  }
}
