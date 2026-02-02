# Детальный Промпт для Claude Code Agent: ASMO Fixes

## 🎯 МИССИЯ

Вы - Claude Code агент, ответственный за исправление критических проблем и улучшение качества кодовой базы проекта **ASMO** - системы для оркестрации множества специализированных AI агентов.

**Ключевая особенность:** Это dog-fooding проект! После исправления критических проблем, мы будем использовать саму систему asmo для выполнения остальных задач (самоисправление).

---

## 📊 ТЕКУЩЕЕ СОСТОЯНИЕ ПРОЕКТА

### Проект:
- **Название:** ASMO
- **Путь:** `/Users/aliaksandrsmolka/ASMO`
- **Версия:** 3.0 (недавно мигрировал с LangGraph на native TypeScript)
- **Тип:** Monorepo (pnpm workspaces)
- **Пакеты:**
  - `packages/core` - основная система оркестрации
  - `packages/cli` - CLI интерфейс

### Технологический стек:
- TypeScript 5.3+
- Node.js 20+
- pnpm (package manager)
- Anthropic SDK для LLM вызовов
- PostgreSQL (опционально)
- Jest/Vitest для тестов

### Архитектура:
- **28 специализированных агентов** (Architect, Developer, Tester, DevOps, и др.)
- **28 workflows** для различных задач разработки
- **85 skills** распределённых между агентами
- **Dynamic Orchestrator** для маршрутизации задач
- **MCP Bridge** для интеграции с внешними сервисами

---

## 🚨 КРИТИЧЕСКИЕ ПРОБЛЕМЫ (Требуют немедленного внимания)

### Проблема #1: CLI НЕ РАБОТАЕТ!
```
Error: Dynamic require of "process" is not supported
```
**Причина:** ESM/CJS конфликт в tsup bundler
**Блокирует:** Использование asmo для dog-fooding
**Приоритет:** КРИТИЧЕСКИЙ

### Проблема #2: Безопасность типов сломана
- **20 файлов** с `// @ts-nocheck` (полностью отключен TypeScript!)
- **397 использований** типа `any`
- **194 TypeScript ошибки** (многие скрыты под @ts-nocheck)

### Проблема #3: Ключевая функциональность не реализована
```typescript
// complexity-analyzer.ts:116, 208
// TODO: Call LLM for analysis (placeholder for now)
```
**Проблема:** Анализатор сложности НЕ использует LLM, это заглушка!

### Проблема #4: Неверные зависимости
```json
"zod": "^4.3.6"  // ❌ Zod 4.x не существует!
"@langchain/langgraph": "^0.2.20"  // ❌ Не используется (orchestrator.ts удален)
```

### Проблема #5: Отсутствуют тесты
- **28 агентов** без единого теста (0% покрытия)
- Нет E2E тестов воркфлоу
- Нет интеграционных тестов

---

## 🎯 ЦЕЛИ И SCOPE

### Общая цель:
Превратить проект из прототипа (40% готовности) в production-ready систему (95%+ готовности) за **4-6 недель** full-time работы.

### Scope утвержден пользователем:
- ✅ Все 3 фазы (полное исправление)
- ✅ Breaking changes разрешены
- ✅ LangChain - полное удаление
- ✅ Dog-fooding - использовать asmo для исправления самого себя

### Ваша роль в плане:
- **Фаза 1** (1-2 недели): Вы исправляете критические проблемы и запускаете asmo
- **Фаза 2** (2-3 недели): Совместная работа - вы + asmo
- **Фаза 3** (1-2 недели): asmo ведет, вы мониторите

---

## 📋 ДЕТАЛЬНЫЙ ПЛАН ВЫПОЛНЕНИЯ

## ФАЗА 1: КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ (Ваша основная работа)

### 🔧 ЗАДАЧА 1.0: Исправить сборку CLI (2-4 часа) - НАЧАТЬ С ЭТОГО!

**Цель:** Сделать asmo CLI работоспособным

#### Шаг 1.0.1: Создать tsup конфигурацию

**Действие:** Создать файл `packages/core/tsup.config.ts`

```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  external: [
    'yaml',
    'js-yaml',
    'pg',
    'lru-cache',
    '@anthropic-ai/sdk',
    '@langchain/anthropic',
    '@langchain/core'
  ],
  noExternal: [],
  platform: 'node',
  target: 'node20',
  shims: true,
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);"
  }
})
```

**Проверка:**
```bash
cd packages/core
pnpm build
# Должно собраться без ошибок
```

#### Шаг 1.0.2: Пересобрать проект

