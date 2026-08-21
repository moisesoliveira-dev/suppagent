import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateAiChatSessionService } from '../application/create-ai-chat-session.service';
import { DeleteAiChatSessionService } from '../application/delete-ai-chat-session.service';
import { GetAiChatSessionService } from '../application/get-ai-chat-session.service';
import { ListAiChatSessionsService } from '../application/list-ai-chat-sessions.service';
import { RenameAiChatSessionService } from '../application/rename-ai-chat-session.service';
import { SendAiChatMessageService } from '../application/send-ai-chat-message.service';
import { AI_CHAT_STARTERS } from '../domain/ai-chat-replies';
import { AiChatSessionNotFoundError } from '../domain/ai-chat.errors';
import {
  toSessionDetailHttp,
  toSessionSummaryHttp,
} from './ai-chat.http';

const DEFAULT_AGENT = 'c.reis';

@Controller('ai-chat')
export class AiChatController {
  constructor(
    private readonly listSessions: ListAiChatSessionsService,
    private readonly getSession: GetAiChatSessionService,
    private readonly createSession: CreateAiChatSessionService,
    private readonly renameSession: RenameAiChatSessionService,
    private readonly deleteSession: DeleteAiChatSessionService,
    private readonly sendMessage: SendAiChatMessageService,
  ) {}

  @Get('starters')
  starters() {
    return { items: AI_CHAT_STARTERS };
  }

  @Get('sessions')
  async list(@Query('agent') agent?: string) {
    const items = await this.listSessions.execute(agent || DEFAULT_AGENT);
    return { items: items.map(toSessionSummaryHttp) };
  }

  @Post('sessions')
  async create(
    @Query('agent') agent: string | undefined,
    @Body() body: { title?: string },
  ) {
    try {
      const session = await this.createSession.execute({
        ownerHandle: agent || DEFAULT_AGENT,
        title: body.title,
      });
      return toSessionDetailHttp(session);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get('sessions/:id')
  async get(@Param('id') id: string, @Query('agent') agent?: string) {
    try {
      const session = await this.getSession.execute(
        id,
        agent || DEFAULT_AGENT,
      );
      return toSessionDetailHttp(session);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch('sessions/:id')
  async rename(
    @Param('id') id: string,
    @Query('agent') agent: string | undefined,
    @Body() body: { title?: string },
  ) {
    try {
      const session = await this.renameSession.execute({
        id,
        ownerHandle: agent || DEFAULT_AGENT,
        title: required(body.title, 'title'),
      });
      return toSessionDetailHttp(session);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete('sessions/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string, @Query('agent') agent?: string) {
    try {
      await this.deleteSession.execute(id, agent || DEFAULT_AGENT);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post('sessions/:id/messages')
  async message(
    @Param('id') id: string,
    @Query('agent') agent: string | undefined,
    @Body() body: { text?: string },
  ) {
    try {
      const session = await this.sendMessage.execute({
        id,
        ownerHandle: agent || DEFAULT_AGENT,
        text: required(body.text, 'text'),
      });
      return toSessionDetailHttp(session);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof AiChatSessionNotFoundError) {
      throw new NotFoundException(error.message);
    }
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
