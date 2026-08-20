import { Module } from '@nestjs/common';
import { ClaimTicketService } from './application/claim-ticket.service';
import { CloseTicketService } from './application/close-ticket.service';
import { CreateTicketService } from './application/create-ticket.service';
import { DeleteTicketMessageService } from './application/delete-ticket-message.service';
import { EditTicketMessageService } from './application/edit-ticket-message.service';
import { ForwardTicketMessageService } from './application/forward-ticket-message.service';
import { GetTicketService } from './application/get-ticket.service';
import { ListTicketsService } from './application/list-tickets.service';
import { MarkTicketWaitingService } from './application/mark-ticket-waiting.service';
import { PinTicketMessageService } from './application/pin-ticket-message.service';
import { ReopenTicketService } from './application/reopen-ticket.service';
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
    ClaimTicketService,
    MarkTicketWaitingService,
    CloseTicketService,
    ReopenTicketService,
    EditTicketMessageService,
    DeleteTicketMessageService,
    PinTicketMessageService,
    ForwardTicketMessageService,
    {
      provide: TICKET_REPOSITORY,
      useClass: PrismaTicketRepository,
    },
  ],
})
export class TicketsModule {}
