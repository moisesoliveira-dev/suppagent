import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { RoutingRule } from '../domain/routing-rule';
import type { RoutingRuleRepository } from '../domain/routing-rule.repository';
import {
  toDomainRoutingRule,
  toPrismaRoutingData,
} from './routing-rule.mapper';

@Injectable()
export class PrismaRoutingRuleRepository implements RoutingRuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RoutingRule[]> {
    const records = await this.prisma.routingRule.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toDomainRoutingRule);
  }

  async findById(id: string): Promise<RoutingRule | null> {
    const record = await this.prisma.routingRule.findUnique({ where: { id } });
    return record ? toDomainRoutingRule(record) : null;
  }

  async save(rule: RoutingRule): Promise<void> {
    const data = toPrismaRoutingData(rule);
    await this.prisma.routingRule.upsert({
      where: { id: rule.id },
      create: data,
      update: {
        name: data.name,
        keywords: data.keywords,
        category: data.category,
        agentHandle: data.agentHandle,
        enabled: data.enabled,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.routingRule.delete({ where: { id } });
  }
}
