import { Injectable } from '@nestjs/common';
import { UsageEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async overview(workspaceId: string, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);

    const [leads, conversations, messages, usage, recentLeads] =
      await Promise.all([
        this.prisma.lead.count({ where: { workspaceId } }),
        this.prisma.conversation.count({ where: { workspaceId } }),
        this.prisma.conversationMessage.count({
          where: {
            conversation: { workspaceId },
          },
        }),
        this.prisma.usageMetric.groupBy({
          by: ['event'],
          where: { workspaceId },
          _sum: { quantity: true },
        }),
        this.prisma.lead.findMany({
          where: { workspaceId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ]);

    const engagementRate = conversations
      ? Number(((messages / conversations) * 10).toFixed(2))
      : 0;

    return {
      totals: {
        leads,
        conversations,
        messages,
      },
      usage: {
        messages:
          usage.find((x) => x.event === UsageEvent.MESSAGE)?._sum.quantity ?? 0,
        voiceMinutes:
          usage.find((x) => x.event === UsageEvent.VOICE_MINUTE)?._sum
            .quantity ?? 0,
      },
      engagementRate,
      recentLeads,
    };
  }
}
