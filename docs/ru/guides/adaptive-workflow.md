# Адаптивный выбор Workflow

Узнайте, как AI1st автоматически выбирает лучший workflow для ваших задач.

## Обзор

Вместо ручного выбора workflows, опишите задачу и позвольте AI1st:

1. **Проанализировать** сложность задачи
2. **Подобрать** необходимые навыки
3. **Выбрать** оптимальный workflow
4. **Выполнить** с подходящими агентами

## Базовое использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Просто опишите, что нужно
const result = await engine.execute(
  'Добавить аутентификацию с OAuth2 и JWT токенами'
)

// AI1st автоматически выбирает:
// - Сложность: 65 (complex)
// - Workflow: security_audit
// - Агенты: architect, security-specialist, developer, tester
```

## Детальный анализ

Получите полный анализ перед выполнением:

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Рефакторинг модуля аутентификации',
  {
    projectSize: 'large',
    techStack: ['React', 'Node.js', 'PostgreSQL']
  }
)

console.log('\n📊 Анализ задачи')
console.log('================')
console.log(`Задача: ${task}`)
console.log(`\nСложность:`)
console.log(`  Оценка: ${selection.complexity.score}/100`)
console.log(`  Уровень: ${selection.complexity.level}`)
console.log(`  Уверенность: ${(selection.confidence * 100).toFixed(0)}%`)

console.log(`\nРекомендация:`)
console.log(`  Workflow: ${selection.workflow.name}`)
console.log(`  Агенты: ${selection.complexity.recommendedAgents.join(', ')}`)
console.log(`  Обоснование: ${selection.reasoning}`)
```

## Контекст проекта

Улучшите точность выбора, предоставив контекст:

```typescript
const result = await engine.execute(
  'Добавить обработку платежей со Stripe',
  undefined,
  {
    projectSize: 'large',
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    hasTests: true,
    hasCICD: true,
    teamSize: 8,
    domain: 'e-commerce'
  }
)
```

### Опции контекста

| Опция | Тип | Описание |
|-------|-----|----------|
| `projectSize` | 'small' \| 'medium' \| 'large' | Масштаб проекта |
| `techStack` | string[] | Используемые технологии |
| `hasTests` | boolean | Есть тесты |
| `hasCICD` | boolean | Есть CI/CD pipeline |
| `teamSize` | number | Размер команды |
| `domain` | string | Бизнес-домен |

## Пороги сложности

| Уровень | Баллы | Типичный выбор |
|---------|-------|----------------|
| Тривиальный | 0-20 | Bug Fix (YOLO Mode) |
| Простой | 21-40 | Bug Fix |
| Средний | 41-60 | Feature Development |
| Сложный | 61-80 | Security Audit |
| Корпоративный | 81-100 | Architecture Design |

## Лучшие практики

1. **Предоставляйте контекст** — больше контекста = лучший выбор
2. **Используйте естественный язык** — описывайте задачи чётко
3. **Проверяйте уверенность** — валидируйте важные выборы
4. **Изучайте обоснование** — понимайте, почему выбран workflow
5. **Итерируйте** — уточняйте описания при необходимости

## См. также

- [Анализ сложности](../concepts/complexity.md)
- [Доступные Workflows](../reference/workflows/index.md)
- [YOLO Mode](./yolo-mode.md)
