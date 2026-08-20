import { Inject, Injectable } from '@nestjs/common';
import { User } from '../domain/user';
import {
  UserEmailAlreadyExistsError,
  UserHandleAlreadyExistsError,
} from '../domain/user.errors';
import type { UserRole } from '../domain/user-role';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';

export type CreateUserCommand = {
  name: string;
  email: string;
  role: UserRole;
  handle?: string | null;
};

@Injectable()
export class CreateUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<User> {
    const user = User.register(command);
    const byEmail = await this.users.findByEmail(user.email);
    if (byEmail) throw new UserEmailAlreadyExistsError(user.email);
    if (user.handle) {
      const byHandle = await this.users.findByHandle(user.handle);
      if (byHandle) throw new UserHandleAlreadyExistsError(user.handle);
    }
    return this.users.save(user);
  }
}
