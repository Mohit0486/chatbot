import { Module } from '@nestjs/common';
import { ChatbotsController } from './chatbots.controller';
import { ChatbotsService } from './chatbots.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [PrismaModule, WorkspacesModule],
  controllers: [ChatbotsController],
  providers: [ChatbotsService],
})
export class ChatbotsModule {}
