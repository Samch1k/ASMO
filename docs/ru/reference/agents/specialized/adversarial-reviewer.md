# Агент Adversarial Reviewer

Критический code reviewer, который ОБЯЗАН находить проблемы — никаких формальных одобрений.

## Обзор

Агент Adversarial Reviewer выполняет строгий code review с мандатом на поиск проблем. В отличие от стандартного code review, этот агент использует эскалирующие уровни проверки и ОБЯЗАН выявлять проблемы перед одобрением.

## Ключевой принцип

> "В каждом изменении кода есть возможность для улучшения. Задача ревьюера — найти её."

Этот агент реализует паттерн BMAD Adversarial Review, где:
- Первый проход: Обычный review
- Второй проход: Усиленная проверка, если проблем не найдено
- Третий проход: Предположить, что проблемы существуют, и найти их

## Возможности

| Навык | Описание |
|-------|----------|
| `adversarial_review` | Критический поиск проблем |
| `code_review` | Комплексный анализ кода |
| `security_review` | Обнаружение уязвимостей безопасности |
| `performance_review` | Выявление проблем производительности |
| `architecture_review` | Оценка design-паттернов |
| `best_practices` | Соблюдение стандартов кодирования |

## Категории review

### Проблемы безопасности
- Недостатки аутентификации/авторизации
- Пробелы в валидации ввода
- Уязвимости инъекций
- Риски утечки данных

### Проблемы производительности
- Неэффективные алгоритмы
- Паттерны N+1 запросов
- Утечки памяти
- Лишние вычисления

### Качество кода
- Дублирование кода
- Сложные условия
- Отсутствие обработки ошибок
- Неясные имена

### Архитектура
- Тесная связанность
- Нарушения принципа единственной ответственности
- Отсутствующие абстракции
- Проблемы масштабируемости

## Конфигурация

```yaml
# orchestration.config.ts
adversarialReview:
  enabled: true
  minIssuesRequired: 1
  maxRetries: 3
  escalationLevels:
    - normal
    - increased_scrutiny
    - assume_problems_exist
```

## Использование

```typescript
import { AdversarialReviewerAgent } from '@ai1st/core'
import { AdversarialReviewSession } from '@ai1st/core'

const reviewer = new AdversarialReviewerAgent()

// Прямое использование агента
const result = await reviewer.execute({
  task: 'Review middleware аутентификации',
  context: { code: authMiddlewareCode }
})

// Или использование review-сессии
const session = new AdversarialReviewSession({
  minIssuesRequired: 2
})

const review = await session.executeReview(artifact, reviewer)
console.log(review.issues)       // Массив найденных проблем
console.log(review.approved)     // false пока проблемы не решены
```

## Выходные данные review

```typescript
interface AdversarialReviewResult {
  issues: ReviewIssue[]
  approved: boolean
  escalationLevel: 'normal' | 'increased' | 'maximum'
  summary: string
  recommendations: string[]
}

interface ReviewIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion'
  category: 'security' | 'performance' | 'quality' | 'architecture'
  location: string
  description: string
  suggestion: string
}
```

## Процесс эскалации

1. **Уровень 1 (Normal)**: Стандартный тщательный review
2. **Уровень 2 (Increased)**: Фокус на edge cases, путях ошибок, безопасности
3. **Уровень 3 (Maximum)**: Предположить, что проблемы существуют, проверить каждую строку

Если после Уровня 3 проблем не найдено, одобрение выдаётся с предупреждением.

## MCP интеграции

- **Filesystem MCP**: Читает файлы кода и связанный контекст
- **Memory MCP**: Отслеживает повторяющиеся проблемы и паттерны
- **Context7 MCP**: Ссылается на лучшие практики безопасности

## См. также

- [Концепция Adversarial Review](/docs/ru/concepts/adversarial-review.md)
- [Workflow Adversarial Review](/docs/ru/reference/workflows/11-adversarial-review.md)
- [Агент Code Reviewer](./code-reviewer.md)
