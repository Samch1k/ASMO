# Глобальный план запуска ASMO

## Текущее состояние

| Метрика | Значение | Цель |
|---------|----------|------|
| `@ts-nocheck` | **0** ✅ | 0 ✅ |
| Использований `any` | ~398 | <50 |
| `console.log` | ~430 | 0 (structured logging) |
| TODO/FIXME | 7 | 0 |
| Тестов | 25 файлов / 390 тестов ✅ | Больше |
| Тестов агентов | 4 файла | 28 файлов |
| CLI работает | ✅ | ✅ |
| Workflow execution | ✅ Работает | ✅ Работает |
| LLM через подписку | ✅ SessionProvider | ✅ По умолчанию |
| LangChain | ✅ Удалён (22 пакета) | Удалён ✅ |

---

## Блоки работ

```
┌─────────────────────────────────────────────────────────────────┐
│                    ASMO LAUNCH ROADMAP                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  БЛОК A: LLM Provider + Удаление LangChain    [16-26 ч]        │
│  ════════════════════════════════════════                       │
│  • ILLMProvider интерфейс                                       │
│  • SessionProvider (claude CLI, $0)                             │
│  • AnthropicProvider (API)                                      │
│  • Миграция 28 агентов                                          │
│  • Удаление LangChain (~11 MB)                                  │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  БЛОК B: Workflow Execution                   [8-12 ч]         │
│  ══════════════════════════════                                 │
│  • CLI workflow команда (реальное выполнение)                   │
│  • Интеграция DynamicOrchestrator с CLI                         │
│  • Тестирование E2E workflow                                    │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  БЛОК C: Code Quality                         [15-20 ч]        │
│  ════════════════════════                                       │
│  • Уменьшение `any` (398 → <50)                                 │
│  • Structured logging (430 console.log → logger)                │
│  • Исправление TODO/FIXME (7 штук)                              │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  БЛОК D: Testing                              [10-15 ч]        │
│  ═══════════════                                                │
│  • Тесты для 28 агентов                                         │
│  • E2E тесты workflow                                           │
│  • Integration тесты                                            │
│                                                                 │
│                         ↓                                       │
│                                                                 │
│  БЛОК E: Documentation & Polish              [5-8 ч]           │
│  ═══════════════════════════════                                │
│  • README обновление                                            │
│  • docs/USING-ASMO.md                                           │
│  • Примеры использования                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    🚀 ASMO READY FOR LAUNCH
```

---

## БЛОК A: LLM Provider + Удаление LangChain

**Статус:** ✅ ЗАВЕРШЁН
**Время:** ~8 часов
**Детали:** см. `docs/internal/LLM-PROVIDER-PLAN.md`

### Подзадачи

| # | Задача | Время | Статус |
|---|--------|-------|--------|
| A.1 | Типы (Message, ILLMProvider) | 1-2ч | ✅ |
| A.2 | SessionLLMProvider (claude CLI) | 2-3ч | ✅ |
| A.3 | AnthropicLLMProvider (SDK) | 2-3ч | ✅ |
| A.4 | LLMProviderFactory | 1-2ч | ✅ |
| A.5 | Обновить BaseAgent (callLLM) | 2-3ч | ✅ |
| A.6 | Миграция 27 агентов | 6-10ч | ✅ |
| A.7 | Удалить LangChain, cleanup | 1-2ч | ✅ |
| A.8 | YAML конфиг провайдера | 2-3ч | ⬜ (опционально) |

### Результат блока A

- ✅ Работает через подписку Claude ($0)
- ✅ API как опция (@anthropic-ai/sdk)
- ✅ LangChain удалён (22 пакета, ~11 MB)
- ✅ Расширяемо для других провайдеров

---

## БЛОК B: Workflow Execution

**Статус:** ✅ ЗАВЕРШЁН
**Время:** ~3 часа
**Зависит от:** Блок A ✅

### Подзадачи

