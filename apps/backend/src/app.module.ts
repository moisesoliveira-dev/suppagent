import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AutomationsModule } from './modules/automations/automations.module';
import { CannedResponsesModule } from './modules/canned-responses/canned-responses.module';
import { HealthModule } from './modules/health/health.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SlaModule } from './modules/sla/sla.module';
import { TeamChatModule } from './modules/team-chat/team-chat.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        resolve(process.cwd(), '.env'),
        resolve(process.cwd(), '../../.env'),
      ],
    }),
    HealthModule,
    NotificationsModule,
    TicketsModule,
    UsersModule,
    KnowledgeModule,
    TeamChatModule,
    ReportsModule,
    AutomationsModule,
    SlaModule,
    CannedResponsesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
