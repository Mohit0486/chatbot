import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  workspaceName!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class AddMemberDto {
  @IsEmail()
  email!: string;

  @IsString()
  role!: string;
}

export class UpdateMemberRoleDto {
  @IsString()
  role!: string;
}

export class WorkspaceContextDto {
  @IsString()
  @IsOptional()
  workspaceId?: string;
}
