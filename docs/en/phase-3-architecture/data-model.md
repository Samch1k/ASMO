# Data Model

## Core TypeScript Interfaces

### Task

The fundamental unit of work in ASMO. Every CLI invocation creates a Task that flows through the orchestration pipeline.

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
```

### ComplexityScore

Produced by `ComplexityAnalyzer`. Drives workflow selection, model routing, and YOLO mode decisions.

```typescript
interface ComplexityScore {
  score: number          // 0-100
  level: ComplexityLevel // trivial | simple | medium | complex | enterprise
  confidence: number     // 0.0-1.0
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}
```

**Complexity level thresholds:**

| Level | Score Range | Model | YOLO |
|-------|------------|-------|------|
| trivial | 0--15 | Haiku | Yes |
| simple | 16--30 | Haiku | Yes |
| medium | 31--55 | Sonnet | No |
| complex | 56--80 | Sonnet | No |
| enterprise | 81--100 | Opus | No |

### ComplexityFactors

Individual scoring factors that sum to produce the final complexity score.

```typescript
interface ComplexityFactors {
  filesAffected: number           // +5..+35
  dependencies: number            // +0..+30
  riskLevel: 'low' | 'medium' | 'high'  // +5..+25
  domainExpertiseRequired: boolean       // +0 or +15
  estimatedLOC: number            // +5..+30
  dataChanges: boolean            // +0 or +20
  securityImpact: boolean         // +0 or +15
  performanceImpact: boolean      // +0 or +10
}
```

### WorkflowResult

Returned after workflow execution completes. Contains all phase results, artifacts, and performance metrics.

```typescript
interface WorkflowResult {
  workflowId: string
  status: 'completed' | 'failed'
  steps: StepResult[]
  artifacts: Artifact[]
  metrics: {
    totalTime: number
    agentsUsed: string[]
    complexityScore: number
  }
}
```

### StepResult

Result of a single workflow phase or agent execution step.

```typescript
interface StepResult {
  stepId: string
  agentId: string
  status: 'completed' | 'failed' | 'skipped'
  output: unknown
  duration: number
  tokensUsed?: number
}
```

### Artifact

Output produced by an agent during workflow execution (code files, test suites, documentation, etc.).

```typescript
interface Artifact {
  id: string
  type: string
  name: string
  content: string | Buffer
  metadata: Record<string, unknown>
  createdBy: string
  createdAt: Date
}
```

## Persistence Layer

### MetricsPersister (SQLite)

Stores workflow and agent execution metrics for the learning loop.

**Tables:**

| Table | Purpose |
|-------|---------|
| `workflow_metrics` | Per-workflow execution stats (duration, status, complexity) |
| `agent_step_metrics` | Per-agent step stats (duration, tokens, success/failure) |
| `bottleneck_data` | Identified performance bottlenecks and recommendations |

### TaskPersister (SQLite / JSON)

Stores task state, execution history, and parent-child relationships.

### DocumentRegistry

Manages versioned documents produced during workflow execution, indexed by phase.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  priority TEXT NOT NULL DEFAULT 'medium',
  complexity_score INTEGER,
  complexity_level TEXT,
  assigned_agent TEXT,
  workflow_id TEXT,
  parent_task_id TEXT REFERENCES tasks(id),
  metadata TEXT DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_metrics (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  task_id TEXT REFERENCES tasks(id),
  status TEXT NOT NULL,
  total_time_ms INTEGER NOT NULL,
  agents_used TEXT NOT NULL,
  complexity_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS agent_step_metrics (
  id TEXT PRIMARY KEY,
  workflow_metric_id TEXT REFERENCES workflow_metrics(id),
  agent_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  status TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bottleneck_data (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  phase TEXT NOT NULL,
  bottleneck_type TEXT NOT NULL,
  description TEXT,
  recommendation TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Entity Relationships

```
Task 1──* StepResult       (a task produces multiple step results)
Task 1──1 ComplexityScore   (each task has one complexity assessment)
Task 1──* Artifact          (agents produce artifacts per task)
Task *──1 Workflow          (many tasks can reference a workflow template)
Task 1──* Task              (parent-child via parentTaskId)
WorkflowMetric 1──* AgentStepMetric  (per-agent breakdown)
```

## Related Documents

- [Architecture Overview](./README.md)
- [Architecture Diagram](./architecture-diagram.md)
- [API Contract](./api-contract.md)
