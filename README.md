# AI Agent Builder (Multi-Tenant SaaS)

Production-ready SaaS platform where businesses can create, deploy, and manage AI chatbots and voice agents.

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, ShadCN-style UI components
- **Backend**: Node.js, NestJS
- **Database**: PostgreSQL (pgvector-ready image in Docker Compose)
- **ORM**: Prisma
- **AI**: OpenAI GPT models + embeddings
- **Voice AI**: ElevenLabs (voice model config), Deepgram (transcript ingestion), Twilio (call automation/incoming webhooks)
- **Billing**: Stripe subscriptions and usage tracking

## Monorepo Structure

```bash
apps/
  api/   # NestJS backend
  web/   # Next.js frontend
docker-compose.yml
```

## Implemented Modules

1. **Authentication**
   - `POST /auth/signup`
   - `POST /auth/login`
   - `GET /auth/me`
   - Workspace creation on signup and role-based workspace memberships.

2. **Chatbot Builder**
   - `GET /chatbots`
   - `POST /chatbots`
   - `PATCH /chatbots/:chatbotId/flow`
   - `POST /chatbots/:chatbotId/knowledge`
   - `POST /chatbots/:chatbotId/deploy/widget`
   - Supports prompt instructions, flow JSON, knowledge ingestion (PDF/URL/TEXT metadata), and website widget deployment token generation.

3. **Voice Agent Builder**
   - `GET /voice-agents`
   - `POST /voice-agents`
   - `POST /voice-agents/:voiceAgentId/call`
   - Supports voice selection and Twilio outbound call automation.

4. **Lead Management**
   - `GET /leads`
   - `POST /leads`
   - `PATCH /leads/:leadId/status`
   - CRM pipeline statuses: `NEW`, `CONTACTED`, `QUALIFIED`, `WON`, `LOST`.

5. **Conversation Inbox**
   - `GET /conversations`
   - `GET /conversations/:conversationId/messages`
   - `POST /conversations/chat` (public-compatible for widget)
   - `POST /conversations/:conversationId/reply` (manual admin reply)
   - Stores chat history + voice transcript events.

6. **Analytics Dashboard**
   - `GET /analytics/overview`
   - Leads generated, conversation totals, usage, engagement rate.

7. **Deployment Channels**
   - `GET /channels`
   - `POST /channels`
   - `GET /channels/widget-script`
   - Channel configs for website widget, WhatsApp, and voice.

8. **SaaS Billing**
   - `POST /billing/checkout-session`
   - `GET /billing/usage`
   - `POST /billing/webhook`
   - Stripe checkout + subscription persistence + usage reporting.

## Integrations / Handlers

- **Voice call handler (Twilio webhook)**: `POST /integrations/twilio/voice`
- **Transcript ingestion handler (Deepgram)**: `POST /integrations/deepgram/transcript`
- **Chat widget script**: `apps/web/public/ai-agent-widget.js`

## Database Schema

Prisma schema includes:

- Multi-tenant entities: `Workspace`, `WorkspaceMember`, `User`
- Builders: `Chatbot`, `KnowledgeDocument`, `VoiceAgent`, `VoiceCall`
- Engagement: `Conversation`, `ConversationMessage`
- CRM: `Lead`
- SaaS: `Subscription`, `UsageMetric`, `DeploymentChannel`
- RBAC and pipeline enums

See: `apps/api/prisma/schema.prisma`

## Local Development

### 1) Install dependencies

```bash
npm install --workspaces
```

### 2) Configure env

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 3) Start PostgreSQL + services via Docker

```bash
docker compose up --build
```

### 4) Run Prisma generate/push locally (non-docker workflow)

```bash
npm run prisma:generate
npm run prisma:push
```

### 5) Run apps

```bash
npm run dev:api
npm run dev:web
```

Both servers bind to `0.0.0.0` by default, so Cursor port previews can connect directly on ports `4000` and `3000`.

## Frontend Pages

- `/` Landing page
- `/signup`, `/login`
- `/dashboard` Analytics overview
- `/dashboard/chatbots`
- `/dashboard/voice-agents`
- `/dashboard/leads`
- `/dashboard/inbox`
- `/dashboard/channels`
- `/dashboard/billing`
- `/admin` (redirects to dashboard)

## Notes

- Configure `OPENAI_API_KEY`, `STRIPE_SECRET_KEY`, `TWILIO_*`, `DEEPGRAM_API_KEY`, and `ELEVENLABS_API_KEY` to enable full production integrations.
- Widget route can work unauthenticated by chatbot token + workspace context.
