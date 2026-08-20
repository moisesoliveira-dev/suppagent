import type { KnowledgeArticle } from '../domain/knowledge-article';

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatAge(from: Date, now: Date): string {
  const delta = Math.max(0, now.getTime() - from.getTime());
  if (delta < HOUR) return `${Math.max(1, Math.round(delta / MINUTE))}m`;
  if (delta < DAY) return `${Math.max(1, Math.round(delta / HOUR))}h`;
  if (delta < 7 * DAY) return `${Math.max(1, Math.round(delta / DAY))}d`;
  return `${Math.max(1, Math.round(delta / (7 * DAY)))}sem`;
}

function formatUpdatedLabel(from: Date, now: Date): string {
  const age = formatAge(from, now);
  if (age.endsWith('m') || age.endsWith('h')) return `atualizado há ${age}`;
  if (age.endsWith('d')) return `atualizado há ${age}`;
  return `atualizado há ${age}`;
}

export type KnowledgeArticleHttp = {
  id: string;
  title: string;
  category: string;
  body: string;
  tags: string[];
  published: boolean;
  author: string;
  views: number;
  viewsLabel: string;
  useful: string;
  saved: string;
  age: string;
  meta: string;
  sourceTicketId: string | null;
  updatedAt: string;
};

export function toKnowledgeArticleHttp(
  article: KnowledgeArticle,
  now = new Date(),
): KnowledgeArticleHttp {
  const status = article.published ? 'publicado' : 'rascunho';
  return {
    id: article.id,
    title: article.title,
    category: article.category,
    body: article.body,
    tags: [...article.tags],
    published: article.published,
    author: article.authorName,
    views: article.views,
    viewsLabel: `${article.views.toLocaleString('pt-BR')} vis.`,
    useful: article.published ? `${article.usefulPercent}%` : '—',
    saved: String(article.ticketsAvoided),
    age: formatAge(article.updatedAt, now),
    meta: `${article.category} · ${status} · ${article.authorName} · ${formatUpdatedLabel(article.updatedAt, now)}`,
    sourceTicketId:
      article.sourceTicketId != null ? String(article.sourceTicketId) : null,
    updatedAt: article.updatedAt.toISOString(),
  };
}
