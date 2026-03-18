import { Module } from '@nestjs/common';
import { VoiceAgentsController } from './voice-agents.controller';
import { VoiceAgentsService } from './voice-agents.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [VoiceAgentsController],
  providers: [VoiceAgentsService],
  exports: [VoiceAgentsService],
})
export class VoiceAgentsModule {}
