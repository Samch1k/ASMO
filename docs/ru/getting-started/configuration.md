# Конфигурация

AI1st использует 3-уровневую систему конфигурации для гибкой настройки.

## Иерархия конфигурации

1. **Встроенные значения** — разумные значения по умолчанию
2. **Файлы конфигурации** — проектные настройки в `.ai1st/config/`
3. **Переменные окружения** — переопределения в runtime

Более высокие уровни переопределяют более низкие.

## Файлы конфигурации

Создайте директорию `.ai1st/config/` в корне проекта.

### Конфигурация оркестрации

```typescript
// .ai1st/config/orchestration.config.ts
export default {
  // Таймауты агентов в миллисекундах
  timeouts: {
    architect: 300000,    // 5 минут
    developer: 900000,    // 15 минут
    tester: 480000,       // 8 минут
    devops: 600000,       // 10 минут
    default: 300000       // 5 минут по умолчанию
  },

  // Настройки параллельного выполнения
  parallel: {
    maxAgents: 3,         // Макс. одновременных агентов
    enabled: true         // Включить параллельное выполнение
  },

  // Настройки утверждения
  approvalRequired: true,  // Требовать утверждение на checkpoint'ах

  // Обучение и метрики
  learningEnabled: true,   // Отслеживать и учиться
  metricsEnabled: true     // Собирать метрики производительности
}
```

### Конфигурация Workflows

```typescript
// .ai1st/config/workflows.config.ts
export default {
  // Workflow по умолчанию для разных уровней сложности
  defaultWorkflows: {
    trivial: 'bug_fix_workflow',
    simple: 'bug_fix_workflow',
    medium: 'feature_implementation_full',
    complex: 'architecture_design',
    enterprise: 'architecture_design'
  },

  // Настройки YOLO mode
  yoloMode: {
    enabled: true,
    complexityThreshold: 30,  // Авто-утверждение для задач ниже этого балла
    excludedWorkflows: ['security_audit', 'database_migration']
  },

  // Настройки адаптивного выбора
  adaptiveSelection: {
    enabled: true,
    confidenceThreshold: 0.7,
    fallbackWorkflow: 'feature_implementation_full'
  }
}
```

## Переменные окружения

### Основные настройки

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `AI1ST_LOG_LEVEL` | Уровень логирования (debug, info, warn, error) | `info` |
| `AI1ST_CONFIG_PATH` | Путь к директории конфигурации | `.ai1st/config` |

### YOLO Mode

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `AI1ST_YOLO_ENABLED` | Включить YOLO mode | `true` |
| `AI1ST_YOLO_THRESHOLD` | Порог сложности для YOLO | `30` |
| `AI1ST_YOLO_AUDIT` | Включить аудит | `true` |

### База данных

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `DATABASE_URL` | Строка подключения PostgreSQL | - |
| `AI1ST_CACHE_SIZE` | Размер LRU кэша | `1000` |
| `AI1ST_CACHE_TTL` | TTL кэша в секундах | `300` |

### LLM

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `ANTHROPIC_API_KEY` | API ключ Anthropic | - |
| `AI1ST_LLM_MODEL` | LLM модель по умолчанию | `claude-3-sonnet` |
| `AI1ST_LLM_TEMPERATURE` | Temperature по умолчанию | `0.2` |

## Программная конфигурация

```typescript
import { WorkflowEngine, AgentRegistry, ConfigManager } from '@ai1st/core'

// Получаем менеджер конфигурации
const config = ConfigManager.getInstance()

// Устанавливаем опции
config.set('yoloMode.enabled', true)
config.set('yoloMode.complexityThreshold', 25)
config.set('parallel.maxAgents', 5)

// Инициализируем с кастомной конфигурацией
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry, {
  config: {
    timeouts: {
      default: 600000  // 10 минут
    }
  }
})

await engine.initialize()
```

## Лучшие практики

1. **Используйте переменные окружения для секретов** — никогда не коммитьте API ключи
2. **Начинайте с defaults** — переопределяйте только то, что нужно
3. **Используйте конфиги для командных настроек** — коммитьте `.ai1st/config/`
4. **Тестируйте изменения** — проверяйте перед деплоем

## Следующие шаги

- [Концепции](../concepts/index.md) — как работает AI1st
- [YOLO Mode](../guides/yolo-mode.md) — настройка автоматических утверждений
- [Кастомные агенты](../guides/custom-agents.md) — создание своих агентов
