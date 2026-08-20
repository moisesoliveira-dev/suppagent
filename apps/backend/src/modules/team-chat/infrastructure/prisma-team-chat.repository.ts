import { Injectable } from '@nestjs/common';
import { TeamChatKind as PrismaTeamChatKind } from '../../../generated/client';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import { TeamChat } from '../domain/team-chat';
import type { TeamChatRepository } from '../domain/team-chat.repository';

const messageInclude = {
  messages: { orderBy: { occurredAt: 'asc' as const } },
};

@Injectable()
export class PrismaTeamChatRepository implements TeamChatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<TeamChat | null> {
    const record = await this.prisma.teamChat.findUnique({
      where: { id },
      include: messageInclude,
    });
    return record ? toDomain(record) : null;
  }

  async findAll(): Promise<TeamChat[]> {
    const records = await this.prisma.teamChat.findMany({
      include: messageInclude,
      orderBy: { name: 'asc' },
    });
    return records.map(toDomain);
  }

  async save(chat: TeamChat): Promise<TeamChat> {
    const messages = chat.messages.map((message) => ({
      id: message.id,
      occurredAt: message.occurredAt,
      text: message.text,
      authorHandle: message.authorHandle,
      authorName: message.authorName,
      deletedAt: message.deletedAt,
      editedAt: message.editedAt,
      pinnedAt: message.pinnedAt,
      replyToId: message.replyToId,
      forwardedFromName: message.forwardedFromName,
    }));

    const existing = await this.prisma.teamChat.findUnique({
      where: { id: chat.id },
      select: { id: true },
    });

    if (!existing) {
      const created = await this.prisma.teamChat.create({
        data: {
          id: chat.id,
          name: chat.name,
          kind: chat.kind === 'direct' ? PrismaTeamChatKind.DIRECT : PrismaTeamChatKind.CHANNEL,
          createdAt: chat.createdAt,
          messages: { create: messages },
        },
        include: messageInclude,
      });
      return toDomain(created);
    }

    const saved = await this.prisma.$transaction(async (tx) => {
      await tx.teamChat.update({
        where: { id: chat.id },
        data: { name: chat.name },
      });
      await tx.teamChatMessage.deleteMany({ where: { chatId: chat.id } });
      await tx.teamChatMessage.createMany({
        data: messages.map((message) => ({ ...message, chatId: chat.id })),
      });
      return tx.teamChat.findUniqueOrThrow({
        where: { id: chat.id },
        include: messageInclude,
      });
    });

    return toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.teamChat.delete({ where: { id } });
  }
}

function toDomain(record: {
  id: string;
  name: string;
  kind: PrismaTeamChatKind;
  createdAt: Date;
  messages: {
    id: string;
    occurredAt: Date;
    text: string;
    authorHandle: string;
    authorName: string;
    deletedAt: Date | null;
    editedAt: Date | null;
    pinnedAt: Date | null;
    replyToId: string | null;
    forwardedFromName: string | null;
  }[];
}): TeamChat {
  return TeamChat.reconstitute({
    id: record.id,
    name: record.name,
    kind: record.kind === PrismaTeamChatKind.DIRECT ? 'direct' : 'channel',
    createdAt: record.createdAt,
    messages: record.messages,
  });
}
