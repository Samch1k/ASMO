# E-commerce Catalog - AI1st Demo

> Production-ready e-commerce platform showcasing autonomous AI orchestration at scale

**Demo Complexity:** ⭐⭐⭐ Advanced (45-60 minutes)
**Tech Stack:** Next.js 15 • Drizzle ORM • SQLite • shadcn/ui • Playwright
**AI1st Features:** 3-tier config • Markdown instructions • Subagent-driven • Quality gates • Parallel execution • Performance optimization

---

## What Is This?

This is the **flagship demonstration** of the AI1st orchestration system. It showcases how AI1st coordinates multiple specialized agents to autonomously develop a production-ready e-commerce application.

**What makes this demo special:**
- ✅ **3-tier configuration system** - Defaults → File → Environment
- ✅ **Markdown-based agent instructions** - Domain-specific context for each agent
- ✅ **Subagent-driven development** - Architect spawns parallel subagents
- ✅ **Quality gates** - Human approval at design, implementation, and testing phases
- ✅ **Maximum parallel execution** - 4 agents working simultaneously
- ✅ **Performance optimization workflows** - Dedicated Optimizer agent

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm (recommended) or npm

### Installation

```bash
# Navigate to e-commerce demo
cd packages/examples/ecommerce-catalog
```

### Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Initialize database
npm run db:migrate

# Seed sample data (50 products)
npm run db:seed

# Start backend server (http://localhost:3002)
npm run dev
```

### Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server (http://localhost:3000)
npm run dev
```

---

## Project Status

🚧 **Work in Progress** - Project structure initialized
📦 Database schema - Coming soon
🔌 Backend API - Coming soon
🎨 Frontend UI - Coming soon
⚙️ AI1st Configuration - Coming soon
✅ Tests - Coming soon

---

## Technology Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: SQLite (demo) / PostgreSQL (production)
- **ORM**: Drizzle ORM
- **Search**: SQLite FTS5 full-text search
- **Validation**: Zod schemas
- **Testing**: Vitest + Supertest

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: shadcn/ui (Radix UI + Tailwind)
- **Styling**: Tailwind CSS v4
- **State**: React Server Components
- **Forms**: React Hook Form + Zod

### Testing
- **E2E**: Playwright
- **Unit**: Vitest
- **Coverage**: Minimum 80%

### Deployment
- **Backend**: Render.com (or similar)
- **Frontend**: Vercel
- **Database**: Supabase (production) / Local SQLite (demo)

---

## AI1st Features (Coming Soon)

This demo will showcase:

1. **3-Tier Configuration** - Defaults → File → Environment cascade
2. **Markdown Instructions** - Domain-specific agent context
3. **Subagent-Driven Development** - Parallel execution coordination
4. **Quality Gates** - Approval checkpoints at key phases
5. **Performance Optimization** - Dedicated Optimizer agent workflows
6. **Production Patterns** - Next.js 15, Drizzle ORM, modern tooling

---

## License

MIT - Part of the AI1st orchestration demo project
