import { Inject, Injectable } from '@nestjs/common';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
} from '../domain/notification';
import {
  NOTIFICATION_REPOSITORY,
  type NotificationRepository,
} from '../domain/notification.repository';

@Injectable()
export class GetNotificationPreferencesService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  execute(handle: string) {
    return this.notifications.getPreferences(handle.trim() || 'c.reis');
  }
}

@Injectable()
export class UpdateNotificationPreferencesService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notifications: NotificationRepository,
  ) {}

  execute(
    handle: string,
    patch: Partial<Omit<NotificationPreferences, 'recipientHandle'>>,
  ) {
    const recipientHandle = handle.trim() || 'c.reis';
    return this.notifications.getPreferences(recipientHandle).then((current) =>
      this.notifications.savePreferences({
        recipientHandle,
        assigned: patch.assigned ?? current.assigned,
        sla: patch.sla ?? current.sla,
        digest: patch.digest ?? current.digest,
        sound: patch.sound ?? current.sound,
      }),
    );
  }
}

export { DEFAULT_NOTIFICATION_PREFERENCES };
