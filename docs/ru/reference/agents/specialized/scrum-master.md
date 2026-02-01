# 🔄 Scrum Master

> Agile ceremonies and sprint management specialist. Facilitates sprint planning, daily standups, retrospectives, and backlog refinement. Tracks velocity, resolves impediments, coaches team on Agile practices.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `scrum-master` |
| **Категория** | Специализированный |
| **Тип роли** | Гибридный |
| **Приоритет** | 6/10 |
| **Домен** | Agile/Scrum Management |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `sprint_planning`
- `backlog_management`
- `agile_ceremonies`

### Дополнительные навыки

- `impediment_resolution`
- `velocity_tracking`
- `retrospective_facilitation`
- `story_estimation`
- `team_coaching`

## Интеграции (MCP)

- `github`
- `memory`
- `linear`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `sprint`, `scrum`, `agile`, `standup`, `retrospective`
- **Типы задач**: `sprint_planning`, `agile_management`, `team_facilitation`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.2 |
| Max Tokens | 4096 |

## Артефакты

- `documentation`
- `report`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('scrum-master')
```

---

[← Назад к списку агентов](./index.md)
