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
} from '@nestjs/common';
import { ApplyRoutingService } from '../application/apply-routing.service';
import { CreateRoutingRuleService } from '../application/create-routing-rule.service';
import { DeleteRoutingRuleService } from '../application/delete-routing-rule.service';
import { GetRoutingBoardService } from '../application/get-routing-board.service';
import { ListRoutingRulesService } from '../application/list-routing-rules.service';
import { ReviewRoutingService } from '../application/review-routing.service';
import { UpdateRoutingRuleService } from '../application/update-routing-rule.service';
import {
  RoutingRuleNotFoundError,
  RoutingTicketNotFoundError,
} from '../domain/routing.errors';
import { parseKeywords, toRoutingRuleHttp } from './routing.http';

@Controller('routing')
export class RoutingController {
  constructor(
    private readonly listRules: ListRoutingRulesService,
    private readonly createRule: CreateRoutingRuleService,
    private readonly updateRule: UpdateRoutingRuleService,
    private readonly deleteRule: DeleteRoutingRuleService,
    private readonly getBoard: GetRoutingBoardService,
    private readonly applyRouting: ApplyRoutingService,
    private readonly reviewRouting: ReviewRoutingService,
  ) {}

  @Get('rules')
  async rules() {
    const items = await this.listRules.execute();
    return { items: items.map(toRoutingRuleHttp) };
  }

  @Post('rules')
  async create(
    @Body()
    body: {
      name?: string;
      keywords?: unknown;
      category?: string;
      agentHandle?: string | null;
      enabled?: boolean;
    },
  ) {
    try {
      const rule = await this.createRule.execute({
        name: required(body.name, 'name'),
        keywords: parseKeywords(body.keywords),
        category: required(body.category, 'category'),
        agentHandle: body.agentHandle,
        enabled: body.enabled,
      });
      return toRoutingRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch('rules/:id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      keywords?: unknown;
      category?: string;
      agentHandle?: string | null;
      enabled?: boolean;
    },
  ) {
    try {
      const rule = await this.updateRule.execute({
        id,
        name: body.name,
        keywords:
          body.keywords !== undefined
            ? parseKeywords(body.keywords)
            : undefined,
        category: body.category,
        agentHandle: body.agentHandle,
        enabled: body.enabled,
      });
      return toRoutingRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete('rules/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteRule.execute(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get('board')
  async board() {
    return this.getBoard.execute();
  }

  @Post('board/:ticketId/apply')
  async apply(@Param('ticketId') ticketIdRaw: string) {
    try {
      const ticketId = Number(ticketIdRaw);
      if (!Number.isFinite(ticketId)) {
        throw new BadRequestException('ticketId inválido');
      }
      const suggestion = await this.applyRouting.execute(ticketId);
      return { ok: true, suggestion };
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post('board/:ticketId/review')
  async review(@Param('ticketId') ticketIdRaw: string) {
    try {
      const ticketId = Number(ticketIdRaw);
      if (!Number.isFinite(ticketId)) {
        throw new BadRequestException('ticketId inválido');
      }
      const suggestion = await this.reviewRouting.execute(ticketId);
      return { ok: true, suggestion };
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (
      error instanceof RoutingRuleNotFoundError ||
      error instanceof RoutingTicketNotFoundError
    ) {
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
