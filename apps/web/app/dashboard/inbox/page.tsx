'use client';

import { useEffect, useState } from 'react';
import { api, withAuth } from '@/lib/api';
import { getWorkspaceId } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

type Conversation = {
  id: string;
  type: 'CHAT' | 'VOICE';
};

type Message = {
  id: string;
  sender: string;
  content: string;
};

export default function InboxPage() {
  const workspaceId = getWorkspaceId();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [active, setActive] = useState<string>('');
  const [reply, setReply] = useState('');

  const loadConversations = () => {
    if (!workspaceId) return;
    api
      .get('/conversations', { ...withAuth(), params: { workspaceId } })
      .then((res) => setConversations(res.data))
      .catch(() => setConversations([]));
  };

  const loadMessages = (conversationId: string) => {
    api
      .get(`/conversations/${conversationId}/messages`, {
        ...withAuth(),
        params: { workspaceId },
      })
      .then((res) => {
        setActive(conversationId);
        setMessages(res.data);
      })
      .catch(() => setMessages([]));
  };

  useEffect(loadConversations, [workspaceId]);

  const sendReply = async () => {
    if (!active) return;
    await api.post(
      `/conversations/${active}/reply`,
      { workspaceId, content: reply },
      withAuth(),
    );
    setReply('');
    loadMessages(active);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Conversation Inbox</h2>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted"
                onClick={() => loadMessages(conversation.id)}
              >
                {conversation.type} • {conversation.id.slice(0, 8)}
              </button>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Messages & transcripts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 rounded-md border p-3">
              {messages.map((message) => (
                <div key={message.id} className="rounded-md bg-slate-50 p-2 text-sm">
                  <span className="font-medium">{message.sender}: </span>
                  {message.content}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Manual admin reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Button onClick={sendReply}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
