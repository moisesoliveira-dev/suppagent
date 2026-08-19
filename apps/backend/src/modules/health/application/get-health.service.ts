import { Inject, Injectable } from '@nestjs/common';
import { HEALTH_PORT, type HealthPort } from '../domain/health.port';
import type { HealthStatus } from '../domain/health-status';

@Injectable()
export class GetHealthService {
  constructor(@Inject(HEALTH_PORT) private readonly health: HealthPort) {}

  async execute(): Promise<HealthStatus> {
    try {
      await this.health.ping();
      return { status: 'ok', database: 'up' };
    } catch {
      return { status: 'error', database: 'down' };
    }
  }
}
