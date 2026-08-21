import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common';
import { GetSlaBoardService } from '../application/get-sla-board.service';
import { ListSlaPoliciesService } from '../application/list-sla-policies.service';
import { UpdateSlaPolicyService } from '../application/update-sla-policy.service';
import { SlaPolicyNotFoundError } from '../domain/sla.errors';
import {
  parseSlaPriority,
  priorityLabel,
  toSlaClockHttp,
  toSlaPolicyHttp,
  formatMinutesLabel,
} from './sla.http';

@Controller('sla')
export class SlaController {
  constructor(
    private readonly listPolicies: ListSlaPoliciesService,
    private readonly updatePolicy: UpdateSlaPolicyService,
    private readonly getBoard: GetSlaBoardService,
  ) {}

  @Get('policies')
  async policies() {
    const items = await this.listPolicies.execute();
    return { items: items.map(toSlaPolicyHttp) };
  }

  @Patch('policies/:priority')
  async update(
    @Param('priority') priorityRaw: string,
    @Body()
    body: {
      responseMinutes?: number;
      resolutionMinutes?: number;
    },
  ) {
    try {
      const priority = parseSlaPriority(priorityRaw);
      if (
        typeof body.responseMinutes !== 'number' ||
        typeof body.resolutionMinutes !== 'number'
      ) {
        throw new BadRequestException(
          'responseMinutes e resolutionMinutes são obrigatórios',
        );
      }
      const policy = await this.updatePolicy.execute({
        priority,
        responseMinutes: body.responseMinutes,
        resolutionMinutes: body.resolutionMinutes,
      });
      return toSlaPolicyHttp(policy);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Get('board')
  async board() {
    const board = await this.getBoard.execute();
    return {
      generatedAt: board.generatedAt,
      policies: board.policies.map((policy) => ({
        id: policy.id,
        priority: priorityLabel(policy.priority),
        priorityKey: policy.priority,
        responseMinutes: policy.responseMinutes,
        resolutionMinutes: policy.resolutionMinutes,
        targetsLabel: `resposta: ${formatMinutesLabel(policy.responseMinutes)} · resolução: ${formatMinutesLabel(policy.resolutionMinutes)}`,
        compliancePercent: policy.compliancePercent,
        openCount: policy.openCount,
      })),
      items: board.items.map((item) => ({
        id: String(item.id),
        ticketId: item.id,
        subject: item.subject,
        priority: priorityLabel(item.priority),
        priorityKey: item.priority,
        status: item.status,
        openedAt: item.openedAt,
        meta: `chamado nº ${item.id} · ${priorityLabel(item.priority)}`,
        sub: `política aplicada: ${priorityLabel(item.priority)} · resposta ${formatMinutesLabel(item.policy.responseMinutes)} / resolução ${formatMinutesLabel(item.policy.resolutionMinutes)}`,
        response: toSlaClockHttp(item.response),
        resolution: toSlaClockHttp(item.resolution),
        timeline: item.timeline,
      })),
    };
  }

  private rethrow(error: unknown): never {
    if (error instanceof SlaPolicyNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof Error) {
      throw new BadRequestException(error.message);
    }
    throw error;
  }
}
