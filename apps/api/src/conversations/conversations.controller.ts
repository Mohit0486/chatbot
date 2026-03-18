import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import {
  ChatMessageDto,
  ManualReplyDto,
  StartConversationDto,
} from './dto/conversation.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  list(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.list(workspaceId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  start(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: StartConversationDto,
  ) {
    return this.conversationsService.start(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/messages')
  listMessages(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('conversationId') conversationId: string,
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.conversationsService.listMessages(
      req.user.id,
      workspaceId,
      conversationId,
    );
  }

  @Post('chat')
  chat(@Req() req: Request & { user?: AuthenticatedUser }, @Body() dto: ChatMessageDto) {
    return this.conversationsService.chat(req.user?.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':conversationId/reply')
  manualReply(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('conversationId') conversationId: string,
    @Body() dto: ManualReplyDto,
  ) {
    return this.conversationsService.manualReply(
      req.user.id,
      conversationId,
      dto,
    );
  }
}
