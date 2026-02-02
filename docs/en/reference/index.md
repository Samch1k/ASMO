# Reference

Complete reference documentation for ASMO.

## Catalogs

| Reference | Description | Count |
|-----------|-------------|-------|
| [Agents](./agents/index.md) | All available agents | 24 |
| [Workflows](./workflows/index.md) | Production-ready workflows | 10 |
| [Skills](./skills/index.md) | Skill capabilities | 85 |

## API Reference

### Core Classes

| Class | Description |
|-------|-------------|
| `WorkflowEngine` | Main orchestration engine |
| `AgentRegistry` | Agent management |
| `ComplexityAnalyzer` | Task complexity scoring |
| `TaskManager` | Task lifecycle management |
| `YoloModeManager` | Automatic approval bypass |

### Quick Import

```typescript
import {
  WorkflowEngine,
  AgentRegistry,
  ComplexityAnalyzer,
  TaskManager,
  ConfigManager
} from '@asmo/core'
```

## CLI Reference

```bash
# Analyze task complexity
npx asmo analyze "Task description"

# Task management
npx asmo task create "Title" -p high
npx asmo task list
npx asmo task show <id>

# Workflow execution
npx asmo workflow quick-flow --task "Fix bug"
```

## Configuration Reference

See [Configuration Guide](../getting-started/configuration.md) for:

- Environment variables
- Configuration files
- Programmatic configuration

## Types Reference

### Core Types

```typescript
interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  complexityScore?: number
  complexityLevel?: ComplexityLevel
  assignedAgent?: string
  workflowId?: string
  metadata: Record<string, unknown>
}

interface WorkflowResult {
  workflowId: string
  status: 'completed' | 'failed'
  steps: StepResult[]
  artifacts: Artifact[]
  metrics: ExecutionMetrics
}

interface ComplexityScore {
  score: number
  level: ComplexityLevel
  confidence: number
  reasoning: string
  factors: ComplexityFactors
  recommendedAgents: string[]
  recommendedWorkflow: string
}
```

### Enums

```typescript
type TaskStatus = 'created' | 'assigned' | 'in_progress' | 'completed' | 'failed'
type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
type ComplexityLevel = 'trivial' | 'simple' | 'medium' | 'complex' | 'enterprise'
type RoleType = 'reasoning' | 'execution' | 'hybrid'
```

## See Also

- [Concepts](../concepts/index.md) - Core concepts
- [Guides](../guides/index.md) - How-to guides
- [Examples](../examples/index.md) - Code examples
