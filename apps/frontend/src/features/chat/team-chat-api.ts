import { apiRequest } from '../../shared/api/http'
import type { TicketHistoryEntry } from '../tickets/tickets'
import { CURRENT_AGENT } from '../tickets/tickets'

export type TeamChatSummary = {
  id: string
  name: string
  kind: 'channel' | 'direct'
  category: 'equipe'
  time: string
  snippet: string
  messages: TeamChatMessage[]
}

export type TeamChatMessage = TicketHistoryEntry & {
  authorHandle?: string
}

export type TeamChatListResponse = {
  items: TeamChatSummary[]
}

export function listTeamChats(): Promise<TeamChatListResponse> {
  return apiRequest<TeamChatListResponse>('/team-chats')
}

export function getTeamChat(id: string): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(`/team-chats/${id}`)
}

export function postTeamChatMessage(
  chatId: string,
  text: string,
  replyToId?: string | null,
): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(`/team-chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      replyToId: replyToId ?? undefined,
      authorHandle: CURRENT_AGENT,
      authorName: 'camila reis',
    }),
  })
}

export function editTeamChatMessage(
  chatId: string,
  messageId: string,
  text: string,
): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(
    `/team-chats/${chatId}/messages/${messageId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    },
  )
}

export function deleteTeamChatMessage(
  chatId: string,
  messageId: string,
): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(
    `/team-chats/${chatId}/messages/${messageId}`,
    { method: 'DELETE' },
  )
}

export function pinTeamChatMessage(
  chatId: string,
  messageId: string,
): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(
    `/team-chats/${chatId}/messages/${messageId}/pin`,
    { method: 'POST' },
  )
}

export function forwardTeamMessage(
  chatId: string,
  messageId: string,
  target: { targetTeamChatId?: string; targetTicketId?: string },
): Promise<TeamChatSummary | { ok: true }> {
  return apiRequest(`/team-chats/${chatId}/messages/${messageId}/forward`, {
    method: 'POST',
    body: JSON.stringify({
      targetTeamChatId: target.targetTeamChatId,
      targetTicketId: target.targetTicketId
        ? Number(target.targetTicketId)
        : undefined,
    }),
  })
}

export function forwardTicketMessageToTeam(
  teamChatId: string,
  ticketId: string,
  messageId: string,
): Promise<TeamChatSummary> {
  return apiRequest<TeamChatSummary>(
    `/team-chats/${teamChatId}/forward-from-ticket`,
    {
      method: 'POST',
      body: JSON.stringify({
        ticketId: Number(ticketId),
        messageId,
      }),
    },
  )
}
