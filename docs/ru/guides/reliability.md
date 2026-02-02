# Руководство по надёжности

ASMO включает встроенные механизмы надёжности: Circuit Breaker и Zod валидацию.

## Circuit Breaker

Предотвращает каскадные сбои, останавливая запросы к неработающим сервисам.

### Состояния

```
CLOSED → OPEN → HALF_OPEN → CLOSED
  │        │        │
  │        │        └─ Успех → Закрыть
  │        │        └─ Ошибка → Открыть снова
  │        │
  │        └─ После таймаута восстановления
  │
  └─ После достижения порога ошибок
```

### Базовое использование

```typescript
import { CircuitBreaker, CircuitOpenError } from '@asmo/core'

const breaker = new CircuitBreaker({
  failureThreshold: 5,      // Открыть после 5 ошибок
  recoveryTimeout: 30000,   // Попытка восстановления через 30с
  successThreshold: 2       // Закрыть после 2 успехов
})

try {
  const result = await breaker.execute(async () => {
    return await riskyOperation()
  })
} catch (error) {
  if (error instanceof CircuitOpenError) {
    console.log('Circuit открыт — запрос отклонён')
  }
}
```

### Конфигурация

```typescript
interface CircuitBreakerConfig {
  failureThreshold: number    // Ошибок для открытия (default: 5)
  recoveryTimeout: number     // Мс до восстановления (default: 30000)
  successThreshold: number    // Успехов для закрытия (default: 2)
  failureWindow: number       // Окно для ошибок (default: 60000)
  name?: string               // Для логирования
}
```

### Менеджер Circuit Breaker

```typescript
import { getCircuitBreakerManager } from '@asmo/core'

const manager = getCircuitBreakerManager()

// Получить или создать брейкеры по имени
const apiBreaker = manager.get('api-calls')
const dbBreaker = manager.get('database')

// Мониторинг всех
const allStats = manager.getAllStats()
console.log(allStats['api-calls'].state)
```

### События

```typescript
breaker.on((event) => {
  switch (event.type) {
    case 'state_change':
      console.log(`Состояние: ${event.previousState} → ${event.state}`)
      break
    case 'failure':
      console.log(`Ошибка: ${event.error?.message}`)
      break
    case 'success':
      console.log('Успех!')
      break
  }
})
```

## Валидация входа/выхода

Валидация на основе Zod для типобезопасности.

### Встроенные схемы

```typescript
import {
  TaskInputSchema,
  AgentStateSchema,
  AgentOutputSchema
} from '@asmo/core'

const result = TaskInputSchema.safeParse(input)
if (!result.success) {
  console.log(result.error.issues)
}
```

### Input Validator

```typescript
import { getInputValidator } from '@asmo/core'

const validator = getInputValidator()

const result = validator.validateTaskInput({
  id: 'task-001',
  description: 'Создать фичу',
  complexity: { score: 50, level: 'medium' }
})

if (result.success) {
  console.log(result.data)  // Типизированные данные
} else {
  console.log(result.errorMessage)
}
```

### Middleware валидации

```typescript
import { withValidation } from '@asmo/core'
import { z } from 'zod'

const inputSchema = z.object({ value: z.number() })
const outputSchema = z.object({ result: z.number() })

const safeDouble = withValidation(
  inputSchema,
  outputSchema,
  async (input) => ({ result: input.value * 2 })
)

// Бросает ValidationError если невалидно
const result = await safeDouble({ value: 5 })
```

## Лучшие практики

### Circuit Breaker
1. Используйте отдельные брейкеры для сервисов (API, DB, и т.д.)
2. Устанавливайте пороги в соответствии с SLA
3. Мониторьте изменения состояния
4. Обрабатывайте `CircuitOpenError` корректно

### Валидация
1. Валидируйте на границах системы
2. Используйте встроенные схемы когда возможно
3. Создавайте переиспользуемые кастомные схемы
4. Обрабатывайте ошибки валидации явно
