import {
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { KnowledgeSource } from '@prisma/client';

export class CreateChatbotDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  systemPrompt!: string;

  @IsString()
  @IsOptional()
  model?: string;
}

export class UpdateChatbotFlowDto {
  @IsObject()
  flowDefinition!: Record<string, unknown>;
}

export class AddKnowledgeDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  title!: string;

  @IsIn([KnowledgeSource.PDF, KnowledgeSource.URL, KnowledgeSource.TEXT])
  sourceType!: KnowledgeSource;

  @IsString()
  @IsOptional()
  sourceUrl?: string;

  @IsString()
  @IsOptional()
  rawText?: string;
}

export class PublishWidgetDto {
  @IsString()
  workspaceId!: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;
}
