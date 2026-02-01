# 🏗️ Architect

> System architecture and design decisions. Creates architectural decision records (ADRs), designs system components, evaluates technologies, and models data structures. Focuses on long-term technical vision and scalability.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `architect` |
| **Категория** | Базовый |
| **Тип роли** | Аналитический |
| **Приоритет** | 10/10 |
| **Домен** | System Architecture |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `system_design`
- `architecture_decisions`
- `adr_creation`
- `data_modeling`

### Дополнительные навыки

- `technology_evaluation`
- `scalability_planning`

## Интеграции (MCP)

- `filesystem`
- `context7`
- `memory`
- `github`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `design`, `architecture`, `architect`, `adr`, `system design`
- **Типы задач**: `architecture`, `planning`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.3 |
| Max Tokens | 8192 |

## Артефакты

- `architecture`
- `documentation`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('architect')
```

---

[← Назад к списку агентов](./index.md)
