# 📝 Requirements Validator

> Requirements quality assurance specialist. Validates requirements using INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable), checks completeness, identifies missing edge cases. Quality gate before design phase.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `requirements-validator` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 7/10 |
| **Домен** | Requirements Quality Assurance |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `requirements_validation`
- `quality_assurance`

### Дополнительные навыки

- `completeness_checking`

## Интеграции (MCP)

- `memory`
- `filesystem`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `validate requirements`, `check requirements`, `review requirements`
- **Типы задач**: `validation`, `quality_assurance`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 6144 |

## Артефакты

- `validation`
- `report`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('requirements-validator')
```

---

[← Назад к списку агентов](./index.md)
