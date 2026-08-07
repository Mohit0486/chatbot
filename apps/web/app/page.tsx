import Link from "next/link";
import { Bot, Mic2, ChartLine, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-6xl px-6 py-16">
        <header className="mb-12">
          <h1 className="text-5xl font-bold">AI Agent Builder</h1>
          <p className="mt-4 max-w-2xl text-slate-300">
            Production-ready multi-tenant SaaS for building chatbot and voice AI agents with lead capture, inbox, analytics, and billing.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/signup">
              <Button>Start Free Trial</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Open Dashboard</Button>
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Chatbot Builder", desc: "Prompt, KB, flow, widget deployment", icon: Bot },
            { title: "Voice Agent", desc: "ElevenLabs + Deepgram + Twilio orchestration", icon: Mic2 },
            { title: "Analytics", desc: "Leads, conversations, engagement performance", icon: ChartLine },
            { title: "Channels", desc: "Website widget, WhatsApp, voice automation", icon: Plug },
          ].map((item) => (
            <Card key={item.title} className="bg-slate-900 text-white">
              <CardHeader>
                <item.icon size={18} />
                <CardTitle>{item.title}</CardTitle>
                <CardDescription className="text-slate-300">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
