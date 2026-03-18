import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  AddWorkspaceMemberDto,
  CreateWorkspaceDto,
  UpdateWorkspaceMemberRoleDto,
} from './dto/workspace.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  listForUser(userId: string) {
    return this.prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = `${dto.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).slice(2, 7)}`;

    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: dto.name,
          slug,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId,
          workspaceId: workspace.id,
          role: WorkspaceRole.OWNER,
        },
      });

      await tx.subscription.create({
        data: {
          workspaceId: workspace.id,
          planName: 'Starter',
        },
      });

      return workspace;
    });
  }

  async addMember(
    userId: string,
    workspaceId: string,
    dto: AddWorkspaceMemberDto,
  ) {
    await this.assertAdminRole(userId, workspaceId);

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });
    if (!user) {
      throw new NotFoundException('User with that email does not exist.');
    }

    try {
      return await this.prisma.workspaceMember.create({
        data: {
          userId: user.id,
          workspaceId,
          role: dto.role,
        },
      });
    } catch {
      throw new BadRequestException('User is already a member.');
    }
  }

  async updateMemberRole(
    userId: string,
    workspaceId: string,
    memberId: string,
    dto: UpdateWorkspaceMemberRoleDto,
  ) {
    await this.assertAdminRole(userId, workspaceId);

    return this.prisma.workspaceMember.updateMany({
      where: { id: memberId, workspaceId },
      data: { role: dto.role },
    });
  }

  async assertWorkspaceMember(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!membership) {
      throw new ForbiddenException('User does not belong to this workspace.');
    }
  }

  private async assertAdminRole(userId: string, workspaceId: string) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });
    if (!membership) {
      throw new ForbiddenException('User does not belong to this workspace.');
    }

    if (
      membership.role !== WorkspaceRole.OWNER &&
      membership.role !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Only workspace admins can perform this action.');
    }
  }
}
