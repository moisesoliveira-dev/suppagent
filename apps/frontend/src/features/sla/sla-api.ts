import { apiRequest } from '../../shared/api/http'
import type {
  SlaBoard,
  SlaPolicy,
  SlaPolicyListResponse,
} from './sla'

export function getSlaBoard(): Promise<SlaBoard> {
  return apiRequest<SlaBoard>('/sla/board')
}

export function listSlaPolicies(): Promise<SlaPolicyListResponse> {
  return apiRequest<SlaPolicyListResponse>('/sla/policies')
}

export function updateSlaPolicy(
  priority: string,
  input: { responseMinutes: number; resolutionMinutes: number },
): Promise<SlaPolicy> {
  return apiRequest<SlaPolicy>(`/sla/policies/${priority}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
