export const REPORTS_PORT = Symbol('REPORTS_PORT');

export type ReportBucket = {
  id: string;
  label: string;
  count: number;
};

export type ReportAgentBucket = {
  agentId: string;
  agentName: string;
  open: number;
  resolved: number;
  total: number;
};

export type ReportsSummary = {
  generatedAt: Date;
  totals: {
    tickets: number;
    open: number;
    resolved: number;
    unassigned: number;
    urgentOpen: number;
  };
  byStatus: ReportBucket[];
  byPriority: ReportBucket[];
  byCategory: ReportBucket[];
  byAgent: ReportAgentBucket[];
  knowledge: {
    articles: number;
    published: number;
    views: number;
    ticketsAvoided: number;
  };
};

export interface ReportsPort {
  summarize(): Promise<ReportsSummary>;
}
