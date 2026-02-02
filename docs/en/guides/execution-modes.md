# Dual Execution Modes

ASMO supports two execution modes: **Session** ($0 cost) and **API** (pay-per-use).

## Overview

| Mode | Cost | Best For | Provider |
|------|------|----------|----------|
| **Session** | $0 | Development, testing | Claude subscription |
| **API** | Pay-per-token | Production, automation | Anthropic API |

## Session Mode

Uses your Claude subscription for $0 API cost.

### When to Use
- Development and testing
- Interactive workflows
- Learning and experimentation
- Budget-conscious projects

### Configuration

```typescript
import { getSessionExecutor } from '@asmo/core'

const executor = getSessionExecutor({
  verbose: true,
  timeout: 120000,
  interactive: true
})
```

## API Mode

Direct Anthropic API calls with pay-per-token pricing.

### When to Use
- Production deployments
- CI/CD pipelines
- Automated workflows
- High-volume processing

### Configuration

```typescript
import { getAPIExecutor } from '@asmo/core'

const executor = getAPIExecutor({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseUrl: 'https://api.anthropic.com',
  timeout: 120000,
  maxRetries: 3
})
```

### Environment Variables

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

## Unified Interface

The ExecutorFactory provides a unified interface:

```typescript
import { getExecutorFactory, type ExecutionMode } from '@asmo/core'

const factory = getExecutorFactory({
  preferredMode: 'auto'  // 'session' | 'api' | 'auto'
})

// Execute with automatic mode selection
const result = await factory.execute({
  taskId: 'task-001',
  prompt: 'Implement user authentication',
  state: agentState,
  model: 'sonnet'
})

console.log(result.metrics.mode)  // 'session' or 'api'
```

## Auto Mode

When `preferredMode: 'auto'`:
1. Try Session mode first (free)
2. Fall back to API mode if available
3. Default to Session if nothing else works

```typescript
const factory = getExecutorFactory({
  preferredMode: 'auto'
})

// Check available modes
const modes = factory.getAvailableModes()
console.log(modes)
// [
//   { mode: 'session', available: true, info: {...} },
//   { mode: 'api', available: true, info: {...} }
// ]
```

## Per-Task Override

Override mode for specific tasks:

```typescript
const result = await factory.execute({
  taskId: 'critical-task',
  prompt: 'Security audit',
  state: agentState,
  mode: 'api'  // Force API mode
})
```

## Execution Results

Both modes return the same result structure:

```typescript
interface UnifiedExecutionResult {
  success: boolean
  output?: AgentExecutionOutput
  rawResponse?: string
  error?: string
  metrics: {
    duration: number
    mode: 'session' | 'api'
    model?: string
    inputTokens?: number     // API mode only
    outputTokens?: number    // API mode only
    estimatedCost?: number   // API mode only
  }
}
```

## Cost Tracking (API Mode)

```typescript
const result = await factory.execute({
  taskId: 'task-001',
  prompt: 'Generate code',
  state: agentState,
  mode: 'api'
})

if (result.metrics.mode === 'api') {
  console.log(`Tokens: ${result.metrics.inputTokens} in / ${result.metrics.outputTokens} out`)
  console.log(`Cost: $${result.metrics.estimatedCost?.toFixed(4)}`)
}
```

## YAML Configuration

```yaml
# models.yaml
execution_modes:
  session:
    enabled: true
    description: Uses Claude Code session
    config:
      provider: claude_code
      interactive: true

  api:
    enabled: true
    description: Direct Anthropic API
    config:
      provider: anthropic
      api_key_env: ANTHROPIC_API_KEY
      base_url: https://api.anthropic.com
```

## Best Practices

1. **Development**: Use Session mode for $0 cost
2. **Production**: Use API mode for reliability
3. **Testing**: Use Session mode with mock data
4. **CI/CD**: Use API mode with budget alerts
5. **Hybrid**: Use `auto` mode for flexibility

## Switching Modes

```typescript
const factory = getExecutorFactory()

// Start with session
factory.setPreferredMode('session')

// Switch to API for production
factory.setPreferredMode('api')

// Check current mode
console.log(factory.getPreferredMode())
```

## See Also

- [Dynamic Orchestrator](../concepts/dynamic-orchestrator.md)
- [Model Routing](../guides/model-routing.md)
- [Reliability](../guides/reliability.md)
