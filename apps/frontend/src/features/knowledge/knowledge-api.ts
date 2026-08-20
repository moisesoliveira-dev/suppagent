import { apiRequest } from '../../shared/api/http'
import type {
  CreateKnowledgeFromTicketInput,
  CreateKnowledgeInput,
  KnowledgeArticle,
  KnowledgeListResponse,
} from './knowledge'

export function listKnowledge(params?: {
  category?: string
  q?: string
}): Promise<KnowledgeListResponse> {
  const search = new URLSearchParams()
  if (params?.category) search.set('category', params.category)
  if (params?.q) search.set('q', params.q)
  const query = search.toString()
  return apiRequest<KnowledgeListResponse>(`/knowledge${query ? `?${query}` : ''}`)
}

export function getKnowledgeArticle(id: string): Promise<KnowledgeArticle> {
  return apiRequest<KnowledgeArticle>(`/knowledge/${id}`)
}

export function createKnowledgeArticle(
  input: CreateKnowledgeInput,
): Promise<KnowledgeArticle> {
  return apiRequest<KnowledgeArticle>('/knowledge', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function createKnowledgeFromTicket(
  input: CreateKnowledgeFromTicketInput,
): Promise<KnowledgeArticle> {
  return apiRequest<KnowledgeArticle>('/knowledge/from-ticket', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      ticketId: Number(input.ticketId),
    }),
  })
}

export function updateKnowledgeArticle(
  id: string,
  input: Partial<{
    title: string
    category: string
    body: string
    tags: string[]
    published: boolean
  }>,
): Promise<KnowledgeArticle> {
  return apiRequest<KnowledgeArticle>(`/knowledge/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}
