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
  Post,
} from '@nestjs/common';
import { CreateUserService } from '../application/create-user.service';
import { DeleteUserService } from '../application/delete-user.service';
import { ListUsersService } from '../application/list-users.service';
import {
  InvalidUserRoleError,
  parseUserRole,
} from '../domain/user-role';
import {
  UserEmailAlreadyExistsError,
  UserNotFoundError,
} from '../domain/user.errors';
import { toUserHttp } from './user.http';

@Controller('users')
export class UsersController {
  constructor(
    private readonly listUsers: ListUsersService,
    private readonly createUser: CreateUserService,
    private readonly deleteUser: DeleteUserService,
  ) {}

  @Get()
  async list() {
    const users = await this.listUsers.execute();
    return { items: users.map(toUserHttp) };
  }

  @Post()
  async create(
    @Body()
    body: {
      name?: string;
      email?: string;
      role?: string;
    },
  ) {
    try {
      const user = await this.createUser.execute({
        name: required(body.name, 'name'),
        email: required(body.email, 'email'),
        role: parseUserRole(required(body.role, 'role')),
      });
      return toUserHttp(user);
    } catch (error) {
      this.rethrow(error);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    try {
      await this.deleteUser.execute(id);
    } catch (error) {
      this.rethrow(error);
    }
  }

  private rethrow(error: unknown): never {
    if (error instanceof InvalidUserRoleError) {
      throw new BadRequestException(error.message);
    }
    if (error instanceof UserEmailAlreadyExistsError) {
      throw new ConflictException(error.message);
    }
    if (error instanceof UserNotFoundError) {
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
