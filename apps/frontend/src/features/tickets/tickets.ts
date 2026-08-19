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

export const CURRENT_AGENT = 'c.reis'

export const TICKETS: Ticket[] = [
  {
    id: '4471',
    subject: 'erro ao gerar relatório mensal',
    status: 'aberto',
    priority: 'urgente',
    agent: 'livre',
    agentLabel: '— livre —',
    time: '12m',
    category: 'financeiro',
    requester: 'marina costa',
    email: 'marina.costa@vertexcorp.com',
    openedAt: '12:04',
    history: [
      { time: '12:04', text: 'marina.costa — relatório de agosto travando em "gerando…".' },
      {
        time: '12:08',
        text: 'camila.reis (nota interna) — já visto antes em relatórios grandes.',
        note: true,
      },
    ],
  },
  {
    id: '4470',
    subject: 'não consigo acessar o painel',
    status: 'andamento',
    priority: 'alta',
    agent: 'b.alves',
    agentLabel: 'b.alves',
    time: '34m',
    category: 'acesso',
    requester: 'rafael nunes',
    email: 'rafael.nunes@email.com',
    openedAt: '11:40',
    history: [{ time: '11:40', text: 'rafael.nunes — login recusado no painel.' }],
  },
  {
    id: '4468',
    subject: 'exportar dados em csv',
    status: 'aberto',
    priority: 'baixa',
    agent: 'livre',
    agentLabel: '— livre —',
    time: '1h',
    category: 'relatórios',
    requester: 'helena duarte',
    email: 'helena.duarte@email.com',
    openedAt: '11:10',
    history: [{ time: '11:10', text: 'helena.duarte — precisa exportar chamados em csv.' }],
  },
  {
    id: '4465',
    subject: 'cobrança duplicada — agosto',
    status: 'aguardando',
    priority: 'alta',
    agent: 'c.reis',
    agentLabel: 'c.reis',
    time: '2h',
    category: 'financeiro',
    requester: 'joão pedro lima',
    email: 'joao.lima@email.com',
    openedAt: '10:10',
    history: [{ time: '10:10', text: 'joão — cobrança em duplicidade na fatura de agosto.' }],
  },
  {
    id: '4460',
    subject: 'botão de salvar — safari',
    status: 'andamento',
    priority: 'media',
    agent: 'c.reis',
    agentLabel: 'c.reis',
    time: '3h',
    category: 'bug',
    requester: 'studio verde',
    email: 'contato@studioverde.com',
    openedAt: '09:20',
    history: [{ time: '09:20', text: 'safari antigo não dispara o save.' }],
  },
  {
    id: '4452',
    subject: 'alterar e-mail de cobrança',
    status: 'resolvido',
    priority: 'baixa',
    agent: 'b.alves',
    agentLabel: 'b.alves',
    time: '1d',
    category: 'financeiro',
    requester: 'diego martins',
    email: 'diego@email.com',
    openedAt: 'ontem',
    history: [{ time: '10:00', text: 'e-mail de cobrança atualizado.' }],
  },
  {
    id: '4448',
    subject: 'sistema fora do ar — login não abre',
    status: 'aberto',
    priority: 'urgente',
    agent: 'c.reis',
    agentLabel: 'c.reis',
    time: '40m',
    category: 'acesso',
    requester: 'vários',
    email: 'ops@balcao.com',
    openedAt: '12:40',
    history: [{ time: '12:40', text: 'login indisponível.' }],
  },
  {
    id: '4441',
    subject: 'pagamento não é confirmado no checkout',
    status: 'andamento',
    priority: 'urgente',
    agent: 'livre',
    agentLabel: '— livre —',
    time: '55m',
    category: 'financeiro',
    requester: 'cliente checkout',
    email: 'pagamentos@email.com',
    openedAt: '11:20',
    history: [{ time: '11:20', text: 'pagamento pendente no checkout.' }],
  },
  {
    id: '4438',
    subject: 'duplicidade de registro de cliente',
    status: 'aberto',
    priority: 'alta',
    agent: 'r.souza',
    agentLabel: 'r.souza',
    time: '1h',
    category: 'cadastro',
    requester: 'interno',
    email: 'rafael.souza@balcao.com',
    openedAt: '11:35',
    history: [{ time: '11:35', text: 'dois registros para o mesmo cliente.' }],
  },
  {
    id: '4430',
    subject: 'senha resetada com sucesso',
    status: 'resolvido',
    priority: 'media',
    agent: 'c.reis',
    agentLabel: 'c.reis',
    time: '2d',
    category: 'acesso',
    requester: 'marina costa',
    email: 'marina.costa@vertexcorp.com',
    openedAt: '2d',
    history: [{ time: '09:00', text: 'senha redefinida.' }],
  },
]

export function filterTickets(
  tickets: Ticket[],
  filter: TicketFilter,
  currentAgent = CURRENT_AGENT,
): Ticket[] {
  if (filter === 'meus') return tickets.filter((ticket) => ticket.agent === currentAgent)
  if (filter === 'naoatribuidos') return tickets.filter((ticket) => ticket.agent === 'livre')
  if (filter === 'urgentes') return tickets.filter((ticket) => ticket.priority === 'urgente')
  return tickets
}
