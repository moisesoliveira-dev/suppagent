import { Injectable } from '@nestjs/common';
import type { Prisma } from '../../../generated/client';
import { PrismaService } from '../../../shared/infrastructure/persistence/prisma.service';
import type { KnowledgeArticle } from '../domain/knowledge-article';
import type {
  KnowledgeArticleRepository,
  KnowledgeListFilter,
} from '../domain/knowledge-article.repository';
import { toDomainArticle } from './knowledge-article.mapper';

@Injectable()
export class PrismaKnowledgeArticleRepository
  implements KnowledgeArticleRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<KnowledgeArticle | null> {
    const record = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
    });
    return record ? toDomainArticle(record) : null;
  }

  async findBySourceTicketId(
    ticketId: number,
  ): Promise<KnowledgeArticle | null> {
    const record = await this.prisma.knowledgeArticle.findUnique({
      where: { sourceTicketId: ticketId },
    });
    return record ? toDomainArticle(record) : null;
  }

  async list(filter?: KnowledgeListFilter): Promise<KnowledgeArticle[]> {
    const where: Prisma.KnowledgeArticleWhereInput = {};
    if (filter?.category?.trim()) {
      where.category = filter.category.trim().toLowerCase();
    }
    if (filter?.q?.trim()) {
      const q = filter.q.trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
        { tags: { has: q.toLowerCase() } },
      ];
    }

    const records = await this.prisma.knowledgeArticle.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
    return records.map(toDomainArticle);
  }

  async save(article: KnowledgeArticle): Promise<KnowledgeArticle> {
    const data = {
      title: article.title,
      category: article.category,
      body: article.body,
      tags: [...article.tags],
      published: article.published,
      authorName: article.authorName,
      views: article.views,
      usefulPercent: article.usefulPercent,
      ticketsAvoided: article.ticketsAvoided,
      sourceTicketId: article.sourceTicketId,
      updatedAt: article.updatedAt,
    };

    if (article.isNew) {
      const created = await this.prisma.knowledgeArticle.create({
        data: {
          ...data,
          createdAt: article.createdAt,
        },
      });
      return toDomainArticle(created);
    }

    const updated = await this.prisma.knowledgeArticle.update({
      where: { id: article.id },
      data,
    });
    return toDomainArticle(updated);
  }
}
