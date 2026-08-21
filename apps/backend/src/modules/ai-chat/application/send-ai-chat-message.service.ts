import { Inject, Injectable } from '@nestjs/common';
import { replyToPrompt } from '../domain/ai-chat-replies';
import type { AiChatSession } from '../domain/ai-chat-session';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';
import { AiChatSessionNotFoundError } from '../domain/ai-chat.errors';

@Injectable()
export class SendAiChatMessageService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  async execute(input: {
    id: string;
    ownerHandle: string;
    text: string;
  }): Promise<AiChatSession> {
    const session = await this.sessions.findByIdForOwner(
      input.id,
      input.ownerHandle.trim().toLowerCase(),
    );
    if (!session) throw new AiChatSessionNotFoundError(input.id);
    session.appendExchange(input.text, replyToPrompt(input.text));
    await this.sessions.save(session);
    return session;
  }
}
