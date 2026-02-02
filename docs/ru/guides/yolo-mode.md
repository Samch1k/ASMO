# YOLO Mode

YOLO (You Only Live Once) Mode включает автоматический bypass утверждений для простых, низкорисковых задач.

## Обзор

Для тривиальных задач (оценка сложности < 30), YOLO Mode:

- **Пропускает checkpoint'ы утверждения** — без подтверждений
- **Ускоряет выполнение** — пропуск несущественных шагов
- **Ведёт аудит** — все действия логируются
- **Снижает friction** — простые задачи выполняются мгновенно

## Когда YOLO Mode активируется

```
Описание задачи → Анализ сложности → Оценка < 30 → YOLO Mode
                                              ↓
                                     Выполнение без утверждений
```

## Примеры

### YOLO включен (оценка: 15)

```typescript
const result = await engine.execute('Исправить опечатку в README')
// Сложность: 15 (trivial)
// YOLO Mode: включен
// Выполняется сразу без запросов утверждения
```

### YOLO выключен (оценка: 65)

```typescript
const result = await engine.execute('Добавить OAuth2 аутентификацию')
// Сложность: 65 (complex)
// YOLO Mode: выключен
// Требует утверждения на checkpoint'ах
```

## Конфигурация

### Переменные окружения

```bash
# Включить/выключить YOLO mode
export ASMO_YOLO_ENABLED=true

# Установить порог сложности (по умолчанию: 30)
export ASMO_YOLO_THRESHOLD=30

# Включить аудит
export ASMO_YOLO_AUDIT=true
```

### Файл конфигурации

```typescript
// .asmo/config/workflows.config.ts
export default {
  yoloMode: {
    enabled: true,
    complexityThreshold: 30,
    auditEnabled: true,
    excludedWorkflows: ['security_audit', 'database_migration']
  }
}
```

## Исключённые Workflows

Некоторые workflows никогда не должны использовать YOLO Mode:

```typescript
excludedWorkflows: [
  'security_audit',      // Безопасность требует ревью
  'database_migration',  // Изменения данных требуют утверждения
  'architecture_design'  // Важные решения требуют ревью
]
```

## Аудит

Все YOLO-выполнения логируются:

```typescript
interface YoloAuditRecord {
  taskId: string
  complexityScore: number
  timestamp: Date
  bypassedCheckpoints: string[]
  outcome: 'success' | 'failure' | 'pending'
}
```

### Доступ к истории аудита

```typescript
import { YoloModeManager } from '@asmo/core'

const yoloManager = new YoloModeManager()
const history = yoloManager.getAuditHistory(10)

for (const record of history) {
  console.log(`Задача: ${record.taskId}`)
  console.log(`Оценка: ${record.complexityScore}`)
  console.log(`Пропущено: ${record.bypassedCheckpoints.join(', ')}`)
  console.log(`Результат: ${record.outcome}`)
}
```

## Когда YOLO безопасен

- Исправление опечаток и текста
- Простые баг-фиксы с очевидным решением
- Добавление console.log для отладки
- Обновление значений конфигурации
- Мелкие стилевые правки

## Когда YOLO рискован

- Изменения, связанные с безопасностью
- Модификации базы данных
- Изменения API контрактов
- Breaking changes
- Production деплои

## Лучшие практики

1. **Начинайте консервативно** — с порогом по умолчанию (30)
2. **Мониторьте результаты** — регулярно проверяйте аудит
3. **Исключайте критичные workflows** — никогда YOLO для безопасности или данных
4. **Настраивайте по результатам** — корректируйте порог по success rate
5. **Анализируйте ошибки** — исследуйте YOLO failures

## См. также

- [Анализ сложности](../concepts/complexity.md)
- [Адаптивный Workflow](./adaptive-workflow.md)
- [Конфигурация](../getting-started/configuration.md)
