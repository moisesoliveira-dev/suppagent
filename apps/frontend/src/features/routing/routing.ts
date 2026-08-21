export type RoutingTone = 'high' | 'mid' | 'low'
export type RoutingStatus = 'aplicado' | 'pendente' | 'revisao'

export type RoutingSuggestion = {
  ruleId: string | null
  ruleName: string | null
  category: string
  agentHandle: string | null
  agentLabel: string
  confidence: number
  confidenceLabel: string
  tone: RoutingTone
  status: RoutingStatus
  matchedKeywords: string[]
  signals: string[]
}

export type RoutingBoardItem = {
  id: string
  ticketId: number
  subject: string
  requesterName: string
  currentCategory: string
  currentAgentId: string | null
  meta: string
  title: string
  sub: string
  suggestion: RoutingSuggestion
}

export type RoutingBoard = {
  generatedAt: string
  items: RoutingBoardItem[]
}

export type RoutingRule = {
  id: string
  name: string
  keywords: string[]
  keywordsLabel: string
  category: string
  agentHandle: string | null
  enabled: boolean
  createdAt: string
  updatedAt: string
}

export type RoutingRuleListResponse = {
  items: RoutingRule[]
}

export function confidenceClass(tone: RoutingTone): string {
  if (tone === 'high') return 'text-green'
  if (tone === 'mid') return 'text-amber'
  return 'text-red'
}

export function statusClass(status: RoutingStatus): string {
  return status === 'aplicado' ? 'text-green' : 'text-amber'
}

export function statusLabel(status: RoutingStatus): string {
  if (status === 'revisao') return 'revisão'
  return status
}

export function barClass(tone: RoutingTone): string {
  if (tone === 'high') return 'bg-green'
  if (tone === 'mid') return 'bg-amber'
  return 'bg-red'
}
