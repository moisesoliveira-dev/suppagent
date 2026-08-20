import type { TicketFilter } from '../domain/ticket-filter';
import { Prisma } from '../../../generated/client';

export function buildTicketWhere(
  filter: TicketFilter,
  currentAgent: string,
  search?: string,
): Prisma.TicketWhereInput {
  const base: Prisma.TicketWhereInput =
    filter === 'meus'
      ? { agentId: currentAgent }
      : filter === 'naoatribuidos'
        ? { agentId: null }
        : filter === 'urgentes'
          ? { priority: 'URGENT' }
          : {};

  const q = search?.trim();
  if (!q) return base;

  const normalized = q.replace(/^#/, '').trim();
  const searchOr: Prisma.TicketWhereInput[] = [
    { subject: { contains: q, mode: 'insensitive' } },
    { requesterName: { contains: q, mode: 'insensitive' } },
    { requesterEmail: { contains: q, mode: 'insensitive' } },
    { category: { contains: q, mode: 'insensitive' } },
    { agentId: { contains: q, mode: 'insensitive' } },
    { subject: { contains: normalized, mode: 'insensitive' } },
  ];

  if (/^\d+$/.test(normalized)) {
    const asId = Number.parseInt(normalized, 10);
    if (Number.isFinite(asId)) {
      searchOr.push({ id: asId });
    }
  }

  return { AND: [base, { OR: searchOr }] };
}
