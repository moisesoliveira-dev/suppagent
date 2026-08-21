import type {
  AppNotification,
  NotificationPreferences,
  NotificationType,
} from './notification';

export const NOTIFICATION_REPOSITORY = Symbol('NOTIFICATION_REPOSITORY');

export type CreateNotificationInput = {
  recipientHandle: string;
  type: NotificationType;
  title: string;
  body: string;
  ticketId?: number | null;
};

export interface NotificationRepository {
  createMany(items: CreateNotificationInput[]): Promise<AppNotification[]>;
  listForRecipient(
    handle: string,
    limit?: number,
  ): Promise<AppNotification[]>;
  countUnread(handle: string): Promise<number>;
  markRead(id: string, handle: string): Promise<AppNotification | null>;
  markAllRead(handle: string): Promise<number>;
  getPreferences(handle: string): Promise<NotificationPreferences>;
  savePreferences(
    prefs: NotificationPreferences,
  ): Promise<NotificationPreferences>;
  listTechnicianHandles(): Promise<string[]>;
}
