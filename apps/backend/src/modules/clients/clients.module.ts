import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { CreateClientService } from './application/create-client.service';
import { DeleteClientService } from './application/delete-client.service';
import {
  GetClientService,
  ListClientsService,
} from './application/list-clients.service';
import { UpdateClientService } from './application/update-client.service';
import { CLIENT_REPOSITORY } from './domain/client.repository';
import { PrismaClientRepository } from './infrastructure/prisma-client.repository';
import { ClientsController } from './presentation/clients.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ClientsController],
  providers: [
    ListClientsService,
    GetClientService,
    CreateClientService,
    UpdateClientService,
    DeleteClientService,
    {
      provide: CLIENT_REPOSITORY,
      useClass: PrismaClientRepository,
    },
  ],
})
export class ClientsModule {}
