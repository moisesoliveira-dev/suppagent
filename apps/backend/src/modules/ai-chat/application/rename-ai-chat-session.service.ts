import { Inject, Injectable } from '@nestjs/common';
import type { AiChatSession } from '../domain/ai-chat-session';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';
import { AiChatSessionNotFoundError } from '../domain/ai-chat.errors';

@Injectable()
export class RenameAiChatSessionService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  async execute(input: {
    id: string;
    ownerHandle: string;
    title: string;
  }): Promise<AiChatSession> {
    const session = await this.sessions.findByIdForOwner(
      input.id,
      input.ownerHandle.trim().toLowerCase(),
    );
    if (!session) throw new AiChatSessionNotFoundError(input.id);
    session.rename(input.title);
    await this.sessions.save(session);
    return session;
  }
}
