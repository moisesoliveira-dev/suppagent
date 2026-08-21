import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { CannedResponse } from '../domain/canned-response';
import type { CannedResponseRepository } from '../domain/canned-response.repository';
import {
  toDomainCanned,
  toPrismaCannedData,
} from './canned-response.mapper';

@Injectable()
export class PrismaCannedResponseRepository
  implements CannedResponseRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findAll(category?: string): Promise<CannedResponse[]> {
    const records = await this.prisma.cannedResponse.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });
    return records.map(toDomainCanned);
  }

  async findById(id: string): Promise<CannedResponse | null> {
    const record = await this.prisma.cannedResponse.findUnique({
      where: { id },
    });
    return record ? toDomainCanned(record) : null;
  }

  async findByShortcut(shortcut: string): Promise<CannedResponse | null> {
    const record = await this.prisma.cannedResponse.findUnique({
      where: { shortcut },
    });
    return record ? toDomainCanned(record) : null;
  }

  async listCategories(): Promise<string[]> {
    const rows = await this.prisma.cannedResponse.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });
    return rows.map((row) => row.category);
  }

  async save(response: CannedResponse): Promise<void> {
    const data = toPrismaCannedData(response);
    await this.prisma.cannedResponse.upsert({
      where: { id: response.id },
      create: data,
      update: {
        title: data.title,
        category: data.category,
        shortcut: data.shortcut,
        body: data.body,
        useCount: data.useCount,
        updatedAt: data.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cannedResponse.delete({ where: { id } });
  }
}
