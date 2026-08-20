import type {
  Ticket,
  TicketFilter,
  TicketListResponse,
} from './tickets'
import { CURRENT_AGENT } from './tickets'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
)

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!response.ok) {
    let detail = response.statusText
    try {
      const body = (await response.json()) as { message?: string | string[] }
      if (Array.isArray(body.message)) detail = body.message.join(', ')
      else if (body.message) detail = body.message
    } catch {
      /* ignore */
    }
    throw new Error(detail || `erro HTTP ${response.status}`)
  }
  return (await response.json()) as T
}

export function listTickets(
  filter: TicketFilter,
  agent = CURRENT_AGENT,
): Promise<TicketListResponse> {
  const params = new URLSearchParams({ filter, agent })
  return request<TicketListResponse>(`/tickets?${params}`)
}

export function getTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}`)
}

export function replyToTicket(
  id: string,
  text: string,
  note = false,
): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}/replies`, {
    method: 'POST',
    body: JSON.stringify({ text, note }),
  })
}

export function transferTicket(
  id: string,
  agent: string | null,
): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}/transfer`, {
    method: 'POST',
    body: JSON.stringify({ agent }),
  })
}

export function closeTicket(id: string): Promise<Ticket> {
  return request<Ticket>(`/tickets/${id}/close`, {
    method: 'POST',
  })
}

export { API_URL }
