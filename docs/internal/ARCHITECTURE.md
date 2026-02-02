# ASMO Framework: Technical Architecture

> Technical documentation for developers and architects

## Overview

ASMO Framework is a multi-agent orchestration system implementing BMAD (Business-driven Multi-Agent Development) methodology. It provides adaptive workflow selection, task lifecycle management, and structured decision-making processes.

**Package:** `@asmo/core` (npm)

**Stack:** TypeScript, PostgreSQL, LRU-cache, Commander.js, tsup

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      ASMO Framework                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  WorkflowEngine  │  │ ComplexityAnalyzer│  │  TaskManager   │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • execute()     │  │  • analyzeTask()  │  │  • createTask()│ │
│  │  • adaptive      │  │  • score 0-100    │  │  • lifecycle   │ │
│  │    selection     │  │  • level mapping  │  │  • events      │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 ↓                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │  YoloModeManager │  │ BrainstormSession │  │ TemplateEngine │ │
│  │  ─────────────── │  │  ──────────────── │  │  ──────────── │ │
│  │  • threshold: 30 │  │  • 4 rounds       │  │  • XML/MD      │ │
│  │  • audit trail   │  │  • ADR generation │  │  • validation  │ │
│  │  • bypass logic  │  │  • convergence    │  │  • rendering   │ │
│  └──────────────────┘  └──────────────────┘  └────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    TaskPersister                          │   │
│  │  • PostgreSQL + LRU cache (1000 items, 5min TTL)         │   │
│  │  • Connection pooling (max: 20)                          │   │
│  │  • tasks, task_executions, task_comments tables          │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. YoloModeManager

**File:** `packages/core/src/orchestration/yolo-mode-manager.ts`

Manages automatic bypass of approval checkpoints for trivial tasks.

```typescript
interface YoloModeConfig {
  complexityThreshold: number  // default: 30
  enabled: boolean             // default: true
  auditEnabled: boolean        // default: true
  excludedWorkflows: string[]  // workflows that never use YOLO
}

interface YoloAuditRecord {
  taskId: string
  complexityScore: number
  timestamp: Date
  bypassedCheckpoints: string[]
  outcome: 'success' | 'failure' | 'pending'
}

class YoloModeManager {
  shouldEnableYolo(complexityScore: number): boolean
  recordYoloExecution(record: YoloAuditRecord): void
  getAuditHistory(limit?: number): YoloAuditRecord[]
}
```

**Integration with ApprovalCheckpoint:**

```typescript
// In approval-checkpoint.ts
if (this.yoloModeManager.shouldEnableYolo(state.metadata?.complexityScore)) {
  this.config.skipCheckpoints = true
  this.yoloModeManager.recordYoloExecution({
    taskId: state.taskId,
    complexityScore: state.metadata.complexityScore,
    timestamp: new Date(),
    bypassedCheckpoints: ['definition', 'design', 'review'],
    outcome: 'pending'
  })
  return { approved: true, reason: 'yolo_mode' }
}
```

### 2. BrainstormingSession

**File:** `packages/core/src/orchestration/brainstorming-session.ts`

Extends PartySession with structured 4-round decision-making process.

```typescript
interface BrainstormingRound {
  roundNumber: 1 | 2 | 3 | 4
  phase: 'independent_proposals' | 'cross_critique' | 'synthesis' | 'decision'
  proposals?: Map<string, Proposal[]>
  critiques?: Map<string, Critique[]>
  synthesisPoints?: SynthesisPoint[]
  finalDecision?: Agreement
  adrPath?: string
}

interface Critique {
  fromAgent: string
  toProposal: string
  score: number  // 1-10
  pros: string[]
  cons: string[]
  suggestions: string[]
}

class BrainstormingSession extends PartySession {
  // Round 1: Each agent proposes independently
  async executeRound1(): Promise<Map<string, Proposal[]>>

  // Round 2: Agents critique each other's proposals
  async executeRound2(): Promise<Map<string, Critique[]>>

  // Round 3: Synthesis and voting
  async executeRound3(): Promise<SynthesisPoint[]>

  // Round 4: Final decision + ADR generation
  async executeRound4(): Promise<{ decision: Agreement, adrPath: string }>

  // Run full 4-round session
  async execute(): Promise<BrainstormingResult>
}
```

**Usage:**

```typescript
import { createBrainstormingSession } from '@asmo/core'

const session = createBrainstormingSession(
  'API Authentication Strategy',
  ['architect', 'security-specialist', 'developer'],
  { generateADR: true, convergenceThreshold: 0.7 }
)

const result = await session.execute()
console.log(result.finalDecision)
console.log(result.adrPath) // Path to generated ADR
```

### 3. TaskManager & TaskPersister

**Files:**
- `packages/core/src/orchestration/task-manager.ts`
- `packages/core/src/orchestration/task-persister.ts`

High-level task lifecycle management with PostgreSQL persistence and LRU caching.

