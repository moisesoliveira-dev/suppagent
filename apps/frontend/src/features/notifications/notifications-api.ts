import { apiRequest } from '../../shared/api/http'
import { CURRENT_AGENT } from '../tickets/tickets'
import type {
  NotificationPreferences,
  NotificationsListResponse,
  AppNotification,
} from './notifications'

export function listNotifications(
  agent = CURRENT_AGENT,
): Promise<NotificationsListResponse> {
  return apiRequest<NotificationsListResponse>(
    `/notifications?agent=${encodeURIComponent(agent)}`,
  )
}

export function markNotificationRead(
  id: string,
  agent = CURRENT_AGENT,
): Promise<AppNotification> {
  return apiRequest<AppNotification>(
    `/notifications/${id}/read?agent=${encodeURIComponent(agent)}`,
    { method: 'POST' },
  )
}

export function markAllNotificationsRead(
  agent = CURRENT_AGENT,
): Promise<{ agent: string; updated: number }> {
  return apiRequest(`/notifications/read-all?agent=${encodeURIComponent(agent)}`, {
    method: 'POST',
  })
}

export function getNotificationPreferences(
  agent = CURRENT_AGENT,
): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>(
    `/notifications/preferences?agent=${encodeURIComponent(agent)}`,
  )
}

export function updateNotificationPreferences(
  patch: Partial<
    Pick<NotificationPreferences, 'assigned' | 'sla' | 'digest' | 'sound'>
  >,
  agent = CURRENT_AGENT,
): Promise<NotificationPreferences> {
  return apiRequest<NotificationPreferences>(
    `/notifications/preferences?agent=${encodeURIComponent(agent)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
}
