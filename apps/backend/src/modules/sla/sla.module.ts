import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { GetSlaBoardService } from './application/get-sla-board.service';
import { ListSlaPoliciesService } from './application/list-sla-policies.service';
import { UpdateSlaPolicyService } from './application/update-sla-policy.service';
import { SLA_POLICY_REPOSITORY } from './domain/sla-policy.repository';
import { SLA_TICKET_QUERY } from './domain/sla-ticket.query';
import { PrismaSlaPolicyRepository } from './infrastructure/prisma-sla-policy.repository';
import { PrismaSlaTicketQuery } from './infrastructure/prisma-sla-ticket.query';
import { SlaController } from './presentation/sla.controller';

@Module({
  imports: [PrismaModule],
  controllers: [SlaController],
  providers: [
    ListSlaPoliciesService,
    UpdateSlaPolicyService,
    GetSlaBoardService,
    {
      provide: SLA_POLICY_REPOSITORY,
      useClass: PrismaSlaPolicyRepository,
    },
    {
      provide: SLA_TICKET_QUERY,
      useClass: PrismaSlaTicketQuery,
    },
  ],
})
export class SlaModule {}
