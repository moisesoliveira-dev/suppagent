import { Inject, Injectable } from '@nestjs/common';
import { allowsNotificationType } from '../domain/notification';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../domain/notification.repository';
import type {
  NotificationWriter,
  TicketNotificationCommand,
} from '../domain/notification-writer.port';

@Injectable()
export class NotifyTicketEventService implements NotificationWriter {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async notifyTicket(command: TicketNotificationCommand): Promise<void> {
    const unique = [...new Set(command.recipientHandles.map((h) => h.trim()).filter(Boolean))];
    if (unique.length === 0) return;

    const allowed: string[] = [];
    for (const handle of unique) {
      const prefs = await this.notifications.getPreferences(handle);
      if (allowsNotificationType(prefs, command.type)) {
        allowed.push(handle);
      }
    }
    if (allowed.length === 0) return;

    await this.notifications.createMany(
      allowed.map((recipientHandle) => ({
        recipientHandle,
        type: command.type,
        title: command.title,
        body: command.body,
        ticketId: command.ticketId,
      })),
    );
  }

  listTechnicianHandles(): Promise<string[]> {
    return this.notifications.listTechnicianHandles();
  }
}
