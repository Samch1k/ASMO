# Базовый Workflow

Этот пример демонстрирует создание и выполнение простого workflow.

## Задача

Создать функцию валидации email с тестами.

## Код

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function main() {
  // 1. Инициализация
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // 2. Описание задачи
  const task = `
    Создать функцию validateEmail которая:
    - Принимает строку email
    - Возвращает true если email валиден
    - Возвращает false если email невалиден
    - Написать unit тесты
  `

  // 3. Выполнение
  const result = await engine.execute(task)

  // 4. Результат
  console.log('Статус:', result.status)
  console.log('Workflow:', result.workflowId)
  console.log('Артефакты:', result.artifacts)
}

main().catch(console.error)
```

## Объяснение

### Шаг 1: Инициализация

```typescript
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()
```

- `AgentRegistry` — управляет доступными агентами
- `WorkflowEngine` — основной движок выполнения
- `initialize()` — загружает встроенные workflows и агентов

### Шаг 2: Описание задачи

Задача описывается на естественном языке. Движок автоматически:
- Анализирует сложность
- Выбирает подходящий workflow
- Определяет нужных агентов

### Шаг 3: Выполнение

```typescript
const result = await engine.execute(task)
```

Метод `execute()` возвращает промис с результатом выполнения.

### Шаг 4: Результат

```typescript
interface WorkflowResult {
  status: 'completed' | 'failed' | 'pending'
  workflowId: string
  artifacts: Artifact[]
  metrics: ExecutionMetrics
}
```

## Результат

```
Статус: completed
Workflow: simple_task
Артефакты: [
  { type: 'code', path: 'src/utils/validateEmail.ts' },
  { type: 'test', path: 'src/utils/validateEmail.test.ts' }
]
```

## Сгенерированный код

```typescript
// src/utils/validateEmail.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

```typescript
// src/utils/validateEmail.test.ts
import { validateEmail } from './validateEmail'

describe('validateEmail', () => {
  it('returns true for valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.user@domain.org')).toBe(true)
  })

  it('returns false for invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
  })
})
```

## Следующие шаги

- [Адаптивный выбор](./adaptive-selection.md) — автоматический выбор workflow
- [Мульти-агент](./multi-agent.md) — совместная работа агентов

## См. также

- [Концепция Workflows](../concepts/workflows.md)
- [Каталог Workflows](../reference/workflows/index.md)