```bash
# В корне проекта
cd packages/core
pnpm build

cd ../cli
pnpm build
```

#### Шаг 1.0.3: Протестировать CLI

```bash
# Тест 1: Help
node packages/cli/dist/index.js --help

# Тест 2: Analyze
node packages/cli/dist/index.js analyze "Create REST API endpoint"

# Тест 3: Workflow (dry-run)
node packages/cli/dist/index.js workflow code-quality --dry-run

# Тест 4: Task
node packages/cli/dist/index.js task list
```

**Критерий успеха:** Все команды работают без ошибки "Dynamic require of process is not supported"

---

### 🔧 ЗАДАЧА 1.1: Исправить package.json (30 минут)

#### Действия:

1. **Открыть:** `packages/core/package.json`

2. **Изменить:**
```json
// Было:
"zod": "^4.3.6"
// Стало:
"zod": "^3.22.0"
```

3. **Удалить:**
```json
"@langchain/langgraph": "^0.2.20"
```

4. **Пока оставить** (удалим в Фазе 2):
```json
"@langchain/anthropic": "^0.3.7"
"@langchain/core": "^0.3.24"
```

5. **Выполнить:**
```bash
pnpm install
pnpm build
pnpm test
```

**Критерий успеха:** Проект собирается и тесты проходят

---

### 🔧 ЗАДАЧА 1.2: Создать .env.example (15 минут)

**Действие:** Создать файл `.env.example` в корне проекта

```bash
# ASMO Orchestration - Environment Variables

# Required
ANTHROPIC_API_KEY=sk-ant-xxx_your_key_here

# Optional - Database
DATABASE_URL=postgresql://user:password@localhost:5432/asmo

# Optional - Configuration
NODE_ENV=development
LOG_LEVEL=info
USE_SKILLMD=true
MAX_PARALLEL_AGENTS=3

# Optional - Circuit Breaker
CIRCUIT_BREAKER_THRESHOLD=5
CIRCUIT_BREAKER_TIMEOUT=60000

# Optional - MCP Servers (if using)
# MCP_MEMORY_URL=...
# MCP_SUPABASE_URL=...
```

**Проверка:** Файл создан и содержит все необходимые переменные

---

### 🔧 ЗАДАЧА 1.3: Реализовать LLM анализ сложности (4-6 часов)

**Проблема:** `complexity-analyzer.ts` использует заглушки вместо реального LLM

#### Шаг 1.3.1: Прочитать текущую реализацию

```bash
# Открыть файл и изучить
packages/core/src/orchestration/complexity-analyzer.ts
```

**Найти строки:**
- Line 116: `// TODO: Call LLM for analysis (placeholder for now)`
- Line 208: `// TODO: Implement actual LLM call using Anthropic SDK`

#### Шаг 1.3.2: Реализовать LLM вызов

**В методе `analyzeWithLLM()`:**

```typescript
private async analyzeWithLLM(task: string): Promise<ComplexityScore> {
  // Импортировать Anthropic SDK
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
  })

  const prompt = `Analyze the complexity of this software development task:

Task: ${task}

Provide a complexity analysis with:
1. Overall complexity score (1-10)
2. Required skills
3. Estimated effort
4. Key challenges
5. Recommended workflow

