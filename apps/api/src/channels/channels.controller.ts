import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import { UpsertChannelDto } from './dto/channel.dto';

@UseGuards(JwtAuthGuard)
@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  list(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.channelsService.list(workspaceId, req.user.id);
  }

  @Post()
  upsert(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: UpsertChannelDto,
  ) {
    return this.channelsService.upsert(req.user.id, dto);
  }

  @Get('widget-script')
  widgetScript(
    @Query('workspaceId') workspaceId: string,
    @Query('chatbotToken') chatbotToken: string,
  ) {
    return this.channelsService.widgetScript(workspaceId, chatbotToken);
  }
}
