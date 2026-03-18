import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChatbotsModule } from './chatbots/chatbots.module';
import { VoiceAgentsModule } from './voice-agents/voice-agents.module';
import { LeadsModule } from './leads/leads.module';
import { ConversationsModule } from './conversations/conversations.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { BillingModule } from './billing/billing.module';
import { ChannelsModule } from './channels/channels.module';
import { IntegrationsModule } from './integrations/integrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    WorkspacesModule,
    ChatbotsModule,
    VoiceAgentsModule,
    LeadsModule,
    ConversationsModule,
    AnalyticsModule,
    BillingModule,
    ChannelsModule,
    IntegrationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
