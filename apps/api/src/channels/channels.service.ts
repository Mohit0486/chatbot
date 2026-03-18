import { Injectable } from '@nestjs/common';
import { ChannelType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { UpsertChannelDto } from './dto/channel.dto';

@Injectable()
export class ChannelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async list(workspaceId: string, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.deploymentChannel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upsert(userId: string, dto: UpsertChannelDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    const existing = await this.prisma.deploymentChannel.findFirst({
      where: { workspaceId: dto.workspaceId, type: dto.type },
    });

    if (existing) {
      return this.prisma.deploymentChannel.update({
        where: { id: existing.id },
        data: {
          name: dto.name,
          config: dto.config as Prisma.InputJsonValue,
          isActive: true,
        },
      });
    }

    return this.prisma.deploymentChannel.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        type: dto.type,
        config: dto.config as Prisma.InputJsonValue,
      },
    });
  }

  async widgetScript(workspaceId: string, chatbotToken: string) {
    const channel = await this.prisma.deploymentChannel.findFirst({
      where: {
        workspaceId,
        type: ChannelType.WEBSITE_WIDGET,
      },
    });
    const baseUrl =
      (channel?.config as { cdnBaseUrl?: string } | null)?.cdnBaseUrl ??
      process.env.WIDGET_BASE_URL ??
      'https://cdn.example.com';

    return {
      scriptTag: `<script src="${baseUrl}/ai-agent-widget.js" data-chatbot-token="${chatbotToken}" data-workspace-id="${workspaceId}"></script>`,
    };
  }
}
