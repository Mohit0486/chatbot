'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type Usage = {
  subscription?: {
    planName: string;
    status: string;
    messageLimit: number;
    voiceMinuteLimit: number;
  };
  usage: {
    messages: number;
    voiceMinutes: number;
    leads: number;
  };
};

export default function BillingPage() {
  const workspaceId = getWorkspaceId();
  const [usage, setUsage] = useState<Usage | null>(null);

  const load = () => {
    if (!workspaceId) return;
    api
      .get('/billing/usage', { ...withAuth(), params: { workspaceId } })
      .then((res) => setUsage(res.data))
      .catch(() => setUsage(null));
  };

  useEffect(load, [workspaceId]);

  const startCheckout = async () => {
    const { data } = await api.post(
      '/billing/checkout-session',
      { workspaceId, planName: 'Pro', priceId: 'price_pro_monthly' },
      withAuth(),
    );
    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">SaaS Billing</h2>
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Stripe subscriptions, plan limits, and usage tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Plan: {usage?.subscription?.planName ?? 'Starter'}</p>
          <p>Status: {usage?.subscription?.status ?? 'TRIALING'}</p>
          <p>
            Messages: {usage?.usage.messages ?? 0} / {usage?.subscription?.messageLimit ?? 1000}
          </p>
          <p>
            Voice Minutes: {usage?.usage.voiceMinutes ?? 0} / {usage?.subscription?.voiceMinuteLimit ?? 200}
          </p>
          <Button onClick={startCheckout}>Upgrade to Pro</Button>
        </CardContent>
      </Card>
    </div>
  );
}
