# Workflows

Workflows — это структурированные последовательности задач агентов для достижения сложных целей.

## Что такое Workflow?

Workflow определяет:
- **Шаги** — упорядоченная последовательность задач агентов
- **Фазы** — логические группировки шагов
- **Артефакты** — ожидаемые результаты на каждом шаге
- **Критерии выхода** — условия для перехода дальше
- **Таймауты** — максимальное время на каждый шаг

## Доступные Workflows

AI1st включает **10 production-ready workflows**:

| # | Workflow | Сложность | Время | Применение |
|---|----------|-----------|-------|------------|
| 1 | Bug Fix | Простой | 1ч | Быстрые исправления |
| 2 | Feature Development | Средний | 2.5ч | Полный цикл фичи |
| 3 | Quality Assurance | Средний | 35м | Комплексное тестирование |
| 4 | Advanced Bug Fix | Сложный | 3.5ч | Сложные баги |
| 5 | Code Refactoring | Средний | 3.5ч | Улучшение кода |
| 6 | Performance Optimization | Сложный | 4ч | Оптимизация |
| 7 | Security Audit | Сложный | 6ч | Аудит безопасности |
| 8 | Architecture Design | Корп. | 6ч | Проектирование |
| 9 | Database Migration | Корп. | 6ч+ | Миграции схемы |
| 10 | API Design | Сложный | 6.5ч | API контракты |

## Выполнение Workflow

### По ID

```typescript
const result = await engine.executeWorkflow('feature_implementation_full', {
  task: 'Добавить страницу профиля'
})
```

### По описанию (адаптивно)

```typescript
// AI1st автоматически выбирает лучший workflow
const result = await engine.execute(
  'Добавить аутентификацию с OAuth2',
  undefined,
  { projectSize: 'large' }
)
```

## Параллельное выполнение

Workflows поддерживают параллельное выполнение:

```
Фаза 1: Дизайн
  ┌─────────────┐
  │  Architect  │ ─────┐
  └─────────────┘      │
                       ├──→ [Merge] ──→ Фаза 2
  ┌─────────────┐      │
  │ UX Designer │ ─────┘
  └─────────────┘
```

## YOLO Mode

Для простых задач (сложность < 30) checkpoint'ы пропускаются:

```typescript
// Сложность: 25 → YOLO Mode включен
const result = await engine.execute('Исправить опечатку в README')
// Без утверждений, выполняется сразу
```

## Выбор Workflow

AI1st использует анализ сложности для выбора:

| Сложность | Баллы | Типичный Workflow |
|-----------|-------|-------------------|
| Тривиальный | 0-20 | Bug Fix (YOLO) |
| Простой | 21-40 | Bug Fix |
| Средний | 41-60 | Feature Development |
| Сложный | 61-80 | Security Audit |
| Корпоративный | 81-100 | Architecture Design |

## См. также

- [Каталог Workflows](../reference/workflows/index.md) — полная документация
- [Кастомные Workflows](../guides/custom-workflows.md) — создание своих
- [Адаптивный выбор](../guides/adaptive-workflow.md) — детали выбора
