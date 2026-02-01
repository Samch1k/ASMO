# Мульти-агентное взаимодействие

Этот пример демонстрирует совместную работу нескольких агентов.

## Задача

Реализовать функционал с участием нескольких специализированных агентов.

## Код: Последовательная работа

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function sequentialExample() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Задача требующая нескольких агентов
  const task = `
    Реализовать REST API для управления пользователями:
    - CRUD операции
    - Аутентификация JWT
    - Валидация данных
    - Unit и integration тесты
  `

  const result = await engine.execute(task)

  // Workflow автоматически включает:
  // 1. Architect → проектирование API
  // 2. Developer → реализация
  // 3. Security Specialist → ревью безопасности
  // 4. Tester → написание тестов

  console.log('Агенты:', result.agentContributions.map(a => a.agentId))
}

sequentialExample()
```

## Код: Party Mode

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function partyModeExample() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Brainstorming сессия
  const session = await engine.executePartyMode(
    'Спроектировать систему уведомлений в реальном времени',
    ['architect', 'developer', 'devops'],
    undefined,
    {
      maxRounds: 3,
      convergenceThreshold: 0.8
    }
  )

  console.log('Статус:', session.status)
  console.log('Раунды:', session.state.roundCount)
  console.log('Конвергенция:', session.state.convergenceScore)

  // Достигнутые соглашения
  for (const agreement of session.state.agreements) {
    console.log(`\n${agreement.topic}:`)
    console.log(`  Решение: ${agreement.decision}`)
    console.log(`  Уверенность: ${(agreement.confidence * 100).toFixed(0)}%`)
  }
}

partyModeExample()
```

## Объяснение

### Последовательная работа

В стандартных workflows агенты работают последовательно:

```
Architect → Developer → Tester → Reviewer
     ↓          ↓          ↓          ↓
  Design    Implement    Test      Review
```

Каждый агент:
1. Получает результат предыдущего
2. Выполняет свою часть
3. Передаёт результат следующему

### Party Mode

В Party Mode агенты работают параллельно:

```
       ┌─────────────┐
       │   Задача    │
       └──────┬──────┘
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
┌───────┐ ┌───────┐ ┌───────┐
│Architect│ │Developer│ │ DevOps │
└───┬───┘ └───┬───┘ └───┬───┘
    │         │         │
    └─────────┼─────────┘
              ↓
       ┌──────────────┐
       │  Обсуждение  │
       │  Консенсус   │
       └──────────────┘
```

## Результат: Последовательная работа

```
Агенты: ['architect', 'developer', 'security-specialist', 'tester']

Contribution architect:
  - API design document
  - Endpoint specifications
  - Data models

Contribution developer:
  - Implementation code
  - Database migrations
  - API handlers

Contribution security-specialist:
  - Security review
  - JWT implementation review
  - Recommendations

Contribution tester:
  - Unit tests
  - Integration tests
  - Test coverage report
```

## Результат: Party Mode

```
Статус: completed
Раунды: 3
Конвергенция: 0.85

Технология транспорта:
  Решение: WebSocket с fallback на SSE
  Уверенность: 90%

Масштабирование:
  Решение: Redis Pub/Sub для распределения
  Уверенность: 85%

Персистентность:
  Решение: PostgreSQL для истории, Redis для очереди
  Уверенность: 80%
```

## Кастомный набор агентов

```typescript
// Явно указать агентов для задачи
const result = await engine.execute(task, undefined, {
  includeAgents: ['architect', 'security-specialist', 'performance-optimizer'],
  excludeAgents: ['tester']  // Пропустить тестирование
})
```

## Обработка конфликтов

```typescript
const session = await engine.executePartyMode(task, agents)

// Проверка неразрешённых конфликтов
const unresolvedConflicts = session.state.conflictLog.filter(
  c => !c.resolved && c.severity === 'Critical'
)

if (unresolvedConflicts.length > 0) {
  console.log('Требуется участие человека:')
  for (const conflict of unresolvedConflicts) {
    console.log(`- ${conflict.topic}: ${conflict.description}`)
  }
}
```

## Следующие шаги

- [Party Mode](../guides/party-mode.md) — подробное руководство
- [Кастомные агенты](../guides/custom-agents.md) — создание своих агентов

## См. также

- [Концепция агентов](../concepts/agents.md)
- [Каталог агентов](../reference/agents/index.md)
