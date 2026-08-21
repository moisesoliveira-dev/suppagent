import { Inject, Injectable } from '@nestjs/common';
import { Ticket } from '../domain/ticket';
import type { TicketPriority } from '../domain/ticket-priority';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';
import { TicketNotificationBridge } from './ticket-notification.bridge';

export type CreateTicketCommand = {
  subject: string;
  priority: TicketPriority;
  category: string;
  requesterName: string;
  requesterEmail: string;
  message: string;
};

@Injectable()
export class CreateTicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
    private readonly notifications: TicketNotificationBridge,
  ) {}

  async execute(command: CreateTicketCommand) {
    const ticket = Ticket.open(command);
    const saved = await this.tickets.save(ticket);
    await this.notifications.onCreated(saved);
    return saved;
  }
}
