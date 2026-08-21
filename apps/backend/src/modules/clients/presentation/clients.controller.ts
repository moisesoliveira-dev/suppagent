import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateClientService } from '../application/create-client.service';
import { DeleteClientService } from '../application/delete-client.service';
import {
  GetClientService,
  ListClientsService,
} from '../application/list-clients.service';
import { UpdateClientService } from '../application/update-client.service';
import {
  InvalidClientPlanError,
  parseClientPlan,
} from '../domain/client-plan';
import {
  ClientEmailAlreadyExistsError,
  ClientNotFoundError,
} from '../domain/client.errors';
import { toClientHttp, toClientHttpBasic } from './client.http';

@Controller('clients')
export class ClientsController {
  constructor(
    private readonly listClients: ListClientsService,
    private readonly getClient: GetClientService,
    private readonly createClient: CreateClientService,
    private readonly updateClient: UpdateClientService,
    private readonly deleteClient: DeleteClientService,
  ) {}

  @Get()
  async list() {
    const items = await this.listClients.execute();
    return { items: items.map((item) => toClientHttp(item)) };
  }

  @Get(':id')
  async one(@Param('id') id: string) {
    const item = await this.getClient.execute(id);
    if (!item) throw new NotFoundException(`cliente não encontrado: ${id}`);
    return toClientHttp(item);
  }

  @Post()
  async create(
    @Body()
    body: {
      name?: string;
      company?: string | null;
      plan?: string;
      email?: string;
      phone?: string | null;
      tags?: string[];
    },
  ) {
    try {
      const client = await this.createClient.execute({
        name: required(body.name, 'name'),
        company: body.company,
        plan: parseClientPlan(required(body.plan, 'plan')),
        email: required(body.email, 'email'),
        phone: body.phone,
        tags: body.tags,
      });
      return toClientHttpBasic(client);
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
      company?: string | null;
      plan?: string;
      email?: string;
      phone?: string | null;
      tags?: string[];
    },
  ) {
    try {
      const client = await this.updateClient.execute({
        id,
        name: body.name,
        company: body.company,
        plan: body.plan !== undefined ? parseClientPlan(body.plan) : undefined,
        email: body.email,
        phone: body.phone,
        tags: body.tags,
      });
      return toClientHttpBasic(client);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteClient.execute(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof InvalidClientPlanError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof ClientEmailAlreadyExistsError) {
      throw new ConflictException(error.message);
    }
    if (error instanceof ClientNotFoundError) {
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
