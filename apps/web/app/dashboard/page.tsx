'use client';

import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type OverviewResponse = {
  totals: { leads: number; conversations: number; messages: number };
  usage: { messages: number; voiceMinutes: number };
  engagementRate: number;
};

export default function DashboardOverviewPage() {
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const workspaceId = getWorkspaceId();
    if (!workspaceId) return;
    api
      .get('/analytics/overview', {
        ...withAuth(),
        params: { workspaceId },
      })
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, []);

  const chartData = [
    { label: 'Leads', value: data?.totals.leads ?? 0 },
    { label: 'Conversations', value: data?.totals.conversations ?? 0 },
    { label: 'Messages', value: data?.totals.messages ?? 0 },
    { label: 'Voice Minutes', value: data?.usage.voiceMinutes ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Workspace KPIs for engagement and lead generation.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Leads Generated</CardDescription>
            <CardTitle>{data?.totals.leads ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Total Conversations</CardDescription>
            <CardTitle>{data?.totals.conversations ?? 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Engagement Rate</CardDescription>
            <CardTitle>{data?.engagementRate ?? 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usage Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-72">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="label" />
                <YAxis />
                <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
