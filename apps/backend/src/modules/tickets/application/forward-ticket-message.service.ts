import { Inject, Injectable } from '@nestjs/common';
import { TicketNotFoundError } from '../domain/ticket.errors';
import {
  TICKET_REPOSITORY,
  type TicketRepository,
} from '../domain/ticket.repository';

@Injectable()
export class ForwardTicketMessageService {
  constructor(
    @Inject(TICKET_REPOSITORY) private readonly tickets: TicketRepository,
  ) {}

  async execute(
    sourceTicketId: number,
    messageId: string,
    targetTicketId: number,
  ) {
    if (sourceTicketId === targetTicketId) {
      throw new Error('escolha outro chamado para encaminhar');
    }

    const source = await this.tickets.findById(sourceTicketId);
    if (!source) throw new TicketNotFoundError(sourceTicketId);
    const message = source.history.find((entry) => entry.id === messageId);
    if (!message) throw new Error('mensagem não encontrada');
    if (message.deletedAt) throw new Error('mensagem apagada não pode ser encaminhada');
    if (message.isInternalNote) {
      throw new Error('nota interna não pode ser encaminhada');
    }

    const target = await this.tickets.findById(targetTicketId);
    if (!target) throw new TicketNotFoundError(targetTicketId);

    const fromName =
      message.forwardedFromName ?? source.authorDisplayName(message);
    target.receiveForwarded({
      text: message.text,
      fromName,
    });
    return this.tickets.save(target);
  }
}
