# API-контракт

## CLI-команды

ASMO предоставляет функциональность через CLI `asmo` (пакет: `@asmo/cli`, точка входа: `packages/cli/bin/asmo.js`).

### asmo run

Выполнение задачи с автоматическим выбором workflow.

```bash
asmo run "<задача>"                    # По умолчанию: Session-режим
asmo run "<задача>" --use-api          # Принудительный API-режим
asmo run "<задача>" --no-llm           # Только эвристики (оффлайн)
asmo run "<задача>" --verbose          # Детальное логирование
asmo run "<задача>" --dry-run          # Только анализ, без выполнения
asmo run "<задача>" --workflow <name>  # Ручной выбор workflow
```

**Вывод:** Индикаторы прогресса при выполнении, затем финальное резюме с результатом: статус, использованные агенты, длительность, созданные артефакты.

### asmo suggest

Получение рекомендации по workflow без выполнения.

```bash
asmo suggest "<задача>"
```

**Вывод (JSON):**

```json
{
  "useAsmo": true,
  "confidence": 0.85,
  "workflow": "bug_fix_workflow",
  "agents": ["debugger", "developer", "tester"],
  "complexity": {
    "score": 42,
    "level": "medium"
  },
  "reasoning": "Задача включает отладку и исправление в нескольких файлах"
}
```

### asmo analyze

Только анализ сложности.

```bash
asmo analyze "<задача>"
asmo analyze "<задача>" --json         # Машиночитаемый вывод
```

**Вывод:** Оценка сложности (0--100), уровень, разбивка факторов, рекомендованный workflow и агенты.

### asmo workflow

Список или выполнение конкретного workflow.

```bash
asmo workflow                        # Список всех 27 workflow
asmo workflow <name>                 # Детали workflow
asmo workflow <name> --task "<task>" # Выполнение конкретного workflow
```

### asmo task

Команды управления задачами.

```bash
asmo task list                       # Список отслеживаемых задач
asmo task status <id>                # Проверка статуса задачи
```

## Программный API (@asmo/core)

### WorkflowEngine

Основная точка входа для оркестрации. Рекомендуемый фабричный метод -- `WorkflowEngine.create()`.

```typescript
import { WorkflowEngine } from '@asmo/core'

// Создание и инициализация
const engine = WorkflowEngine.create(registry)
await engine.initialize()

// Выполнение задачи с автоматическим выбором workflow
const result = await engine.execute(task, initialState?, context?)

// Адаптивный выбор workflow (без выполнения)
const workflow = await engine.selectWorkflowAdaptively(task, context?, preference?)

// Выполнение в party-режиме (мультиагентная коллаборация)
const partyResult = await engine.executePartyMode(
  topic,
  agents,
  moderator?,
  options?
)
```

### ComplexityAnalyzer

Оценка сложности задачи по шкале 0--100.

```typescript
import { ComplexityAnalyzer } from '@asmo/core'

const analyzer = new ComplexityAnalyzer()
const score = await analyzer.analyzeTask(task, context?)

// score: { score: 42, level: 'medium', confidence: 0.85, ... }
```

### DynamicOrchestrator

Низкоуровневая оркестрация с превью маршрутизации.

```typescript
import { getDynamicOrchestrator } from '@asmo/core'

const orchestrator = getDynamicOrchestrator(options?)

// Превью маршрутизации без выполнения
const preview = orchestrator.previewRouting(task)

// Выполнение с полной оркестрацией
const result = await orchestrator.executeTask(task)
```

### ExecutorFactory

Прямое выполнение агента без накладных расходов workflow.

```typescript
import { getExecutorFactory } from '@asmo/core'

const factory = getExecutorFactory(options?)
const result = await factory.execute({
  taskId: 'task-123',
  prompt: 'Исправить null pointer в UserService',
  state: {},
  model: 'sonnet'
})
```

### LLM Provider

Прямой доступ к слою абстракции LLM.

```typescript
import { getLLMProvider } from '@asmo/core'

const provider = getLLMProvider()

// Простое завершение
const response = await provider.complete(prompt, options?)

// Структурированный JSON-ответ
const json = await provider.completeJSON(prompt, schema, options?)
```

## Справочник CLI-флагов

| Флаг | Тип | По умолчанию | Описание |
|------|-----|-------------|----------|
| `--use-api` | boolean | `false` | Принудительный режим Anthropic API (требует `ANTHROPIC_API_KEY`) |
| `--no-llm` | boolean | `false` | Отключить LLM, использовать только keyword-эвристики |
| `--verbose` | boolean | `false` | Включить детальное логирование |
| `--dry-run` | boolean | `false` | Анализ и план без выполнения |
| `--workflow` | string | auto | Ручной выбор workflow (пропуск автовыбора) |
| `--json` | boolean | `false` | Вывод в формате JSON (где поддерживается) |

## Обработка ошибок

Все CLI-команды возвращают структурированные ошибки:

| Код выхода | Значение |
|-----------|----------|
| 0 | Успех |
| 1 | Ошибка выполнения (ошибка агента или workflow) |
| 2 | Невалидный ввод (ошибка валидации) |
| 3 | Ошибка конфигурации (отсутствует конфигурация, некорректный шаблон) |
| 4 | LLM-провайдер недоступен (все режимы не сработали) |

## Связанные документы

- [Обзор архитектуры](./README.md)
- [Модель данных](./data-model.md)
- [Карта интеграций](./integration-map.md)
