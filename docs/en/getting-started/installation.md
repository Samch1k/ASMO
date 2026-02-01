# Installation

This guide covers the installation of AI1st Framework in your project.

## System Requirements

- **Node.js**: 18.0 or higher
- **Package Manager**: npm 9+ or pnpm 8+ (recommended)
- **TypeScript**: 5.0+ (optional, but recommended)

## Installation

### Using pnpm (Recommended)

```bash
pnpm add @ai1st/core
```

### Using npm

```bash
npm install @ai1st/core
```

### Using yarn

```bash
yarn add @ai1st/core
```

## Optional Dependencies

AI1st works with various MCP (Model Context Protocol) servers for enhanced capabilities:

```bash
# For database integration
pnpm add @mcp/supabase

# For deployment
pnpm add @mcp/vercel @mcp/render

# For GitHub integration
pnpm add @mcp/github

# For browser automation
pnpm add @mcp/playwright
```

## Database Setup (Optional)

For task persistence, AI1st uses PostgreSQL:

```bash
# Set the database URL
export DATABASE_URL="postgresql://user:password@localhost:5432/ai1st"
```

### Database Migration

```sql
-- Run the migration script
-- Located at: packages/core/migrations/095_add_task_master_tables.sql

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'created',
  priority VARCHAR(20) DEFAULT 'medium',
  complexity_score INTEGER,
  complexity_level VARCHAR(20),
  assigned_agent VARCHAR(100),
  workflow_id VARCHAR(100),
  parent_task_id UUID REFERENCES tasks(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);
```

## Environment Variables

AI1st uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `ANTHROPIC_API_KEY` | Anthropic API key for LLM | - |
| `AI1ST_YOLO_THRESHOLD` | YOLO mode complexity threshold | 30 |
| `AI1ST_LOG_LEVEL` | Logging level | info |

Create a `.env` file in your project root:

```bash
DATABASE_URL=postgresql://localhost:5432/ai1st
ANTHROPIC_API_KEY=your-api-key
AI1ST_YOLO_THRESHOLD=30
AI1ST_LOG_LEVEL=info
```

## Verify Installation

Create a test file to verify the installation:

```typescript
// test-ai1st.ts
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)

  await engine.initialize()

  console.log('✅ AI1st installed successfully!')
  console.log(`Available workflows: ${engine.getWorkflows().length}`)
}

main().catch(console.error)
```

Run with:

```bash
npx tsx test-ai1st.ts
```

## TypeScript Configuration

For TypeScript projects, add these settings to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Monorepo Setup

If you're using AI1st in a monorepo with pnpm workspaces:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

```json
// package.json
{
  "dependencies": {
    "@ai1st/core": "workspace:*"
  }
}
```

## Next Steps

Now that AI1st is installed, proceed to:

- [Quick Start](./quick-start.md) - Run your first workflow
- [Configuration](./configuration.md) - Configure AI1st for your project

## Troubleshooting

### Common Issues

**Error: Cannot find module '@ai1st/core'**

Ensure you've installed the package and your Node.js version is 18+:

```bash
node --version  # Should be 18.0.0 or higher
pnpm install
```

**Error: Database connection failed**

Check your `DATABASE_URL` and ensure PostgreSQL is running:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

**TypeScript errors**

Ensure your TypeScript version is 5.0+ and module resolution is set correctly.

For more issues, see the [Troubleshooting Guide](../guides/troubleshooting.md).
