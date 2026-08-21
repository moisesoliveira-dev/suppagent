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
  Query,
} from '@nestjs/common';
import { CreateCannedResponseService } from '../application/create-canned-response.service';
import { DeleteCannedResponseService } from '../application/delete-canned-response.service';
import { DuplicateCannedResponseService } from '../application/duplicate-canned-response.service';
import { ListCannedResponsesService } from '../application/list-canned-responses.service';
import { UpdateCannedResponseService } from '../application/update-canned-response.service';
import { UseCannedResponseService } from '../application/use-canned-response.service';
import {
  CannedResponseNotFoundError,
  CannedShortcutAlreadyExistsError,
} from '../domain/canned.errors';
import { toCannedResponseHttp } from './canned.http';

@Controller('canned-responses')
export class CannedResponsesController {
  constructor(
    private readonly listResponses: ListCannedResponsesService,
    private readonly createResponse: CreateCannedResponseService,
    private readonly updateResponse: UpdateCannedResponseService,
    private readonly duplicateResponse: DuplicateCannedResponseService,
    private readonly useResponse: UseCannedResponseService,
    private readonly deleteResponse: DeleteCannedResponseService,
  ) {}

  @Get()
  async list(@Query('category') category?: string) {
    const result = await this.listResponses.execute(
      category?.trim() || undefined,
    );
    return {
      categories: result.categories,
      items: result.items.map(toCannedResponseHttp),
    };
  }

  @Post()
  async create(
    @Body()
    body: {
      title?: string;
      category?: string;
      shortcut?: string;
      body?: string;
    },
  ) {
    try {
      const response = await this.createResponse.execute({
        title: required(body.title, 'title'),
        category: required(body.category, 'category'),
        shortcut: required(body.shortcut, 'shortcut'),
        body: required(body.body, 'body'),
      });
      return toCannedResponseHttp(response);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      category?: string;
      shortcut?: string;
      body?: string;
    },
  ) {
    try {
      const response = await this.updateResponse.execute({
        id,
        title: body.title,
        category: body.category,
        shortcut: body.shortcut,
        body: body.body,
      });
      return toCannedResponseHttp(response);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/duplicate')
  async duplicate(@Param('id') id: string) {
    try {
      const response = await this.duplicateResponse.execute(id);
      return toCannedResponseHttp(response);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Post(':id/use')
  async use(@Param('id') id: string) {
    try {
      const response = await this.useResponse.execute(id);
      return toCannedResponseHttp(response);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteResponse.execute(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof CannedResponseNotFoundError) {
      throw new NotFoundException(error.message);
    }
    if (error instanceof CannedShortcutAlreadyExistsError) {
      throw new ConflictException(error.message);
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
