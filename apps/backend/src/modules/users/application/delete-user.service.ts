import { Inject, Injectable } from '@nestjs/common';
import { UserNotFoundError } from '../domain/user.errors';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../domain/user.repository';

@Injectable()
export class DeleteUserService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) throw new UserNotFoundError(id);
    await this.users.delete(id);
  }
}
