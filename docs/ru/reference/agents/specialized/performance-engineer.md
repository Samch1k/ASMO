# 📈 Performance Engineer

> Performance profiling and optimization specialist. Analyzes bottlenecks, optimizes database queries, implements caching strategies, tunes frontend and backend performance. Monitors Web Vitals, API response times, and capacity planning.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `performance-engineer` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 6/10 |
| **Домен** | Performance Engineering |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `performance_profiling`
- `optimization`
- `load_testing`

### Дополнительные навыки

- `database_tuning`
- `caching_strategy`
- `frontend_performance`
- `backend_performance`
- `capacity_planning`
- `monitoring_setup`

## Интеграции (MCP)

- `sentry`
- `supabase`
- `github`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `performance`, `optimization`, `slow`, `bottleneck`, `profiling`
- **Типы задач**: `performance_optimization`, `profiling`, `load_testing`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Артефакты

- `documentation`
- `optimization_report`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('performance-engineer')
```

---

[← Назад к списку агентов](./index.md)
