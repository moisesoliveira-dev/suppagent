import { Inject, Injectable } from '@nestjs/common';
import { TeamChat } from '../domain/team-chat';
import {
  TEAM_CHAT_REPOSITORY,
  type TeamChatRepository,
} from '../domain/team-chat.repository';

@Injectable()
export class CreateTeamChatService {
  constructor(
    @Inject(TEAM_CHAT_REPOSITORY) private readonly chats: TeamChatRepository,
  ) {}

  async execute(name: string) {
    const chat = TeamChat.createChannel(name);
    return this.chats.save(chat);
  }
}
