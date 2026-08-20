import { Inject, Injectable } from '@nestjs/common';
import { withShare } from '../domain/report-math';
import { REPORTS_PORT, type ReportsPort } from '../domain/reports.port';

@Injectable()
export class GetReportsSummaryService {
  constructor(@Inject(REPORTS_PORT) private readonly reports: ReportsPort) {}

  async execute() {
    const summary = await this.reports.summarize();
    const total = summary.totals.tickets;
    return {
      generatedAt: summary.generatedAt.toISOString(),
      totals: summary.totals,
      byStatus: withShare(summary.byStatus, total),
      byPriority: withShare(summary.byPriority, total),
      byCategory: withShare(summary.byCategory, total),
      byAgent: summary.byAgent.map((row) => ({
        ...row,
        openShare: percentSafe(row.open, row.total),
        resolvedShare: percentSafe(row.resolved, row.total),
      })),
      knowledge: summary.knowledge,
    };
  }
}

function percentSafe(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}
