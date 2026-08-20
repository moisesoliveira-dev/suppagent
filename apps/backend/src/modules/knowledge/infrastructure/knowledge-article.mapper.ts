import { KnowledgeArticle } from '../domain/knowledge-article';

type ArticleRecord = {
  id: string;
  title: string;
  category: string;
  body: string;
  tags: string[];
  published: boolean;
  authorName: string;
  views: number;
  usefulPercent: number;
  ticketsAvoided: number;
  sourceTicketId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toDomainArticle(record: ArticleRecord): KnowledgeArticle {
  return KnowledgeArticle.reconstitute(record);
}
