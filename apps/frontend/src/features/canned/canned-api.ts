import { apiRequest } from '../../shared/api/http'
import type { CannedListResponse, CannedResponse } from './canned'

export function listCannedResponses(
  category?: string,
): Promise<CannedListResponse> {
  const params = category && category !== 'todas' ? `?category=${encodeURIComponent(category)}` : ''
  return apiRequest<CannedListResponse>(`/canned-responses${params}`)
}

export function createCannedResponse(input: {
  title: string
  category: string
  shortcut: string
  body: string
}): Promise<CannedResponse> {
  return apiRequest<CannedResponse>('/canned-responses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateCannedResponse(
  id: string,
  input: {
    title?: string
    category?: string
    shortcut?: string
    body?: string
  },
): Promise<CannedResponse> {
  return apiRequest<CannedResponse>(`/canned-responses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export function duplicateCannedResponse(id: string): Promise<CannedResponse> {
  return apiRequest<CannedResponse>(`/canned-responses/${id}/duplicate`, {
    method: 'POST',
  })
}

export function useCannedResponse(id: string): Promise<CannedResponse> {
  return apiRequest<CannedResponse>(`/canned-responses/${id}/use`, {
    method: 'POST',
  })
}

export function deleteCannedResponse(id: string): Promise<void> {
  return apiRequest<void>(`/canned-responses/${id}`, { method: 'DELETE' })
}
