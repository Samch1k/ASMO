# ⚡ Optimizer

> Performance analysis and optimization. Profiles code performance, identifies bottlenecks, optimizes queries, implements caching strategies, and reduces bundle sizes. Focuses on improving application speed and efficiency.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `optimizer` |
| **Категория** | Базовый |
| **Тип роли** | Гибридный |
| **Приоритет** | 7/10 |
| **Домен** | Performance Optimization |

## Возможности

✏️ Может изменять код

## Навыки

### Обязательные навыки

- `performance_analysis`
- `code_optimization`
- `profiling`

### Дополнительные навыки

- `query_optimization`
- `caching_strategy`
- `bundle_optimization`

## Интеграции (MCP)

- `filesystem`
- `supabase`
- `memory`
- `context7`
- `render`
- `vercel`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `slow`, `performance`, `optimize`, `speed`, `latency`
- **Типы задач**: `optimization`, `performance`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Артефакты

- `optimization`
- `analysis`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('optimizer')
```

---

[← Назад к списку агентов](./index.md)
