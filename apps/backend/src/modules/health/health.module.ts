import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { GetHealthService } from './application/get-health.service';
import { HEALTH_PORT } from './domain/health.port';
import { PrismaHealthAdapter } from './infrastructure/prisma-health.adapter';
import { HealthController } from './presentation/health.controller';

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [
    GetHealthService,
    {
      provide: HEALTH_PORT,
      useClass: PrismaHealthAdapter,
    },
  ],
})
export class HealthModule {}
