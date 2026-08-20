import { Inject, Injectable } from '@nestjs/common';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from '../domain/knowledge-article.repository';
import { KnowledgeArticleNotFoundError } from '../domain/knowledge.errors';

@Injectable()
export class GetKnowledgeArticleService {
  constructor(
    @Inject(KNOWLEDGE_ARTICLE_REPOSITORY)
    private readonly articles: KnowledgeArticleRepository,
  ) {}

  async execute(id: string, options?: { registerView?: boolean }) {
    const article = await this.articles.findById(id);
    if (!article) throw new KnowledgeArticleNotFoundError(id);
    if (options?.registerView) {
      article.registerView();
      return this.articles.save(article);
    }
    return article;
  }
}
