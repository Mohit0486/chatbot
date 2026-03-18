import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OpenAI } from 'openai';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import {
  AddKnowledgeDto,
  CreateChatbotDto,
  UpdateChatbotFlowDto,
} from './dto/chatbot.dto';

@Injectable()
export class ChatbotsService {
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
    return this.prisma.chatbot.findMany({
      where: { workspaceId },
      include: {
        knowledgeDocuments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateChatbotDto, userId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    return this.prisma.chatbot.create({
      data: {
        workspaceId: dto.workspaceId,
        name: dto.name,
        description: dto.description,
        systemPrompt: dto.systemPrompt,
        model: dto.model ?? 'gpt-4o-mini',
      },
    });
  }

  async updateFlow(
    userId: string,
    workspaceId: string,
    chatbotId: string,
    dto: UpdateChatbotFlowDto,
  ) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    await this.ensureOwnedChatbot(chatbotId, workspaceId);

    return this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        flowDefinition: dto.flowDefinition as Prisma.InputJsonValue,
      },
    });
  }

  async addKnowledge(userId: string, chatbotId: string, dto: AddKnowledgeDto) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    await this.ensureOwnedChatbot(chatbotId, dto.workspaceId);

    const knowledgeDoc = await this.prisma.knowledgeDocument.create({
      data: {
        workspaceId: dto.workspaceId,
        chatbotId,
        title: dto.title,
        sourceType: dto.sourceType,
        sourceUrl: dto.sourceUrl,
        rawText: dto.rawText,
        indexed: false,
      },
    });

    const raw = dto.rawText?.trim();
    if (raw && this.openai) {
      await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: raw.slice(0, 4000),
      });
    }

    return this.prisma.knowledgeDocument.update({
      where: { id: knowledgeDoc.id },
      data: { indexed: true },
    });
  }

  async publishWidget(userId: string, workspaceId: string, chatbotId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    await this.ensureOwnedChatbot(chatbotId, workspaceId);

    const token = `wgt_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    const chatbot = await this.prisma.chatbot.update({
      where: { id: chatbotId },
      data: {
        isPublished: true,
        websiteWidgetToken: token,
      },
    });

    const embedScript = `<script src="${process.env.WIDGET_BASE_URL ?? 'https://cdn.example.com'}/ai-agent-widget.js" data-chatbot-token="${chatbot.websiteWidgetToken}"></script>`;

    return {
      chatbotId: chatbot.id,
      isPublished: chatbot.isPublished,
      websiteWidgetToken: chatbot.websiteWidgetToken,
      embedScript,
    };
  }

  private async ensureOwnedChatbot(chatbotId: string, workspaceId: string) {
    const chatbot = await this.prisma.chatbot.findFirst({
      where: { id: chatbotId, workspaceId },
    });
    if (!chatbot) {
      throw new NotFoundException('Chatbot not found for this workspace.');
    }
  }
}
