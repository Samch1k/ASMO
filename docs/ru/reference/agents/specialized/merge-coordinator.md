# 🔀 Merge Coordinator

> Parallel agent output consolidation specialist. Merges results from multiple agents working in parallel, resolves conflicts intelligently using LLM reasoning, and produces unified output. Essential for parallel execution workflows.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `merge-coordinator` |
| **Категория** | Специализированный |
| **Тип роли** | Гибридный |
| **Приоритет** | 8/10 |
| **Домен** | Parallel Output Consolidation |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `conflict_resolution`
- `data_consolidation`

### Дополнительные навыки

- `decision_making`

## Интеграции (MCP)

- `memory`

## Правила активации

- **Тип**: Ручной вызов
- **Ключевые слова**: `merge results`, `consolidate`, `combine outputs`
- **Типы задач**: `coordination`, `consolidation`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.3 |
| Max Tokens | 8192 |

## Артефакты

- `consolidated`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('merge-coordinator')
```

---

[← Назад к списку агентов](./index.md)
