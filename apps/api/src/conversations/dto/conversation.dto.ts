import { ConversationType } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class StartConversationDto {
  @IsString()
  workspaceId!: string;

  @IsEnum(ConversationType)
  type!: ConversationType;

  @IsString()
  @IsOptional()
  chatbotId?: string;

  @IsString()
  @IsOptional()
  voiceAgentId?: string;

  @IsString()
  @IsOptional()
  externalUserId?: string;
}

export class ChatMessageDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  chatbotId!: string;

  @IsString()
  message!: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class ManualReplyDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  content!: string;
}
