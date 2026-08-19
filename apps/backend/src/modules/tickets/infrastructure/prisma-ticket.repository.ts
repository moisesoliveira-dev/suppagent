import { Injectable } from '@nestjs/common';
import { Prisma } from '../../../generated/client';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { TicketFilter } from '../domain/ticket-filter';
import type { Ticket } from '../domain/ticket';
import type {
  TicketCounts,
  TicketRepository,
} from '../domain/ticket.repository';
import {
  toDomainTicket,
  toPrismaPriority,
  toPrismaStatus,
} from './ticket.mapper';

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

  async findMany(
    filter: TicketFilter,
    currentAgent: string,
  ): Promise<Ticket[]> {
    const records = await this.prisma.ticket.findMany({
      where: this.where(filter, currentAgent),
      include: eventInclude,
      orderBy: { id: 'desc' },
    });
    return records.map(toDomainTicket);
  }

  async counts(currentAgent: string): Promise<TicketCounts> {
    const [todos, meus, naoatribuidos, urgentes] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { agentId: currentAgent } }),
      this.prisma.ticket.count({ where: { agentId: null } }),
      this.prisma.ticket.count({ where: { priority: 'URGENT' } }),
    ]);
    return { todos, meus, naoatribuidos, urgentes };
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

  private where(
    filter: TicketFilter,
    currentAgent: string,
  ): Prisma.TicketWhereInput {
    if (filter === 'meus') return { agentId: currentAgent };
    if (filter === 'naoatribuidos') return { agentId: null };
    if (filter === 'urgentes') return { priority: 'URGENT' };
    return {};
  }
}