| # | Задача | Время | Статус |
|---|--------|-------|--------|
| B.1 | Интегрировать DynamicOrchestrator в CLI | 3-4ч | ✅ |
| B.2 | Загрузка workflows из YAML/файлов | 2-3ч | ✅ |
| B.3 | Регистрация агентов в CLI | 2-3ч | ✅ |
| B.4 | Progress output во время выполнения | 1-2ч | ✅ |

### Файлы изменённые

```
packages/cli/src/commands/workflow.ts  # ✅ Полностью переработан
packages/cli/src/index.ts              # ✅ Добавлен --verbose
```

### Результат блока B

```bash
# Работает:
asmo workflow
# Показывает список доступных workflows

asmo workflow bug-fix --task "Fix login button" --dry-run
# Показывает план выполнения

asmo workflow bug-fix --task "Fix login button" --verbose
# Выполняет реальный workflow: debugger → developer → tester

asmo workflow feature --task "Add user profile page"
# Выполняет цепочку: architect → developer → tester

asmo workflow analyze --task "Analyze the code"
# Выполняет анализ через agent analyst
```

### Архитектура workflow

```
CLI (workflow.ts)
  ├─ Built-in workflows (bug-fix, feature, analyze, review)
  ├─ CLIAgentRegistry (8 агентов)
  └─ DynamicOrchestrator
       ├─ TaskRouter (выбор модели)
       ├─ AgentExecutor (retry, timeout)
       └─ SimpleCLIAgent (LLM calls)

---

## БЛОК C: Code Quality

**Статус:** Частично (0 @ts-nocheck)
**Время:** 15-20 часов
**Зависит от:** Блок A (миграция агентов уменьшит `any`)

### Подзадачи

| # | Задача | Время | Статус |
|---|--------|-------|--------|
| C.1 | Создать Logger utility | 2-3ч | ⬜ |
| C.2 | Заменить console.log (430 шт) | 6-8ч | ⬜ |
| C.3 | Уменьшить `any` (398 → <50) | 5-7ч | ⬜ |
| C.4 | Исправить TODO/FIXME (7 шт) | 2-3ч | ⬜ |

### C.1 Logger utility

**Файл:** `packages/core/src/utils/logger.ts`

```typescript
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

export interface Logger {
  debug(message: string, context?: Record<string, any>): void
  info(message: string, context?: Record<string, any>): void
  warn(message: string, context?: Record<string, any>): void
  error(message: string, error?: Error, context?: Record<string, any>): void
}

export function createLogger(component: string): Logger {
  // Structured logging implementation
}
```

### Результат блока C

- ✅ 0 `console.log` (structured logging)
- ✅ <50 использований `any`
- ✅ 0 TODO/FIXME

---

## БЛОК D: Testing

**Статус:** Частично (390 тестов, но мало для агентов)
**Время:** 10-15 часов
**Зависит от:** Блок A, B

### Подзадачи

| # | Задача | Время | Статус |
|---|--------|-------|--------|
| D.1 | Unit тесты LLMProvider | 2-3ч | ⬜ |
| D.2 | Unit тесты для агентов (28 шт) | 5-7ч | ⬜ |
| D.3 | Integration тесты orchestrator | 2-3ч | ⬜ |
| D.4 | E2E тесты workflow | 2-3ч | ⬜ |

### Текущее покрытие

```
tests/
├── orchestration/         # 21 файл ✅
├── agents/
│   ├── core-agents.test.ts        # ✅
│   ├── specialized-agents.test.ts # ✅
│   ├── business-roles.test.ts     # ✅
│   └── validation-roles.test.ts   # ✅
└── llm/                   # 0 файлов ⬜ (новое)
```

### Результат блока D

- ✅ >500 тестов
- ✅ Покрытие агентов
- ✅ E2E тесты workflow

---

## БЛОК E: Documentation & Polish

**Статус:** Не начат
**Время:** 5-8 часов
**Зависит от:** Блоки A-D

### Подзадачи

| # | Задача | Время | Статус |
|---|--------|-------|--------|
| E.1 | Обновить README.md | 1-2ч | ⬜ |
| E.2 | Создать docs/USING-ASMO.md | 2-3ч | ⬜ |
| E.3 | Примеры в examples/ | 2-3ч | ⬜ |

### docs/USING-ASMO.md

```markdown
# Использование ASMO

