import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { SubscriptionStatus, UsageEvent } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkspacesService } from '../workspaces/workspaces.service';
import { CreateSubscriptionSessionDto } from './dto/billing.dto';

@Injectable()
export class BillingService {
  private readonly stripe: Stripe | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspacesService: WorkspacesService,
  ) {
    this.stripe = process.env.STRIPE_SECRET_KEY
      ? new Stripe(process.env.STRIPE_SECRET_KEY)
      : null;
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateSubscriptionSessionDto,
  ) {
    await this.workspacesService.assertWorkspaceMember(userId, dto.workspaceId);
    const workspace = await this.prisma.workspace.findUniqueOrThrow({
      where: { id: dto.workspaceId },
    });

    if (!this.stripe) {
      return {
        mode: 'mock',
        checkoutUrl: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/dashboard/billing?mockCheckout=1`,
      };
    }

    const customer = await this.stripe.customers.create({
      name: workspace.name,
      metadata: { workspaceId: workspace.id },
    });

    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price: dto.priceId, quantity: 1 }],
      success_url: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/dashboard/billing?success=1`,
      cancel_url: `${process.env.APP_BASE_URL ?? 'http://localhost:3000'}/dashboard/billing?cancel=1`,
      metadata: {
        workspaceId: dto.workspaceId,
        planName: dto.planName,
      },
    });

    return {
      checkoutUrl: session.url,
    };
  }

  async usage(userId: string, workspaceId: string) {
    await this.workspacesService.assertWorkspaceMember(userId, workspaceId);
    const [subscription, usage] = await Promise.all([
      this.prisma.subscription.findFirst({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.usageMetric.groupBy({
        by: ['event'],
        where: { workspaceId },
        _sum: { quantity: true },
      }),
    ]);

    return {
      subscription,
      usage: {
        messages:
          usage.find((x) => x.event === UsageEvent.MESSAGE)?._sum.quantity ?? 0,
        voiceMinutes:
          usage.find((x) => x.event === UsageEvent.VOICE_MINUTE)?._sum.quantity ??
          0,
        leads:
          usage.find((x) => x.event === UsageEvent.LEAD_CAPTURED)?._sum.quantity ??
          0,
      },
    };
  }

  async handleWebhook(rawPayload: string, signature: string | undefined) {
    if (!this.stripe || !process.env.STRIPE_WEBHOOK_SECRET || !signature) {
      return { received: true, mocked: true };
    }

    const event = this.stripe.webhooks.constructEvent(
      rawPayload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const workspaceId = session.metadata?.workspaceId;
      if (workspaceId) {
        await this.prisma.subscription.create({
          data: {
            workspaceId,
            stripeCustomerId: session.customer?.toString(),
            stripeSubscriptionId: session.subscription?.toString(),
            planName: session.metadata?.planName ?? 'Pro',
            status: SubscriptionStatus.ACTIVE,
          },
        });
      }
    }

    return { received: true };
  }
}
