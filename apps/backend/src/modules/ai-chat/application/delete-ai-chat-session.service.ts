import { Inject, Injectable } from '@nestjs/common';
import {
  AI_CHAT_SESSION_REPOSITORY,
  type AiChatSessionRepository,
} from '../domain/ai-chat-session.repository';
import { AiChatSessionNotFoundError } from '../domain/ai-chat.errors';

@Injectable()
export class DeleteAiChatSessionService {
  constructor(
    @Inject(AI_CHAT_SESSION_REPOSITORY)
    private readonly sessions: AiChatSessionRepository,
  ) {}

  async execute(id: string, ownerHandle: string): Promise<void> {
    const owner = ownerHandle.trim().toLowerCase();
    const session = await this.sessions.findByIdForOwner(id, owner);
    if (!session) throw new AiChatSessionNotFoundError(id);
    await this.sessions.delete(id, owner);
  }
}
