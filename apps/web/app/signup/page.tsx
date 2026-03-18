'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/signup', {
        name,
        workspaceName,
        email,
        password,
      });
      localStorage.setItem('aibuilder_token', data.token);
      localStorage.setItem('aibuilder_workspace_id', data.workspace.id);
      router.push('/dashboard');
    } catch {
      setError('Could not create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>Create workspace and start building AI agents.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={onSubmit}>
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Workspace name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
            />
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input type="password" placeholder="Password (8+ chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button className="w-full" disabled={loading} type="submit">
              {loading ? 'Creating...' : 'Create workspace'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
