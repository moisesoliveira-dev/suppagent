import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ListNotificationsService } from '../application/list-notifications.service';
import { MarkAllNotificationsReadService } from '../application/mark-all-notifications-read.service';
import { MarkNotificationReadService } from '../application/mark-notification-read.service';
import {
  GetNotificationPreferencesService,
  UpdateNotificationPreferencesService,
} from '../application/notification-preferences.service';
import { toNotificationHttp, toPreferencesHttp } from './notification.http';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly listNotifications: ListNotificationsService,
    private readonly markRead: MarkNotificationReadService,
    private readonly markAllRead: MarkAllNotificationsReadService,
    private readonly getPrefs: GetNotificationPreferencesService,
    private readonly updatePrefs: UpdateNotificationPreferencesService,
  ) {}

  @Get()
  async list(@Query('agent') agent?: string) {
    const result = await this.listNotifications.execute(agent ?? '');
    return {
      agent: result.agent,
      unread: result.unread,
      items: result.items.map(toNotificationHttp),
    };
  }

  @Get('preferences')
  async preferences(@Query('agent') agent?: string) {
    const prefs = await this.getPrefs.execute(agent ?? '');
    return toPreferencesHttp(prefs);
  }

  @Patch('preferences')
  async updatePreferences(
    @Query('agent') agent: string | undefined,
    @Body()
    body: {
      assigned?: boolean;
      sla?: boolean;
      digest?: boolean;
      sound?: boolean;
    },
  ) {
    const prefs = await this.updatePrefs.execute(agent ?? '', body);
    return toPreferencesHttp(prefs);
  }

  @Post('read-all')
  async readAll(@Query('agent') agent?: string) {
    return this.markAllRead.execute(agent ?? '');
  }

  @Post(':id/read')
  async read(@Param('id') id: string, @Query('agent') agent?: string) {
    const item = await this.markRead.execute(id, agent ?? '');
    if (!item) throw new NotFoundException('notificação não encontrada');
    return toNotificationHttp(item);
  }
}
