import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { AutomationRule } from '../domain/automation-rule';
import type { AutomationRuleRepository } from '../domain/automation-rule.repository';
import {
  toDomainAutomationRule,
  toPrismaAutomationData,
} from './automation-rule.mapper';

@Injectable()
export class PrismaAutomationRuleRepository
  implements AutomationRuleRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AutomationRule[]> {
    const records = await this.prisma.automationRule.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return records.map(toDomainAutomationRule);
  }

  async findById(id: string): Promise<AutomationRule | null> {
    const record = await this.prisma.automationRule.findUnique({
      where: { id },
    });
    return record ? toDomainAutomationRule(record) : null;
  }

  async save(rule: AutomationRule): Promise<void> {
    const data = toPrismaAutomationData(rule);
    await this.prisma.automationRule.upsert({
      where: { id: rule.id },
      create: data,
      update: {
        name: data.name,
        trigger: data.trigger,
        condition: data.condition,
        action: data.action,
        enabled: data.enabled,
        runCount: data.runCount,
        lastRunAt: data.lastRunAt,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.automationRule.delete({ where: { id } });
  }
}
