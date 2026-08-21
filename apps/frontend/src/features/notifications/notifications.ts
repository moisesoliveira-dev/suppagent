export type NotificationType =
  | 'ticket_assigned'
  | 'ticket_opened'
  | 'ticket_reopened'
  | 'ticket_urgent'

export type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  ticketId: string | null
  read: boolean
  createdAt: string
}

export type NotificationsListResponse = {
  agent: string
  unread: number
  items: AppNotification[]
}

export type NotificationPreferences = {
  agent: string
  assigned: boolean
  sla: boolean
  digest: boolean
  sound: boolean
}

export function formatNotificationTime(iso: string, now = new Date()): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return '—'
  const delta = Math.max(0, now.getTime() - at.getTime())
  const minutes = Math.round(delta / 60_000)
  if (minutes < 1) return 'agora'
  if (minutes < 60) return `${minutes}m`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  return `${days}d`
}

export function shouldPlaySound(
  prefs: Pick<NotificationPreferences, 'sound'> | null,
  items: AppNotification[],
  previousUnread: number,
): boolean {
  if (!prefs?.sound) return false
  const unread = items.filter((item) => !item.read).length
  return unread > previousUnread
}
