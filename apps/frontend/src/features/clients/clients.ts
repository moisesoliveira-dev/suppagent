export type ClientPlan = 'starter' | 'pro' | 'empresa'

export type ClientTicket = {
  id: string
  label: string
  status: string
}

export type Client = {
  id: string
  name: string
  company: string | null
  displayName: string
  plan: ClientPlan
  email: string
  phone: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  since: string
  sinceLong: string
  openCount: number
  openLabel: string
  totalTickets: number
  lastContact: string
  tickets: ClientTicket[]
}

export type ClientListResponse = {
  items: Client[]
}

export const CLIENT_PLAN_OPTIONS: { id: ClientPlan; label: string }[] = [
  { id: 'starter', label: 'starter' },
  { id: 'pro', label: 'pro' },
  { id: 'empresa', label: 'empresa' },
]

export type CreateClientInput = {
  name: string
  company?: string | null
  plan: ClientPlan
  email: string
  phone?: string | null
  tags?: string[]
}

export type UpdateClientInput = Partial<CreateClientInput>
