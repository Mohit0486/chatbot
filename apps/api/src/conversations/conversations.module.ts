import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { ConversationsService } from './conversations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [ConversationsController],
  providers: [ConversationsService],
})
export class ConversationsModule {}
