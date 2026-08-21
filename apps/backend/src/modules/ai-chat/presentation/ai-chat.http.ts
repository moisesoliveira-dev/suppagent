import type { AiChatSession } from '../domain/ai-chat-session';
import type { AiChatSessionSummary } from '../domain/ai-chat-session.repository';

export function toSessionSummaryHttp(summary: AiChatSessionSummary) {
  return {
    id: summary.id,
    title: summary.title,
    messageCount: summary.messageCount,
    createdAt: summary.createdAt.toISOString(),
    updatedAt: summary.updatedAt.toISOString(),
  };
}

export function toSessionDetailHttp(session: AiChatSession) {
  return {
    id: session.id,
    title: session.title,
    ownerHandle: session.ownerHandle,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    messages: session.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    })),
  };
}
