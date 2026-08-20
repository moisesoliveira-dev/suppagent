import { Module } from '@nestjs/common';
import { CreateUserService } from './application/create-user.service';
import { DeleteUserService } from './application/delete-user.service';
import { ListUsersService } from './application/list-users.service';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/prisma-user.repository';
import { UsersController } from './presentation/users.controller';

@Module({
  controllers: [UsersController],
  providers: [
    ListUsersService,
    CreateUserService,
    DeleteUserService,
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
})
export class UsersModule {}
