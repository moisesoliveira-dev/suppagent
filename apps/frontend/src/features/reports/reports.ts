export type ReportBucket = {
  id: string
  label: string
  count: number
  share: number
}

export type ReportAgentRow = {
  agentId: string
  agentName: string
  open: number
  resolved: number
  total: number
  openShare: number
  resolvedShare: number
}

export type ReportsSummary = {
  generatedAt: string
  totals: {
    tickets: number
    open: number
    resolved: number
    unassigned: number
    urgentOpen: number
  }
  byStatus: ReportBucket[]
  byPriority: ReportBucket[]
  byCategory: ReportBucket[]
  byAgent: ReportAgentRow[]
  knowledge: {
    articles: number
    published: number
    views: number
    ticketsAvoided: number
  }
}

export type ReportKind =
  | 'volume'
  | 'equipe'
  | 'prioridade'
  | 'conhecimento'

export const REPORT_MODELS: {
  id: ReportKind
  title: string
  description: string
}[] = [
  {
    id: 'volume',
    title: 'volume de chamados',
    description: 'totais abertos, resolvidos, livres e distribuição por status/categoria.',
  },
  {
    id: 'equipe',
    title: 'desempenho da equipe',
    description: 'chamados abertos e resolvidos por técnico atribuído.',
  },
  {
    id: 'prioridade',
    title: 'chamados por prioridade',
    description: 'volume atual agrupado por urgência.',
  },
  {
    id: 'conhecimento',
    title: 'uso da base de conhecimento',
    description: 'artigos, visualizações e chamados evitados registrados.',
  },
]

export function formatGeneratedAt(iso: string, now = new Date()): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return '—'
  const sameDay = at.toDateString() === now.toDateString()
  const time = at.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  if (sameDay) return `hoje, ${time}`
  return (
    at.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }) + `, ${time}`
  )
}

export function barTone(share: number): string {
  if (share >= 70) return 'bg-red'
  if (share >= 40) return 'bg-amber'
  return 'bg-green'
}
