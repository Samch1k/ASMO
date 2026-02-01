# Адаптивный выбор Workflow

Этот пример демонстрирует автоматический выбор workflow на основе анализа сложности.

## Задача

Показать как движок автоматически выбирает подходящий workflow.

## Код

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Разные задачи → разные workflows
  const tasks = [
    'Исправить опечатку в README',           // trivial → YOLO
    'Добавить кнопку logout',                // simple → simple_task
    'Реализовать OAuth2 аутентификацию',     // complex → full_development
    'Спроектировать микросервисную архитектуру'  // enterprise → architecture_first
  ]

  for (const task of tasks) {
    // Только анализ, без выполнения
    const selection = await engine.selectWorkflowAdaptively(task)

    console.log(`\nЗадача: ${task}`)
    console.log(`Сложность: ${selection.complexity.level} (${selection.complexity.score})`)
    console.log(`Workflow: ${selection.workflow.id}`)
    console.log(`Агенты: ${selection.selectedAgents.join(', ')}`)
  }
}

main().catch(console.error)
```

## Объяснение

### Анализ сложности

```typescript
const selection = await engine.selectWorkflowAdaptively(task)
```

Метод `selectWorkflowAdaptively()` выполняет:

1. **Анализ сложности** — оценка от 0 до 100
2. **Выбор workflow** — на основе оценки
3. **Выбор агентов** — matching по навыкам

### Уровни сложности

| Уровень | Оценка | Workflow |
|---------|--------|----------|
| trivial | 0-20 | YOLO Mode |
| simple | 21-40 | simple_task |
| medium | 41-60 | standard_development |
| complex | 61-80 | full_development |
| enterprise | 81-100 | architecture_first |

### Факторы оценки

```typescript
interface ComplexityFactors {
  taskScope: number        // Объём задачи
  technicalDepth: number   // Техническая сложность
  integrationNeeds: number // Потребность в интеграции
  riskLevel: number        // Уровень риска
  teamCoordination: number // Координация команды
}
```

## Результат

```
Задача: Исправить опечатку в README
Сложность: trivial (12)
Workflow: yolo_mode
Агенты: developer

Задача: Добавить кнопку logout
Сложность: simple (28)
Workflow: simple_task
Агенты: developer, tester

Задача: Реализовать OAuth2 аутентификацию
Сложность: complex (72)
Workflow: full_development
Агенты: architect, developer, security-specialist, tester

Задача: Спроектировать микросервисную архитектуру
Сложность: enterprise (89)
Workflow: architecture_first
Агенты: architect, developer, devops, security-specialist
```

## Добавление контекста

```typescript
// Предоставьте контекст для более точного анализа
const selection = await engine.selectWorkflowAdaptively(task, {
  projectSize: 'large',
  techStack: ['React', 'Node.js', 'PostgreSQL'],
  hasTests: true,
  teamSize: 5
})
```

## Принудительный выбор

```typescript
// Игнорировать адаптивный выбор
const result = await engine.executeWorkflow('full_development', {
  task: 'Простая задача но хочу полный workflow'
})
```

## Следующие шаги

- [Мульти-агент](./multi-agent.md) — совместная работа агентов
- [Party Mode](../guides/party-mode.md) — режим коллаборации

## См. также

- [Концепция сложности](../concepts/complexity.md)
- [Адаптивный Workflow](../guides/adaptive-workflow.md)
