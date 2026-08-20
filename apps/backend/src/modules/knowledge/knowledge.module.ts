import { Module } from '@nestjs/common';
import { CreateKnowledgeArticleService } from './application/create-knowledge-article.service';
import { CreateKnowledgeFromTicketService } from './application/create-knowledge-from-ticket.service';
import { GetKnowledgeArticleService } from './application/get-knowledge-article.service';
import { ListKnowledgeArticlesService } from './application/list-knowledge-articles.service';
import { UpdateKnowledgeArticleService } from './application/update-knowledge-article.service';
import { KNOWLEDGE_ARTICLE_REPOSITORY } from './domain/knowledge-article.repository';
import { TICKET_SOURCE_PORT } from './domain/ticket-source.port';
import { PrismaKnowledgeArticleRepository } from './infrastructure/prisma-knowledge-article.repository';
import { PrismaTicketSourceAdapter } from './infrastructure/prisma-ticket-source.adapter';
import { KnowledgeController } from './presentation/knowledge.controller';

@Module({
  controllers: [KnowledgeController],
  providers: [
    ListKnowledgeArticlesService,
    GetKnowledgeArticleService,
    CreateKnowledgeArticleService,
    CreateKnowledgeFromTicketService,
    UpdateKnowledgeArticleService,
    {
      provide: KNOWLEDGE_ARTICLE_REPOSITORY,
      useClass: PrismaKnowledgeArticleRepository,
    },
    {
      provide: TICKET_SOURCE_PORT,
      useClass: PrismaTicketSourceAdapter,
    },
  ],
})
export class KnowledgeModule {}
