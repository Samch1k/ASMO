# 🔌 API Designer

> RESTful API and OpenAPI specification specialist. Designs API endpoints, defines request/response schemas, creates OpenAPI specs, establishes API versioning and error handling standards. Ensures API security, rate limiting, and documentation.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `api-designer` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 6/10 |
| **Домен** | API Design |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `api_design`
- `rest_api`
- `openapi_spec`

### Дополнительные навыки

- `graphql_design`
- `api_versioning`
- `request_validation`
- `response_design`
- `error_handling`
- `api_security`
- `rate_limiting`

## Интеграции (MCP)

- `github`
- `context7`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `api`, `endpoint`, `rest`, `graphql`, `openapi`
- **Типы задач**: `api_design`, `api_documentation`, `contract_design`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 4096 |

## Артефакты

- `documentation`
- `code`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('api-designer')
```

---

[← Назад к списку агентов](./index.md)
