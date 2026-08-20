import { apiRequest } from '../../shared/api/http'
import type { ReportsSummary } from './reports'

export function getReportsSummary(): Promise<ReportsSummary> {
  return apiRequest<ReportsSummary>('/reports/summary')
}
