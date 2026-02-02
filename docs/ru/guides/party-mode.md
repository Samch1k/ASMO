# Party Mode

Party Mode позволяет нескольким агентам сотрудничать в реальном времени, обсуждать идеи, достигать консенсуса и создавать единый результат.

## Обзор

В отличие от последовательных workflows, где агенты работают независимо, Party Mode позволяет агентам:

- **Видеть работу друг друга** в реальном времени
- **Двусторонне общаться** через сообщения
- **Достигать консенсуса** через голосование и предложения
- **Итерировать вместе** через несколько раундов обсуждения
- **Разрешать конфликты** автоматически через MergeAgent

## Когда использовать Party Mode

Party Mode идеален для:

- **Сложных решений** требующих множества перспектив
- **Brainstorming сессий** для проектирования систем
- **Архитектурных обсуждений** с анализом компромиссов
- **Решения проблем** выигрывающих от коллаборации
- **Достижения консенсуса** по техническим подходам

## Базовое использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск Party Mode
const session = await engine.executePartyMode(
  'Спроектировать систему аутентификации пользователей',
  ['architect', 'developer', 'security-specialist'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.8
  }
)

console.log('Статус:', session.status)
console.log('Соглашения:', session.state.agreements)
console.log('Конвергенция:', session.state.convergenceScore)
```

## Опции конфигурации

| Опция | Тип | По умолчанию | Описание |
|-------|-----|--------------|----------|
| `maxRounds` | number | 3 | Максимум раундов обсуждения |
| `convergenceThreshold` | number | 0.8 | Порог консенсуса (0-1) |
| `facilitator` | string | - | Опциональный агент-фасилитатор |

### Порог конвергенции

- **0.5** — низкий барьер, быстрый консенсус
- **0.7** — умеренный консенсус
- **0.8** — высокий консенсус (по умолчанию)
- **0.9** — очень высокий, больше раундов

## Brainstorming сессии

Для структурированного принятия решений с генерацией ADR:

```typescript
import { createBrainstormingSession } from '@asmo/core'

const session = createBrainstormingSession(
  'Стратегия аутентификации API',
  ['architect', 'security-specialist', 'developer'],
  { generateADR: true, convergenceThreshold: 0.7 }
)

const result = await session.execute()
console.log(result.finalDecision)
console.log(result.adrPath) // Путь к сгенерированному ADR
```

### Раунды Brainstorming

| Раунд | Фаза | Результат |
|-------|------|-----------|
| 1 | Независимые предложения | Каждый агент предлагает решения |
| 2 | Перекрёстная критика | Агенты оценивают предложения |
| 3 | Синтез | Объединение лучших идей, голосование |
| 4 | Решение | Финальное решение + генерация ADR |

## Работа с результатами

### Проверка соглашений

```typescript
for (const agreement of session.state.agreements) {
  console.log(`Тема: ${agreement.topic}`)
  console.log(`Решение: ${agreement.decision}`)
  console.log(`Уверенность: ${(agreement.confidence * 100).toFixed(0)}%`)
  console.log(`Поддержали: ${agreement.supportingAgents.join(', ')}`)
}
```

### Обработка конфликтов

```typescript
const criticalConflicts = session.state.conflictLog.filter(
  c => c.severity === 'Critical' && !c.resolvable
)

if (criticalConflicts.length > 0) {
  console.log('Неразрешённые конфликты — нужно участие человека')
}
```

## Лучшие практики

### 1. Выбирайте взаимодополняющих агентов

```typescript
// Хорошо: разные перспективы
['architect', 'developer', 'tester']

// Плохо: слишком похожи
['developer', 'developer', 'developer']
```

### 2. Устанавливайте подходящее количество раундов

- **Простые решения**: 1-2 раунда
- **Сложные обсуждения**: 3-4 раунда
- **Brainstorming**: 2-3 раунда

### 3. Мониторьте конвергенцию

```typescript
if (session.state.convergenceScore < 0.6) {
  console.log('Низкий консенсус — нужно дополнительное обсуждение')
}
```

## См. также

- [Агенты](../concepts/agents.md)
- [Workflows](../concepts/workflows.md)
- [Кастомные агенты](./custom-agents.md)
