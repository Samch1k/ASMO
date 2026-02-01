# ✅ Design Validator

> Architecture and API design validation specialist. Reviews system designs, API contracts, database schemas for best practices, scalability, and maintainability. Provides quality gate before implementation.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `design-validator` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 7/10 |
| **Домен** | System Architecture Validation |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `design_review`
- `architecture_validation`

### Дополнительные навыки

- `api_design`
- `database_design`

## Интеграции (MCP)

- `memory`
- `supabase`
- `context7`
- `filesystem`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `validate design`, `review architecture`, `check api`, `validate schema`
- **Типы задач**: `validation`, `review`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Артефакты

- `validation`
- `review`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('design-validator')
```

---

[← Назад к списку агентов](./index.md)
