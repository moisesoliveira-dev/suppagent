import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

@Injectable()
export class MarkTicketWaitingService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(id: number) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new TicketNotFoundError(id);
    ticket.markWaiting();
    return this.tickets.save(ticket);
  }
}
