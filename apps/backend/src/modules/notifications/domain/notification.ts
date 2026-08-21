export type NotificationType =
  | 'ticket_assigned'
  | 'ticket_opened'
  | 'ticket_reopened'
  | 'ticket_urgent';

export type AppNotification = {
  id: string;
  recipientHandle: string;
  type: NotificationType;
  title: string;
  body: string;
  ticketId: number | null;
  readAt: Date | null;
  createdAt: Date;
};

export type NotificationPreferences = {
  recipientHandle: string;
  assigned: boolean;
  sla: boolean;
  digest: boolean;
  sound: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: Omit<
  NotificationPreferences,
  'recipientHandle'
> = {
  assigned: true,
  sla: true,
  digest: false,
  sound: true,
};

export function allowsNotificationType(
  prefs: Pick<NotificationPreferences, 'assigned' | 'sla'>,
  type: NotificationType,
): boolean {
  if (type === 'ticket_assigned' || type === 'ticket_reopened') {
    return prefs.assigned;
  }
  if (type === 'ticket_urgent' || type === 'ticket_opened') {
    return prefs.sla;
  }
  return true;
}
