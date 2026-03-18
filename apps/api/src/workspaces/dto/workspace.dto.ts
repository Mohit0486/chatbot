import { IsEmail, IsEnum, IsString } from 'class-validator';
import { WorkspaceRole } from '@prisma/client';

export class CreateWorkspaceDto {
  @IsString()
  name!: string;
}

export class AddWorkspaceMemberDto {
  @IsEmail()
  email!: string;

  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}

export class UpdateWorkspaceMemberRoleDto {
  @IsEnum(WorkspaceRole)
  role!: WorkspaceRole;
}
