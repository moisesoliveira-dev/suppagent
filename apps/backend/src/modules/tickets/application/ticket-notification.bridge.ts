import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  NOTIFICATION_WRITER,
  type NotificationWriter,
} from '../../notifications/domain/notification-writer.port';
import type { Ticket } from '../domain/ticket';

@Injectable()
export class TicketNotificationBridge {
  constructor(
    @Optional()
    @Inject(NOTIFICATION_WRITER)
    private readonly notifications?: NotificationWriter,
  ) {}

  async onCreated(ticket: Ticket) {
    if (!this.notifications) return;
    const techs = await this.notifications.listTechnicianHandles();
    if (techs.length === 0) return;

    if (ticket.priority === 'urgent') {
      await this.notifications.notifyTicket({
        type: 'ticket_urgent',
        recipientHandles: techs,
        title: 'chamado urgente aberto',
        body: `#${ticket.id} — ${ticket.subject}`,
        ticketId: ticket.id,
      });
      return;
    }

    await this.notifications.notifyTicket({
      type: 'ticket_opened',
      recipientHandles: techs,
      title: 'novo chamado na fila',
      body: `#${ticket.id} — ${ticket.subject}`,
      ticketId: ticket.id,
    });
  }

  async onAssigned(ticket: Ticket, agentId: string) {
    if (!this.notifications || !agentId.trim()) return;
    await this.notifications.notifyTicket({
      type: 'ticket_assigned',
      recipientHandles: [agentId],
      title: 'chamado atribuído a você',
      body: `#${ticket.id} — ${ticket.subject}`,
      ticketId: ticket.id,
    });
  }

  async onReopened(ticket: Ticket) {
    if (!this.notifications || !ticket.agentId) return;
    await this.notifications.notifyTicket({
      type: 'ticket_reopened',
      recipientHandles: [ticket.agentId],
      title: 'chamado reaberto',
      body: `#${ticket.id} — ${ticket.subject}`,
      ticketId: ticket.id,
    });
  }
}
