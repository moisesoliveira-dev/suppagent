export type SlaTone = 'ok' | 'warn' | 'breach'

export type SlaClock = {
  tone: SlaTone
  shortLabel: string
  detailText: string
  detailSub: string
  dueAt: string | null
  metAt: string | null
  targetMinutes: number
}

export type SlaPolicyCard = {
  id: string
  priority: string
  priorityKey: string
  responseMinutes: number
  resolutionMinutes: number
  targetsLabel: string
  compliancePercent: number
  openCount: number
}

export type SlaBoardItem = {
  id: string
  ticketId: number
  subject: string
  priority: string
  priorityKey: string
  status: string
  openedAt: string
  meta: string
  sub: string
  response: SlaClock
  resolution: SlaClock
  timeline: { time: string; text: string }[]
}

export type SlaBoard = {
  generatedAt: string
  policies: SlaPolicyCard[]
  items: SlaBoardItem[]
}

export type SlaPolicy = {
  id: string
  priority: string
  priorityKey: string
  responseMinutes: number
  resolutionMinutes: number
  targetsLabel: string
  updatedAt: string
}

export type SlaPolicyListResponse = {
  items: SlaPolicy[]
}

export function countdownClass(tone: SlaTone): string {
  if (tone === 'ok') return 'text-green'
  if (tone === 'warn') return 'text-amber'
  return 'text-red'
}

export function complianceBarClass(pct: number): string {
  if (pct >= 90) return 'bg-green'
  if (pct >= 80) return 'bg-amber'
  return 'bg-red'
}

export function priorityTitleClass(priority: string): string {
  if (priority === 'urgente' || priority === 'alta') return 'text-red'
  if (priority === 'média' || priority === 'media') return 'text-amber'
  return 'text-dim'
}
