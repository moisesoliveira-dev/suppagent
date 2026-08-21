import { apiRequest } from '../../shared/api/http'
import type {
  RoutingBoard,
  RoutingRule,
  RoutingRuleListResponse,
  RoutingSuggestion,
} from './routing'

export function getRoutingBoard(): Promise<RoutingBoard> {
  return apiRequest<RoutingBoard>('/routing/board')
}

export function applyRouting(
  ticketId: number,
): Promise<{ ok: boolean; suggestion: RoutingSuggestion }> {
  return apiRequest(`/routing/board/${ticketId}/apply`, { method: 'POST' })
}

export function reviewRouting(
  ticketId: number,
): Promise<{ ok: boolean; suggestion: RoutingSuggestion }> {
  return apiRequest(`/routing/board/${ticketId}/review`, { method: 'POST' })
}

export function listRoutingRules(): Promise<RoutingRuleListResponse> {
  return apiRequest('/routing/rules')
}

export function createRoutingRule(input: {
  name: string
  keywords: string
  category: string
  agentHandle?: string | null
  enabled?: boolean
}): Promise<RoutingRule> {
  return apiRequest('/routing/rules', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateRoutingRule(
  id: string,
  input: {
    name?: string
    keywords?: string
    category?: string
    agentHandle?: string | null
    enabled?: boolean
  },
): Promise<RoutingRule> {
  return apiRequest(`/routing/rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function deleteRoutingRule(id: string): Promise<void> {
  return apiRequest(`/routing/rules/${id}`, { method: 'DELETE' })
}
