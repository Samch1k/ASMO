# Динамический Оркестратор

DynamicOrchestrator — это нативный TypeScript движок оркестрации ASMO, который интеллектуально маршрутизирует задачи к агентам и моделям.

## Обзор

```
Задача → TaskRouter → Выбор модели → AgentExecutor → Результат
         ├─ Анализ сложности
         ├─ Сопоставление навыков
         └─ Роутинг моделей (Opus/Sonnet/Haiku)
```

## Ключевые возможности

### Интеллектуальная маршрутизация моделей

Задачи автоматически направляются к наиболее подходящей модели:

| Сложность | Баллы | Модель | Применение |
|-----------|-------|--------|------------|
| Trivial/Simple | 0-30 | Haiku | Быстрые фиксы, документация |
| Medium/Complex | 31-70 | Sonnet | Фичи, баги, код-ревью |
| Enterprise | 71-100 | Opus | Архитектура, безопасность |

### Выбор агента

Агенты выбираются на основе:
- Требуемых навыков
- Типа задачи
- Доступности агентов
- Предпочтений пользователя

### Отказоустойчивость

Встроенные механизмы надёжности:
- Retry с экспоненциальным откатом
- Настраиваемые таймауты
- Circuit breaker защита
- Валидация входа/выхода

## Использование

### Базовое выполнение

```typescript
import { getDynamicOrchestrator, type OrchestrationTask } from '@asmo/core'

const orchestrator = getDynamicOrchestrator()

const task: OrchestrationTask = {
  id: 'task-001',
  description: 'Реализовать аутентификацию',
  taskType: 'feature',
  complexity: { score: 55, level: 'medium' }
}

const result = await orchestrator.executeTask(task)

console.log(result.routing.model)  // 'sonnet'
console.log(result.success)        // true/false
```

### Предпросмотр маршрутизации

```typescript
const routing = orchestrator.previewRouting(task)
console.log(routing.model)       // Выбранная модель
console.log(routing.agent)       // Рекомендуемый агент
console.log(routing.rationale)   // Обоснование
console.log(routing.alternatives) // Альтернативы
```

### Выполнение workflow

```typescript
const tasks: OrchestrationTask[] = [
  { id: '1', description: 'Спроектировать API' },
  { id: '2', description: 'Реализовать эндпоинты' },
  { id: '3', description: 'Написать тесты' }
]

const result = await orchestrator.executeWorkflow('api-workflow', tasks)
```

## Конфигурация

```typescript
const orchestrator = new DynamicOrchestrator({
  verbose: true,        // Включить логирование
  maxConcurrency: 10,   // Макс. параллельных задач

  executor: {
    maxRetries: 3,
    timeout: 120000,    // 2 минуты
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

## Статистика

```typescript
const stats = orchestrator.getStats()

console.log(stats.routing.totalDecisions)
console.log(stats.routing.byModel)      // { opus: 5, sonnet: 20, haiku: 10 }
console.log(stats.routing.successRate)  // 0.95
```

## См. также

- [Роутинг моделей](../guides/model-routing.md)
- [Режимы выполнения](../guides/execution-modes.md)
- [Надёжность](../guides/reliability.md)
