import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/infrastructure/persistence/prisma.module';
import { CreateAutomationRuleService } from './application/create-automation-rule.service';
import { DeleteAutomationRuleService } from './application/delete-automation-rule.service';
import { GetAutomationRuleService } from './application/get-automation-rule.service';
import { ListAutomationRulesService } from './application/list-automation-rules.service';
import { RunAutomationRuleService } from './application/run-automation-rule.service';
import { ToggleAutomationRuleService } from './application/toggle-automation-rule.service';
import { UpdateAutomationRuleService } from './application/update-automation-rule.service';
import { AUTOMATION_RULE_REPOSITORY } from './domain/automation-rule.repository';
import { PrismaAutomationRuleRepository } from './infrastructure/prisma-automation-rule.repository';
import { AutomationsController } from './presentation/automations.controller';

@Module({
  imports: [PrismaModule],
  controllers: [AutomationsController],
  providers: [
    ListAutomationRulesService,
    GetAutomationRuleService,
    CreateAutomationRuleService,
    UpdateAutomationRuleService,
    ToggleAutomationRuleService,
    RunAutomationRuleService,
    DeleteAutomationRuleService,
    {
      provide: AUTOMATION_RULE_REPOSITORY,
      useClass: PrismaAutomationRuleRepository,
    },
  ],
})
export class AutomationsModule {}
