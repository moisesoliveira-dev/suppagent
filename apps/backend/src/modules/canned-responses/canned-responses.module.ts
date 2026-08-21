import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { CreateCannedResponseService } from './application/create-canned-response.service';
import { DeleteCannedResponseService } from './application/delete-canned-response.service';
import { DuplicateCannedResponseService } from './application/duplicate-canned-response.service';
import { ListCannedResponsesService } from './application/list-canned-responses.service';
import { UpdateCannedResponseService } from './application/update-canned-response.service';
import { UseCannedResponseService } from './application/use-canned-response.service';
import { CANNED_RESPONSE_REPOSITORY } from './domain/canned-response.repository';
import { PrismaCannedResponseRepository } from './infrastructure/prisma-canned-response.repository';
import { CannedResponsesController } from './presentation/canned-responses.controller';

@Module({
  imports: [PrismaModule],
  controllers: [CannedResponsesController],
  providers: [
    ListCannedResponsesService,
    CreateCannedResponseService,
    UpdateCannedResponseService,
    DuplicateCannedResponseService,
    UseCannedResponseService,
    DeleteCannedResponseService,
    {
      provide: CANNED_RESPONSE_REPOSITORY,
      useClass: PrismaCannedResponseRepository,
    },
  ],
})
export class CannedResponsesModule {}
