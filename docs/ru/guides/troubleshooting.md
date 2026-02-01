# Решение проблем

Решения типичных проблем при использовании AI1st.

## Проблемы установки

### Cannot find module '@ai1st/core'

**Причина:** Пакет не установлен или устаревшая версия Node.js.

**Решение:**
```bash
# Проверьте версию Node.js (должна быть 18+)
node --version

# Переустановите пакет
pnpm install @ai1st/core

# Очистите кэш при необходимости
pnpm store prune
pnpm install
```

### Ошибки TypeScript

**Решение:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true
  }
}
```

## Проблемы с базой данных

### Database connection failed

**Причина:** PostgreSQL не запущен или неверная строка подключения.

**Решение:**
```bash
# Проверьте работу PostgreSQL
pg_isready

# Тест подключения
psql $DATABASE_URL -c "SELECT 1"

# Проверьте формат строки подключения
# postgresql://user:password@host:port/database
```

## Проблемы с Workflows

### Workflow not found

**Решение:**
```typescript
// Список доступных workflows
const workflows = engine.getWorkflows()
console.log(workflows.map(w => w.id))

// Проверьте регистрацию
await engine.initialize()  // Загружает встроенные workflows
engine.registerWorkflow(customWorkflow)  // Добавляет кастомный
```

### Timeout workflow

**Решение:**
```typescript
// Увеличьте timeout в определении workflow
{
  "timeout": "60m"  // Увеличить с дефолтного
}

// Или глобально
config.set('timeouts.default', 3600000)  // 1 час
```

## Проблемы с агентами

### Агент не активируется

**Решение:**
```typescript
// Проверьте правила активации
const agent = await registry.getAgent('developer')
console.log(agent.activation_rules.trigger_keywords)

// Принудительно включите агента
const result = await engine.execute(task, undefined, {
  includeAgents: ['developer']
})
```

## Проблемы анализа сложности

### Всегда одинаковая сложность

**Причина:** Отсутствует контекст.

**Решение:**
```typescript
// Предоставьте контекст проекта
const selection = await engine.selectWorkflowAdaptively(task, {
  projectSize: 'large',
  techStack: ['React', 'Node.js'],
  hasTests: true
})
```

### YOLO mode не активируется

**Решение:**
```bash
# Проверьте настройки
export AI1ST_YOLO_ENABLED=true
export AI1ST_YOLO_THRESHOLD=30
```

## Проблемы Party Mode

### Низкая конвергенция

**Решение:**
```typescript
// Уменьшите агентов или увеличьте раунды
const session = await engine.executePartyMode(
  task,
  ['architect', 'developer'],  // Меньше агентов
  undefined,
  {
    maxRounds: 5,  // Больше раундов
    convergenceThreshold: 0.6  // Ниже порог
  }
)
```

## Получение помощи

Если эти решения не помогли:

1. **Включите логи:** `export AI1ST_LOG_LEVEL=debug`
2. **Поищите issues:** [GitHub Issues](https://github.com/Samch1k/ai1st-orchestration/issues)
3. **Создайте issue:** включите сообщение об ошибке, шаги воспроизведения и детали окружения

## См. также

- [Конфигурация](../getting-started/configuration.md)
- [Установка](../getting-started/installation.md)
