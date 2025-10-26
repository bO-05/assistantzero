# Assistant0 - Secure AI Personal Assistant

A smart AI assistant that helps you manage your digital life with enterprise-grade security powered by Auth0. Built for the Auth0 hackathon challenge.

🚀 **[Live Demo](https://assistant0agent.vercel.app)** | 📦 **[GitHub Repo](https://github.com/bO-05/assistantzero)**

> Built with Auth0 AI SDK, Next.js 15, Mistral AI, and Fine-Grained Authorization (FGA)

## ✨ What It Does

**Mission Control Dashboard** - Track every AI action with full audit trails, risk scoring, and Auth0 context for compliance.

**Risk-Adaptive Auth** - Automatically trigger step-up authentication for sensitive operations based on risk assessment.

**Workspace Isolation** - Separate work, personal, and family contexts using Auth0 FGA to prevent data leakage.

**Smart Document RAG** - Upload documents and chat with them using AI-powered semantic search with pgvector.

**Tool Integrations** - Search the web, manage emails, check calendars, and more - all secured by Auth0.

📝 [View Changelog](./CHANGELOG.md)

## 🛠️ Tech Stack

**Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui

**AI & Backend:** Vercel AI SDK v5, Mistral AI, Auth0 AI SDK v4, Auth0 Next.js SDK v4

**Security:** Auth0 FGA (Fine-Grained Authorization), Token Vault, CIBA, Step-up Auth

**Database:** PostgreSQL (Neon) with Drizzle ORM + pgvector for semantic search

**Deployment:** Vercel

## 📂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── chat/          # Streaming chat API endpoint
│   │   ├── documents/     # Document upload API
│   │   └── migrate/       # Database migration endpoint
│   ├── page.tsx           # Main chat interface + landing page
│   ├── documents/         # Document management page
│   ├── mission-control/   # Audit trail dashboard
│   ├── workspaces/        # Workspace management
│   │   ├── [id]/         # Workspace detail page (dynamic route)
│   │   └── new/          # Create workspace page
│   ├── close/             # Session close page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── chat-message-bubble.tsx
│   ├── chat-window.tsx
│   ├── document-*.tsx     # Document management components
│   ├── auth0/             # Auth0 user components
│   ├── auth0-ai/          # Token Vault & Auth interruption flows
│   ├── guide/             # Info/guide components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── auth0.ts & auth0-ai.ts  # Auth0 SDK integration
│   ├── actions/           # Next.js server actions
│   ├── audit/             # Audit logging system
│   ├── db/                # Drizzle ORM schemas
│   ├── fga/               # Fine-grained authorization policies
│   ├── rag/               # Document embeddings & retrieval
│   ├── risk/              # Risk scoring system
│   ├── tools/             # AI agent tools (Exa, Gmail, Calendar, etc.)
│   └── workspaces/        # Workspace management logic
├── data/                  # Static data files
├── utils/                 # Helper functions
└── middleware.ts          # Auth0 authentication middleware
```

**How it works:**
1. User authenticates via Auth0 → managed by `src/middleware.ts`
2. Chat with AI at `/` → streams from `src/app/api/chat/route.ts` with tool interrupts
3. Upload docs at `/documents` → stored in PostgreSQL with pgvector embeddings
4. Monitor actions at `/mission-control` → full audit trail with risk scoring
5. Manage contexts at `/workspaces` → Auth0 FGA enforces isolation
6. AI tools auto-prompt for Google OAuth via Token Vault when needed

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/bO-05/assistantzero.git
cd assistant0
```

### 2. Set Up Environment Variables
Copy `.env.example` to `.env.local` and configure:

**Required:**
- `MISTRAL_API_KEY` - Get from [Mistral AI](https://mistral.ai)
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` - Create app at [Auth0](https://auth0.com)
- `AUTH0_SECRET` - Generate with `openssl rand -hex 32`
- `APP_BASE_URL` - `http://localhost:3000` (local) or your Vercel URL (production)
- `FGA_STORE_ID`, `FGA_CLIENT_ID`, `FGA_CLIENT_SECRET`, `FGA_API_URL` - Create FGA store at [dashboard.fga.dev](https://dashboard.fga.dev)
- `DATABASE_URL` - Postgres connection string

**Optional:**
- `EXA_API_KEY` - For enhanced web search ([exa.ai](https://exa.ai))
- `MISTRAL_CHAT_MODEL` / `MISTRAL_EMBEDDING_MODEL` - Override defaults

📚 **Auth0 Setup Guides:**
- [Token Vault Setup](https://auth0.com/ai/docs/call-others-apis-on-users-behalf)
- [Enable CIBA Grant](https://auth0.com/ai/docs/call-your-apis-on-users-behalf) (required for async auth)
- [Guardian Push Setup](https://auth0.com/ai/docs/async-authorization) (optional)

### 3. Install & Initialize
```bash
npm install
npm run db:migrate          # Create database schema (if using local PostgreSQL)
npm run fga:init            # Initialize FGA authorization model
```

**Note:** If using Neon (recommended), database is already hosted. Just set `DATABASE_URL` in `.env.local`.

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting with your AI assistant!

![Chat Interface](/public/images/home-page.png)

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server (runs build first)
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Drizzle Studio (DB GUI)
npm run fga:init     # Initialize FGA authorization model

# Bundle analysis
ANALYZE=true npm run build
```

## 🤝 Contributing

This is a hackathon submission project. Feel free to fork and adapt for your own needs!

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built upon the [Auth0 Assistant0 template](https://github.com/auth0-samples/auth0-assistant0/tree/main/ts-vercel-ai) by [Deepu K Sasidharan](https://github.com/deepu105).

Special thanks to the Auth0 team for their excellent AI SDK and documentation.

---

**Made with ❤️ for the Auth0 Hackathon Challenge**