Format your response as JSON.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (content.type === 'text') {
      const analysis = JSON.parse(content.text)

      return {
        score: analysis.complexity_score,
        confidence: 0.85,
        factors: {
          technical: analysis.technical_complexity || 5,
          domain: analysis.domain_complexity || 5,
          collaboration: analysis.collaboration_needed || 3
        },
        reasoning: analysis.reasoning || '',
        recommendedWorkflow: analysis.recommended_workflow || 'general'
      }
    }
  } catch (error) {
    console.error('LLM analysis failed:', error)
    // Fallback to rule-based analysis
    return this.analyzeWithRules(task)
  }
}
```

#### Шаг 1.3.3: Добавить обработку ошибок и retry

```typescript
private async callLLMWithRetry(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await anthropic.messages.create({...})
      return response.content[0].text
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

#### Шаг 1.3.4: Обновить тесты

```bash
packages/core/tests/orchestration/complexity-analyzer.test.ts
```

Добавить моки для Anthropic SDK и тесты для нового функционала.

**Критерий успеха:**
```bash
pnpm test packages/core/tests/orchestration/complexity-analyzer.test.ts
# Все тесты проходят
```

---

### 🔧 ЗАДАЧА 1.4: Исправить @ts-nocheck файлы (40-60 часов)

**Стратегия:** Исправлять по 1-2 файла в день, начиная с самых критичных.

#### Приоритетный список (топ-5 для Фазы 1):

**1. skill-matcher.ts (6 часов)**
**2. task-manager.ts (6 часов)**
**3. config-loader.ts (8 часов)**
**4. documentation-manager.ts (5 часов)**
**5. help-system.ts (5 часов)**

#### Процесс для каждого файла:

**Шаг 1:** Удалить `// @ts-nocheck` из первой строки

**Шаг 2:** Запустить TypeScript для выявления ошибок
```bash
pnpm exec tsc --noEmit packages/core/src/orchestration/skill-matcher.ts
```

**Шаг 3:** Исправить ошибки по категориям:

**Категория A: Implicit any**
```typescript
// Было:
function process(data) { ... }

// Стало:
function process(data: TaskData): TaskResult { ... }
```

**Категория B: Property does not exist**
```typescript
// Было:
return config.someProperty

// Стало:
return config.someProperty as string
// или добавить в interface
```

**Категория C: Object possibly undefined**
```typescript
// Было:
config.value.toLowerCase()

// Стало:
config.value?.toLowerCase() ?? ''
```

**Шаг 4:** Запустить тесты
```bash
pnpm test skill-matcher
```

**Шаг 5:** Коммит
```bash
git add packages/core/src/orchestration/skill-matcher.ts
git commit -m "fix(skill-matcher): remove @ts-nocheck and fix type errors

- Add proper type annotations for all functions
- Fix implicit any types
- Add type guards for optional properties
- All tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Критерий успеха для каждого файла:**
- ✅ Нет `@ts-nocheck`
- ✅ `pnpm exec tsc --noEmit` проходит без ошибок
- ✅ Все тесты проходят
- ✅ Коммит создан

---

### 🔧 ЗАДАЧА 1.5: Тестирование asmo (2-3 часа)

**Цель:** Убедиться, что asmo работает для использования в Фазе 2

#### Шаг 1.5.1: Установить CLI глобально

```bash
cd packages/cli
pnpm link --global
```

#### Шаг 1.5.2: Проверить базовые команды

```bash
asmo --version
asmo --help
```

#### Шаг 1.5.3: Тестовый analyze

```bash
asmo analyze "Add authentication to REST API"
# Должен вернуть анализ сложности с рекомендациями
```

#### Шаг 1.5.4: Тестовая задача

```bash
asmo task create "Test validation task" \
  --description "Verify orchestrator works correctly" \
  --priority low

asmo task list
# Должен показать созданную задачу
```

#### Шаг 1.5.5: Dry-run workflow

```bash
asmo workflow code-quality \
  --task "Review config-loader.ts for type safety" \
  --dry-run

# Должен показать план без выполнения
```

#### Шаг 1.5.6: Создать документацию использования

**Создать:** `docs/USING-ASMO.md`

```markdown
# Как использовать asmo для исправления проблем

## Установка
\`\`\`bash
cd packages/cli
pnpm link --global
\`\`\`

## Базовое использование

### Анализ задачи
\`\`\`bash
asmo analyze "Your task description"
\`\`\`

### Создание задачи
\`\`\`bash
asmo task create "Task title" \
  --description "Detailed description" \
  --priority high
\`\`\`

### Запуск workflow
\`\`\`bash
asmo workflow <workflow-name> \
  --task "Task description" \
  --agents architect,developer,tester
\`\`\`

## Примеры для нашего проекта

### Рефакторинг
\`\`\`bash
asmo workflow refactoring \
  --task "Refactor WorkflowEngine to reduce dependencies" \
  --agents architect,developer,code-reviewer
\`\`\`

### Тестирование
\`\`\`bash
asmo task create "Generate tests for 28 agents" \
  --workflow testing \
  --priority high
\`\`\`

### Миграция
\`\`\`bash
asmo task create "Migrate from LangChain to Anthropic SDK" \
  --workflow migration \
  --priority high
\`\`\`
```

**Критерий успеха:**
- ✅ CLI работает без ошибок
- ✅ Можно создать задачу
- ✅ Можно запустить workflow (dry-run)
- ✅ Документация создана

---

## ⏸️ ТОЧКА ПЕРЕХОДА К DOG-FOODING

**После завершения Задачи 1.5:**

1. **Остановитесь и сообщите пользователю:**
```
✅ ФАЗА 1 ЗАВЕРШЕНА!

Критические проблемы исправлены:
- ✅ CLI работает
- ✅ package.json исправлен
- ✅ .env.example создан
- ✅ LLM анализ реализован
- ✅ Топ-5 @ts-nocheck файлов исправлены

🎯 ГОТОВНОСТЬ К DOG-FOODING!

asmo теперь работоспособен и может помочь с Фазой 2.

Следующие шаги:
1. Протестировать asmo на простой задаче
2. Если работает хорошо - использовать для Фазы 2
3. Сравнить эффективность asmo vs Claude Code
```

2. **Спросить у пользователя:**
- Продолжить с Фазой 2 вручную?
- Начать dog-fooding эксперимент?
- Какую задачу попробовать первой с asmo?

---

## ФАЗА 2: СОВМЕСТНАЯ РАБОТА (Гибридный подход)

**Начинать только после одобрения пользователя и успешного dog-fooding теста!**

### Распределение задач:

#### Вы (Claude Code) делаете:

**Задача 2.1: Внедрение логирования (8-12 часов)**
- Создать `packages/core/src/utils/logger.ts`
- Заменить 529 console.log на structured logging
- Механическая, последовательная работа

**Задача 2.3: Уменьшение 'any' (15-20 часов)**
- Заменить 397 использований 'any' на конкретные типы
- Определить правильные типы для общих паттернов
- Последовательная работа по файлам

**Остальные @ts-nocheck файлы (15-20 часов)**
- Продолжить исправление оставшихся 15 файлов
- По 1-2 файла в день

#### asmo делает:

**Задача 2.2: Генерация тестов для 28 агентов (10-15 часов)**
```bash
asmo task create "Generate tests for all 28 agents" \
  --workflow testing \
  --priority high \
  --agents test-architect,tester,developer
```

**Задача 2.4: Рефакторинг WorkflowEngine (10-15 часов)**
```bash
asmo workflow refactoring \
  --task "Refactor WorkflowEngine to reduce dependencies from 15+ to 3-5" \
  --agents architect,developer,code-reviewer
```

**Задача 2.5: Миграция с LangChain (15-20 часов)**
```bash
asmo task create "Migrate from LangChain to Anthropic SDK" \
  --workflow migration \
  --priority high \
  --agents architect,developer,code-reviewer,tester
```

### Метрики для сравнения:
После каждой задачи asmo записывайте:
- Время выполнения
- Качество кода
- Количество ошибок
- Что сработало хорошо
- Что нужно улучшить

---

## ФАЗА 3: ASMO ВЕДЕТ

**asmo координирует:**
- Документация архитектуры
- Оптимизация производительности
- Финальные улучшения

**Вы мониторите и помогаете при необходимости.**

---

## 📊 КРИТЕРИИ УСПЕХА

### После Фазы 1:
- [ ] CLI запускается без ошибок
- [ ] package.json исправлен
- [ ] .env.example создан
- [ ] LLM анализ работает
- [ ] Топ-5 @ts-nocheck файлов исправлены
- [ ] asmo готов к dog-fooding

### После Фазы 2:
- [ ] 0 console.log вызовов
- [ ] <80 использований 'any'
- [ ] 28 агентов протестированы
- [ ] WorkflowEngine рефакторен
- [ ] LangChain полностью удален
- [ ] Dog-fooding успешен

### После Фазы 3:
- [ ] Документация полная
- [ ] Производительность оптимизирована
- [ ] Готовность: 95%+

---

## 🔍 КОМАНДЫ ДЛЯ ПРОВЕРКИ

### Проверка типов:
```bash
pnpm typecheck
# Или для конкретного файла:
pnpm exec tsc --noEmit packages/core/src/path/to/file.ts
```

### Проверка сборки:
```bash
pnpm build
```

### Запуск тестов:
```bash
pnpm test
# Или конкретный тест:
pnpm test packages/core/tests/orchestration/complexity-analyzer.test.ts
```

### Проверка console.log:
```bash
grep -r "console\\.log" packages/core/src --count
```

### Проверка @ts-nocheck:
```bash
grep -r "// @ts-nocheck" packages/core/src
```

### Проверка 'any':
```bash
grep -r ": any" packages/core/src --count
```

### Размер зависимостей:
```bash
du -sh node_modules
```

---

## ⚠️ ВАЖНЫЕ ОГРАНИЧЕНИЯ

### Git Strategy:
1. **Создать ветку:**
```bash
git checkout -b fix/technical-debt-hybrid
```

2. **Частые коммиты:**
- После каждого исправленного файла
- После каждой завершенной задачи
- Ясные commit messages

3. **Коммит формат:**
```
fix(component): short description

- Detailed change 1
- Detailed change 2
- Tests passing

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Safety Rules:
- ✅ Запускать тесты после каждого изменения
- ✅ Делать небольшие инкрементальные изменения
- ✅ Не трогать код, который не связан с задачей
- ✅ Сохранять обратную совместимость где возможно
- ❌ НЕ добавлять новые фичи без запроса
- ❌ НЕ удалять код без понимания его назначения

### Breaking Changes (Разрешены):
- ✅ Рефакторинг архитектуры
- ✅ Изменение API внутренних модулей
- ✅ Удаление deprecated кода
- ✅ Миграция с LangChain

---

## 🎯 НАЧАЛО РАБОТЫ

### Команда для старта:

```bash
# 1. Убедиться в правильной директории
cd /Users/aliaksandrsmolka/ASMO

# 2. Проверить git status
git status

# 3. Создать ветку
git checkout -b fix/technical-debt-hybrid

# 4. НАЧАТЬ С ЗАДАЧИ 1.0!
# Создать packages/core/tsup.config.ts
```

---

## 💡 СОВЕТЫ ДЛЯ ЭФФЕКТИВНОЙ РАБОТЫ

1. **Читайте код перед изменением**
   - Всегда используйте Read tool перед Edit
   - Понимайте контекст

2. **Запускайте тесты часто**
   - После каждого файла
   - Перед каждым коммитом

3. **Задавайте вопросы**
   - Если что-то непонятно - спросите пользователя
   - Лучше уточнить, чем угадывать

4. **Документируйте прогресс**
   - Сообщайте о завершении задач
   - Показывайте метрики улучшения

5. **Будьте готовы к сюрпризам**
   - Код может содержать неожиданные зависимости
   - Некоторые файлы могут быть сложнее, чем ожидалось

---

## 📞 КОГДА ОБРАЩАТЬСЯ К ПОЛЬЗОВАТЕЛЮ

- ❓ Непонятно назначение кода
- ❓ Несколько способов решения проблемы
- ❓ Изменение влияет на публичное API
- ❓ Тесты падают после исправления
- ❓ Нужно принять архитектурное решение
- ✅ Задача завершена (для подтверждения)
- 🚨 Критическая проблема обнаружена

---

## 🎬 НАЧАЛО РАБОТЫ

**Ваша первая задача:** ЗАДАЧА 1.0 - Исправить сборку CLI

**Вы - автономный агент.** Используйте ваши инструменты:
- **Read** - читать файлы и изучать код
- **Write** - создавать новые файлы
- **Edit** - редактировать существующие файлы
- **Bash** - выполнять команды (build, test, git)
- **Grep/Glob** - искать код и файлы

**Не ждите инструкций - действуйте самостоятельно:**
1. Читайте файлы перед изменением
2. Запускайте тесты после изменений
3. Делайте коммиты после каждой задачи
4. Сообщайте о прогрессе

**Начните с создания tsup.config.ts согласно ЗАДАЧЕ 1.0!**

**Удачи! Проект зависит от вас! 🚀**

---

## 📎 ПРИЛОЖЕНИЕ: Критические файлы

### Топ-15 файлов для работы:

1. ⚠️ `packages/core/package.json` - dependencies
2. 🚨 `packages/core/src/orchestration/complexity-analyzer.ts` - LLM placeholder
3. ⚠️ `packages/core/src/orchestration/skill-matcher.ts` - @ts-nocheck
4. ⚠️ `packages/core/src/orchestration/task-manager.ts` - @ts-nocheck
5. ⚠️ `packages/core/src/orchestration/config-loader.ts` - @ts-nocheck + TODO
6. 🔧 `packages/core/src/orchestration/workflow-engine.ts` - God Object
7. 📝 `packages/core/src/agents/base-agent.ts` - базовый класс
8. 🔧 `packages/core/src/orchestration/dynamic-orchestrator.ts` - центральная логика
9. 🔧 `packages/core/src/orchestration/task-router.ts` - маршрутизация
10. ⚠️ `packages/core/src/templates/template-engine.ts` - @ts-nocheck
11. ⚠️ `packages/core/src/templates/template-schema.ts` - @ts-nocheck
12. ⚠️ `packages/core/src/orchestration/documentation-manager.ts` - @ts-nocheck
13. ⚠️ `packages/core/src/orchestration/help-system.ts` - @ts-nocheck + TODO
14. ⚠️ `packages/core/src/orchestration/party-session.ts` - @ts-nocheck
15. ⚠️ `packages/core/src/orchestration/brainstorming-session.ts` - @ts-nocheck

### Легенда:
- 🚨 = Критично (блокирует функциональность)
- ⚠️ = Высокий приоритет (type safety)
- 🔧 = Архитектура (рефакторинг)
- 📝 = Базовый класс (влияет на всех)
