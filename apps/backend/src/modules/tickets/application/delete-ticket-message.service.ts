import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

@Injectable()
export class DeleteTicketMessageService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(ticketId: number, messageId: string) {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) throw new TicketNotFoundError(ticketId);
    ticket.deleteMessage(messageId);
    return this.tickets.save(ticket);
  }
}
