# 🧪 Tester

> Test creation and quality assurance. Creates unit tests, integration tests, E2E scenarios (Playwright), analyzes test coverage, reproduces bugs, and performs smoke testing. Ensures code quality through comprehensive testing.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `tester` |
| **Категория** | Базовый |
| **Тип роли** | Исполнительный |
| **Приоритет** | 8/10 |
| **Домен** | Testing & QA |

## Возможности

✏️ Может изменять код
🧪 Может запускать тесты

## Навыки

### Обязательные навыки

- `unit_testing`
- `e2e_testing`
- `test_coverage`

### Дополнительные навыки

- `bug_reproduction`
- `smoke_testing`
- `acceptance_testing`

## Интеграции (MCP)

- `filesystem`
- `playwright`
- `github`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `test`, `testing`, `e2e`, `playwright`, `coverage`
- **Типы задач**: `testing`, `quality_assurance`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Артефакты

- `test`
- `report`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('tester')
```

---

[← Назад к списку агентов](./index.md)
