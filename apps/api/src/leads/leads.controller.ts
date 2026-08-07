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
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/lead.dto';

@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  list(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.leadsService.list(workspaceId, req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: CreateLeadDto,
  ) {
    return this.leadsService.create(req.user.id, dto);
  }

  @Patch(':leadId/status')
  updateStatus(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('leadId') leadId: string,
    @Body() dto: UpdateLeadStatusDto,
  ) {
    return this.leadsService.updateStatus(req.user.id, leadId, dto);
  }
}
