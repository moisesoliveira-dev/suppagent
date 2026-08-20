import { Test } from '@nestjs/testing';
import { GetReportsSummaryService } from './get-reports-summary.service';
import { REPORTS_PORT } from '../domain/reports.port';

describe('GetReportsSummaryService', () => {
  it('enriquece buckets com share', async () => {
    const summarize = jest.fn().mockResolvedValue({
      generatedAt: new Date('2026-08-20T12:00:00.000Z'),
      totals: {
        tickets: 10,
        open: 6,
        resolved: 4,
        unassigned: 2,
        urgentOpen: 1,
      },
      byStatus: [{ id: 'aberto', label: 'aberto', count: 6 }],
      byPriority: [{ id: 'alta', label: 'alta', count: 5 }],
      byCategory: [{ id: 'acesso', label: 'acesso', count: 4 }],
      byAgent: [
        {
          agentId: 'c.reis',
          agentName: 'camila reis',
          open: 3,
          resolved: 2,
          total: 5,
        },
      ],
      knowledge: {
        articles: 6,
        published: 5,
        views: 100,
        ticketsAvoided: 20,
      },
    });

    const moduleRef = await Test.createTestingModule({
      providers: [
        GetReportsSummaryService,
        { provide: REPORTS_PORT, useValue: { summarize } },
      ],
    }).compile();

    const service = moduleRef.get(GetReportsSummaryService);
    const result = await service.execute();

    expect(result.byStatus[0].share).toBe(60);
    expect(result.byPriority[0].share).toBe(50);
    expect(result.byAgent[0].resolvedShare).toBe(40);
    expect(result.generatedAt).toBe('2026-08-20T12:00:00.000Z');
  });
});
