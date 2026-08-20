import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';

@Injectable()
export class PostTeamChatMessageService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
  ) {}

  async execute(
    chatId: string,
    text: string,
    author: { handle: string; name: string },
    replyToId?: string | null,
  ) {
    const chat = await this.chats.findById(chatId);
    if (!chat) throw new Error(`chat ${chatId} não encontrado`);
    chat.post(text, author, new Date(), replyToId);
    return this.chats.save(chat);
  }
}
