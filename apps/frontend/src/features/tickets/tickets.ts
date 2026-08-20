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

export type TicketCounts = {
  todos: number
  meus: number
  naoatribuidos: number
  urgentes: number
  abertos: number
}

export type TicketListResponse = {
  filter: TicketFilter
  agent: string
  counts: TicketCounts
  items: Ticket[]
}

export type CreateTicketInput = {
  subject: string
  priority: TicketPriority
  category: string
  requester: string
  email: string
  message: string
}

export const CURRENT_AGENT = 'c.reis'

export const EMPTY_COUNTS: TicketCounts = {
  todos: 0,
  meus: 0,
  naoatribuidos: 0,
  urgentes: 0,
  abertos: 0,
}

export const TICKET_PRIORITIES: { id: TicketPriority; label: string }[] = [
  { id: 'urgente', label: 'urgente' },
  { id: 'alta', label: 'alta' },
  { id: 'media', label: 'média' },
  { id: 'baixa', label: 'baixa' },
]

export const TICKET_CATEGORIES = [
  'financeiro',
  'acesso',
  'bug',
  'relatórios',
  'cadastro',
  'suporte técnico',
]
