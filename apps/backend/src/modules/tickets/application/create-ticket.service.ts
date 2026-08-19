import { Inject, Injectable } from '@nestjs/common';
import { Ticket } from '../domain/ticket';
import type { TicketPriority } from '../domain/ticket-priority';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

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
  ) {}

  execute(command: CreateTicketCommand) {
    const ticket = Ticket.open(command);
    return this.tickets.save(ticket);
  }
}
