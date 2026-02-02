# Тестирование

Руководство по написанию и запуску тестов для ASMO.

## Обзор

ASMO использует:

- **Vitest** — фреймворк для unit и integration тестов
- **Testing Library** — утилиты для тестирования
- **MSW** — мокирование HTTP запросов

## Запуск тестов

### Основные команды

```bash
# Все тесты
pnpm test

# Watch режим
pnpm test:watch

# С покрытием
pnpm test:coverage

# Конкретный файл
pnpm test workflow-engine.test.ts

# Конкретный тест
pnpm test -t "should select YOLO mode"
```

### Фильтрация

```bash
# По паттерну
pnpm test --grep "WorkflowEngine"

# Только unit тесты
pnpm test:unit

# Только integration тесты
pnpm test:integration
```

## Структура тестов

### Расположение файлов

```
packages/core/
├── src/
│   ├── engine/
│   │   ├── workflow-engine.ts
│   │   └── workflow-engine.test.ts  # Рядом с кодом
│   └── agents/
│       ├── registry.ts
│       └── registry.test.ts
└── tests/
    └── integration/                  # Integration тесты
        └── full-workflow.test.ts
```

### Структура теста

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { WorkflowEngine } from './workflow-engine'

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = new WorkflowEngine()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('execute', () => {
    it('should complete task successfully', async () => {
      // Arrange
      const task = 'Simple task'

      // Act
      const result = await engine.execute(task)

      // Assert
      expect(result.status).toBe('completed')
    })
  })
})
```

## Паттерны тестирования

### Unit тесты

```typescript
describe('ComplexityAnalyzer', () => {
  it('should classify trivial task correctly', () => {
    const analyzer = new ComplexityAnalyzer()

    const result = analyzer.analyze('Fix typo')

    expect(result.level).toBe('trivial')
    expect(result.score).toBeLessThan(20)
  })

  it('should classify complex task correctly', () => {
    const analyzer = new ComplexityAnalyzer()

    const result = analyzer.analyze('Implement OAuth2 authentication')

    expect(result.level).toBe('complex')
    expect(result.score).toBeGreaterThan(60)
  })
})
```

### Мокирование

```typescript
import { vi } from 'vitest'

describe('AgentExecutor', () => {
  it('should call agent with correct parameters', async () => {
    // Мок функции
    const mockExecute = vi.fn().mockResolvedValue({ success: true })
    const agent = { execute: mockExecute }

    const executor = new AgentExecutor(agent)
    await executor.run('task')

    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ task: 'task' })
    )
  })
})
```

### Мокирование модулей

```typescript
import { vi } from 'vitest'

vi.mock('./database', () => ({
  query: vi.fn().mockResolvedValue([{ id: 1 }])
}))

import { query } from './database'

describe('Repository', () => {
  it('should use mocked database', async () => {
    const result = await query('SELECT * FROM users')
    expect(result).toEqual([{ id: 1 }])
  })
})
```

### Асинхронные тесты

```typescript
describe('AsyncOperations', () => {
  it('should handle async operation', async () => {
    const result = await asyncOperation()
    expect(result).toBeDefined()
  })

  it('should handle timeout', async () => {
    await expect(
      slowOperation({ timeout: 100 })
    ).rejects.toThrow('Timeout')
  })

  it('should handle concurrent operations', async () => {
    const results = await Promise.all([
      operation1(),
      operation2(),
      operation3()
    ])

    expect(results).toHaveLength(3)
  })
})
```

### Параметризованные тесты

```typescript
describe('validateEmail', () => {
  it.each([
    ['user@example.com', true],
    ['test.user@domain.org', true],
    ['invalid', false],
    ['@domain.com', false],
    ['user@', false]
  ])('validateEmail(%s) should return %s', (email, expected) => {
    expect(validateEmail(email)).toBe(expected)
  })
})
```

## Integration тесты

### Полный workflow

```typescript
describe('Full Workflow Integration', () => {
  let engine: WorkflowEngine

  beforeAll(async () => {
    engine = new WorkflowEngine()
    await engine.initialize()
  })

  afterAll(async () => {
    await engine.cleanup()
  })

  it('should execute complete development workflow', async () => {
    const result = await engine.execute(
      'Create user authentication API',
      { workflow: 'full_development' }
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

### С базой данных

```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    await db.migrate.latest()
    await db.seed.run()
  })

  afterEach(async () => {
    await db.migrate.rollback()
  })

  it('should save workflow execution', async () => {
    const execution = await saveExecution({
      workflowId: 'test',
      status: 'completed'
    })

    const retrieved = await getExecution(execution.id)
    expect(retrieved.status).toBe('completed')
  })
})
```

## Покрытие кода

### Конфигурация

```typescript
// vitest.config.ts
export default {
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'tests',
        '**/*.test.ts'
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
}
```

### Проверка покрытия

```bash
# Генерация отчёта
pnpm test:coverage

# Открыть HTML отчёт
open coverage/index.html
```

## Лучшие практики

### 1. Один assert на тест

```typescript
// ✅ Хорошо
it('should return completed status', () => {
  expect(result.status).toBe('completed')
})

it('should include artifacts', () => {
  expect(result.artifacts).toHaveLength(2)
})

// ❌ Плохо
it('should work correctly', () => {
  expect(result.status).toBe('completed')
  expect(result.artifacts).toHaveLength(2)
  expect(result.duration).toBeLessThan(1000)
})
```

### 2. Описательные имена

```typescript
// ✅ Хорошо
it('should return YOLO mode when complexity score is below 20')

// ❌ Плохо
it('works')
it('test case 1')
```

### 3. Изолированные тесты

```typescript
// ✅ Хорошо: Каждый тест независим
beforeEach(() => {
  engine = new WorkflowEngine()
})

// ❌ Плохо: Тесты зависят друг от друга
let sharedState
it('test 1', () => { sharedState = 'value' })
it('test 2', () => { expect(sharedState).toBe('value') })
```

### 4. Тестирование edge cases

```typescript
describe('execute', () => {
  it('should handle empty task', async () => {
    await expect(engine.execute('')).rejects.toThrow('Task is required')
  })

  it('should handle very long task', async () => {
    const longTask = 'a'.repeat(10000)
    const result = await engine.execute(longTask)
    expect(result.status).toBe('completed')
  })

  it('should handle special characters', async () => {
    const result = await engine.execute('Task with émojis 🚀')
    expect(result.status).toBe('completed')
  })
})
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
```

## См. также

- [Настройка окружения](./setup.md)
- [Стандарты кода](./coding-standards.md)
