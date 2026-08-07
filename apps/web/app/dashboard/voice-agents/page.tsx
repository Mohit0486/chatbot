'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type VoiceAgent = {
  id: string;
  name: string;
  voiceId: string;
  voiceProvider: string;
};

export default function VoiceAgentsPage() {
  const workspaceId = getWorkspaceId();
  const [agents, setAgents] = useState<VoiceAgent[]>([]);
  const [name, setName] = useState('');
  const [voiceId, setVoiceId] = useState('Rachel');
  const [systemPrompt, setSystemPrompt] = useState('You are an inbound sales assistant.');
  const [toNumber, setToNumber] = useState('');
  const [fromNumber, setFromNumber] = useState('');

  const load = () => {
    if (!workspaceId) return;
    api
      .get('/voice-agents', { ...withAuth(), params: { workspaceId } })
      .then((res) => setAgents(res.data))
      .catch(() => setAgents([]));
  };

  useEffect(load, [workspaceId]);

  const createAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(
      '/voice-agents',
      { workspaceId, name, voiceId, systemPrompt },
      withAuth(),
    );
    setName('');
    load();
  };

  const call = async (voiceAgentId: string) => {
    await api.post(
      `/voice-agents/${voiceAgentId}/call`,
      { workspaceId, toNumber, fromNumber },
      withAuth(),
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Voice Agent Builder</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create voice agent</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createAgent}>
            <Input placeholder="Agent name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Voice (ElevenLabs voice ID)" value={voiceId} onChange={(e) => setVoiceId(e.target.value)} />
            <div className="md:col-span-2">
              <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
            </div>
            <Button className="md:col-span-2">Create voice agent</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Call automation</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Input placeholder="To number" value={toNumber} onChange={(e) => setToNumber(e.target.value)} />
          <Input placeholder="From number" value={fromNumber} onChange={(e) => setFromNumber(e.target.value)} />
        </CardContent>
      </Card>
      <div className="grid gap-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Provider: {agent.voiceProvider} | Voice: {agent.voiceId}
              </p>
              <Button variant="outline" onClick={() => call(agent.id)}>
                Trigger call
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
