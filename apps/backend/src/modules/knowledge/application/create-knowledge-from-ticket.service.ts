import { Inject, Injectable } from '@nestjs/common';
import { KnowledgeArticle } from '../domain/knowledge-article';
import type { KnowledgeArticleRepository } from '../domain/knowledge-article.repository';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from '../domain/knowledge-article.repository';
import type { TicketSourcePort } from '../domain/ticket-source.port';
import { TICKET_SOURCE_PORT } from '../domain/ticket-source.port';
import {
  KnowledgeFromTicketAlreadyExistsError,
  TicketNotClosedForKnowledgeError,
  TicketSourceNotFoundError,
} from '../domain/knowledge.errors';

@Injectable()
export class CreateKnowledgeFromTicketService {
  constructor(
    @Inject(KNOWLEDGE_ARTICLE_REPOSITORY)
    private readonly articles: KnowledgeArticleRepository,
    @Inject(TICKET_SOURCE_PORT)
    private readonly tickets: TicketSourcePort,
  ) {}

  async execute(input: {
    ticketId: number;
    title?: string;
    category?: string;
    body?: string;
    tags?: string[];
    published?: boolean;
    authorName: string;
  }) {
    const existing = await this.articles.findBySourceTicketId(input.ticketId);
    if (existing) {
      throw new KnowledgeFromTicketAlreadyExistsError(input.ticketId);
    }

    const ticket = await this.tickets.findById(input.ticketId);
    if (!ticket) throw new TicketSourceNotFoundError(input.ticketId);
    if (ticket.status !== 'resolved') {
      throw new TicketNotClosedForKnowledgeError(input.ticketId);
    }

    const draftedBody =
      input.body?.trim() ||
      ticket.publicMessages
        .map((message) => {
          const who = message.author === 'agent' ? 'agente' : 'cliente';
          return `${who}: ${message.text}`;
        })
        .join('\n\n') ||
      ticket.subject;

    const article = KnowledgeArticle.create({
      title: input.title?.trim() || ticket.subject,
      category: input.category?.trim() || ticket.category,
      body: draftedBody,
      tags: input.tags ?? [ticket.category],
      published: input.published ?? false,
      authorName: input.authorName,
      sourceTicketId: ticket.id,
    });

    return this.articles.save(article);
  }
}
