'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Channel = {
  id: string;
  name: string;
  type: 'WEBSITE_WIDGET' | 'WHATSAPP' | 'VOICE_CALL';
};

export default function ChannelsPage() {
  const workspaceId = getWorkspaceId();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [widgetDomain, setWidgetDomain] = useState('https://your-site.com');
  const [voiceFrom, setVoiceFrom] = useState('');
  const [scriptTag, setScriptTag] = useState('');

  const load = () => {
    if (!workspaceId) return;
    api
      .get('/channels', { ...withAuth(), params: { workspaceId } })
      .then((res) => setChannels(res.data))
      .catch(() => setChannels([]));
  };

  useEffect(load, [workspaceId]);

  const saveChannel = async (type: Channel['type'], name: string, config: Record<string, unknown>) => {
    await api.post('/channels', { workspaceId, name, type, config }, withAuth());
    load();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Deployment Channels</h2>
      <Card>
        <CardHeader>
          <CardTitle>Website Widget</CardTitle>
          <CardDescription>Deploy chatbot on any website using one script tag.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input value={widgetDomain} onChange={(e) => setWidgetDomain(e.target.value)} />
          <Button
            variant="outline"
            onClick={async () => {
              await saveChannel('WEBSITE_WIDGET', 'Website Widget', { allowedDomain: widgetDomain });
              const token = prompt('Enter chatbot token to generate script') ?? '';
              if (token) {
                const { data } = await api.get('/channels/widget-script', {
                  ...withAuth(),
                  params: { workspaceId, chatbotToken: token },
                });
                setScriptTag(data.scriptTag);
              }
            }}
          >
            Save widget config
          </Button>
          {scriptTag ? <Textarea value={scriptTag} readOnly /> : null}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>WhatsApp Integration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Twilio WhatsApp Number"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => saveChannel('WHATSAPP', 'WhatsApp', { number: whatsappNumber })}
            >
              Save WhatsApp
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Voice Call Automation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Twilio From Number"
              value={voiceFrom}
              onChange={(e) => setVoiceFrom(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => saveChannel('VOICE_CALL', 'Voice Calls', { fromNumber: voiceFrom })}
            >
              Save Voice Channel
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configured channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {channels.map((channel) => (
            <div className="rounded-md border p-2" key={channel.id}>
              {channel.name} • {channel.type}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
