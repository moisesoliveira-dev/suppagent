import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTeamChatService } from '../application/create-team-chat.service';
import { DeleteTeamChatMessageService } from '../application/delete-team-chat-message.service';
import { DeleteTeamChatService } from '../application/delete-team-chat.service';
import { EditTeamChatMessageService } from '../application/edit-team-chat-message.service';
import { ForwardIntoTeamChatService } from '../application/forward-into-team-chat.service';
import { ForwardTeamMessageToTicketService } from '../application/forward-team-message-to-ticket.service';
import { GetTeamChatService } from '../application/get-team-chat.service';
import { ListTeamChatsService } from '../application/list-team-chats.service';
import { PinTeamChatMessageService } from '../application/pin-team-chat-message.service';
import { PostTeamChatMessageService } from '../application/post-team-chat-message.service';
import { toTeamChatHttp } from './team-chat.http';

const DEFAULT_AGENT = {
  handle: 'c.reis',
  name: 'camila reis',
};

@Controller('team-chats')
export class TeamChatController {
  constructor(
    private readonly listChats: ListTeamChatsService,
    private readonly getChat: GetTeamChatService,
    private readonly createChat: CreateTeamChatService,
    private readonly deleteChat: DeleteTeamChatService,
    private readonly postMessage: PostTeamChatMessageService,
    private readonly editMessage: EditTeamChatMessageService,
    private readonly deleteMessage: DeleteTeamChatMessageService,
    private readonly pinMessage: PinTeamChatMessageService,
    private readonly forwardInto: ForwardIntoTeamChatService,
    private readonly forwardToTicket: ForwardTeamMessageToTicketService,
  ) {}

  @Get()
  async list() {
    const items = await this.listChats.execute();
    return { items: items.map((chat) => toTeamChatHttp(chat)) };
  }

  @Post()
  async create(@Body() body: { name?: string }) {
    try {
      const chat = await this.createChat.execute(required(body.name, 'name'));
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get(':id')
  async show(@Param('id') id: string) {
    try {
      const chat = await this.getChat.execute(id);
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id')
  async removeChat(@Param('id') id: string) {
    try {
      await this.deleteChat.execute(id);
      return { ok: true };
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/messages')
  async post(
    @Param('id') id: string,
    @Body()
    body: {
      text?: string;
      replyToId?: string;
      authorHandle?: string;
      authorName?: string;
    },
    @Query('agent') agent?: string,
  ) {
    try {
      const author = {
        handle: body.authorHandle?.trim() || agent?.trim() || DEFAULT_AGENT.handle,
        name: body.authorName?.trim() || DEFAULT_AGENT.name,
      };
      const chat = await this.postMessage.execute(
        id,
        required(body.text, 'text'),
        author,
        body.replyToId ?? null,
      );
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch(':id/messages/:messageId')
  async edit(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @Body() body: { text?: string },
  ) {
    try {
      const chat = await this.editMessage.execute(
        id,
        messageId,
        required(body.text, 'text'),
      );
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id/messages/:messageId')
  async remove(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
  ) {
    try {
      const chat = await this.deleteMessage.execute(id, messageId);
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/messages/:messageId/pin')
  async pin(@Param('id') id: string, @Param('messageId') messageId: string) {
    try {
      const chat = await this.pinMessage.execute(id, messageId);
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/messages/:messageId/forward')
  async forward(
    @Param('id') id: string,
    @Param('messageId') messageId: string,
    @Body()
    body: { targetTeamChatId?: string; targetTicketId?: number | string },
  ) {
    try {
      if (body.targetTeamChatId) {
        const chat = await this.forwardInto.execute({
          targetChatId: body.targetTeamChatId,
          fromTeamChatId: id,
          messageId,
        });
        return toTeamChatHttp(chat);
      }
      if (body.targetTicketId != null) {
        const targetTicketId = Number.parseInt(String(body.targetTicketId), 10);
        if (!Number.isFinite(targetTicketId)) {
          throw new BadRequestException('targetTicketId inválido');
        }
        await this.forwardToTicket.execute(id, messageId, targetTicketId);
        return { ok: true };
      }
      throw new BadRequestException('destino do encaminhamento é obrigatório');
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/forward-from-ticket')
  async forwardFromTicket(
    @Param('id') id: string,
    @Body() body: { ticketId?: number | string; messageId?: string },
  ) {
    try {
      const ticketId = Number.parseInt(String(body.ticketId ?? ''), 10);
      if (!Number.isFinite(ticketId)) {
        throw new BadRequestException('ticketId inválido');
      }
      const chat = await this.forwardInto.execute({
        targetChatId: id,
        fromTicketId: ticketId,
        messageId: required(body.messageId, 'messageId'),
      });
      return toTeamChatHttp(chat);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof Error && /não encontrado/.test(error.message)) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof BadRequestException) throw error;
    if (error instanceof Error) throw new BadRequestException(error.message);
    throw error;
  }
}

function required(value: string | undefined, field: string): string {
  const trimmed = value?.trim();
  if (!trimmed) throw new BadRequestException(`${field} é obrigatório`);
  return trimmed;
}
