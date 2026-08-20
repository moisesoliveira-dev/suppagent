import type { KnowledgeArticle } from './knowledge-article';

export const KNOWLEDGE_ARTICLE_REPOSITORY = Symbol(
  'KNOWLEDGE_ARTICLE_REPOSITORY',
);

export type KnowledgeListFilter = {
  category?: string;
  q?: string;
};

export interface KnowledgeArticleRepository {
  findById(id: string): Promise<KnowledgeArticle | null>;
  findBySourceTicketId(ticketId: number): Promise<KnowledgeArticle | null>;
  list(filter?: KnowledgeListFilter): Promise<KnowledgeArticle[]>;
  save(article: KnowledgeArticle): Promise<KnowledgeArticle>;
}
