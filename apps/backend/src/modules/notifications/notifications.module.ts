import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { ListNotificationsService } from './application/list-notifications.service';
import { MarkAllNotificationsReadService } from './application/mark-all-notifications-read.service';
import { MarkNotificationReadService } from './application/mark-notification-read.service';
import { NotifyTicketEventService } from './application/notify-ticket-event.service';
import {
  GetNotificationPreferencesService,
  UpdateNotificationPreferencesService,
} from './application/notification-preferences.service';
import { NOTIFICATION_WRITER } from './domain/notification-writer.port';
import { NOTIFICATION_REPOSITORY } from './domain/notification.repository';
import { PrismaNotificationRepository } from './infrastructure/prisma-notification.repository';
import { NotificationsController } from './presentation/notifications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NotificationsController],
  providers: [
    ListNotificationsService,
    MarkNotificationReadService,
    MarkAllNotificationsReadService,
    GetNotificationPreferencesService,
    UpdateNotificationPreferencesService,
    NotifyTicketEventService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
    {
      provide: NOTIFICATION_WRITER,
      useExisting: NotifyTicketEventService,
    },
  ],
  exports: [NOTIFICATION_WRITER],
})
export class NotificationsModule {}
