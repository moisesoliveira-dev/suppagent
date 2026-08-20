import { Controller, Get } from '@nestjs/common';
import { GetReportsSummaryService } from '../application/get-reports-summary.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly getSummary: GetReportsSummaryService) {}

  @Get('summary')
  summary() {
    return this.getSummary.execute();
  }
}
