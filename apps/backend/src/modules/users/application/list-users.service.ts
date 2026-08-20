import { Inject, Injectable } from '@nestjs/common';
import type { UserRole } from '../domain/user-role';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';

@Injectable()
export class ListUsersService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  execute(role?: UserRole) {
    return this.users.findAll(role);
  }
}
