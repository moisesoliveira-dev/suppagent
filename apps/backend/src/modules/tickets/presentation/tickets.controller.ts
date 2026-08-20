import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ClaimTicketService } from '../application/claim-ticket.service';
import { CloseTicketService } from '../application/close-ticket.service';
import { CreateTicketService } from '../application/create-ticket.service';
import { GetTicketService } from '../application/get-ticket.service';
import { ListTicketsService } from '../application/list-tickets.service';
import { MarkTicketWaitingService } from '../application/mark-ticket-waiting.service';
import { ReplyToTicketService } from '../application/reply-to-ticket.service';
import { TransferTicketService } from '../application/transfer-ticket.service';
import { InvalidTicketFilterError } from '../domain/ticket-filter';
import {
  TicketAlreadyResolvedError,
  TicketNotFoundError,
} from '../domain/ticket.errors';
import { parsePriority } from './ticket-format';
import { toTicketHttp } from './ticket.http';

@Controller('tickets')
export class TicketsController {
  constructor(
    private readonly listTickets: ListTicketsService,
    private readonly getTicket: GetTicketService,
    private readonly createTicket: CreateTicketService,
    private readonly replyToTicket: ReplyToTicketService,
    private readonly transferTicket: TransferTicketService,
    private readonly claimTicket: ClaimTicketService,
    private readonly markWaiting: MarkTicketWaitingService,
    private readonly closeTicket: CloseTicketService,
  ) {}

  @Get()
  async list(
    @Query('filter') filter?: string,
    @Query('agent') agent?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    try {
      const result = await this.listTickets.execute({
        filter,
        agent,
        search,
        page,
        pageSize,
      });
      return {
        filter: result.filter,
        agent: result.agent,
        search: result.search,
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        counts: result.counts,
        items: result.items.map((ticket) => toTicketHttp(ticket)),
      };
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get(':id')
  async show(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.getTicket.execute(id);
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      subject?: string;
      priority?: string;
      category?: string;
      requester?: string;
      email?: string;
      message?: string;
    },
  ) {
    try {
      const ticket = await this.createTicket.execute({
        subject: required(body.subject, 'subject'),
        priority: parsePriority(required(body.priority, 'priority')),
        category: required(body.category, 'category'),
        requesterName: required(body.requester, 'requester'),
        requesterEmail: required(body.email, 'email'),
        message: required(body.message, 'message'),
      });
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/replies')
  async reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { text?: string; note?: boolean },
  ) {
    try {
      const ticket = await this.replyToTicket.execute(
        id,
        required(body.text, 'text'),
        Boolean(body.note),
      );
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/transfer')
  async transfer(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { agent?: string | null },
  ) {
    try {
      const ticket = await this.transferTicket.execute(
        id,
        body.agent ?? null,
      );
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/claim')
  async claim(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { agent?: string },
  ) {
    try {
      const ticket = await this.claimTicket.execute(
        id,
        required(body.agent, 'agent'),
      );
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/waiting')
  async waiting(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.markWaiting.execute(id);
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/close')
  async close(@Param('id', ParseIntPipe) id: number) {
    try {
      const ticket = await this.closeTicket.execute(id);
      return toTicketHttp(ticket);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof InvalidTicketFilterError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof TicketNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof TicketAlreadyResolvedError) {
      throw new BadRequestException(error.message);
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
