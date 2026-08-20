import { Inject, Injectable } from '@nestjs/common';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';

@Injectable()
export class DeleteTeamChatService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
  ) {}

  async execute(id: string) {
    const chat = await this.chats.findById(id);
    if (!chat) throw new Error(`chat ${id} não encontrado`);
    await this.chats.delete(id);
  }
}
