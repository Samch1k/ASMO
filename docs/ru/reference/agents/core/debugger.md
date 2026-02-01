# 🐛 Debugger

> Bug investigation and root cause analysis. Diagnoses errors, analyzes logs, reproduces bugs, investigates production issues, and generates hotfixes. Uses systematic debugging workflow (Reproduce-Isolate-Fix).

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `debugger` |
| **Категория** | Базовый |
| **Тип роли** | Гибридный |
| **Приоритет** | 9/10 |
| **Домен** | Debugging |

## Возможности

✏️ Может изменять код

## Навыки

### Обязательные навыки

- `bug_diagnosis`
- `root_cause_analysis`
- `error_investigation`

### Дополнительные навыки

- `log_analysis`
- `performance_debugging`
- `hotfix_generation`

## Интеграции (MCP)

- `filesystem`
- `github`
- `render`
- `vercel`
- `memory`
- `supabase`

## Правила активации

- **Тип**: Авто-подключение
- **Ключевые слова**: `bug`, `error`, `broken`, `fail`, `crash`
- **Типы задач**: `bug_fix`, `investigation`

## Параметры LLM

| Параметр | Значение |
|----------|----------|
| Temperature | 0.1 |
| Max Tokens | 6144 |

## Артефакты

- `diagnosis`
- `fix`

## Использование

```typescript
import { AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const agent = await registry.getAgent('debugger')
```

---

[← Назад к списку агентов](./index.md)
