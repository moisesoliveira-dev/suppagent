import { Injectable } from '@nestjs/common';
import { TICKET_REPOSITORY, type TicketRepository } from '../../tickets/domain/ticket.repository';
import { Inject } from '@nestjs/common';
import type {
  TicketMessageSnapshot,
  TicketMessageSourcePort,
} from '../domain/ticket-message-source.port';

@Injectable()
export class PrismaTicketMessageSourceAdapter implements TicketMessageSourcePort {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async getPublicMessage(
    ticketId: number,
    messageId: string,
  ): Promise<TicketMessageSnapshot | null> {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) return null;
    const message = ticket.history.find((entry) => entry.id === messageId);
    if (!message || message.deletedAt || message.isInternalNote) return null;
    return {
      text: message.text,
      fromName: message.forwardedFromName ?? ticket.authorDisplayName(message),
    };
  }

  async receiveForwarded(
    ticketId: number,
    input: { text: string; fromName: string },
  ): Promise<void> {
    const ticket = await this.tickets.findById(ticketId);
    if (!ticket) throw new Error(`chamado ${ticketId} não encontrado`);
    ticket.receiveForwarded(input);
    await this.tickets.save(ticket);
  }
}
