# 🎭 UX Designer

> User experience design and prototyping specialist. Designs user flows, creates wireframes, conducts user research and testing, ensures usability, and prototypes interfaces. Focuses on user-centered design principles.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `ux-designer` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 5/10 |
| **Домен** | UX Design |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `user_flows`
- `wireframes`
- `usability`

### Дополнительные навыки

- `user_research`
- `prototyping`
- `user_testing`

## Интеграции (MCP)

- `filesystem`
- `figma`
- `memory`
- `context7`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `ux`, `user experience`, `wireframe`, `prototype`, `user flow`
- **Типы задач**: `design`, `ux`, `prototyping`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.4 |
| Max Tokens | 6144 |

## Артефакты

- `design`
- `wireframe`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('ux-designer')
```

---

[← Назад к списку агентов](./index.md)
