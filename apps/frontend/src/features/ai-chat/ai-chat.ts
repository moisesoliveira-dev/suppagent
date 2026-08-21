export type AiChatRole = 'user' | 'assistant'

export type AiChatMessage = {
  id: string
  role: AiChatRole
  content: string
  createdAt: string
}

export type AiChatSessionSummary = {
  id: string
  title: string
  messageCount: number
  createdAt: string
  updatedAt: string
}

export type AiChatSessionDetail = {
  id: string
  title: string
  ownerHandle: string
  createdAt: string
  updatedAt: string
  messages: AiChatMessage[]
}

export function formatSessionTime(iso: string, now = new Date()): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return '—'
  const delta = Math.max(0, now.getTime() - at.getTime())
  const minutes = Math.round(delta / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d`
  return at.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
