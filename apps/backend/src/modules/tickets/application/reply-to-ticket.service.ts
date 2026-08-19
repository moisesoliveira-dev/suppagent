import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

@Injectable()
export class ReplyToTicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(id: number, text: string, isInternalNote: boolean) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new TicketNotFoundError(id);
    ticket.reply(text, isInternalNote);
    return this.tickets.save(ticket);
  }
}
