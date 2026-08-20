import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';

@Injectable()
export class EditTeamChatMessageService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
  ) {}

  async execute(chatId: string, messageId: string, text: string) {
    const chat = await this.chats.findById(chatId);
    if (!chat) throw new Error(`chat ${chatId} não encontrado`);
    chat.editMessage(messageId, text);
    return this.chats.save(chat);
  }
}
