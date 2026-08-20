import { Module } from '@nestjs/common';
import { TicketsModule } from '../tickets/tickets.module';
import { DeleteTeamChatMessageService } from './application/delete-team-chat-message.service';
import { EditTeamChatMessageService } from './application/edit-team-chat-message.service';
import { ForwardIntoTeamChatService } from './application/forward-into-team-chat.service';
import { ForwardTeamMessageToTicketService } from './application/forward-team-message-to-ticket.service';
import { GetTeamChatService } from './application/get-team-chat.service';
import { ListTeamChatsService } from './application/list-team-chats.service';
import { PinTeamChatMessageService } from './application/pin-team-chat-message.service';
import { PostTeamChatMessageService } from './application/post-team-chat-message.service';
import { TEAM_CHAT_REPOSITORY } from './domain/team-chat.repository';
import { TICKET_MESSAGE_SOURCE } from './domain/ticket-message-source.port';
import { PrismaTeamChatRepository } from './infrastructure/prisma-team-chat.repository';
import { PrismaTicketMessageSourceAdapter } from './infrastructure/prisma-ticket-message-source.adapter';
import { TeamChatController } from './presentation/team-chat.controller';

@Module({
  imports: [TicketsModule],
  controllers: [TeamChatController],
  providers: [
    ListTeamChatsService,
    GetTeamChatService,
    PostTeamChatMessageService,
    EditTeamChatMessageService,
    DeleteTeamChatMessageService,
    PinTeamChatMessageService,
    ForwardIntoTeamChatService,
    ForwardTeamMessageToTicketService,
    {
      provide: TEAM_CHAT_REPOSITORY,
      useClass: PrismaTeamChatRepository,
    },
    {
      provide: TICKET_MESSAGE_SOURCE,
      useClass: PrismaTicketMessageSourceAdapter,
    },
  ],
})
export class TeamChatModule {}
