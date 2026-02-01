# 👨‍💻 Developer

> Feature implementation and code generation. Writes production-quality TypeScript/React code, implements features following TDD methodology, creates unit tests, and performs refactoring. Primary code execution role.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `developer` |
| **Категория** | Базовый |
| **Тип роли** | Исполнительный |
| **Приоритет** | 8/10 |
| **Домен** | Software Development |

## Возможности

✏️ Может изменять код
📋 Требует план

## Навыки

### Обязательные навыки

- `code_writing`
- `typescript_expert`
- `feature_implementation`
- `unit_testing`

### Дополнительные навыки

- `refactoring`
- `integration`

## Интеграции (MCP)

- `filesystem`
- `context7`
- `github`
- `memory`
- `supabase`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `implement`, `code`, `develop`, `feature`, `create function`
- **Типы задач**: `feature`, `refactor`, `enhancement`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 8192 |

## Артефакты

- `code`
- `test`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('developer')
```

---

[← Назад к списку агентов](./index.md)
