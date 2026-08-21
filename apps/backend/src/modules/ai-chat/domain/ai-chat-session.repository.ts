import type { AiChatSession } from './ai-chat-session';

export const AI_CHAT_SESSION_REPOSITORY = Symbol('AI_CHAT_SESSION_REPOSITORY');

export type AiChatSessionSummary = {
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  messageCount: number;
};

export interface AiChatSessionRepository {
  listByOwner(ownerHandle: string): Promise<AiChatSessionSummary[]>;
  findByIdForOwner(
    id: string,
    ownerHandle: string,
  ): Promise<AiChatSession | null>;
  save(session: AiChatSession): Promise<void>;
  delete(id: string, ownerHandle: string): Promise<void>;
}
