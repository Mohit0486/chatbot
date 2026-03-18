import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChatbotsService } from './chatbots.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import {
  AddKnowledgeDto,
  CreateChatbotDto,
  UpdateChatbotFlowDto,
} from './dto/chatbot.dto';

@UseGuards(JwtAuthGuard)
@Controller('chatbots')
export class ChatbotsController {
  constructor(private readonly chatbotsService: ChatbotsService) {}

  @Get()
  list(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.chatbotsService.list(workspaceId, req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: CreateChatbotDto,
  ) {
    return this.chatbotsService.create(dto, req.user.id);
  }

  @Patch(':chatbotId/flow')
  updateFlow(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('chatbotId') chatbotId: string,
    @Body('workspaceId') workspaceId: string,
    @Body() dto: UpdateChatbotFlowDto,
  ) {
    return this.chatbotsService.updateFlow(req.user.id, workspaceId, chatbotId, dto);
  }

  @Post(':chatbotId/knowledge')
  addKnowledge(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('chatbotId') chatbotId: string,
    @Body() dto: AddKnowledgeDto,
  ) {
    return this.chatbotsService.addKnowledge(req.user.id, chatbotId, dto);
  }

  @Post(':chatbotId/deploy/widget')
  publishWidget(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('chatbotId') chatbotId: string,
    @Body('workspaceId') workspaceId: string,
  ) {
    return this.chatbotsService.publishWidget(req.user.id, workspaceId, chatbotId);
  }
}
