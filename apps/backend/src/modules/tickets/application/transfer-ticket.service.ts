import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

@Injectable()
export class TransferTicketService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(id: number, agentId: string | null) {
    const ticket = await this.tickets.findById(id);
    if (!ticket) throw new TicketNotFoundError(id);
    ticket.transfer(agentId);
    return this.tickets.save(ticket);
  }
}
