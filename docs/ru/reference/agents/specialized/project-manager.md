# 📋 Project Manager

> Project planning and coordination specialist. Plans sprints, coordinates teams, tracks progress, manages risks, allocates resources, and communicates with stakeholders. Ensures projects are delivered on time and within scope.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `project-manager` |
| **Категория** | Специализированный |
| **Тип роли** | Гибридный |
| **Приоритет** | 5/10 |
| **Домен** | Project Management |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `sprint_planning`
- `coordination`
- `tracking`

### Дополнительные навыки

- `risk_management`
- `resource_allocation`
- `stakeholder_communication`

## Интеграции (MCP)

- `filesystem`
- `memory`
- `github`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `sprint`, `plan`, `project`, `coordinate`, `track`
- **Типы задач**: `planning`, `coordination`, `management`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.3 |
| Max Tokens | 4096 |

## Артефакты

- `plan`
- `report`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('project-manager')
```

---

[← Назад к списку агентов](./index.md)
