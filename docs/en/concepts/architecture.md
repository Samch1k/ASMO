# Architecture

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

### WorkflowEngine

The central orchestrator that manages workflow execution.

**File:** `packages/core/src/orchestration/workflow-engine.ts`

```typescript
class WorkflowEngine {
  // Execute workflow by ID or description
  async execute(
    taskOrWorkflowId: string,
    context?: Record<string, unknown>,
    options?: ExecuteOptions
  ): Promise<WorkflowResult>

  // Get adaptive workflow selection with reasoning
  async selectWorkflowAdaptively(
    taskDescription: string,
    context?: ProjectContext
  ): Promise<WorkflowSelection>

  // Execute Party Mode session
  async executePartyMode(
    task: string,
    agents: string[],
    initialState?: Partial<AgentState>,
    options?: PartyModeOptions
  ): Promise<PartySession>
}
```

### ComplexityAnalyzer

Heuristic-based task complexity scoring (0-100).

**File:** `packages/core/src/orchestration/complexity-analyzer.ts`

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
```

### YoloModeManager

Manages automatic bypass of approval checkpoints for trivial tasks.

**File:** `packages/core/src/orchestration/yolo-mode-manager.ts`

```typescript
interface YoloModeConfig {
  complexityThreshold: number  // default: 30
  enabled: boolean             // default: true
  auditEnabled: boolean        // default: true
  excludedWorkflows: string[]  // workflows that never use YOLO
}

class YoloModeManager {
  shouldEnableYolo(complexityScore: number): boolean
  recordYoloExecution(record: YoloAuditRecord): void
  getAuditHistory(limit?: number): YoloAuditRecord[]
}
```

### BrainstormingSession

Extends PartySession with structured 4-round decision-making process.

**File:** `packages/core/src/orchestration/brainstorming-session.ts`

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

class BrainstormingSession extends PartySession {
  async executeRound1(): Promise<Map<string, Proposal[]>>
  async executeRound2(): Promise<Map<string, Critique[]>>
  async executeRound3(): Promise<SynthesisPoint[]>
  async executeRound4(): Promise<{ decision: Agreement, adrPath: string }>
  async execute(): Promise<BrainstormingResult>
}
```

### TaskManager & TaskPersister

High-level task lifecycle management with PostgreSQL persistence and LRU caching.

**Files:**
- `packages/core/src/orchestration/task-manager.ts`
- `packages/core/src/orchestration/task-persister.ts`

```typescript
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
}

class TaskManager extends EventEmitter {
  async createTask(input: CreateTaskInput): Promise<Task>
  async assignTask(taskId: string, agentId: string): Promise<Task>
  async startTask(taskId: string): Promise<{ task: Task, execution: TaskExecution }>
  async completeTask(taskId: string, output?: unknown): Promise<Task>
  async failTask(taskId: string, reason: string): Promise<Task>
}
```

## Database Schema

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
```

## File Structure

```
packages/
├── core/                         # @asmo/core package
│   ├── src/
│   │   ├── orchestration/
│   │   │   ├── workflow-engine.ts
│   │   │   ├── complexity-analyzer.ts
│   │   │   ├── yolo-mode-manager.ts
│   │   │   ├── brainstorming-session.ts
│   │   │   ├── party-session.ts
│   │   │   ├── task-manager.ts
│   │   │   ├── task-persister.ts
│   │   │   ├── approval-checkpoint.ts
│   │   │   └── types.ts
│   │   ├── agents/
│   │   │   ├── orchestrator.ts
│   │   │   ├── base-agent.ts
│   │   │   ├── types.ts
│   │   │   └── roles/
│   │   ├── templates/
│   │   │   ├── template-engine.ts
│   │   │   └── template-schema.ts
│   │   └── index.ts
│   ├── templates/
│   │   ├── roles/
│   │   ├── workflows/
│   │   ├── skills/
│   │   └── instructions/
│   └── tests/
├── cli/                          # @asmo/cli package
└── docs/                         # VitePress documentation
```

## See Also

- [Agents](./agents.md) - Agent architecture
- [Workflows](./workflows.md) - Workflow system
- [Configuration](../getting-started/configuration.md) - Configuration options
