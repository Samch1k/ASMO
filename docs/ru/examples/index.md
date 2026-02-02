# Примеры

Практические примеры использования ASMO.

## Быстрый старт

### Базовый Workflow

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

const result = await engine.execute('Реализовать функцию валидации email')
console.log(result)
```

## Доступные примеры

| Пример | Описание | Сложность |
|--------|----------|-----------|
| [Базовый Workflow](./basic-workflow.md) | Простой workflow | Начальный |
| [Адаптивный выбор](./adaptive-selection.md) | Автоматический выбор workflow | Средний |
| [Мульти-агент](./multi-agent.md) | Совместная работа агентов | Продвинутый |

## Структура примеров

Каждый пример включает:

1. **Описание задачи** — что мы реализуем
2. **Код** — полный рабочий пример
3. **Объяснение** — как это работает
4. **Результат** — ожидаемый output

## Запуск примеров

```bash
# Клонируйте репозиторий
git clone https://github.com/Samch1k/ASMO.git
cd ASMO

# Установите зависимости
pnpm install

# Запустите пример
pnpm tsx examples/basic-workflow.ts
```

## См. также

- [Быстрый старт](../getting-started/quick-start.md)
- [Концепции](../concepts/index.md)
- [Справочник API](../reference/api/index.md)
