import { Inject, Injectable } from '@nestjs/common';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from '../domain/knowledge-article.repository';

@Injectable()
export class ListKnowledgeArticlesService {
  constructor(
    @Inject(KNOWLEDGE_ARTICLE_REPOSITORY)
    private readonly articles: KnowledgeArticleRepository,
  ) {}

  execute(filter?: { category?: string; q?: string }) {
    return this.articles.list(filter);
  }
}
