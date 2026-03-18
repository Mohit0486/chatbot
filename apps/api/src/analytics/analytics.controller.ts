import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  overview(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.analyticsService.overview(workspaceId, req.user.id);
  }
}
