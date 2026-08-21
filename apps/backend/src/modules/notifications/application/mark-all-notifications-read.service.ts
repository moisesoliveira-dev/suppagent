import { Inject, Injectable } from '@nestjs/common';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../domain/notification.repository';

@Injectable()
export class MarkAllNotificationsReadService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  async execute(handle: string) {
    const agent = handle.trim() || 'c.reis';
    const updated = await this.notifications.markAllRead(agent);
    return { agent, updated };
  }
}
