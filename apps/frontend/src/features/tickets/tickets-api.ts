import { apiRequest, API_URL } from '../../shared/api/http'
import type {
  Ticket,
  TicketFilter,
  TicketListResponse,
} from './tickets'
import { CURRENT_AGENT } from './tickets'

export function listTickets(
  filter: TicketFilter,
  agent = CURRENT_AGENT,
): Promise<TicketListResponse> {
  const params = new URLSearchParams({ filter, agent })
  return apiRequest<TicketListResponse>(`/tickets?${params}`)
}

export function getTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}`)
}

export function replyToTicket(
  id: string,
  text: string,
  note = false,
): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/replies`, {
    method: 'POST',
    body: JSON.stringify({ text, note }),
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

export function closeTicket(id: string): Promise<Ticket> {
  return apiRequest<Ticket>(`/tickets/${id}/close`, {
    method: 'POST',
  })
}

export { API_URL }
