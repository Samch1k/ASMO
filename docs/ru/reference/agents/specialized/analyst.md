# Агент Analyst

Специалист по стратегическому анализу: маркетинговые исследования, конкурентный анализ, brainstorming.

## Обзор

Агент Analyst выполняет задачи стратегического анализа, включая маркетинговые исследования, конкурентный анализ, SWOT-анализ и креативные brainstorming-сессии. Генерирует структурированные документы анализа и рекомендации.

## Возможности

| Навык | Описание |
|-------|----------|
| `analysis` | Общий стратегический анализ |
| `research` | Маркетинговые и отраслевые исследования |
| `brainstorming` | Креативные сессии генерации идей |
| `market_analysis` | Размер рынка, тренды, сегменты |
| `competitive_analysis` | Сильные/слабые стороны конкурентов |
| `strategic_planning` | Разработка долгосрочной стратегии |
| `product_brief_creation` | Документы продуктового видения |
| `trend_analysis` | Выявление отраслевых трендов |

## Типы анализа

### Маркетинговый анализ
Анализирует размер рынка, рост, целевые сегменты, тренды и барьеры входа.

### Конкурентный анализ
Оценивает прямых/косвенных конкурентов, сильные и слабые стороны, возможности для дифференциации.

### Brainstorming
Генерирует креативные идеи с оценкой impact/feasibility и категоризацией.

### Product Brief
Создаёт документы стратегического продуктового видения с описанием проблемы, целевыми пользователями и метриками успеха.

### SWOT-анализ
Анализирует Strengths, Weaknesses, Opportunities, Threats со стратегическими выводами.

## Конфигурация

```yaml
# agents.yaml
analyst:
  id: analyst
  name: Analyst
  model_preference: sonnet
  role:
    id: analyst
    seniority: senior
    expertise:
      - market_research
      - strategic_analysis
      - competitive_intelligence
```

## Использование

```typescript
import { AnalystAgent } from '@asmo/core'

const analyst = new AnalystAgent()

const result = await analyst.execute({
  task: 'Выполнить конкурентный анализ для нашего SaaS-продукта',
  context: { industry: 'B2B Software' }
})

console.log(result.context.analysis.competitors)
console.log(result.context.analysis.recommendations)
```

## Выходные артефакты

Агент Analyst создаёт структурированные документы анализа в формате markdown:

- Отчёт маркетингового анализа
- Анализ конкурентного ландшафта
- Резюме Brainstorming-сессии
- Документ Product Brief
- Отчёт SWOT-анализа

## MCP интеграции

- **Memory MCP**: Сохраняет инсайты и результаты анализа для будущих ссылок
- **Context7 MCP**: Исследует рыночные данные и лучшие практики
- **Filesystem MCP**: Читает существующие документы и записывает отчёты

## См. также

- [Руководство по custom агентам](/docs/ru/guides/custom-agents.md)
- [Агент Product Owner](./product-owner.md)
- [Агент Business Analyst](./business-analyst.md)
