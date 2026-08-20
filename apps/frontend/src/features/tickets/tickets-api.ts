import { apiRequest, API_URL } from '../../shared/api/http'
import type {
  CreateTicketInput,
  ListTicketsParams,
  Ticket,
  TicketListResponse,
} from './tickets'
import { CURRENT_AGENT, TICKETS_PAGE_SIZE } from './tickets'

export function listTickets(
  params: ListTicketsParams | string = {},
  agent = CURRENT_AGENT,
): Promise<TicketListResponse> {
  const options: ListTicketsParams =
    typeof params === 'string' ? { filter: params as ListTicketsParams['filter'] } : params

  const query = new URLSearchParams({
    filter: options.filter ?? 'todos',
    agent: options.agent ?? agent,
    page: String(options.page ?? 1),
    pageSize: String(options.pageSize ?? TICKETS_PAGE_SIZE),
  })
  const search = options.search?.trim()
  if (search) query.set('search', search)

  return apiRequest<TicketListResponse>(`/tickets?${query}`)
}

export function getTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`)
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return apiRequest<Ticket>('/tickets', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function replyToTicket(
  id: string,
  text: string,
  note = false,
  replyToId?: string | null,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/replies`, {
    method: 'POST',
    body: JSON.stringify({
      text,
      note,
      ...(replyToId ? { replyToId } : {}),
    }),
  })
}

export function transferTicket(
  id: string,
  agent: string | null,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ agent }),
  })
}

export function claimTicket(
  id: string,
  agent = CURRENT_AGENT,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/claim`, {
    method: 'POST',
    body: JSON.stringify({ agent }),
  })
}

export function markTicketWaiting(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/waiting`, {
    method: 'POST',
  })
}

export function closeTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/close`, {
    method: 'POST',
  })
}

export function editTicketMessage(
  ticketId: string,
  messageId: string,
  text: string,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${ticketId}/messages/${messageId}`, {
    method: 'PATCH',
    body: JSON.stringify({ text }),
  })
}

export function deleteTicketMessage(
  ticketId: string,
  messageId: string,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${ticketId}/messages/${messageId}`, {
    method: 'DELETE',
  })
}

export function pinTicketMessage(
  ticketId: string,
  messageId: string,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${ticketId}/messages/${messageId}/pin`, {
    method: 'POST',
  })
}

export function forwardTicketMessage(
  ticketId: string,
  messageId: string,
  targetTicketId: string,
): Promise<Ticket> {
  return apiRequest<Ticket>(
    `/tickets/${ticketId}/messages/${messageId}/forward`,
    {
      method: 'POST',
      body: JSON.stringify({ targetTicketId: Number(targetTicketId) }),
    },
  )
}

export function reopenTicket(id: string, reason: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/reopen`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export { API_URL }
