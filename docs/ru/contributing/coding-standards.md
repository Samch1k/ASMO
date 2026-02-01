# Стандарты кода

Руководство по стилю и соглашениям для кодовой базы AI1st.

## TypeScript

### Конфигурация

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  }
}
```

### Именование

| Элемент | Стиль | Пример |
|---------|-------|--------|
| Классы | PascalCase | `WorkflowEngine` |
| Интерфейсы | PascalCase | `AgentConfig` |
| Функции | camelCase | `executeWorkflow` |
| Переменные | camelCase | `agentRegistry` |
| Константы | UPPER_SNAKE | `DEFAULT_TIMEOUT` |
| Файлы | kebab-case | `workflow-engine.ts` |

### Типы

```typescript
// ✅ Хорошо: Явные типы для публичных API
export function execute(task: string, options?: ExecuteOptions): Promise<Result>

// ✅ Хорошо: Интерфейсы для объектов
interface AgentConfig {
  id: string
  name: string
  priority: number
}

// ❌ Плохо: any
function process(data: any): any

// ✅ Хорошо: unknown + type guards
function process(data: unknown): Result {
  if (isValidInput(data)) {
    return processValid(data)
  }
  throw new Error('Invalid input')
}
```

### Асинхронный код

```typescript
// ✅ Хорошо: async/await
async function fetchData(): Promise<Data> {
  const response = await fetch(url)
  return response.json()
}

// ✅ Хорошо: Обработка ошибок
async function safeExecute(): Promise<Result> {
  try {
    return await execute()
  } catch (error) {
    if (error instanceof WorkflowError) {
      return { status: 'failed', error: error.message }
    }
    throw error
  }
}

// ❌ Плохо: Игнорирование ошибок
async function badExecute() {
  try {
    await execute()
  } catch {
    // молча игнорируем
  }
}
```

## Структура файлов

### Порядок импортов

```typescript
// 1. Внешние зависимости
import { z } from 'zod'

// 2. Внутренние пакеты
import { AgentRegistry } from '@ai1st/core'

// 3. Относительные импорты
import { validateConfig } from './utils'
import type { Config } from './types'
```

### Структура модуля

```typescript
// types.ts - типы и интерфейсы
export interface Config { ... }

// utils.ts - утилиты
export function validate() { ... }

// agent.ts - основная логика
export class Agent { ... }

// index.ts - публичный API
export { Agent } from './agent'
export type { Config } from './types'
```

## Документация

### JSDoc

```typescript
/**
 * Выполняет workflow для задачи.
 *
 * @param task - Описание задачи на естественном языке
 * @param options - Опции выполнения
 * @returns Результат выполнения workflow
 *
 * @example
 * ```typescript
 * const result = await engine.execute('Create user API')
 * console.log(result.status)
 * ```
 */
export async function execute(
  task: string,
  options?: ExecuteOptions
): Promise<WorkflowResult>
```

### Комментарии

```typescript
// ✅ Хорошо: Объяснение "почему"
// Используем retry с exponential backoff для обработки
// временных сбоев при подключении к внешним сервисам
const result = await retry(fetchData, { maxAttempts: 3 })

// ❌ Плохо: Объяснение "что" (очевидно из кода)
// Получаем пользователя по ID
const user = await getUser(id)
```

## Тестирование

### Структура тестов

```typescript
describe('WorkflowEngine', () => {
  // Setup
  let engine: WorkflowEngine
  let registry: AgentRegistry

  beforeEach(() => {
    registry = new AgentRegistry()
    engine = new WorkflowEngine(registry)
  })

  describe('execute', () => {
    it('should complete simple task successfully', async () => {
      // Arrange
      const task = 'Fix typo in README'

      // Act
      const result = await engine.execute(task)

      // Assert
      expect(result.status).toBe('completed')
    })

    it('should select appropriate workflow based on complexity', async () => {
      // ...
    })
  })
})
```

### Именование тестов

```typescript
// ✅ Хорошо: Описывает поведение
it('should return error when task is empty')
it('should select YOLO mode for trivial tasks')

// ❌ Плохо: Описывает реализацию
it('calls validateTask function')
it('sets status to completed')
```

## Обработка ошибок

### Кастомные ошибки

```typescript
export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'WorkflowError'
  }
}

// Использование
throw new WorkflowError(
  'Workflow not found',
  'WORKFLOW_NOT_FOUND',
  { workflowId }
)
```

### Валидация

```typescript
import { z } from 'zod'

const ConfigSchema = z.object({
  timeout: z.number().positive(),
  maxRetries: z.number().int().min(0).max(10)
})

export function validateConfig(input: unknown): Config {
  return ConfigSchema.parse(input)
}
```

## Git

### Формат коммитов

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Типы коммитов

| Тип | Описание |
|-----|----------|
| `feat` | Новая функциональность |
| `fix` | Исправление бага |
| `docs` | Документация |
| `style` | Форматирование |
| `refactor` | Рефакторинг |
| `test` | Тесты |
| `chore` | Обслуживание |

### Примеры

```bash
feat(engine): add adaptive workflow selection
fix(agents): resolve timeout issue in party mode
docs(readme): update installation instructions
test(core): add unit tests for complexity analyzer
```

## Линтинг

### ESLint

```bash
# Проверка
pnpm lint

# Автоисправление
pnpm lint:fix
```

### Prettier

```bash
# Форматирование
pnpm format
```

## См. также

- [Настройка окружения](./setup.md)
- [Тестирование](./testing.md)
