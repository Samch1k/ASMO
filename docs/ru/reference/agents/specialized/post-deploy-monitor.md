# 👁️ Post-Deploy Monitor

> Deployment health and smoke testing specialist. Monitors application health after deployment, runs smoke tests, checks error rates and performance metrics, and triggers rollback if critical issues detected.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `post-deploy-monitor` |
| **Категория** | Специализированный |
| **Тип роли** | Аналитический |
| **Приоритет** | 9/10 |
| **Домен** | Deployment Monitoring |

## Возможности

- Стандартные возможности агента

## Навыки

### Обязательные навыки

- `health_monitoring`
- `performance_validation`

### Дополнительные навыки

- `smoke_testing`
- `incident_response`

## Интеграции (MCP)

- `memory`
- `supabase`
- `render`
- `vercel`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `monitor deployment`, `health check`, `smoke test`, `verify deployment`
- **Типы задач**: `monitoring`, `validation`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Артефакты

- `report`
- `alert`

## Использование

```typescript
import { AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('post-deploy-monitor')
```

---

[← Назад к списку агентов](./index.md)
