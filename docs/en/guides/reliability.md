# Reliability Guide

ASMO includes built-in reliability features: Circuit Breaker and Zod Validation.

## Circuit Breaker

Prevents cascading failures by stopping requests to failing services.

### States

```
CLOSED → OPEN → HALF_OPEN → CLOSED
  │        │        │
  │        │        └─ Success → Close
  │        │        └─ Failure → Reopen
  │        │
  │        └─ After recovery timeout
  │
  └─ After failure threshold reached
```

### Basic Usage

```typescript
import { CircuitBreaker } from '@asmo/core'

const breaker = new CircuitBreaker({
  failureThreshold: 5,      // Open after 5 failures
  recoveryTimeout: 30000,   // Try recovery after 30s
  successThreshold: 2       // Close after 2 successes
})

try {
  const result = await breaker.execute(async () => {
    return await riskyOperation()
  })
} catch (error) {
  if (error instanceof CircuitOpenError) {
    console.log('Circuit is open - request rejected')
  }
}
```

### Configuration

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number    // Failures to open (default: 5)
  recoveryTimeout: number     // Ms before recovery (default: 30000)
  successThreshold: number    // Successes to close (default: 2)
  failureWindow: number       // Window for failures (default: 60000)
  name?: string               // For logging
}
```

### Circuit Breaker Manager

Manage multiple breakers:

```typescript
import { getCircuitBreakerManager } from '@asmo/core'

const manager = getCircuitBreakerManager()

// Get or create breakers by name
const apiBreaker = manager.get('api-calls')
const dbBreaker = manager.get('database')

// Use them
await apiBreaker.execute(() => callAPI())
await dbBreaker.execute(() => queryDB())

// Monitor all
const allStats = manager.getAllStats()
console.log(allStats['api-calls'].state)
console.log(allStats['database'].failures)
```

### Events

```typescript
breaker.on((event) => {
  switch (event.type) {
    case 'state_change':
      console.log(`State: ${event.previousState} → ${event.state}`)
      break
    case 'failure':
      console.log(`Failure: ${event.error?.message}`)
      break
    case 'success':
      console.log('Success!')
      break
    case 'rejected':
      console.log('Request rejected - circuit open')
      break
  }
})
```

### Manual Control

```typescript
// Force states
breaker.forceOpen()   // Manually open
breaker.forceClose()  // Manually close
breaker.reset()       // Reset all counters

// Check state
console.log(breaker.getState())  // 'CLOSED' | 'OPEN' | 'HALF_OPEN'
```

## Input/Output Validation

Zod-based validation for type safety.

### Built-in Schemas

```typescript
import {
  TaskInputSchema,
  AgentStateSchema,
  AgentOutputSchema,
  ExecutionResultSchema
} from '@asmo/core'

// Validate task input
const result = TaskInputSchema.safeParse(input)
if (!result.success) {
  console.log(result.error.issues)
}
```

### Input Validator

```typescript
import { getInputValidator } from '@asmo/core'

const validator = getInputValidator()

// Validate task
const result = validator.validateTaskInput({
  id: 'task-001',
  description: 'Build feature',
  complexity: { score: 50, level: 'medium' }
})

if (result.success) {
  console.log(result.data)  // Typed data
} else {
  console.log(result.errorMessage)
}
```

### Output Validator

```typescript
import { getOutputValidator } from '@asmo/core'

const validator = getOutputValidator()

// Validate agent output
const result = validator.validateAgentOutput({
  task: 'Completed',
  artifacts: [
    { type: 'code', name: 'main.ts', content: '...' }
  ]
})

// Validate execution result
const execResult = validator.validateExecutionResult({
  success: true,
  metrics: { duration: 1000, mode: 'session' }
})
```

### Custom Validation

```typescript
import { z } from 'zod'

const CustomSchema = z.object({
  name: z.string().min(1),
  value: z.number().positive()
})

const result = validator.validateCustom(CustomSchema, data)
```

### Validation Middleware

Wrap functions with automatic validation:

```typescript
import { withValidation } from '@asmo/core'

const inputSchema = z.object({ value: z.number() })
const outputSchema = z.object({ result: z.number() })

const safeDouble = withValidation(
  inputSchema,
  outputSchema,
  async (input) => ({ result: input.value * 2 })
)

// Throws ValidationError if invalid
const result = await safeDouble({ value: 5 })
// result.result === 10
```

### Validation Errors

```typescript
import { ValidationError } from '@asmo/core'

try {
  await safeFunction(invalidInput)
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.message)     // Human-readable
    console.log(error.zodError)    // Full Zod error
  }
}
```

## Best Practices

### Circuit Breaker
1. Use per-service breakers (API, DB, etc.)
2. Set appropriate thresholds for your SLA
3. Monitor state changes
4. Handle `CircuitOpenError` gracefully

### Validation
1. Validate at system boundaries
2. Use built-in schemas when possible
3. Create reusable custom schemas
4. Handle validation errors explicitly

## YAML Configuration

```yaml
# models.yaml
reliability:
  default_retries: 3
  initial_retry_delay_ms: 1000
  retry_multiplier: 2
  max_retry_delay_ms: 30000

  timeouts:
    haiku: 60000
    sonnet: 120000
    opus: 180000

  rate_limit:
    enabled: true
    extra_delay_multiplier: 2
    max_concurrent_requests: 5
```

## See Also

- [Dynamic Orchestrator](../concepts/dynamic-orchestrator.md)
- [Execution Modes](../guides/execution-modes.md)
