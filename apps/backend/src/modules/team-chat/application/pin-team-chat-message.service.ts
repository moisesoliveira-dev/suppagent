import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';

@Injectable()
export class PinTeamChatMessageService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
  ) {}

  async execute(chatId: string, messageId: string) {
    const chat = await this.chats.findById(chatId);
    if (!chat) throw new Error(`chat ${chatId} não encontrado`);
    chat.togglePinMessage(messageId);
    return this.chats.save(chat);
  }
}
