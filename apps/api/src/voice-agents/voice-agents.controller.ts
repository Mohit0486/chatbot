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
import { VoiceAgentsService } from './voice-agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import { CreateVoiceAgentDto, InitiateCallDto } from './dto/voice-agent.dto';

@UseGuards(JwtAuthGuard)
@Controller('voice-agents')
export class VoiceAgentsController {
  constructor(private readonly voiceAgentsService: VoiceAgentsService) {}

  @Get()
  list(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.voiceAgentsService.list(workspaceId, req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: CreateVoiceAgentDto,
  ) {
    return this.voiceAgentsService.create(req.user.id, dto);
  }

  @Post(':voiceAgentId/call')
  initiateCall(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('voiceAgentId') voiceAgentId: string,
    @Body() dto: InitiateCallDto,
  ) {
    return this.voiceAgentsService.initiateCall(req.user.id, voiceAgentId, dto);
  }
}
