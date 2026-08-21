import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';
import { TicketNotificationBridge } from './ticket-notification.bridge';

@Injectable()
export class ClaimTicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
    private readonly notifications: TicketNotificationBridge,
  ) {}

  async execute(id: number, agentId: string) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new TicketNotFoundError(id);
    ticket.claim(agentId);
    const saved = await this.tickets.save(ticket);
    await this.notifications.onAssigned(saved, agentId);
    return saved;
  }
}
