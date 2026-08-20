import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';
import {
  TICKET_MESSAGE_SOURCE,
  type TicketMessageSourcePort,
} from '../domain/ticket-message-source.port';

const DEFAULT_AUTHOR = { handle: 'c.reis', name: 'camila reis' };

@Injectable()
export class ForwardIntoTeamChatService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
    @Inject(TICKET_MESSAGE_SOURCE)
    private readonly tickets: TicketMessageSourcePort,
  ) {}

  async execute(input: {
    targetChatId: string;
    fromTicketId?: number;
    fromTeamChatId?: string;
    messageId: string;
    author?: { handle: string; name: string };
  }) {
    const target = await this.chats.findById(input.targetChatId);
    if (!target) throw new Error(`chat ${input.targetChatId} não encontrado`);

    let text = '';
    let fromName = '';

    if (input.fromTicketId != null) {
      const snapshot = await this.tickets.getPublicMessage(
        input.fromTicketId,
        input.messageId,
      );
      if (!snapshot) throw new Error('mensagem não encontrada');
      text = snapshot.text;
      fromName = snapshot.fromName;
    } else if (input.fromTeamChatId) {
      if (input.fromTeamChatId === input.targetChatId) {
        throw new Error('escolha outro bate-papo para encaminhar');
      }
      const source = await this.chats.findById(input.fromTeamChatId);
      if (!source) throw new Error(`chat ${input.fromTeamChatId} não encontrado`);
      const message = source.messages.find((item) => item.id === input.messageId);
      if (!message || message.deletedAt) throw new Error('mensagem não encontrada');
      text = message.text;
      fromName = message.forwardedFromName ?? message.authorName;
    } else {
      throw new Error('origem do encaminhamento é obrigatória');
    }

    target.receiveForwarded({
      text,
      fromName,
      author: input.author ?? DEFAULT_AUTHOR,
    });
    return this.chats.save(target);
  }
}
