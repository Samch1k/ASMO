# Руководство по роутингу моделей

ASMO автоматически выбирает оптимальную модель Claude (Opus, Sonnet или Haiku) на основе характеристик задачи.

## Уровни моделей

| Модель | Лучше всего для | Скорость | Стоимость |
|--------|-----------------|----------|-----------|
| **Opus** | Сложные рассуждения, архитектура, безопасность | Медленно | Высокая |
| **Sonnet** | Общая разработка, код-ревью, фичи | Средне | Средняя |
| **Haiku** | Быстрые фиксы, документация, форматирование | Быстро | Низкая |

## Правила маршрутизации

### 1. По баллам сложности

```
Баллы 0-30   → Haiku   (trivial, simple)
Баллы 31-70  → Sonnet  (medium, complex)
Баллы 71-100 → Opus    (enterprise)
```

### 2. Переопределение по типу задачи

```typescript
// Всегда Haiku
'quick_fix', 'documentation', 'code_formatting', 'typo_fix'

// Всегда Sonnet
'feature', 'bug_fix', 'code_review', 'testing', 'refactoring'

// Всегда Opus
'architecture_design', 'security_audit', 'system_design'
```

### 3. Определение по ключевым словам

**Ключевые слова Opus:** `architect`, `design system`, `security`, `enterprise`

**Ключевые слова Haiku:** `simple`, `quick`, `typo`, `trivial`

## Конфигурация

### Пользовательские пороги

```typescript
import { getTaskRouter } from '@asmo/core'

const router = getTaskRouter({
  complexityThresholds: {
    haiku: 20,   // Больше задач на Haiku
    sonnet: 60   // Больше задач на Opus
  }
})
```

### YAML конфигурация

```yaml
routing:
  default_model: sonnet

  complexity_thresholds:
    haiku_max: 30
    sonnet_max: 70

  task_type_overrides:
    quick_fix: haiku
    security_audit: opus
```

## Примеры использования

### Явная сложность

```typescript
const task = {
  id: 'task-1',
  description: 'Реализовать дашборд',
  complexity: { score: 45, level: 'medium' }
}

const routing = router.route(task)
// routing.model === 'sonnet'
```

### Принудительная модель

```typescript
const task = {
  id: 'task-2',
  description: 'Быстрый анализ',
  preferredModel: 'opus'  // Переопределение роутинга
}
```

## Оптимизация стоимости

### Примерная стоимость (за 1M токенов)

| Модель | Вход | Выход |
|--------|------|-------|
| Opus | $15 | $75 |
| Sonnet | $3 | $15 |
| Haiku | $0.25 | $1.25 |

## Лучшие практики

1. **Начинайте с баллов сложности** — самая точная маршрутизация
2. **Используйте типы задач** — для единообразия
3. **Мониторьте использование** — корректируйте пороги
4. **Переопределяйте при необходимости** — `preferredModel`
