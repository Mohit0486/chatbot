'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, ChartLine, CreditCard, Inbox, Mic2, Plug, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: ChartLine },
  { href: '/dashboard/chatbots', label: 'Chatbot Builder', icon: Bot },
  { href: '/dashboard/voice-agents', label: 'Voice Agent Builder', icon: Mic2 },
  { href: '/dashboard/leads', label: 'Lead Management', icon: Users },
  { href: '/dashboard/inbox', label: 'Conversation Inbox', icon: Inbox },
  { href: '/dashboard/channels', label: 'Deployment Channels', icon: Plug },
  { href: '/dashboard/billing', label: 'Billing', icon: CreditCard },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="border-r bg-white p-4">
        <h1 className="mb-6 text-lg font-bold">AI Agent Builder</h1>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm',
                  active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
                )}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="bg-slate-50 p-6">{children}</main>
    </div>
  );
}