```typescript
// Task lifecycle: created → assigned → in_progress → completed|failed

interface Task {
  id: string
  title: string
  description?: string
  status: 'created' | 'assigned' | 'in_progress' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  complexityScore?: number
  complexityLevel?: string
  assignedAgent?: string
  workflowId?: string
  parentTaskId?: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

class TaskManager extends EventEmitter {
  async initialize(): Promise<void>
  async createTask(input: CreateTaskInput): Promise<Task>
  async assignTask(taskId: string, agentId: string): Promise<Task>
  async startTask(taskId: string): Promise<{ task: Task, execution: TaskExecution }>
  async completeTask(taskId: string, output?: unknown): Promise<Task>
  async failTask(taskId: string, reason: string): Promise<Task>
  async createSubtasks(parentId: string, subtasks: CreateTaskInput[]): Promise<Task[]>
  async linkToWorkflow(taskId: string, workflowId: string): Promise<void>
  async getTaskComments(taskId: string): Promise<TaskComment[]>
  async addComment(taskId: string, comment: Omit<TaskComment, 'id' | 'createdAt'>): Promise<TaskComment>

  // Events
  on('task:created', (task: Task) => void)
  on('task:assigned', (task: Task, agentId: string) => void)
  on('task:started', (task: Task, execution: TaskExecution) => void)
  on('task:completed', (task: Task, output: unknown) => void)
  on('task:failed', (task: Task, reason: string) => void)
}
```

**TaskPersister caching strategy:**

```typescript
class TaskPersister {
  private taskCache: LRUCache<string, Task>  // 1000 items, 5min TTL
  private pool: Pool  // PostgreSQL connection pool, max: 20

  // Cache-aside pattern
  async getTask(id: string): Promise<Task | null> {
    const cached = this.taskCache.get(id)
    if (cached) return cached

    const result = await this.pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    if (result.rows[0]) {
      const task = this.mapRowToTask(result.rows[0])
      this.taskCache.set(id, task)
      return task
    }
    return null
  }
}
```

### 4. TemplateEngine

**Files:**
- `packages/core/src/templates/template-engine.ts`
- `packages/core/src/templates/template-schema.ts`

XML-structured templates for better LLM parsing and validation.

```typescript
interface AIFirstTemplate {
  id: string
  version: string
  sections: TemplateSection[]
  variables: TemplateVariable[]
}

interface TemplateSection {
  tag: 'context' | 'requirements' | 'constraints' | 'decision' | 'output'
  required: boolean
  format: 'xml' | 'markdown'
  validationSchema?: z.ZodType
}

class TemplateEngine {
  loadTemplate(path: string): Promise<AIFirstTemplate>
  render(templateId: string, variables: Record<string, unknown>): string
  validate(output: string, templateId: string): ValidationResult
  parseOutput<T>(output: string, schema: z.ZodType<T>): T
}
```

**Template format example:**

```xml
<template id="prd" version="2.0">
  <context required="true">
    <problem>{{problem_statement}}</problem>
    <audience>{{target_audience}}</audience>
  </context>
  <requirements>
    <functional>{{functional_reqs}}</functional>
    <non_functional>{{nfrs}}</non_functional>
  </requirements>
  <constraints max_pages="2" max_stories="5"/>
</template>
```

### 5. ComplexityAnalyzer

**File:** `packages/core/src/orchestration/complexity-analyzer.ts`

Heuristic-based task complexity scoring (0-100).

```typescript
interface ComplexityScore {
  score: number           // 0-100
  level: ComplexityLevel  // trivial|simple|medium|complex|enterprise
  confidence: number      // 0.0-1.0
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}

interface ComplexityFactors {
  filesAffected: number
  dependencies: number
  riskLevel: 'low' | 'medium' | 'high'
  domainExpertiseRequired: boolean
  estimatedLOC: number
  dataChanges: boolean
  securityImpact: boolean
  performanceImpact: boolean
}

class ComplexityAnalyzer {
  async analyzeTask(description: string, context?: ProjectContext): Promise<ComplexityScore>
  registerWorkflows(workflows: Workflow[]): void
}
```

**Complexity thresholds:**

| Level | Score Range | Recommended Process |
|-------|-------------|---------------------|
| Trivial | 0-20 | YOLO Mode |
| Simple | 21-40 | Quick workflow |
| Medium | 41-60 | Standard process |
| Complex | 61-80 | Full planning |
| Enterprise | 81-100 | Brainstorming + review |

## Database Schema

**Migration:** `migrations/095_add_task_master_tables.sql`

```sql
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

CREATE TABLE task_executions (
  id SERIAL PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  agent_id VARCHAR(100),
  status VARCHAR(20),
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  output JSONB,
  error_message TEXT
);

CREATE TABLE task_comments (
  id SERIAL PRIMARY KEY,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  author_agent VARCHAR(100),
  comment_type VARCHAR(20),
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_agent ON tasks(assigned_agent);
CREATE INDEX idx_tasks_workflow ON tasks(workflow_id);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id);
CREATE INDEX idx_executions_task ON task_executions(task_id);
CREATE INDEX idx_comments_task ON task_comments(task_id);

-- View for active tasks
CREATE VIEW v_active_tasks AS
SELECT * FROM tasks
WHERE status NOT IN ('completed', 'failed')
ORDER BY
  CASE priority
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at;
```

