import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { GetReportsSummaryService } from './application/get-reports-summary.service';
import { REPORTS_PORT } from './domain/reports.port';
import { PrismaReportsAdapter } from './infrastructure/prisma-reports.adapter';
import { ReportsController } from './presentation/reports.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ReportsController],
  providers: [
    GetReportsSummaryService,
    {
      provide: REPORTS_PORT,
      useClass: PrismaReportsAdapter,
    },
  ],
})
export class ReportsModule {}
