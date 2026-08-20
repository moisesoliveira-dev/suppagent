import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';
import {
  TICKET_MESSAGE_SOURCE,
  type TicketMessageSourcePort,
} from '../domain/ticket-message-source.port';

@Injectable()
export class ForwardTeamMessageToTicketService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
    @Inject(TICKET_MESSAGE_SOURCE)
    private readonly tickets: TicketMessageSourcePort,
  ) {}

  async execute(chatId: string, messageId: string, targetTicketId: number) {
    const source = await this.chats.findById(chatId);
    if (!source) throw new Error(`chat ${chatId} não encontrado`);
    const message = source.messages.find((item) => item.id === messageId);
    if (!message || message.deletedAt) throw new Error('mensagem não encontrada');
    await this.tickets.receiveForwarded(targetTicketId, {
      text: message.text,
      fromName: message.forwardedFromName ?? message.authorName,
    });
  }
}
