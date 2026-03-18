import { Injectable } from '@nestjs/common';
import {
  CallDirection,
  ConversationType,
  MessageSender,
  UsageEvent,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async handleIncomingTwilioVoice(params: Record<string, string>) {
    const workspaceId = params.workspaceId;
    const voiceAgentId = params.voiceAgentId;
    const from = params.From ?? '';
    const to = params.To ?? '';
    const callSid = params.CallSid;

    if (!workspaceId || !voiceAgentId) {
      return `<Response><Say>Missing workspace or voice agent context.</Say></Response>`;
    }

    const call = await this.prisma.voiceCall.create({
      data: {
        workspaceId,
        voiceAgentId,
        direction: CallDirection.INBOUND,
        fromNumber: from,
        toNumber: to,
        twilioCallSid: callSid,
      },
    });

    const conversation = await this.prisma.conversation.create({
      data: {
        workspaceId,
        voiceAgentId,
        type: ConversationType.VOICE,
      },
    });

    await this.prisma.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        sender: MessageSender.SYSTEM,
        content: `Incoming call received from ${from}`,
        metadata: { twilioCallSid: call.twilioCallSid },
      },
    });

    return `<Response><Say>Thanks for calling. Our AI assistant is ready to help you.</Say><Pause length="1"/><Say>Please leave your details after the tone.</Say><Record timeout="4" maxLength="120"/></Response>`;
  }

  async handleDeepgramTranscript(payload: {
    workspaceId: string;
    conversationId: string;
    transcript: string;
    durationSec?: number;
  }) {
    await this.prisma.conversationMessage.create({
      data: {
        conversationId: payload.conversationId,
        sender: MessageSender.USER,
        content: payload.transcript,
        metadata: { source: 'deepgram' },
      },
    });

    await this.prisma.usageMetric.create({
      data: {
        workspaceId: payload.workspaceId,
        event: UsageEvent.VOICE_MINUTE,
        quantity: Math.max(1, Math.ceil((payload.durationSec ?? 30) / 60)),
      },
    });

    return { received: true };
  }
}
