import { Injectable } from '@nestjs/common';
import type { TicketStatus as PrismaTicketStatus } from '../../../generated/client';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { Client } from '../domain/client';
import type {
  ClientRepository,
  ClientTicketRef,
  ClientWithTickets,
} from '../domain/client.repository';
import { toDomainClient, toPrismaClientData } from './client.mapper';

const STATUS_FROM_PRISMA: Record<
  PrismaTicketStatus,
  ClientTicketRef['status']
> = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  WAITING: 'waiting',
  RESOLVED: 'resolved',
};

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Client[]> {
    const records = await this.prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    return records.map(toDomainClient);
  }

  async findAllWithTickets(): Promise<ClientWithTickets[]> {
    const records = await this.prisma.client.findMany({
      orderBy: { name: 'asc' },
    });
    return this.attachTickets(records.map(toDomainClient));
  }

  async findById(id: string): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({ where: { id } });
    return record ? toDomainClient(record) : null;
  }

  async findByIdWithTickets(id: string): Promise<ClientWithTickets | null> {
    const record = await this.prisma.client.findUnique({ where: { id } });
    if (!record) return null;
    const [item] = await this.attachTickets([toDomainClient(record)]);
    return item ?? null;
  }

  async findByEmail(email: string): Promise<Client | null> {
    const record = await this.prisma.client.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    return record ? toDomainClient(record) : null;
  }

  async save(client: Client): Promise<void> {
    const data = toPrismaClientData(client);
    await this.prisma.client.upsert({
      where: { id: client.id },
      create: data,
      update: {
        name: data.name,
        company: data.company,
        plan: data.plan,
        email: data.email,
        phone: data.phone,
        tags: data.tags,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.client.delete({ where: { id } });
  }

  private async attachTickets(
    clients: Client[],
  ): Promise<ClientWithTickets[]> {
    if (clients.length === 0) return [];
    const emails = clients.map((client) => client.email);
    const tickets = await this.prisma.ticket.findMany({
      where: {
        requesterEmail: { in: emails, mode: 'insensitive' },
      },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        subject: true,
        status: true,
        requesterEmail: true,
        updatedAt: true,
      },
    });

    const byEmail = new Map<string, ClientTicketRef[]>();
    for (const ticket of tickets) {
      const key = ticket.requesterEmail.trim().toLowerCase();
      const list = byEmail.get(key) ?? [];
      list.push({
        id: ticket.id,
        subject: ticket.subject,
        status: STATUS_FROM_PRISMA[ticket.status],
        updatedAt: ticket.updatedAt,
      });
      byEmail.set(key, list);
    }

    return clients.map((client) => ({
      client,
      tickets: byEmail.get(client.email) ?? [],
    }));
  }
}
