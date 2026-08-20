import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type {
  ReportAgentBucket,
  ReportBucket,
  ReportsPort,
  ReportsSummary,
} from '../domain/reports.port';

const STATUS_LABEL: Record<string, string> = {
  OPEN: 'aberto',
  IN_PROGRESS: 'andamento',
  WAITING: 'aguardando',
  RESOLVED: 'resolvido',
};

const PRIORITY_LABEL: Record<string, string> = {
  URGENT: 'urgente',
  HIGH: 'alta',
  MEDIUM: 'média',
  LOW: 'baixa',
};

const STATUS_ORDER = ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED'];
const PRIORITY_ORDER = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

@Injectable()
export class PrismaReportsAdapter implements ReportsPort {
  constructor(private readonly prisma: PrismaService) {}

  async summarize(): Promise<ReportsSummary> {
    const notResolved = { not: 'RESOLVED' as const };

    const [
      tickets,
      open,
      resolved,
      unassigned,
      urgentOpen,
      byStatusRaw,
      byPriorityRaw,
      byCategoryRaw,
      byAgentRaw,
      users,
      articles,
      published,
      knowledgeAgg,
    ] = await Promise.all([
      this.prisma.ticket.count(),
      this.prisma.ticket.count({ where: { status: notResolved } }),
      this.prisma.ticket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.ticket.count({ where: { agentId: null } }),
      this.prisma.ticket.count({
        where: { priority: 'URGENT', status: notResolved },
      }),
      this.prisma.ticket.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['priority'],
        _count: { _all: true },
      }),
      this.prisma.ticket.groupBy({
        by: ['category'],
        _count: { _all: true },
        orderBy: { _count: { category: 'desc' } },
      }),
      this.prisma.ticket.groupBy({
        by: ['agentId', 'status'],
        _count: { _all: true },
      }),
      this.prisma.user.findMany({
        where: { role: 'TECHNICIAN' },
        select: { handle: true, name: true },
      }),
      this.prisma.knowledgeArticle.count(),
      this.prisma.knowledgeArticle.count({ where: { published: true } }),
      this.prisma.knowledgeArticle.aggregate({
        _sum: { views: true, ticketsAvoided: true },
      }),
    ]);

    const byStatus = orderBuckets(
      byStatusRaw.map((row) => ({
        id: STATUS_LABEL[row.status] ?? row.status.toLowerCase(),
        label: STATUS_LABEL[row.status] ?? row.status.toLowerCase(),
        count: row._count._all,
      })),
      STATUS_ORDER.map((key) => STATUS_LABEL[key]),
    );

    const byPriority = orderBuckets(
      byPriorityRaw.map((row) => ({
        id: PRIORITY_LABEL[row.priority] ?? row.priority.toLowerCase(),
        label: PRIORITY_LABEL[row.priority] ?? row.priority.toLowerCase(),
        count: row._count._all,
      })),
      PRIORITY_ORDER.map((key) => PRIORITY_LABEL[key]),
    );

    const byCategory: ReportBucket[] = byCategoryRaw.map((row) => ({
      id: row.category,
      label: row.category,
      count: row._count._all,
    }));

    const nameByHandle = new Map(
      users
        .filter((user) => user.handle)
        .map((user) => [user.handle as string, user.name]),
    );

    const agentMap = new Map<
      string,
      { open: number; resolved: number; total: number }
    >();

    for (const row of byAgentRaw) {
      const key = row.agentId ?? 'livre';
      const current = agentMap.get(key) ?? { open: 0, resolved: 0, total: 0 };
      current.total += row._count._all;
      if (row.status === 'RESOLVED') current.resolved += row._count._all;
      else current.open += row._count._all;
      agentMap.set(key, current);
    }

    const byAgent: ReportAgentBucket[] = [...agentMap.entries()]
      .map(([agentId, stats]) => ({
        agentId,
        agentName:
          agentId === 'livre'
            ? '— livre —'
            : (nameByHandle.get(agentId) ?? agentId),
        ...stats,
      }))
      .sort((a, b) => b.total - a.total || a.agentName.localeCompare(b.agentName));

    return {
      generatedAt: new Date(),
      totals: {
        tickets,
        open,
        resolved,
        unassigned,
        urgentOpen,
      },
      byStatus,
      byPriority,
      byCategory,
      byAgent,
      knowledge: {
        articles,
        published,
        views: knowledgeAgg._sum.views ?? 0,
        ticketsAvoided: knowledgeAgg._sum.ticketsAvoided ?? 0,
      },
    };
  }
}

function orderBuckets(
  buckets: ReportBucket[],
  order: string[],
): ReportBucket[] {
  const map = new Map(buckets.map((bucket) => [bucket.id, bucket]));
  const ordered = order.map(
    (id) => map.get(id) ?? { id, label: id, count: 0 },
  );
  for (const bucket of buckets) {
    if (!order.includes(bucket.id)) ordered.push(bucket);
  }
  return ordered;
}
