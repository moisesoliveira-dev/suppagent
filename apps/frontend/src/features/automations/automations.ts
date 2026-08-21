export type AutomationRule = {
  id: string
  name: string
  trigger: string
  condition: string
  action: string
  enabled: boolean
  authorName: string
  runCount: number
  lastRunAt: string | null
  createdAt: string
  updatedAt: string
}

export type AutomationRuleListResponse = {
  items: AutomationRule[]
}

export function formatAutomationRelative(
  iso: string | null,
  now = new Date(),
): string {
  if (!iso) return 'nunca'
  const ms = now.getTime() - new Date(iso).getTime()
  if (Number.isNaN(ms) || ms < 0) return 'agora'
  const minutes = Math.floor(ms / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `há ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days} dia${days === 1 ? '' : 's'}`
  const weeks = Math.floor(days / 7)
  if (weeks < 8) return `há ${weeks} semana${weeks === 1 ? '' : 's'}`
  const months = Math.floor(days / 30)
  return `há ${months} mês${months === 1 ? '' : 'es'}`
}

export function automationMeta(rule: AutomationRule): string {
  const runs =
    rule.runCount === 1 ? '1 execução' : `${rule.runCount} execuções`
  return `${rule.trigger} · ${runs}`
}

export function automationSub(rule: AutomationRule): string {
  const updated = formatAutomationRelative(rule.updatedAt)
  const status = rule.enabled ? '' : ' · inativa'
  return `criada por ${rule.authorName} · atualizada ${updated}${status}`
}
