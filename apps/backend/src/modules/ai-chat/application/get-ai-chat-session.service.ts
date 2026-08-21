import { Inject, Injectable } from '@nestjs/common';
import { AiChatSession } from '../domain/ai-chat-session';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';
import { AiChatSessionNotFoundError } from '../domain/ai-chat.errors';

@Injectable()
export class GetAiChatSessionService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  async execute(id: string, ownerHandle: string): Promise<AiChatSession> {
    const session = await this.sessions.findByIdForOwner(
      id,
      ownerHandle.trim().toLowerCase(),
    );
    if (!session) throw new AiChatSessionNotFoundError(id);
    return session;
  }
}
