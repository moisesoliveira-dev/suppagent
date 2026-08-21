import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';
import { TicketNotificationBridge } from './ticket-notification.bridge';

@Injectable()
export class ReopenTicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
    private readonly notifications: TicketNotificationBridge,
  ) {}

  async execute(id: number, reason: string) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new TicketNotFoundError(id);
    ticket.reopen(reason);
    const saved = await this.tickets.save(ticket);
    await this.notifications.onReopened(saved);
    return saved;
  }
}
