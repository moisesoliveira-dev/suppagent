import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import { RoutingTicketNotFoundError } from '../domain/routing.errors';
import type {
  RoutingTicketPort,
  RoutingTicketSnapshot,
} from '../domain/routing-ticket.port';

@Injectable()
export class PrismaRoutingTicketAdapter implements RoutingTicketPort {
  constructor(private readonly prisma: PrismaService) {}

  async listOpen(): Promise<RoutingTicketSnapshot[]> {
    const tickets = await this.prisma.ticket.findMany({
      where: { status: { not: 'RESOLVED' } },
      include: {
        events: {
          where: { deletedAt: null },
          orderBy: { occurredAt: 'asc' },
          take: 5,
          select: { text: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const emails = [...new Set(tickets.map((t) => t.requesterEmail))];
    const priorByEmail = new Map<string, Map<string, number>>();
    if (emails.length > 0) {
      const priors = await this.prisma.ticket.groupBy({
        by: ['requesterEmail', 'category'],
        where: { requesterEmail: { in: emails } },
        _count: { _all: true },
      });
      for (const row of priors) {
        let byCat = priorByEmail.get(row.requesterEmail);
        if (!byCat) {
          byCat = new Map();
          priorByEmail.set(row.requesterEmail, byCat);
        }
        byCat.set(row.category.toLowerCase(), row._count._all);
      }
    }

    return tickets.map((ticket) => {
      const textBlob = [ticket.subject, ...ticket.events.map((e) => e.text)].join(
        ' ',
      );
      const byCat = priorByEmail.get(ticket.requesterEmail);
      const priorByCategory: Record<string, number> = {};
      if (byCat) {
        for (const [cat, count] of byCat) {
          // exclui o próprio chamado aberto da contagem de histórico
          const adjusted =
            cat === ticket.category.toLowerCase()
              ? Math.max(0, count - 1)
              : count;
          if (adjusted > 0) priorByCategory[cat] = adjusted;
        }
      }
      return {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        agentId: ticket.agentId,
        requesterName: ticket.requesterName,
        requesterEmail: ticket.requesterEmail,
        textBlob,
        priorByCategory,
        status: ticket.status,
      };
    });
  }

  async listAgentNames(): Promise<Record<string, string>> {
    const users = await this.prisma.user.findMany({
      where: { role: 'TECHNICIAN', handle: { not: null } },
      select: { handle: true, name: true },
    });
    const map: Record<string, string> = {};
    for (const user of users) {
      if (user.handle) map[user.handle] = user.name;
    }
    return map;
  }

  async applyRouting(input: {
    ticketId: number;
    category: string;
    agentId: string | null;
  }): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: input.ticketId },
    });
    if (!ticket || ticket.status === 'RESOLVED') {
      throw new RoutingTicketNotFoundError(input.ticketId);
    }
    const now = new Date();
    const agentId = input.agentId?.trim() || null;
    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          category: input.category,
          agentId,
          status:
            agentId && ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status,
          updatedAt: now,
        },
      }),
      this.prisma.ticketEvent.create({
        data: {
          id: randomUUID(),
          ticketId: input.ticketId,
          occurredAt: now,
          text: agentId
            ? `roteamento ia aplicado: ${input.category} → ${agentId}.`
            : `roteamento ia aplicado: categoria ${input.category}.`,
          isInternalNote: true,
          author: 'AGENT',
          updatedAt: now,
        },
      }),
    ]);
  }

  async markForReview(input: {
    ticketId: number;
    category: string;
  }): Promise<void> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: input.ticketId },
    });
    if (!ticket || ticket.status === 'RESOLVED') {
      throw new RoutingTicketNotFoundError(input.ticketId);
    }
    const now = new Date();
    await this.prisma.$transaction([
      this.prisma.ticket.update({
        where: { id: input.ticketId },
        data: {
          category: input.category || 'indefinido',
          agentId: null,
          updatedAt: now,
        },
      }),
      this.prisma.ticketEvent.create({
        data: {
          id: randomUUID(),
          ticketId: input.ticketId,
          occurredAt: now,
          text: `roteamento ia enviado para revisão humana (${input.category || 'indefinido'}).`,
          isInternalNote: true,
          author: 'AGENT',
          updatedAt: now,
        },
      }),
    ]);
  }
}
