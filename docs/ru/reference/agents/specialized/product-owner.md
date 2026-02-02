# 🎯 Product Owner

> Product vision and prioritization specialist. Defines product strategy, creates roadmaps, prioritizes features, conducts market and competitive analysis. Represents user and business needs, makes product decisions.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `product-owner` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 7/10 |
| **Домен** | Product Management |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `strategy`
- `roadmap`
- `prioritization`

### Дополнительные навыки

- `market_analysis`
- `competitive_analysis`

## Интеграции (MCP)

- `filesystem`
- `memory`
- `github`
- `supabase`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `product`, `strategy`, `roadmap`, `prioritize`, `feature`
- **Типы задач**: `product`, `strategy`, `planning`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.4 |
| Max Tokens | 6144 |

## Артефакты

- `strategy`
- `roadmap`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('product-owner')
```

---

[← Назад к списку агентов](./index.md)
