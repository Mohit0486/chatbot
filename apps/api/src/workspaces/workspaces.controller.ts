import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  UpdateWorkspaceMemberRoleDto,
} from './dto/workspace.dto';

@UseGuards(JwtAuthGuard)
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Get()
  listForCurrentUser(@Req() req: Request & { user: AuthenticatedUser }) {
    return this.workspacesService.listForUser(req.user.id);
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(req.user.id, dto);
  }

  @Post(':workspaceId/members')
  addMember(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddWorkspaceMemberDto,
  ) {
    return this.workspacesService.addMember(req.user.id, workspaceId, dto);
  }

  @Patch(':workspaceId/members/:memberId/role')
  updateMemberRole(
    @Req() req: Request & { user: AuthenticatedUser },
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateWorkspaceMemberRoleDto,
  ) {
    return this.workspacesService.updateMemberRole(
      req.user.id,
      workspaceId,
      memberId,
      dto,
    );
  }
}
