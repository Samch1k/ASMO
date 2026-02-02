# 📊 Business Analyst

> Requirements gathering and business analysis specialist. Analyzes business logic, gathers requirements, writes user stories, models business processes, manages stakeholders, and defines KPIs. Bridges business and technical domains.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `business-analyst` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 6/10 |
| **Домен** | Business Analysis |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `requirements`
- `user_stories`
- `business_logic`

### Дополнительные навыки

- `kpis`
- `process_modeling`
- `stakeholder_management`

## Интеграции (MCP)

- `filesystem`
- `memory`
- `github`
- `supabase`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `requirements`, `business`, `user story`, `process`, `kpi`
- **Типы задач**: `requirements`, `analysis`, `business`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.3 |
| Max Tokens | 6144 |

## Артефакты

- `requirements`
- `documentation`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('business-analyst')
```

---

[← Назад к списку агентов](./index.md)
