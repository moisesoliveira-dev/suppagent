import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { ApplyRoutingService } from './application/apply-routing.service';
import { CreateRoutingRuleService } from './application/create-routing-rule.service';
import { DeleteRoutingRuleService } from './application/delete-routing-rule.service';
import { GetRoutingBoardService } from './application/get-routing-board.service';
import { ListRoutingRulesService } from './application/list-routing-rules.service';
import { ReviewRoutingService } from './application/review-routing.service';
import { UpdateRoutingRuleService } from './application/update-routing-rule.service';
import { ROUTING_RULE_REPOSITORY } from './domain/routing-rule.repository';
import { ROUTING_TICKET_PORT } from './domain/routing-ticket.port';
import { PrismaRoutingRuleRepository } from './infrastructure/prisma-routing-rule.repository';
import { PrismaRoutingTicketAdapter } from './infrastructure/prisma-routing-ticket.adapter';
import { RoutingController } from './presentation/routing.controller';

@Module({
  imports: [PrismaModule],
  controllers: [RoutingController],
  providers: [
    ListRoutingRulesService,
    CreateRoutingRuleService,
    UpdateRoutingRuleService,
    DeleteRoutingRuleService,
    GetRoutingBoardService,
    ApplyRoutingService,
    ReviewRoutingService,
    {
      provide: ROUTING_RULE_REPOSITORY,
      useClass: PrismaRoutingRuleRepository,
    },
    {
      provide: ROUTING_TICKET_PORT,
      useClass: PrismaRoutingTicketAdapter,
    },
  ],
})
export class RoutingModule {}
