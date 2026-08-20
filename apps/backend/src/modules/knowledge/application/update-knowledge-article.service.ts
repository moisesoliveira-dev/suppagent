import { Inject, Injectable } from '@nestjs/common';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from '../domain/knowledge-article.repository';
import { KnowledgeArticleNotFoundError } from '../domain/knowledge.errors';

@Injectable()
export class UpdateKnowledgeArticleService {
  constructor(
    @Inject(KNOWLEDGE_ARTICLE_REPOSITORY)
    private readonly articles: KnowledgeArticleRepository,
  ) {}

  async execute(
    id: string,
    input: {
      title?: string;
      category?: string;
      body?: string;
      tags?: string[];
      published?: boolean;
    },
  ) {
    const article = await this.articles.findById(id);
    if (!article) throw new KnowledgeArticleNotFoundError(id);
    article.update(input);
    return this.articles.save(article);
  }
}
