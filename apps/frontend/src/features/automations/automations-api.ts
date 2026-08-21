import { apiRequest } from '../../shared/api/http'
import type { AutomationRule, AutomationRuleListResponse } from './automations'

export function listAutomationRules(): Promise<AutomationRuleListResponse> {
  return apiRequest<AutomationRuleListResponse>('/automations')
}

export function createAutomationRule(input: {
  name: string
  trigger: string
  condition: string
  action: string
  authorName: string
  enabled?: boolean
}): Promise<AutomationRule> {
  return apiRequest<AutomationRule>('/automations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateAutomationRule(
  id: string,
  input: {
    name?: string
    trigger?: string
    condition?: string
    action?: string
    enabled?: boolean
  },
): Promise<AutomationRule> {
  return apiRequest<AutomationRule>(`/automations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function toggleAutomationRule(id: string): Promise<AutomationRule> {
  return apiRequest<AutomationRule>(`/automations/${id}/toggle`, {
    method: 'POST',
  })
}

export function runAutomationRule(id: string): Promise<AutomationRule> {
  return apiRequest<AutomationRule>(`/automations/${id}/run`, {
    method: 'POST',
  })
}

export function deleteAutomationRule(id: string): Promise<void> {
  return apiRequest<void>(`/automations/${id}`, { method: 'DELETE' })
}
