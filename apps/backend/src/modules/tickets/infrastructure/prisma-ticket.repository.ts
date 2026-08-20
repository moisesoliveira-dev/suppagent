import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { Ticket } from '../domain/ticket';
import type {
  TicketCounts,
  TicketListOptions,
  TicketListResult,
  TicketRepository,
} from '../domain/ticket.repository';
import {
  toDomainTicket,
  toPrismaAuthor,
  toPrismaPriority,
  toPrismaStatus,
} from './ticket.mapper';
import { buildTicketWhere } from './ticket-search';

const eventInclude = {
  events: { orderBy: { occurredAt: 'asc' as const } },
};

@Injectable()
export class PrismaTicketRepository implements TicketRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Ticket | null> {
    const record = await this.prisma.ticket.findUnique({
      where: { id },
      include: eventInclude,
    });
    return record ? toDomainTicket(record) : null;
  }

  async findMany(options: TicketListOptions): Promise<TicketListResult> {
    const where = buildTicketWhere(
      options.filter,
      options.currentAgent,
      options.search,
    );
    const [records, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: eventInclude,
        orderBy: { id: 'desc' },
        skip: (options.page - 1) * options.pageSize,
        take: options.pageSize,
      }),
      this.prisma.ticket.count({ where }),
    ]);
    return {
      items: records.map(toDomainTicket),
      total,
    };
  }

  async counts(currentAgent: string): Promise<TicketCounts> {
    const notResolved = { not: 'RESOLVED' as const };
    const [todos, meus, naoatribuidos, urgentes, abertos] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { agentId: currentAgent } }),
      this.prisma.ticket.count({ where: { agentId: null } }),
      this.prisma.ticket.count({
        where: { priority: 'URGENT', status: notResolved },
      }),
      this.prisma.ticket.count({ where: { status: notResolved } }),
    ]);
    return { todos, meus, naoatribuidos, urgentes, abertos };
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const data = {
      subject: ticket.subject,
      status: toPrismaStatus(ticket.status),
      priority: toPrismaPriority(ticket.priority),
      agentId: ticket.agentId,
      category: ticket.category,
      requesterName: ticket.requesterName,
      requesterEmail: ticket.requesterEmail,
      createdAt: ticket.createdAt,
    };

    const events = ticket.history.map((event) => ({
      id: event.id,
      occurredAt: event.occurredAt,
      text: event.text,
      isInternalNote: event.isInternalNote,
      author: toPrismaAuthor(event.author),
      deletedAt: event.deletedAt,
      editedAt: event.editedAt,
      pinnedAt: event.pinnedAt,
      replyToId: event.replyToId,
      forwardedFromName: event.forwardedFromName,
    }));

    if (ticket.isNew) {
      const created = await this.prisma.ticket.create({
        data: {
          ...data,
          events: { create: events },
        },
        include: eventInclude,
      });
      return toDomainTicket(created);
    }

    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.ticket.update({
        where: { id: ticket.id },
        data,
      });
      await tx.ticketEvent.deleteMany({ where: { ticketId: ticket.id } });
      await tx.ticketEvent.createMany({
        data: events.map((event) => ({ ...event, ticketId: ticket.id })),
      });
      return tx.ticket.findUniqueOrThrow({
        where: { id: ticket.id },
        include: eventInclude,
      });
    });

    return toDomainTicket(saved);
  }
}