## CLI Commands

```bash
# Install
npm install asmo-framework

# Analyze task complexity
npx asmo analyze "Add OAuth2 authentication"
# Output: score: 70, level: complex, recommendedWorkflow: full-planning-path

npx asmo analyze "Fix typo in README" --json
# Output: { "score": 15, "level": "trivial", ... }

# Task management
npx asmo task create "Implement feature" -p high -d "Description here"
npx asmo task list --status in_progress
npx asmo task show <task-id>
npx asmo task start <task-id> --agent developer
npx asmo task complete <task-id> --output '{"result": "success"}'
npx asmo task fail <task-id> --reason "Blocked by dependency"

# Workflow execution
npx asmo workflow quick-flow --task "Fix typo"
npx asmo workflow full-planning-path --task "Add authentication"
```

## File Structure

```
packages/
├── core/                         # @asmo/core package
│   ├── src/
│   │   ├── orchestration/
│   │   │   ├── workflow-engine.ts        # Core engine + TaskManager integration
│   │   │   ├── complexity-analyzer.ts    # Heuristic-based scoring
│   │   │   ├── yolo-mode-manager.ts      # Bypass logic + audit trail
│   │   │   ├── brainstorming-session.ts  # 4-round structured discussion
│   │   │   ├── party-session.ts          # Base class for multi-agent sessions
│   │   │   ├── task-manager.ts           # High-level task lifecycle
│   │   │   ├── task-persister.ts         # PostgreSQL + LRU caching
│   │   │   ├── approval-checkpoint.ts    # YOLO integration point
│   │   │   └── types.ts                  # Shared type definitions
│   │   ├── agents/
│   │   │   ├── orchestrator.ts           # LangGraph orchestration
│   │   │   ├── base-agent.ts             # Abstract base class
│   │   │   ├── types.ts                  # Agent type definitions
│   │   │   └── roles/                    # 24 role agents
│   │   ├── templates/
│   │   │   ├── template-engine.ts        # Load, render, validate
│   │   │   └── template-schema.ts        # AIFirstTemplate types
│   │   └── index.ts                      # Public exports
│   ├── templates/                        # Configuration templates
│   └── tests/
├── cli/                          # @asmo/cli package
│   ├── src/
│   │   ├── index.ts              # Commander.js setup
│   │   └── commands/
│   │       ├── analyze.ts
│   │       ├── workflow.ts
│   │       └── task.ts
│   └── bin/
│       └── asmo.js              # CLI entry point
└── docs/
    ├── OVERVIEW.md               # Non-technical summary
    └── ARCHITECTURE.md           # This document
```

## CI/CD

**File:** `.github/workflows/publish-asmo.yml`

```yaml
name: Publish ASMO Framework

on:
  push:
    tags: ['asmo-v*']
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to publish'
        required: true
      dry_run:
        description: 'Dry run'
        type: boolean
        default: false

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: packages/core
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install
      - run: pnpm build
      - run: pnpm typecheck
      - run: pnpm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Release process:**

```bash
git tag asmo-v1.0.0
git push origin asmo-v1.0.0
# → Triggers build, typecheck, npm publish, GitHub release
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `ANTHROPIC_API_KEY` | Anthropic API key for agents | Optional |
| `ASMO_YOLO_THRESHOLD` | YOLO mode complexity threshold | 30 |
| `ASMO_LOG_LEVEL` | Logging level (debug/info/warn/error) | info |

## Testing

```bash
# Run all tests
pnpm test

# Run specific test files
pnpm test -- --grep "TaskManager"
pnpm test -- --grep "YoloMode"
pnpm test -- --grep "Brainstorming"

# Test coverage
pnpm test:coverage
```

**Test structure:**

```typescript
// tests/unit/orchestration/task-manager.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock pg before imports
const mockQuery = vi.fn()
const mockPool = { query: mockQuery, on: vi.fn(), end: vi.fn() }
vi.mock('pg', () => ({ default: { Pool: vi.fn(() => mockPool) } }))

import { TaskManager, getTaskManager } from '../../../packages/core/src/orchestration/task-manager'

describe('TaskManager', () => {
  it('should create task with complexity score', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'task-1', ... }] })

    const manager = getTaskManager('postgresql://...')
    await manager.initialize()

    const task = await manager.createTask({
      title: 'Test task',
      complexityScore: 45
    })

    expect(task.complexityScore).toBe(45)
    expect(task.complexityLevel).toBe('medium')
  })
})
```

## Known Limitations

1. **TypeScript declarations** - DTS generation disabled due to re-export pattern. Use source types for now.

2. **LLM integration** - ComplexityAnalyzer uses heuristics. Full LLM integration requires `ANTHROPIC_API_KEY`.

3. **Real-time sync** - TaskPersister uses cache-aside pattern. For real-time sync across instances, consider adding pub/sub.

## Roadmap

- [ ] Enable DTS generation with proper TypeScript project references
- [ ] Add WebSocket support for real-time task updates
- [ ] Implement full LLM-based complexity analysis
- [ ] Add metrics dashboard integration
- [ ] Support for custom workflow definitions via config
