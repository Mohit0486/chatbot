import { Injectable } from '@nestjs/common';
import { UsageEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateLeadDto, UpdateLeadStatusDto } from './dto/lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async list(workspaceId: string, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.lead.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateLeadDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    const lead = await this.prisma.lead.create({
      data: {
        workspaceId: dto.workspaceId,
        fullName: dto.fullName,
        email: dto.email,
        phone: dto.phone,
        source: dto.source,
        lastActivityAt: new Date(),
      },
    });
    await this.prisma.usageMetric.create({
      data: {
        workspaceId: dto.workspaceId,
        event: UsageEvent.LEAD_CAPTURED,
        quantity: 1,
      },
    });
    return lead;
  }

  async updateStatus(userId: string, leadId: string, dto: UpdateLeadStatusDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    return this.prisma.lead.updateMany({
      where: { id: leadId, workspaceId: dto.workspaceId },
      data: {
        status: dto.status,
        lastActivityAt: new Date(),
      },
    });
  }
}
