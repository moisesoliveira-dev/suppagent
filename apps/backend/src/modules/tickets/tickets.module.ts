import { Module } from '@nestjs/common';
import { CloseTicketService } from './application/close-ticket.service';
import { CreateTicketService } from './application/create-ticket.service';
import { GetTicketService } from './application/get-ticket.service';
import { ListTicketsService } from './application/list-tickets.service';
import { ReplyToTicketService } from './application/reply-to-ticket.service';
import { TransferTicketService } from './application/transfer-ticket.service';
import { TICKET_REPOSITORY } from './domain/ticket.repository';
import { PrismaTicketRepository } from './infrastructure/prisma-ticket.repository';
import { TicketsController } from './presentation/tickets.controller';

@Module({
  controllers: [TicketsController],
  providers: [
    ListTicketsService,
    GetTicketService,
    CreateTicketService,
    ReplyToTicketService,
    TransferTicketService,
    CloseTicketService,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
  ],
})
export class TicketsModule {}
