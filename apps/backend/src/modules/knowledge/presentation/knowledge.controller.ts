import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateKnowledgeArticleService } from '../application/create-knowledge-article.service';
import { CreateKnowledgeFromTicketService } from '../application/create-knowledge-from-ticket.service';
import { GetKnowledgeArticleService } from '../application/get-knowledge-article.service';
import { ListKnowledgeArticlesService } from '../application/list-knowledge-articles.service';
import { UpdateKnowledgeArticleService } from '../application/update-knowledge-article.service';
import {
  KnowledgeArticleNotFoundError,
  KnowledgeFromTicketAlreadyExistsError,
  TicketNotClosedForKnowledgeError,
  TicketSourceNotFoundError,
} from '../domain/knowledge.errors';
import { toKnowledgeArticleHttp } from './knowledge.http';

@Controller('knowledge')
export class KnowledgeController {
  constructor(
    private readonly listArticles: ListKnowledgeArticlesService,
    private readonly getArticle: GetKnowledgeArticleService,
    private readonly createArticle: CreateKnowledgeArticleService,
    private readonly createFromTicket: CreateKnowledgeFromTicketService,
    private readonly updateArticle: UpdateKnowledgeArticleService,
  ) {}

  @Get()
  async list(
    @Query('category') category?: string,
    @Query('q') q?: string,
  ) {
    const items = await this.listArticles.execute({ category, q });
    return { items: items.map((item) => toKnowledgeArticleHttp(item)) };
  }

  @Post('from-ticket')
  async fromTicket(
    @Body()
    body: {
      ticketId?: number | string;
      title?: string;
      category?: string;
      body?: string;
      tags?: string[];
      published?: boolean;
      author?: string;
    },
  ) {
    try {
      const ticketId = Number(body.ticketId);
      if (!Number.isInteger(ticketId) || ticketId <= 0) {
        throw new BadRequestException('ticketId inválido');
      }
      const article = await this.createFromTicket.execute({
        ticketId,
        title: body.title,
        category: body.category,
        body: body.body,
        tags: body.tags,
        published: body.published,
        authorName: required(body.author, 'author'),
      });
      return toKnowledgeArticleHttp(article);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      title?: string;
      category?: string;
      body?: string;
      tags?: string[];
      published?: boolean;
      author?: string;
    },
  ) {
    try {
      const article = await this.createArticle.execute({
        title: required(body.title, 'title'),
        category: required(body.category, 'category'),
        body: required(body.body, 'body'),
        tags: body.tags,
        published: body.published,
        authorName: required(body.author, 'author'),
      });
      return toKnowledgeArticleHttp(article);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    try {
      const article = await this.getArticle.execute(id, { registerView: true });
      return toKnowledgeArticleHttp(article);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      category?: string;
      body?: string;
      tags?: string[];
      published?: boolean;
    },
  ) {
    try {
      const article = await this.updateArticle.execute(id, {
        title: body.title,
        category: body.category,
        body: body.body,
        tags: body.tags,
        published: body.published,
      });
      return toKnowledgeArticleHttp(article);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof KnowledgeArticleNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof TicketSourceNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof TicketNotClosedForKnowledgeError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof KnowledgeFromTicketAlreadyExistsError) {
      throw new ConflictException(error.message);
    }
    if (error instanceof BadRequestException) throw error;
    if (error instanceof Error) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}

function required(value: string | undefined, field: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new BadRequestException(`${field} é obrigatório`);
  return trimmed;
}
