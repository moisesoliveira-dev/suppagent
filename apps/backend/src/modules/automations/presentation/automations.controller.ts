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
import { CreateAutomationRuleService } from '../application/create-automation-rule.service';
import { DeleteAutomationRuleService } from '../application/delete-automation-rule.service';
import { GetAutomationRuleService } from '../application/get-automation-rule.service';
import { ListAutomationRulesService } from '../application/list-automation-rules.service';
import { RunAutomationRuleService } from '../application/run-automation-rule.service';
import { ToggleAutomationRuleService } from '../application/toggle-automation-rule.service';
import { UpdateAutomationRuleService } from '../application/update-automation-rule.service';
import { AutomationRuleNotFoundError } from '../domain/automation.errors';
import { toAutomationRuleHttp } from './automation.http';

@Controller('automations')
export class AutomationsController {
  constructor(
    private readonly listRules: ListAutomationRulesService,
    private readonly getRule: GetAutomationRuleService,
    private readonly createRule: CreateAutomationRuleService,
    private readonly updateRule: UpdateAutomationRuleService,
    private readonly toggleRule: ToggleAutomationRuleService,
    private readonly runRule: RunAutomationRuleService,
    private readonly deleteRule: DeleteAutomationRuleService,
  ) {}

  @Get()
  async list() {
    const items = await this.listRules.execute();
    return { items: items.map(toAutomationRuleHttp) };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    try {
      const rule = await this.getRule.execute(id);
      return toAutomationRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post()
  async create(
    @Body()
    body: {
      name?: string;
      trigger?: string;
      condition?: string;
      action?: string;
      authorName?: string;
      enabled?: boolean;
    },
  ) {
    try {
      const rule = await this.createRule.execute({
        name: required(body.name, 'name'),
        trigger: required(body.trigger, 'trigger'),
        condition: required(body.condition, 'condition'),
        action: required(body.action, 'action'),
        authorName: required(body.authorName, 'authorName'),
        enabled: body.enabled,
      });
      return toAutomationRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      trigger?: string;
      condition?: string;
      action?: string;
      enabled?: boolean;
    },
  ) {
    try {
      const rule = await this.updateRule.execute({
        id,
        name: body.name,
        trigger: body.trigger,
        condition: body.condition,
        action: body.action,
        enabled: body.enabled,
      });
      return toAutomationRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/toggle')
  async toggle(@Param('id') id: string) {
    try {
      const rule = await this.toggleRule.execute(id);
      return toAutomationRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/run')
  async run(@Param('id') id: string) {
    try {
      const rule = await this.runRule.execute(id);
      return toAutomationRuleHttp(rule);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteRule.execute(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof AutomationRuleNotFoundError) {
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
