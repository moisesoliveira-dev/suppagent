import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { CreateAiChatSessionService } from './application/create-ai-chat-session.service';
import { DeleteAiChatSessionService } from './application/delete-ai-chat-session.service';
import { GetAiChatSessionService } from './application/get-ai-chat-session.service';
import { ListAiChatSessionsService } from './application/list-ai-chat-sessions.service';
import { RenameAiChatSessionService } from './application/rename-ai-chat-session.service';
import { SendAiChatMessageService } from './application/send-ai-chat-message.service';
import { AI_CHAT_SESSION_REPOSITORY } from './domain/ai-chat-session.repository';
import { PrismaAiChatSessionRepository } from './infrastructure/prisma-ai-chat-session.repository';
import { AiChatController } from './presentation/ai-chat.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AiChatController],
  providers: [
    ListAiChatSessionsService,
    GetAiChatSessionService,
    CreateAiChatSessionService,
    RenameAiChatSessionService,
    DeleteAiChatSessionService,
    SendAiChatMessageService,
    {
      provide: AI_CHAT_SESSION_REPOSITORY,
      useClass: PrismaAiChatSessionRepository,
    },
  ],
})
export class AiChatModule {}
