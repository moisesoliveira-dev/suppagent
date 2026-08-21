import { Inject, Injectable } from '@nestjs/common';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';

@Injectable()
export class ListAiChatSessionsService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  execute(ownerHandle: string) {
    return this.sessions.listByOwner(ownerHandle.trim().toLowerCase());
  }
}
