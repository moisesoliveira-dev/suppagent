import { Inject, Injectable } from '@nestjs/common';
import { AiChatSession } from '../domain/ai-chat-session';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';

@Injectable()
export class CreateAiChatSessionService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  async execute(input: {
    ownerHandle: string;
    title?: string;
  }): Promise<AiChatSession> {
    const session = AiChatSession.create({
      ownerHandle: input.ownerHandle,
      title: input.title,
    });
    await this.sessions.save(session);
    return session;
  }
}
