import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type AppNotification,
  type NotificationPreferences,
  type NotificationType,
} from '../domain/notification';
import type {
  CreateNotificationInput,
  NotificationRepository,
} from '../domain/notification.repository';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(items: CreateNotificationInput[]): Promise<AppNotification[]> {
    if (items.length === 0) return [];
    const now = new Date();
    const rows = items.map((item) => ({
      id: randomUUID(),
      recipientHandle: item.recipientHandle,
      type: item.type,
      title: item.title,
      body: item.body,
      ticketId: item.ticketId ?? null,
      readAt: null,
      createdAt: now,
      updatedAt: now,
    }));
    await this.prisma.notification.createMany({ data: rows });
    return rows.map((row) => ({
      ...row,
      type: row.type as NotificationType,
    }));
  }

  async listForRecipient(
    handle: string,
    limit = 40,
  ): Promise<AppNotification[]> {
    const rows = await this.prisma.notification.findMany({
      where: { recipientHandle: handle },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 100),
    });
    return rows.map(toDomain);
  }

  countUnread(handle: string): Promise<number> {
    return this.prisma.notification.count({
      where: { recipientHandle: handle, readAt: null },
    });
  }

  async markRead(
    id: string,
    handle: string,
  ): Promise<AppNotification | null> {
    const existing = await this.prisma.notification.findFirst({
      where: { id, recipientHandle: handle },
    });
    if (!existing) return null;
    if (existing.readAt) return toDomain(existing);
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return toDomain(updated);
  }

  async markAllRead(handle: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: { recipientHandle: handle, readAt: null },
      data: { readAt: new Date() },
    });
    return result.count;
  }

  async getPreferences(handle: string): Promise<NotificationPreferences> {
    const row = await this.prisma.notificationPreference.findUnique({
      where: { recipientHandle: handle },
    });
    if (!row) {
      return { recipientHandle: handle, ...DEFAULT_NOTIFICATION_PREFERENCES };
    }
    return {
      recipientHandle: row.recipientHandle,
      assigned: row.assigned,
      sla: row.sla,
      digest: row.digest,
      sound: row.sound,
    };
  }

  async savePreferences(
    prefs: NotificationPreferences,
  ): Promise<NotificationPreferences> {
    const row = await this.prisma.notificationPreference.upsert({
      where: { recipientHandle: prefs.recipientHandle },
      create: {
        recipientHandle: prefs.recipientHandle,
        assigned: prefs.assigned,
        sla: prefs.sla,
        digest: prefs.digest,
        sound: prefs.sound,
      },
      update: {
        assigned: prefs.assigned,
        sla: prefs.sla,
        digest: prefs.digest,
        sound: prefs.sound,
      },
    });
    return {
      recipientHandle: row.recipientHandle,
      assigned: row.assigned,
      sla: row.sla,
      digest: row.digest,
      sound: row.sound,
    };
  }

  async listTechnicianHandles(): Promise<string[]> {
    const users = await this.prisma.user.findMany({
      where: { role: 'TECHNICIAN', handle: { not: null } },
      select: { handle: true },
    });
    return users
      .map((user) => user.handle)
      .filter((handle): handle is string => Boolean(handle));
  }
}

function toDomain(row: {
  id: string;
  recipientHandle: string;
  type: string;
  title: string;
  body: string;
  ticketId: number | null;
  readAt: Date | null;
  createdAt: Date;
}): AppNotification {
  return {
    id: row.id,
    recipientHandle: row.recipientHandle,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    ticketId: row.ticketId,
    readAt: row.readAt,
    createdAt: row.createdAt,
  };
}
