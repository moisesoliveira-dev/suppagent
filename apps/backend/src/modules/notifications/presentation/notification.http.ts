import type {
  AppNotification,
  NotificationPreferences,
} from '../domain/notification';

export function toNotificationHttp(item: AppNotification) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body,
    ticketId: item.ticketId == null ? null : String(item.ticketId),
    read: Boolean(item.readAt),
    createdAt: item.createdAt.toISOString(),
  };
}

export function toPreferencesHttp(prefs: NotificationPreferences) {
  return {
    agent: prefs.recipientHandle,
    assigned: prefs.assigned,
    sla: prefs.sla,
    digest: prefs.digest,
    sound: prefs.sound,
  };
}
