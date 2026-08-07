'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

type Chatbot = {
  id: string;
  name: string;
  systemPrompt: string;
  isPublished: boolean;
  websiteWidgetToken?: string;
};

export default function ChatbotsPage() {
  const [bots, setBots] = useState<Chatbot[]>([]);
  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful sales assistant.');
  const [description, setDescription] = useState('');
  const [selectedBotId, setSelectedBotId] = useState('');
  const [knowledgeText, setKnowledgeText] = useState('');
  const [flowJson, setFlowJson] = useState(
    JSON.stringify(
      {
        nodes: [{ id: 'start', text: 'Welcome! How can I help?' }],
        edges: [],
      },
      null,
      2,
    ),
  );

  const workspaceId = getWorkspaceId();

  const load = () => {
    if (!workspaceId) return;
    api
      .get('/chatbots', { ...withAuth(), params: { workspaceId } })
      .then((res) => setBots(res.data))
      .catch(() => setBots([]));
  };

  useEffect(load, [workspaceId]);

  const createBot = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post(
      '/chatbots',
      { workspaceId, name, description, systemPrompt },
      withAuth(),
    );
    setName('');
    setDescription('');
    load();
  };

  const publishWidget = async (chatbotId: string) => {
    await api.post(`/chatbots/${chatbotId}/deploy/widget`, { workspaceId }, withAuth());
    load();
  };

  const addKnowledge = async () => {
    if (!selectedBotId || !knowledgeText.trim()) return;
    await api.post(
      `/chatbots/${selectedBotId}/knowledge`,
      {
        workspaceId,
        title: 'Text Knowledge',
        sourceType: 'TEXT',
        rawText: knowledgeText,
      },
      withAuth(),
    );
    setKnowledgeText('');
    load();
  };

  const saveFlow = async () => {
    if (!selectedBotId) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(flowJson);
    } catch {
      alert('Flow JSON is invalid.');
      return;
    }
    await api.patch(
      `/chatbots/${selectedBotId}/flow`,
      {
        workspaceId,
        flowDefinition: parsed,
      },
      withAuth(),
    );
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Chatbot Builder</h2>
      <Card>
        <CardHeader>
          <CardTitle>Create Chatbot</CardTitle>
          <CardDescription>Configure instructions, then upload knowledge base files, URLs, or text chunks.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={createBot}>
            <Input placeholder="Bot name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="md:col-span-2">
              <Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} />
            </div>
            <Button className="md:col-span-2" type="submit">Create chatbot</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base & Flow Builder</CardTitle>
          <CardDescription>Select a bot, upload text knowledge, and save conversation flow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            className="h-10 w-full rounded-md border px-3 text-sm"
            value={selectedBotId}
            onChange={(e) => setSelectedBotId(e.target.value)}
          >
            <option value="">Select chatbot</option>
            {bots.map((bot) => (
              <option key={bot.id} value={bot.id}>
                {bot.name}
              </option>
            ))}
          </select>
          <Textarea
            placeholder="Paste text or extracted PDF contents"
            value={knowledgeText}
            onChange={(e) => setKnowledgeText(e.target.value)}
          />
          <Button variant="outline" onClick={addKnowledge}>
            Add text knowledge
          </Button>
          <Textarea value={flowJson} onChange={(e) => setFlowJson(e.target.value)} />
          <Button variant="outline" onClick={saveFlow}>
            Save flow definition
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {bots.map((bot) => (
          <Card key={bot.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>{bot.name}</CardTitle>
                <CardDescription>{bot.systemPrompt.slice(0, 100)}...</CardDescription>
              </div>
              <Badge variant={bot.isPublished ? 'default' : 'outline'}>
                {bot.isPublished ? 'Published' : 'Draft'}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Token: {bot.websiteWidgetToken ?? 'not deployed'}
              </p>
              <Button variant="outline" onClick={() => publishWidget(bot.id)}>
                Deploy widget
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
