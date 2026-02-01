# Анализ сложности

AI1st использует анализ сложности для автоматического выбора workflows и агентов.

## Обзор

Каждая задача анализируется и оценивается по шкале 0-100:

| Уровень | Баллы | Процесс | Примеры задач |
|---------|-------|---------|---------------|
| **Тривиальный** | 0-20 | YOLO Mode | Исправить опечатку |
| **Простой** | 21-40 | Быстрый workflow | Простой баг-фикс |
| **Средний** | 41-60 | Стандартный процесс | Новый компонент |
| **Сложный** | 61-80 | Полное планирование | Безопасность, API |
| **Корпоративный** | 81-100 | Brainstorming + review | Архитектура, миграции |

## Факторы сложности

`ComplexityAnalyzer` оценивает восемь факторов:

### 1. Затронутые файлы

| Файлов | Влияние |
|--------|---------|
| 1-3 | Низкое (+5) |
| 4-10 | Среднее (+15) |
| 11-20 | Высокое (+25) |
| 20+ | Очень высокое (+35) |

### 2. Зависимости

| Зависимостей | Влияние |
|--------------|---------|
| 0 | Нет (+0) |
| 1-2 | Низкое (+10) |
| 3-5 | Среднее (+20) |
| 6+ | Высокое (+30) |

### 3. Уровень риска

| Риск | Влияние |
|------|---------|
| Низкий | +5 |
| Средний | +15 |
| Высокий | +25 |

### 4-8. Дополнительные факторы

- **Доменная экспертиза** — +15 если требуется
- **Изменения данных** — +20 при изменении схемы БД
- **Влияние на безопасность** — +15
- **Влияние на производительность** — +10

## Использование анализа

### Автоматический (рекомендуется)

```typescript
const result = await engine.execute(
  'Добавить двухфакторную аутентификацию',
  undefined,
  { projectSize: 'large' }
)
```

### Ручной анализ

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Рефакторинг модуля аутентификации',
  { projectSize: 'medium' }
)

console.log('Оценка:', selection.complexity.score)
console.log('Уровень:', selection.complexity.level)
console.log('Уверенность:', selection.confidence)
console.log('Обоснование:', selection.reasoning)
```

## YOLO Mode

Для тривиальных задач (оценка < 30) YOLO mode включает:

- **Автоматический bypass утверждений** — без подтверждений
- **Быстрое выполнение** — пропуск несущественных шагов
- **Аудит** — все действия логируются

```typescript
// Настройка порога YOLO
config.set('yoloMode.complexityThreshold', 25)
config.set('yoloMode.excludedWorkflows', ['security_audit'])
```

## Контекст проекта

Предоставьте контекст для лучшего анализа:

```typescript
const context = {
  projectSize: 'large',      // small, medium, large
  techStack: ['React', 'Node.js', 'PostgreSQL'],
  teamSize: 5,
  hasTests: true,
  hasCICD: true
}

const selection = await engine.selectWorkflowAdaptively(task, context)
```

## См. также

- [YOLO Mode](../guides/yolo-mode.md) — автоматический bypass утверждений
- [Адаптивный Workflow](../guides/adaptive-workflow.md) — выбор workflow
- [Workflows](./workflows.md) — доступные workflows
