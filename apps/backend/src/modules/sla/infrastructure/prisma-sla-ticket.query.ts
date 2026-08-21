import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type {
  SlaTicketQuery,
  SlaTicketSnapshot,
} from '../domain/sla-ticket.query';
import { toDomainSlaPriority } from './sla-policy.mapper';

@Injectable()
export class PrismaSlaTicketQuery implements SlaTicketQuery {
  constructor(private readonly prisma: PrismaService) {}

  async listForBoard(): Promise<SlaTicketSnapshot[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { status: { not: 'RESOLVED' } },
      include: {
        events: {
          where: { deletedAt: null },
          orderBy: { occurredAt: 'asc' },
          select: {
            occurredAt: true,
            author: true,
            isInternalNote: true,
            text: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((ticket) => {
      const firstAgentReply = ticket.events.find(
        (event) => event.author === 'AGENT' && !event.isInternalNote,
      );
      const closeEvent = ticket.events.find((event) =>
        event.text.toLowerCase().includes('encerrado'),
      );
      return {
        id: ticket.id,
        subject: ticket.subject,
        priority: toDomainSlaPriority(ticket.priority),
        status:
          ticket.status === 'OPEN'
            ? 'open'
            : ticket.status === 'IN_PROGRESS'
              ? 'in_progress'
              : ticket.status === 'WAITING'
                ? 'waiting'
                : 'resolved',
        openedAt: ticket.createdAt,
        firstAgentReplyAt: firstAgentReply?.occurredAt ?? null,
        resolvedAt:
          ticket.status === 'RESOLVED'
            ? (closeEvent?.occurredAt ?? ticket.updatedAt)
            : null,
      };
    });
  }
}
