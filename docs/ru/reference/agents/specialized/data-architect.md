# 💾 Data Architect

> Database schema design and data migration specialist. Designs entity relationships, optimizes indexes, plans migrations, ensures data integrity. Handles normalization, backup/recovery strategies, and database performance tuning.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `data-architect` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 7/10 |
| **Домен** | Database Architecture |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `database_design`
- `schema_modeling`
- `data_migration`

### Дополнительные навыки

- `database_normalization`
- `index_optimization`
- `data_integrity`
- `backup_recovery`
- `data_lifecycle`
- `relationship_design`

## Интеграции (MCP)

- `supabase`
- `github`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `database`, `schema`, `migration`, `table`, `index`
- **Типы задач**: `database_design`, `data_migration`, `schema_design`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Артефакты

- `documentation`
- `code`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('data-architect')
```

---

[← Назад к списку агентов](./index.md)
