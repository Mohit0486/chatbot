import { LeadStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateLeadDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  source!: string;
}

export class UpdateLeadStatusDto {
  @IsEnum(LeadStatus)
  status!: LeadStatus;

  @IsString()
  workspaceId!: string;
}
