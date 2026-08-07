import { IsString } from 'class-validator';

export class CreateSubscriptionSessionDto {
  @IsString()
  workspaceId!: string;

  @IsString()
  planName!: string;

  @IsString()
  priceId!: string;
}
