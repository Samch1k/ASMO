# Testing

Guidelines for testing ASMO code.

## Test Stack

- **Jest** - Test runner
- **ts-jest** - TypeScript support
- **jest-mock** - Mocking utilities

## Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test -- --coverage

# Run specific file
pnpm --filter @asmo/core test complexity-analyzer.test.ts

# Watch mode
pnpm test -- --watch

# Verbose output
pnpm test -- --verbose
```

## Test Structure

### File Organization

```
packages/core/
├── src/
│   └── orchestration/
│       └── task-manager.ts
└── tests/
    └── orchestration/
        └── task-manager.test.ts
```

### Test File Template

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Mock dependencies before imports
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    query: vi.fn(),
    on: vi.fn(),
    end: vi.fn()
  }))
}))

import { TaskManager } from '../../src/orchestration/task-manager'

describe('TaskManager', () => {
  let manager: TaskManager
  let mockQuery: jest.Mock

  beforeEach(() => {
    mockQuery = vi.fn()
    manager = new TaskManager('postgresql://test')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createTask', () => {
    it('should create task with valid input', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id: '123', title: 'Test', status: 'created' }]
      })

      const task = await manager.createTask({ title: 'Test' })

      expect(task.id).toBe('123')
      expect(task.title).toBe('Test')
    })

    it('should throw on empty title', async () => {
      await expect(
        manager.createTask({ title: '' })
      ).rejects.toThrow('Title is required')
    })
  })
})
```

## Test Types

### Unit Tests

Test individual functions/methods:

```typescript
describe('ComplexityAnalyzer', () => {
  it('should calculate score correctly', async () => {
    const analyzer = new ComplexityAnalyzer()

    const score = await analyzer.analyzeTask('Fix typo in README')

    expect(score.score).toBeLessThan(30)
    expect(score.level).toBe('trivial')
  })
})
```

### Integration Tests

Test component interactions:

```typescript
describe('WorkflowEngine integration', () => {
  it('should execute workflow with real agents', async () => {
    const registry = new AgentRegistry()
    const engine = new WorkflowEngine(registry)
    await engine.initialize()

    const result = await engine.execute('Simple test task')

    expect(result.status).toBe('completed')
    expect(result.steps.length).toBeGreaterThan(0)
  })
})
```

### E2E Tests

Test full user flows:

```typescript
describe('E2E: Bug fix workflow', () => {
  it('should complete bug fix from description to verification', async () => {
    const registry = new AgentRegistry()
    const engine = new WorkflowEngine(registry)
    await engine.initialize()

    const result = await engine.execute(
      'Fix login button not responding'
    )

    expect(result.status).toBe('completed')
    expect(result.artifacts).toContainEqual(
      expect.objectContaining({ type: 'code' })
    )
    expect(result.artifacts).toContainEqual(
      expect.objectContaining({ type: 'test' })
    )
  })
})
```

## Mocking

### Database Mocking

```typescript
const mockPool = {
  query: vi.fn(),
  on: vi.fn(),
  end: vi.fn()
}

vi.mock('pg', () => ({
  Pool: vi.fn(() => mockPool)
}))

// In tests
mockPool.query.mockResolvedValueOnce({
  rows: [{ id: '1', title: 'Test' }]
})
```

### Agent Mocking

```typescript
const mockAgent = {
  id: 'test-agent',
  execute: vi.fn().mockResolvedValue({
    success: true,
    output: { result: 'done' }
  })
}

vi.spyOn(registry, 'getAgent').mockResolvedValue(mockAgent)
```

### LLM Mocking

```typescript
vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Mocked response' }]
      })
    }
  }))
}))
```

## Test Patterns

### Setup/Teardown

```typescript
describe('Feature', () => {
  beforeAll(async () => {
    // One-time setup
    await setupTestDatabase()
  })

  afterAll(async () => {
    // One-time cleanup
    await teardownTestDatabase()
  })

  beforeEach(() => {
    // Per-test setup
    vi.clearAllMocks()
  })

  afterEach(async () => {
    // Per-test cleanup
    await cleanupTestData()
  })
})
```

### Testing Async Errors

```typescript
it('should handle errors gracefully', async () => {
  mockQuery.mockRejectedValueOnce(new Error('DB error'))

  await expect(
    manager.createTask({ title: 'Test' })
  ).rejects.toThrow('DB error')
})
```

### Testing Events

```typescript
it('should emit events on task creation', async () => {
  const onCreated = vi.fn()
  manager.on('task:created', onCreated)

  await manager.createTask({ title: 'Test' })

  expect(onCreated).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Test' })
  )
})
```

### Snapshot Testing

For complex outputs:

```typescript
it('should generate correct complexity analysis', async () => {
  const analysis = await analyzer.analyzeTask('Complex task')

  expect(analysis).toMatchSnapshot()
})
```

## Coverage Goals

| Type | Target |
|------|--------|
| Statements | > 80% |
| Branches | > 75% |
| Functions | > 85% |
| Lines | > 80% |

## Test Utilities

### Custom Matchers

```typescript
// tests/matchers.ts
expect.extend({
  toBeValidTask(received) {
    const pass = received.id && received.title && received.status
    return {
      pass,
      message: () => `expected ${received} to be a valid task`
    }
  }
})

// Usage
expect(task).toBeValidTask()
```

### Test Factories

```typescript
// tests/factories.ts
export function createTestTask(overrides = {}): Task {
  return {
    id: 'test-id',
    title: 'Test task',
    status: 'created',
    priority: 'medium',
    ...overrides
  }
}

// Usage
const task = createTestTask({ priority: 'high' })
```

## Best Practices

1. **One assertion per test** - Keep tests focused
2. **Descriptive names** - `it('should return empty array when no matches')`
3. **Arrange-Act-Assert** - Clear structure
4. **Independent tests** - No test dependencies
5. **Fast tests** - Mock expensive operations
6. **No implementation details** - Test behavior, not internals

## See Also

- [Coding Standards](./coding-standards.md)
- [Development Setup](./setup.md)