## Установка
## Конфигурация
## Команды CLI
  - asmo analyze
  - asmo workflow
  - asmo task
## Программное использование
## Примеры
## Troubleshooting
```

---

## Общая оценка времени

| Блок | Время | Накопительно |
|------|-------|--------------|
| A. LLM Provider + LangChain removal | 16-26ч | 16-26ч |
| B. Workflow Execution | 8-12ч | 24-38ч |
| C. Code Quality | 15-20ч | 39-58ч |
| D. Testing | 10-15ч | 49-73ч |
| E. Documentation | 5-8ч | 54-81ч |
| **Итого** | **54-81ч** | |

**При 8ч/день:** 7-10 рабочих дней
**При 4ч/день:** 14-20 рабочих дней

---

## Приоритеты

### MVP (Минимальный запуск)

Для базового dog-fooding достаточно:

| Блок | Нужен для MVP? |
|------|----------------|
| A. LLM Provider | ✅ Да (критично) |
| B. Workflow Execution | ✅ Да (основной функционал) |
| C. Code Quality | ⚠️ Частично (можно после) |
| D. Testing | ⚠️ Частично (можно после) |
| E. Documentation | ❌ Нет (можно после) |

**MVP = Блок A + Блок B = 24-38 часов**

### Post-MVP

- Code Quality (C)
- Полное тестирование (D)
- Документация (E)

---

## Порядок выполнения

```
Неделя 1:
├── Блок A (LLM Provider)
│   ├── Пн-Вт: Фазы 1-2 (типы, провайдеры)
│   ├── Ср: Фаза 3 (BaseAgent)
│   ├── Чт-Пт: Фаза 4 (миграция агентов)
│   └── Пт: Фазы 5-6 (cleanup, config)

Неделя 2:
├── Блок B (Workflow Execution)
│   ├── Пн-Вт: CLI интеграция
│   └── Ср: Тестирование
│
├── 🎯 MVP READY (середина недели 2)
│
├── Блок C (Code Quality)
│   ├── Чт: Logger + console.log
│   └── Пт: any types

Неделя 3:
├── Блок C (продолжение)
├── Блок D (Testing)
└── Блок E (Documentation)

🚀 FULL LAUNCH (конец недели 3)
```

---

## Чеклист запуска

### MVP Checklist

- [x] LLM работает через подписку (claude CLI)
- [x] LLM работает через API (опционально)
- [x] LangChain удалён
- [x] `asmo analyze` работает
- [x] `asmo workflow` выполняет реальные задачи
- [x] `asmo task` работает (JSON storage)
- [x] Базовые тесты проходят (390 тестов)

### Full Launch Checklist

- [ ] Всё из MVP
- [ ] 0 `console.log`
- [ ] <50 `any`
- [ ] 0 TODO/FIXME
- [ ] >500 тестов
- [ ] Документация готова
- [ ] README актуальный
- [ ] Примеры есть

---

## Риски

| Риск | Вероятность | Митигация |
|------|-------------|-----------|
| Claude CLI изменит API | Низкая | Абстракция через ILLMProvider |
| Сложность миграции агентов | Средняя | Шаблон миграции, по одному |
| Workflow сложнее чем ожидалось | Средняя | Начать с простого workflow |
| Тесты ломаются после изменений | Высокая | Частые прогоны, CI |

---

## Следующий шаг

**Начать с Блока A, Фаза 1:**

```bash
git checkout -b feature/llm-provider
mkdir -p packages/core/src/llm
# Создать packages/core/src/llm/types.ts
```
