import { Injectable } from '@nestjs/common';
import { CallDirection } from '@prisma/client';
import twilio from 'twilio';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateVoiceAgentDto, InitiateCallDto } from './dto/voice-agent.dto';

@Injectable()
export class VoiceAgentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async list(workspaceId: string, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.voiceAgent.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateVoiceAgentDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    return this.prisma.voiceAgent.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        systemPrompt: dto.systemPrompt,
        voiceId: dto.voiceId,
        voiceProvider: dto.voiceProvider ?? 'elevenlabs',
        deepgramModel: dto.deepgramModel ?? 'nova-2',
      },
    });
  }

  async initiateCall(
    userId: string,
    voiceAgentId: string,
    dto: InitiateCallDto,
  ) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    const agent = await this.prisma.voiceAgent.findFirst({
      where: { id: voiceAgentId, workspaceId: dto.workspaceId },
    });
    if (!agent) {
      return { error: 'Voice agent not found in workspace' };
    }

    let twilioCallSid: string | undefined;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twimlWebhook =
      process.env.TWILIO_VOICE_WEBHOOK_URL ??
      `${process.env.PUBLIC_API_BASE_URL ?? 'http://localhost:4000'}/integrations/twilio/voice`;

    if (accountSid && authToken) {
      const client = twilio(accountSid, authToken);
      const call = await client.calls.create({
        to: dto.toNumber,
        from: dto.fromNumber,
        url: `${twimlWebhook}?voiceAgentId=${voiceAgentId}&workspaceId=${dto.workspaceId}`,
      });
      twilioCallSid = call.sid;
    }

    return this.prisma.voiceCall.create({
      data: {
        workspaceId: dto.workspaceId,
        voiceAgentId,
        direction: CallDirection.OUTBOUND,
        fromNumber: dto.fromNumber,
        toNumber: dto.toNumber,
        twilioCallSid,
      },
    });
  }
}
