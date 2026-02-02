# Быстрый старт

Запустите первый ASMO workflow за 5 минут!

## Предварительные требования

Убедитесь, что вы [установили ASMO](./installation.md).

## Шаг 1: Инициализация Engine

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

// Создаём registry и engine
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)

// Инициализируем (загружает workflows и агентов)
await engine.initialize()

console.log(`Загружено ${engine.getWorkflows().length} workflows`)
console.log(`Зарегистрировано ${registry.getAgents().length} агентов`)
```

## Шаг 2: Запуск простого Workflow

### Вариант A: Выполнение по ID

```typescript
// Выполняем конкретный workflow
const result = await engine.executeWorkflow('bug_fix_workflow', {
  task: 'Исправить кнопку логина, которая не реагирует на клики'
})

console.log('Результат:', result)
```

### Вариант B: Адаптивный выбор (рекомендуется)

Позвольте ASMO автоматически выбрать лучший workflow:

```typescript
// Опишите задачу на естественном языке
const result = await engine.execute(
  'Добавить аутентификацию с OAuth2 и JWT токенами',
  undefined,
  {
    projectSize: 'large',
    techStack: ['Node.js', 'PostgreSQL']
  }
)

console.log('Выбранный workflow:', result.workflowId)
console.log('Сложность:', result.complexityScore)
```

## Шаг 3: Анализ сложности задачи

Перед выполнением можно проанализировать сложность:

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Рефакторинг модуля аутентификации для улучшения безопасности',
  { projectSize: 'medium' }
)

console.log('Уровень сложности:', selection.complexity.level)
console.log('Оценка сложности:', selection.complexity.score)
console.log('Уверенность:', selection.confidence)
console.log('Обоснование:', selection.reasoning)
console.log('Рекомендуемый workflow:', selection.workflow.name)
console.log('Рекомендуемые агенты:', selection.complexity.recommendedAgents)
```

## Шаг 4: Party Mode (многоагентная коллаборация)

Для сложных решений используйте Party Mode:

```typescript
const session = await engine.executePartyMode(
  'Спроектировать схему базы данных для системы управления пользователями',
  ['architect', 'data-architect', 'developer'],
  undefined,
  {
    maxRounds: 3,
    convergenceThreshold: 0.8
  }
)

console.log('Статус сессии:', session.status)
console.log('Соглашения:', session.state.agreements)
console.log('Конвергенция:', session.state.convergenceScore)
```

## Полный пример

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

async function main() {
  // Инициализация
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Анализ задачи
  const task = 'Добавить страницу профиля пользователя с загрузкой аватара'
  const selection = await engine.selectWorkflowAdaptively(task)

  console.log('\n📊 Анализ задачи:')
  console.log(`  Задача: ${task}`)
  console.log(`  Сложность: ${selection.complexity.level} (${selection.complexity.score}/100)`)
  console.log(`  Workflow: ${selection.workflow.name}`)
  console.log(`  Агенты: ${selection.complexity.recommendedAgents.join(', ')}`)

  // Выполнение
  console.log('\n🚀 Выполнение workflow...')
  const result = await engine.execute(task)

  console.log('\n✅ Workflow завершён!')
  console.log('Результат:', JSON.stringify(result, null, 2))
}

main().catch(console.error)
```

## Уровни сложности

| Уровень | Баллы | Примеры | Workflow |
|---------|-------|---------|----------|
| Тривиальный | 0-20 | Исправить опечатку | YOLO Mode |
| Простой | 21-40 | Простой баг-фикс | Quick Flow |
| Средний | 41-60 | Новый компонент | Feature Development |
| Сложный | 61-80 | Безопасность, API | Full Planning |
| Корпоративный | 81-100 | Архитектура | Brainstorming + Review |

## Доступные Workflows

| # | Workflow | Применение |
|---|----------|------------|
| 1 | Quick Flow | Быстрые исправления |
| 2 | Feature Development | Полный цикл разработки |
| 3 | Quality Assurance | Комплексное тестирование |
| 4 | Advanced Bug Fix | Сложные баги |
| 5 | Refactoring | Улучшение качества кода |
| 6 | Performance Optimization | Оптимизация производительности |
| 7 | Security Audit | Аудит безопасности |
| 8 | Architecture Design | Проектирование системы |
| 9 | Database Migration | Миграции схемы |
| 10 | API Design | Дизайн API контрактов |

## Следующие шаги

- [Конфигурация](./configuration.md) — настройте ASMO
- [Концепции](../concepts/index.md) — как работает ASMO
- [Руководства](../guides/index.md) — продвинутые возможности
- [Примеры](../examples/index.md) — больше примеров кода
