import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageSender, UsageEvent } from '@prisma/client';
import { OpenAI } from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  ChatMessageDto,
  ManualReplyDto,
  StartConversationDto,
} from './dto/conversation.dto';

@Injectable()
export class ConversationsService {
  private readonly openai: OpenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {
    this.openai = process.env.OPENAI_API_KEY
      ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
      : null;
  }

  async list(workspaceId: string, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    return this.prisma.conversation.findMany({
      where: { workspaceId },
      include: {
        lead: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });
  }

  async start(userId: string, dto: StartConversationDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    return this.prisma.conversation.create({
      data: {
        workspaceId: dto.workspaceId,
        chatbotId: dto.chatbotId,
        voiceAgentId: dto.voiceAgentId,
        type: dto.type,
        externalUserId: dto.externalUserId,
      },
    });
  }

  async listMessages(
    userId: string,
    workspaceId: string,
    conversationId: string,
  ) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    await this.assertConversationBelongs(conversationId, workspaceId);

    return this.prisma.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async chat(userId: string | undefined, dto: ChatMessageDto) {
    if (userId) {
      await this.workspacesService.assertWorkspaceMember(
        userId,
        dto.workspaceId,
      );
    }
    const chatbot = await this.prisma.chatbot.findFirst({
      where: {
        workspaceId: dto.workspaceId,
        OR: [{ id: dto.chatbotId }, { websiteWidgetToken: dto.chatbotId }],
      },
      include: { knowledgeDocuments: true },
    });
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found.');
    }

    const conversation = dto.conversationId
      ? await this.prisma.conversation.findFirst({
          where: { id: dto.conversationId, workspaceId: dto.workspaceId },
        })
      : null;

    const activeConversation =
      conversation ??
      (await this.prisma.conversation.create({
        data: {
          workspaceId: dto.workspaceId,
          chatbotId: chatbot.id,
          type: 'CHAT',
        },
      }));

    await this.prisma.conversationMessage.create({
      data: {
        conversationId: activeConversation.id,
        sender: MessageSender.USER,
        content: dto.message,
      },
    });

    const context = chatbot.knowledgeDocuments
      .map((doc) => doc.rawText ?? '')
      .join('\n')
      .slice(0, 5000);

    const fallback = `Thanks for your message. I am ${chatbot.name}. A live AI response is unavailable until OPENAI_API_KEY is configured.`;

    const aiReply = this.openai
      ? (
          await this.openai.responses.create({
            model: chatbot.model,
            instructions: chatbot.systemPrompt,
            input: [
              {
                role: 'user',
                content: `Context:\n${context}\n\nUser message: ${dto.message}`,
              },
            ],
          })
        ).output_text || fallback
      : fallback;

    await this.prisma.conversationMessage.create({
      data: {
        conversationId: activeConversation.id,
        sender: MessageSender.BOT,
        content: aiReply,
      },
    });

    await this.prisma.usageMetric.createMany({
      data: [
        {
          workspaceId: dto.workspaceId,
          event: UsageEvent.MESSAGE,
          quantity: 1,
        },
        {
          workspaceId: dto.workspaceId,
          event: UsageEvent.MESSAGE,
          quantity: 1,
        },
      ],
    });

    return {
      conversationId: activeConversation.id,
      reply: aiReply,
    };
  }

  async manualReply(
    userId: string,
    conversationId: string,
    dto: ManualReplyDto,
  ) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    await this.assertConversationBelongs(conversationId, dto.workspaceId);

    return this.prisma.conversationMessage.create({
      data: {
        conversationId,
        sender: MessageSender.AGENT,
        content: dto.content,
        repliedById: userId,
      },
    });
  }

  private async assertConversationBelongs(
    conversationId: string,
    workspaceId: string,
  ) {
    const exists = await this.prisma.conversation.findFirst({
      where: { id: conversationId, workspaceId },
    });
    if (!exists) {
      throw new NotFoundException('Conversation not found.');
    }
  }
}
