import { Inject, Injectable } from '@nestjs/common';
import { KnowledgeArticle } from '../domain/knowledge-article';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from '../domain/knowledge-article.repository';
import { KnowledgeFromTicketAlreadyExistsError } from '../domain/knowledge.errors';

@Injectable()
export class CreateKnowledgeArticleService {
  constructor(
    @Inject(KNOWLEDGE_ARTICLE_REPOSITORY)
    private readonly articles: KnowledgeArticleRepository,
  ) {}

  async execute(input: {
    title: string;
    category: string;
    body: string;
    tags?: string[];
    published?: boolean;
    authorName: string;
    sourceTicketId?: number | null;
  }) {
    if (input.sourceTicketId != null) {
      const existing = await this.articles.findBySourceTicketId(
        input.sourceTicketId,
      );
      if (existing) {
        throw new KnowledgeFromTicketAlreadyExistsError(input.sourceTicketId);
      }
    }

    const article = KnowledgeArticle.create(input);
    return this.articles.save(article);
  }
}
