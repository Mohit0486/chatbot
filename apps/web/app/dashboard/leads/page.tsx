'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Lead = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  source: string;
  status: LeadStatus;
};

type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'WON' | 'LOST';

const nextStatus: Record<LeadStatus, LeadStatus> = {
  NEW: 'CONTACTED',
  CONTACTED: 'QUALIFIED',
  QUALIFIED: 'WON',
  WON: 'WON',
  LOST: 'LOST',
};

export default function LeadsPage() {
  const workspaceId = getWorkspaceId();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const load = () => {
    if (!workspaceId) return;
    api
      .get('/leads', { ...withAuth(), params: { workspaceId } })
      .then((res) => setLeads(res.data))
      .catch(() => setLeads([]));
  };

  useEffect(load, [workspaceId]);

  const createLead = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(
      '/leads',
      { workspaceId, fullName, email, phone, source: 'chat' },
      withAuth(),
    );
    setFullName('');
    setEmail('');
    setPhone('');
    load();
  };

  const moveStatus = async (lead: Lead) => {
    const status = nextStatus[lead.status] ?? lead.status;
    await api.patch(`/leads/${lead.id}/status`, { workspaceId, status }, withAuth());
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Lead Management</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create lead</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={createLead}>
            <Input placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Button className="md:col-span-3">Capture lead</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{lead.fullName ?? lead.email ?? lead.phone ?? 'Unknown lead'}</p>
                <p className="text-sm text-muted-foreground">{lead.source}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{lead.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => moveStatus(lead)}>
                  Move stage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
