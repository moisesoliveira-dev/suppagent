import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { HealthPort } from '../domain/health.port';

@Injectable()
export class PrismaHealthAdapter implements HealthPort {
  constructor(private readonly prisma: PrismaService) {}

  async ping(): Promise<void> {
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
