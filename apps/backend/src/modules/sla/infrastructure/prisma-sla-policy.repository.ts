import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { SlaPolicy, SlaPriority } from '../domain/sla-policy';
import type { SlaPolicyRepository } from '../domain/sla-policy.repository';
import {
  toDomainSlaPolicy,
  toPrismaSlaPriority,
} from './sla-policy.mapper';

@Injectable()
export class PrismaSlaPolicyRepository implements SlaPolicyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<SlaPolicy[]> {
    const records = await this.prisma.slaPolicy.findMany();
    const order: SlaPriority[] = ['urgent', 'high', 'medium', 'low'];
    return records
      .map(toDomainSlaPolicy)
      .sort(
        (a, b) => order.indexOf(a.priority) - order.indexOf(b.priority),
      );
  }

  async findByPriority(priority: SlaPriority): Promise<SlaPolicy | null> {
    const record = await this.prisma.slaPolicy.findUnique({
      where: { priority: toPrismaSlaPriority(priority) },
    });
    return record ? toDomainSlaPolicy(record) : null;
  }

  async save(policy: SlaPolicy): Promise<void> {
    await this.prisma.slaPolicy.update({
      where: { id: policy.id },
      data: {
        responseMinutes: policy.responseMinutes,
        resolutionMinutes: policy.resolutionMinutes,
        updatedAt: policy.updatedAt,
      },
    });
  }
}
