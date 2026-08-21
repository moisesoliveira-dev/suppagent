import {
  AiChatRole as PrismaRole,
  type AiChatMessage as PrismaMessage,
  type AiChatSession as PrismaSession,
} from '../../../generated/client';
import {
  AiChatSession,
  type AiChatMessageProps,
  type AiChatRole,
} from '../domain/ai-chat-session';

const TO_DOMAIN: Record<PrismaRole, AiChatRole> = {
  USER: 'user',
  ASSISTANT: 'assistant',
};

const TO_PRISMA: Record<AiChatRole, PrismaRole> = {
  user: PrismaRole.USER,
  assistant: PrismaRole.ASSISTANT,
};

export function toDomainSession(
  record: PrismaSession & { messages: PrismaMessage[] },
): AiChatSession {
  const messages: AiChatMessageProps[] = record.messages.map((message) => ({
    id: message.id,
    role: TO_DOMAIN[message.role],
    content: message.content,
    createdAt: message.createdAt,
  }));
  return AiChatSession.reconstitute({
    id: record.id,
    title: record.title,
    ownerHandle: record.ownerHandle,
    messages,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

export function toPrismaRole(role: AiChatRole): PrismaRole {
  return TO_PRISMA[role];
}
