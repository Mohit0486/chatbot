import {
  Body,
  Controller,
  Headers,
  Post,
  Query,
  Req,
  UseGuards,
  Get,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/auth-request.type';
import { CreateSubscriptionSessionDto } from './dto/billing.dto';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout-session')
  createCheckout(
    @Req() req: Request & { user: AuthenticatedUser },
    @Body() dto: CreateSubscriptionSessionDto,
  ) {
    return this.billingService.createCheckoutSession(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('usage')
  usage(
    @Req() req: Request & { user: AuthenticatedUser },
    @Query('workspaceId') workspaceId: string,
  ) {
    return this.billingService.usage(req.user.id, workspaceId);
  }

  @Post('webhook')
  async webhook(
    @Body() body: unknown,
    @Headers('stripe-signature') stripeSignature?: string,
  ) {
    return this.billingService.handleWebhook(
      typeof body === 'string' ? body : JSON.stringify(body),
      stripeSignature,
    );
  }
}
