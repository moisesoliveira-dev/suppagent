import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import { UserEmailAlreadyExistsError } from '../domain/user.errors';
import type { UserRole } from '../domain/user-role';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';

export type CreateUserCommand = {
  name: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = User.register(command);
    const existing = await this.users.findByEmail(user.email);
    if (existing) throw new UserEmailAlreadyExistsError(user.email);
    return this.users.save(user);
  }
}
