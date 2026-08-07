import { ChannelType } from '@prisma/client';
import { IsEnum, IsObject, IsString } from 'class-validator';

export class UpsertChannelDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  name!: string;

  @IsEnum(ChannelType)
  type!: ChannelType;

  @IsObject()
  config!: Record<string, unknown>;
}
