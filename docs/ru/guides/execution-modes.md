# Двойной режим выполнения

ASMO поддерживает два режима выполнения: **Session** ($0) и **API** (оплата за использование).

## Обзор

| Режим | Стоимость | Лучше для | Провайдер |
|-------|-----------|-----------|-----------|
| **Session** | $0 | Разработка, тестирование | Подписка Claude |
| **API** | По токенам | Продакшн, автоматизация | Anthropic API |

## Session режим

Использует вашу подписку Claude — $0 затрат на API.

### Когда использовать
- Разработка и тестирование
- Интерактивные workflow
- Обучение и эксперименты
- Проекты с ограниченным бюджетом

### Конфигурация

```typescript
import { getSessionExecutor } from '@asmo/core'

const executor = getSessionExecutor({
  verbose: true,
  timeout: 120000,
  interactive: true
})
```

## API режим

Прямые вызовы Anthropic API с оплатой за токены.

### Когда использовать
- Продакшн деплой
- CI/CD пайплайны
- Автоматизированные workflow
- Высоконагруженная обработка

### Конфигурация

```typescript
import { getAPIExecutor } from '@asmo/core'

const executor = getAPIExecutor({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseUrl: 'https://api.anthropic.com',
  timeout: 120000,
  maxRetries: 3
})
```

## Унифицированный интерфейс

ExecutorFactory предоставляет единый интерфейс:

```typescript
import { getExecutorFactory } from '@asmo/core'

const factory = getExecutorFactory({
  preferredMode: 'auto'  // 'session' | 'api' | 'auto'
})

const result = await factory.execute({
  taskId: 'task-001',
  prompt: 'Реализовать аутентификацию',
  state: agentState,
  model: 'sonnet'
})

console.log(result.metrics.mode)  // 'session' или 'api'
```

## Auto режим

При `preferredMode: 'auto'`:
1. Сначала пробует Session (бесплатно)
2. Откатывается на API если доступен
3. По умолчанию Session

## Переопределение для задачи

```typescript
const result = await factory.execute({
  taskId: 'critical-task',
  prompt: 'Аудит безопасности',
  state: agentState,
  mode: 'api'  // Принудительно API
})
```

## Трекинг стоимости (API режим)

```typescript
if (result.metrics.mode === 'api') {
  console.log(`Токены: ${result.metrics.inputTokens} вход / ${result.metrics.outputTokens} выход`)
  console.log(`Стоимость: $${result.metrics.estimatedCost?.toFixed(4)}`)
}
```

## Лучшие практики

1. **Разработка**: Session режим для $0 затрат
2. **Продакшн**: API режим для надёжности
3. **Тестирование**: Session режим с мок-данными
4. **CI/CD**: API режим с алертами по бюджету
5. **Гибрид**: `auto` режим для гибкости
