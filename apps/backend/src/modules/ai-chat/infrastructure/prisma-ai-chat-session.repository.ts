import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { AiChatSession } from '../domain/ai-chat-session';
import type {
  AiChatSessionRepository,
  AiChatSessionSummary,
} from '../domain/ai-chat-session.repository';
import { toDomainSession, toPrismaRole } from './ai-chat.mapper';

@Injectable()
export class PrismaAiChatSessionRepository
  implements AiChatSessionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async listByOwner(ownerHandle: string): Promise<AiChatSessionSummary[]> {
    const records = await this.prisma.aiChatSession.findMany({
      where: { ownerHandle },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
    return records.map((record) => ({
      id: record.id,
      title: record.title,
      updatedAt: record.updatedAt,
      createdAt: record.createdAt,
      messageCount: record._count.messages,
    }));
  }

  async findByIdForOwner(
    id: string,
    ownerHandle: string,
  ): Promise<AiChatSession | null> {
    const record = await this.prisma.aiChatSession.findFirst({
      where: { id, ownerHandle },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    return record ? toDomainSession(record) : null;
  }

  async save(session: AiChatSession): Promise<void> {
    const existing = await this.prisma.aiChatSession.findUnique({
      where: { id: session.id },
      select: { id: true },
    });

    if (!existing) {
      await this.prisma.aiChatSession.create({
        data: {
          id: session.id,
          title: session.title,
          ownerHandle: session.ownerHandle,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messages: {
            create: session.messages.map((message) => ({
              id: message.id,
              role: toPrismaRole(message.role),
              content: message.content,
              createdAt: message.createdAt,
              updatedAt: message.createdAt,
            })),
          },
        },
      });
      return;
    }

    const persisted = await this.prisma.aiChatMessage.findMany({
      where: { sessionId: session.id },
      select: { id: true },
    });
    const known = new Set(persisted.map((item) => item.id));
    const toCreate = session.messages.filter((message) => !known.has(message.id));

    await this.prisma.$transaction([
      this.prisma.aiChatSession.update({
        where: { id: session.id },
        data: {
          title: session.title,
          updatedAt: session.updatedAt,
        },
      }),
      ...toCreate.map((message) =>
        this.prisma.aiChatMessage.create({
          data: {
            id: message.id,
            sessionId: session.id,
            role: toPrismaRole(message.role),
            content: message.content,
            createdAt: message.createdAt,
            updatedAt: message.createdAt,
          },
        }),
      ),
    ]);
  }

  async delete(id: string, ownerHandle: string): Promise<void> {
    await this.prisma.aiChatSession.deleteMany({
      where: { id, ownerHandle },
    });
  }
}
