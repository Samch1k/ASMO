# Coding Standards

Coding standards and best practices for ASMO development.

## TypeScript

### General

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use explicit types for function parameters and returns
- Avoid `any` - use `unknown` if type is truly unknown

```typescript
// Good
function processTask(task: Task): Promise<TaskResult> {
  const result = await engine.execute(task)
  return result
}

// Bad
function processTask(task: any): any {
  var result = engine.execute(task)
  return result
}
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `WorkflowEngine` |
| Interfaces | PascalCase | `TaskResult` |
| Functions | camelCase | `executeWorkflow` |
| Variables | camelCase | `taskManager` |
| Constants | UPPER_SNAKE_CASE | `MAX_TIMEOUT` |
| Files | kebab-case | `workflow-engine.ts` |

### Interfaces

Define interfaces for data structures:

```typescript
interface Task {
  id: string
  title: string
  status: TaskStatus
  metadata?: Record<string, unknown>
}

interface TaskResult {
  success: boolean
  output?: unknown
  error?: string
}
```

### Enums

Use string enums for better debugging:

```typescript
enum TaskStatus {
  Created = 'created',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed'
}
```

## Code Structure

### File Organization

```typescript
// 1. Imports (external first, then internal)
import { EventEmitter } from 'events'
import type { Pool } from 'pg'
import { ConfigManager } from '../config'
import type { Task, TaskResult } from './types'

// 2. Constants
const DEFAULT_TIMEOUT = 300000

// 3. Types/Interfaces
interface EngineOptions {
  timeout?: number
}

// 4. Class/Function definitions
export class WorkflowEngine {
  // ...
}

// 5. Helper functions (if any)
function normalizeTask(task: Task): Task {
  // ...
}
```

### Class Structure

```typescript
class TaskManager {
  // 1. Static members
  private static instance: TaskManager

  // 2. Instance properties
  private readonly pool: Pool
  private cache: Map<string, Task>

  // 3. Constructor
  constructor(databaseUrl: string) {
    this.pool = new Pool({ connectionString: databaseUrl })
    this.cache = new Map()
  }

  // 4. Public methods
  async createTask(input: CreateTaskInput): Promise<Task> {
    // ...
  }

  // 5. Private methods
  private validateInput(input: unknown): void {
    // ...
  }
}
```

### Async/Await

Always use async/await over raw promises:

```typescript
// Good
async function fetchTask(id: string): Promise<Task> {
  const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id])
  return result.rows[0]
}

// Bad
function fetchTask(id: string): Promise<Task> {
  return pool.query('SELECT * FROM tasks WHERE id = $1', [id])
    .then(result => result.rows[0])
}
```

### Error Handling

Use typed errors:

```typescript
class TaskNotFoundError extends Error {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`)
    this.name = 'TaskNotFoundError'
  }
}

async function getTask(id: string): Promise<Task> {
  const task = await taskManager.findById(id)
  if (!task) {
    throw new TaskNotFoundError(id)
  }
  return task
}
```

## Documentation

### JSDoc Comments

Document public APIs:

```typescript
/**
 * Executes a workflow with the given task description.
 *
 * @param taskOrWorkflowId - Task description or workflow ID
 * @param context - Optional execution context
 * @param options - Execution options
 * @returns Promise resolving to workflow result
 *
 * @example
 * ```typescript
 * const result = await engine.execute('Fix login bug')
 * console.log(result.status)
 * ```
 */
async execute(
  taskOrWorkflowId: string,
  context?: Record<string, unknown>,
  options?: ExecuteOptions
): Promise<WorkflowResult> {
  // ...
}
```

### Inline Comments

Use sparingly, for complex logic:

```typescript
// Calculate complexity score based on weighted factors
// Each factor contributes to the total score (0-100)
const score =
  filesAffected * 2 +          // +2 per file affected
  dependencies * 5 +            // +5 per dependency
  (securityImpact ? 15 : 0) +  // +15 if security impact
  (dataChanges ? 20 : 0)        // +20 if data changes
```

## Testing

### Test Structure

```typescript
describe('TaskManager', () => {
  let manager: TaskManager

  beforeEach(() => {
    manager = new TaskManager(testDbUrl)
  })

  afterEach(async () => {
    await manager.close()
  })

  describe('createTask', () => {
    it('should create a task with valid input', async () => {
      const task = await manager.createTask({
        title: 'Test task',
        priority: 'medium'
      })

      expect(task.id).toBeDefined()
      expect(task.title).toBe('Test task')
      expect(task.status).toBe('created')
    })

    it('should throw on invalid input', async () => {
      await expect(
        manager.createTask({ title: '' })
      ).rejects.toThrow('Title is required')
    })
  })
})
```

### Test Naming

```typescript
// Good - describes behavior
it('should return empty array when no tasks match criteria', async () => {})

// Bad - vague
it('works correctly', async () => {})
```

## Git Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add adaptive workflow selection
fix(cli): resolve timeout issue in analyze command
docs(readme): update installation instructions
test(agents): add unit tests for Architect agent
refactor(engine): simplify complexity calculation
```

## Code Review Checklist

- [ ] Types are explicit and correct
- [ ] Error cases are handled
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No TODO comments (create issues instead)

## See Also

- [Testing](./testing.md)
- [Development Setup](./setup.md)
