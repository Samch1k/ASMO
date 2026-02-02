# Продвинутая Elicitation

Продвинутая Elicitation — это набор техник для углублённого анализа и переосмысления сгенерированного контента. Эти техники помогают обнаружить скрытые предположения, выявить риски и улучшить принятие решений.

## Обзор

AI-сгенерированный контент выигрывает от структурированного пересмотра. Техники elicitation применяют разные аналитические подходы для:

- Проверки предположений
- Выявления слепых зон
- Стресс-тестирования решений
- Генерации альтернативных перспектив

## Доступные техники

### 1. First Principles (Первые принципы)

Разбейте контент на фундаментальные компоненты и перестройте с базовых истин.

```typescript
import { ElicitationManager, firstPrinciplesTechnique } from '@asmo/core'

const manager = new ElicitationManager()
const result = await manager.applyElicitation(
  prdContent,
  'first-principles',
  agent
)
```

**Когда использовать:**
- Проектирование новых систем с нуля
- Проверка традиционных подходов
- Упрощение сложных решений

**Задаваемые вопросы:**
- Каковы фундаментальные требования?
- Какие предположения мы делаем?
- Можно ли решить это проще?

### 2. Red Team / Blue Team

Симуляция перспектив атаки и защиты контента.

```typescript
const result = await manager.applyElicitation(
  architectureDoc,
  'red-team-blue-team',
  agent
)
```

**Когда использовать:**
- Критически важные с точки зрения безопасности системы
- Конкурентный анализ
- Оценка рисков

**Перспективы:**
- **Red Team**: Найти слабости, векторы атаки, точки отказа
- **Blue Team**: Защитить решения, предложить митигации

### 3. Pre-mortem (Предварительный анализ провала)

Представьте, что проект провалился, и работайте в обратном направлении.

```typescript
const result = await manager.applyElicitation(
  projectPlan,
  'pre-mortem',
  agent
)
```

**Когда использовать:**
- Планирование проекта
- Идентификация рисков
- Определение scope

**Задаваемые вопросы:**
- "Прошло 6 месяцев, проект провалился. Что пошло не так?"
- Какие предупреждающие знаки мы проигнорировали?
- Какие зависимости дали сбой?

### 4. Socratic (Сократический метод)

Применяйте глубокие, проникающие вопросы для проверки предположений.

```typescript
const result = await manager.applyElicitation(
  designDoc,
  'socratic',
  agent
)
```

**Когда использовать:**
- Уточнение требований
- Валидация дизайн-решений
- Обучение и передача знаний

**Типы вопросов:**
- Уточняющие: "Что вы имеете в виду под...?"
- Проверяющие предположения: "Почему вы предполагаете...?"
- Изучающие последствия: "Что произойдёт, если...?"

### 5. Devil's Advocate (Адвокат дьявола)

Аргументируйте противоположную позицию для стресс-тестирования решений.

```typescript
const result = await manager.applyElicitation(
  techChoice,
  'devils-advocate',
  agent
)
```

**Когда использовать:**
- Выбор технологий
- Архитектурные решения
- Спорные выборы

**Подход:**
- Аргументировать против предложенного решения
- Представить альтернативные точки зрения
- Бросить вызов статусу-кво

## Применение нескольких техник

Примените несколько техник для комплексного анализа:

```typescript
const result = await manager.applyMultipleElicitations(
  content,
  ['first-principles', 'pre-mortem', 'devils-advocate'],
  agent
)

console.log('Всего инсайтов:', result.allInsights.length)
console.log('Рекомендаций:', result.allRecommendations.length)
```

## Конфигурация

```typescript
const config = {
  elicitation: {
    enabled: true,
    defaultTechniques: ['first-principles', 'pre-mortem'],
    applyToWorkflows: ['create-prd', 'create-architecture'],
    maxInsightsPerTechnique: 10,
    verbose: false
  }
}
```

## Структура результата

```typescript
interface ElicitationResult {
  original: string          // Оригинальный контент
  technique: string         // Применённая техника
  insights: Insight[]       // Обнаруженные инсайты
  recommendations: Rec[]    // Действенные рекомендации
  revisedContent?: string   // Улучшенный контент (опционально)
  summary: string          // Краткое резюме
  durationMs: number       // Время обработки
}
```

## Сравнительная таблица

| Техника | Лучше всего для | Фокус |
|---------|-----------------|-------|
| First Principles | Новые дизайны | Фундаментальные основы |
| Red/Blue Team | Безопасность | Атака/Защита |
| Pre-mortem | Планирование | Режимы отказа |
| Socratic | Требования | Глубокое понимание |
| Devil's Advocate | Решения | Альтернативы |

## Связанные темы

- [Adversarial Review](./adversarial-review.md)
- [Context Cascade](./context-cascade.md)
- [Analyst Agent](../reference/agents/analyst.md)
