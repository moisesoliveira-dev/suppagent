export type TicketStatus = 'aberto' | 'andamento' | 'aguardando' | 'resolvido'
export type TicketPriority = 'urgente' | 'alta' | 'media' | 'baixa'
export type TicketFilter = 'todos' | 'meus' | 'naoatribuidos' | 'urgentes'

export type Ticket = {
  id: string
  subject: string
  status: TicketStatus
  priority: TicketPriority
  agent: string
  agentLabel: string
  time: string
  category: string
  requester: string
  email: string
  openedAt: string
  history: { time: string; text: string; note?: boolean }[]
}

export type TicketCounts = Record<TicketFilter, number>

export type TicketListResponse = {
  filter: TicketFilter
  agent: string
  counts: TicketCounts
  items: Ticket[]
}

export const CURRENT_AGENT = 'c.reis'

export const EMPTY_COUNTS: TicketCounts = {
  todos: 0,
  meus: 0,
  naoatribuidos: 0,
  urgentes: 0,
}
