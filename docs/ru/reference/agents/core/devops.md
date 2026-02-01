# 🚀 DevOps

> Deployment, CI/CD, and infrastructure management. Handles deployment to Render/Vercel, manages CI/CD pipelines, monitors production systems, responds to incidents, and manages infrastructure. Ensures reliable operations.

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `devops` |
| **Категория** | Базовый |
| **Тип роли** | Исполнительный |
| **Приоритет** | 9/10 |
| **Домен** | DevOps & Infrastructure |

## Возможности

🚀 Может деплоить

## Навыки

### Обязательные навыки

- `deployment`
- `ci_cd`
- `infrastructure`
- `monitoring`

### Дополнительные навыки

- `incident_response`

## Интеграции (MCP)

- `render`
- `vercel`
- `github`
- `docker`
- `filesystem`
- `memory`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `deploy`, `deployment`, `ci/cd`, `ci`, `cd`
- **Типы задач**: `deployment`, `infrastructure`, `operations`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 4096 |

## Артефакты

- `deployment`
- `configuration`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('devops')
```

---

[← Назад к списку агентов](./index.md)
