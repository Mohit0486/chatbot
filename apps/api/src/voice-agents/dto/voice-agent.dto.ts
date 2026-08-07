import { IsOptional, IsString } from 'class-validator';

export class CreateVoiceAgentDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  name!: string;

  @IsString()
  systemPrompt!: string;

  @IsString()
  voiceId!: string;

  @IsString()
  @IsOptional()
  voiceProvider?: string;

  @IsString()
  @IsOptional()
  deepgramModel?: string;
}

export class InitiateCallDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  toNumber!: string;

  @IsString()
  fromNumber!: string;
}
