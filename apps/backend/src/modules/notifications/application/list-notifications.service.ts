import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../domain/notification.repository';

@Injectable()
export class ListNotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute(handle: string) {
    const recipient = handle.trim() || 'c.reis';
    const [items, unread] = await Promise.all([
      this.notifications.listForRecipient(recipient),
      this.notifications.countUnread(recipient),
    ]);
    return { agent: recipient, unread, items };
  }
}
