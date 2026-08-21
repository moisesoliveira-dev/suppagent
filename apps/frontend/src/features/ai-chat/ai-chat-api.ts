import { apiRequest } from '../../shared/api/http'
import type { AiChatSessionDetail, AiChatSessionSummary } from './ai-chat'

const DEFAULT_AGENT = 'c.reis'

function agentQs(agent = DEFAULT_AGENT) {
  return `agent=${encodeURIComponent(agent)}`
}

export function listAiChatSessions(
  agent = DEFAULT_AGENT,
): Promise<{ items: AiChatSessionSummary[] }> {
  return apiRequest(`/ai-chat/sessions?${agentQs(agent)}`)
}

export function getAiChatStarters(): Promise<{ items: string[] }> {
  return apiRequest('/ai-chat/starters')
}

export function getAiChatSession(
  id: string,
  agent = DEFAULT_AGENT,
): Promise<AiChatSessionDetail> {
  return apiRequest(`/ai-chat/sessions/${id}?${agentQs(agent)}`)
}

export function createAiChatSession(
  title?: string,
  agent = DEFAULT_AGENT,
): Promise<AiChatSessionDetail> {
  return apiRequest(`/ai-chat/sessions?${agentQs(agent)}`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  })
}

export function renameAiChatSession(
  id: string,
  title: string,
  agent = DEFAULT_AGENT,
): Promise<AiChatSessionDetail> {
  return apiRequest(`/ai-chat/sessions/${id}?${agentQs(agent)}`, {
    method: 'PATCH',
    body: JSON.stringify({ title }),
  })
}

export function deleteAiChatSession(
  id: string,
  agent = DEFAULT_AGENT,
): Promise<void> {
  return apiRequest(`/ai-chat/sessions/${id}?${agentQs(agent)}`, {
    method: 'DELETE',
  })
}

export function sendAiChatMessage(
  id: string,
  text: string,
  agent = DEFAULT_AGENT,
): Promise<AiChatSessionDetail> {
  return apiRequest(`/ai-chat/sessions/${id}/messages?${agentQs(agent)}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  })
}
