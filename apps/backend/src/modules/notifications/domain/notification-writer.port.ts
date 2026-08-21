import type { NotificationType } from './notification';

export const NOTIFICATION_WRITER = Symbol('NOTIFICATION_WRITER');

export type TicketNotificationCommand = {
  type: NotificationType;
  recipientHandles: string[];
  title: string;
  body: string;
  ticketId: number;
};

export interface NotificationWriter {
  notifyTicket(command: TicketNotificationCommand): Promise<void>;
  listTechnicianHandles(): Promise<string[]>;
}
