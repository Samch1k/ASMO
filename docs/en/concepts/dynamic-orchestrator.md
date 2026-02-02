# Dynamic Orchestrator

The DynamicOrchestrator is ASMO's native TypeScript orchestration engine that intelligently routes tasks to agents and models.

## Overview

```
Task → TaskRouter → Model Selection → AgentExecutor → Result
       ├─ Complexity Analysis
       ├─ Skill Matching
       └─ Model Routing (Opus/Sonnet/Haiku)
```

## Key Features

### Intelligent Model Routing

Tasks are automatically routed to the most appropriate model:

| Complexity | Score | Model | Use Case |
|------------|-------|-------|----------|
| Trivial/Simple | 0-30 | Haiku | Quick fixes, docs, formatting |
| Medium/Complex | 31-70 | Sonnet | Features, bugs, code review |
| Enterprise | 71-100 | Opus | Architecture, security, design |

### Agent Selection

Agents are selected based on:
- Required skills
- Task type
- Agent availability
- Preferred agent hints

### Fault Tolerance

Built-in reliability features:
- Retry with exponential backoff
- Configurable timeouts
- Circuit breaker protection
- Input/output validation

## Usage

### Basic Execution

```typescript
import { getDynamicOrchestrator, type OrchestrationTask } from '@asmo/core'

const orchestrator = getDynamicOrchestrator()

const task: OrchestrationTask = {
  id: 'task-001',
  description: 'Implement user authentication',
  taskType: 'feature',
  complexity: { score: 55, level: 'medium' }
}

const result = await orchestrator.executeTask(task)

console.log(result.routing.model)  // 'sonnet'
console.log(result.success)        // true/false
```

### Preview Routing

Check routing without executing:

```typescript
const routing = orchestrator.previewRouting(task)
console.log(routing.model)       // Selected model
console.log(routing.agent)       // Suggested agent
console.log(routing.rationale)   // Explanation
console.log(routing.alternatives) // Other options
```

### Workflow Execution

Execute multiple tasks as a workflow:

```typescript
const tasks: OrchestrationTask[] = [
  { id: '1', description: 'Design API' },
  { id: '2', description: 'Implement endpoints' },
  { id: '3', description: 'Write tests' }
]

const result = await orchestrator.executeWorkflow('api-workflow', tasks)

console.log(result.success)           // Overall success
console.log(result.results.length)    // Individual results
console.log(result.totalDuration)     // Total time
```

### Concurrent Execution

Execute independent tasks concurrently:

```typescript
const results = await orchestrator.executeTasks(tasks)
// Respects maxConcurrency config (default: 5)
```

## Configuration

```typescript
const orchestrator = new DynamicOrchestrator({
  verbose: true,        // Enable logging
  maxConcurrency: 10,   // Max parallel tasks

  executor: {
    maxRetries: 3,
    timeout: 120000,    // 2 minutes
    initialRetryDelay: 1000
  },

  router: {
    defaultModel: 'sonnet',
    complexityThresholds: {
      haiku: 30,
      sonnet: 70
    }
  }
})
```

## Statistics

Monitor orchestration performance:

```typescript
const stats = orchestrator.getStats()

console.log(stats.routing.totalDecisions)
console.log(stats.routing.byModel)      // { opus: 5, sonnet: 20, haiku: 10 }
console.log(stats.routing.successRate)  // 0.95
console.log(stats.runningTasks)         // Currently running
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  DynamicOrchestrator                     │
├─────────────────┬─────────────────┬─────────────────────┤
│   TaskRouter    │  AgentExecutor  │   RoutingLogger     │
│                 │                 │                     │
│ • Complexity    │ • Retry logic   │ • Decision logging  │
│ • Task type     │ • Timeout       │ • Metrics tracking  │
│ • Keywords      │ • Error handling│ • Statistics        │
└─────────────────┴─────────────────┴─────────────────────┘
```

## See Also

- [Model Routing Guide](../guides/model-routing.md)
- [Dual Execution Modes](../guides/execution-modes.md)
- [Circuit Breaker](../guides/reliability.md)
