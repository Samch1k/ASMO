# Детальный план исправления ASMO

## Обзор проблем

| Категория | Ошибок | % от общего |
|-----------|--------|-------------|
| LangGraph API несовместимость | 52 | 27% |
| Отсутствующие типы в types.js | 24 | 12% |
| Отсутствующие npm зависимости | 4 | 2% |
| Неиспользуемые переменные (TS6133) | 42 | 22% |
| Отсутствующие свойства в типах (TS2339) | 28 | 14% |
| Неправильные типы (TS2322, TS2345) | 18 | 9% |
| Implicit any (TS7006) | 18 | 9% |
| Прочие | 8 | 4% |
| **ИТОГО** | **194** | **100%** |

---

## КАТЕГОРИЯ 1: LangGraph API (52 ошибки)

### Файл: `src/agents/orchestrator.ts`

**Корневая причина:**
LangGraph обновил API, и старый код несовместим с новой версией. Типы `StateGraph`, `NodeAction` изменились.

### Ошибки:

| Строка | Ошибка | Причина |
|--------|--------|---------|
| 175 | TS2769 | `StateGraph` конструктор ожидает другой формат channels |
| 219-576 | TS2345 (×20) | `workflow.addNode()` ожидает `NodeAction` нового формата |
| 633-658 | TS2345 (×20) | `workflow.addEdge()` ожидает `"__start__"` вместо custom node names |
| 701 | TS2345 | `workflow.invoke()` ожидает другой тип input |
| 712 | TS2740 | Return type несовместим |

### Решение:

**Вариант A: Обновить код под новый LangGraph API**

```typescript
// Было:
const workflow = new StateGraph({ channels: {...} })
workflow.addNode("entry", entryNode)

// Станет (LangGraph 0.2+):
import { Annotation } from "@langchain/langgraph"

const StateAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({ reducer: (a, b) => a.concat(b) }),
  task: Annotation<string>(),
  // ...
})

const workflow = new StateGraph(StateAnnotation)
  .addNode("entry", entryNode)
  .addEdge("__start__", "entry")
```

**Трудоёмкость:** 4-6 часов
**Риск:** Высокий (новый API может иметь другие breaking changes)

---

**Вариант B: Удалить orchestrator.ts и использовать workflow-engine.ts**

```typescript
// orchestrator.ts использует LangGraph, но workflow-engine.ts уже работает
// Удалить orchestrator.ts, оставить workflow-engine.ts как основной executor

// Изменить index.ts:
// - export { orchestratorApp, runMultiAgentTask, ... } from './orchestrator'
// + export { WorkflowEngine } from './orchestration/workflow-engine'
```

**Трудоёмкость:** 1-2 часа
**Риск:** Низкий (workflow-engine.ts уже работает)

---

**Вариант C: Закомментировать LangGraph код (временно)**

```typescript
// Обернуть весь orchestrator.ts в:
// @ts-nocheck
// или закомментировать проблемный код
```

**Трудоёмкость:** 10 минут
**Риск:** Средний (функциональность orchestrator станет недоступна)

---

**РЕКОМЕНДАЦИЯ: Вариант B**

Причины:
1. `workflow-engine.ts` уже реализует ту же функциональность
2. LangGraph добавляет сложность без явной выгоды
3. Проще поддерживать собственный код

---

## КАТЕГОРИЯ 2: Отсутствующие типы в types.js (24 ошибки)

### Файлы:
- `brainstorming-session.ts` (13 ошибок)
- `party-session.ts` (11 ошибок)

### Отсутствующие типы:

```typescript
// Эти типы импортируются, но не экспортируются из types.ts:
AgentWithRoleSkills
BrainstormingPhase
BrainstormingRound
BrainstormingProposal
Critique
SynthesisPoint
BrainstormingVote
BrainstormingConfig
BrainstormingResult
Agreement
PartyRound
PartySession
PartyState
PartyMessage
Proposal
Vote
ConflictDetection
```

### Решение:

**Шаг 1:** Найти определения типов

```bash
grep -r "interface BrainstormingPhase\|type BrainstormingPhase" src/
grep -r "interface PartySession\|type PartySession" src/
```

**Шаг 2:** Добавить в `src/orchestration/types.ts`:

```typescript
// Brainstorming types
export interface BrainstormingPhase {
  name: 'diverge' | 'critique' | 'converge' | 'synthesize'
  duration: number
}

export interface BrainstormingProposal {
  id: string
  agentId: string
  content: string
  rationale: string
  votes: BrainstormingVote[]
}

export interface Critique {
  proposalId: string
  agentId: string
  strength: 'strong' | 'moderate' | 'weak' | 'opposed'
  comment: string
}

// ... и т.д. для всех отсутствующих типов
```

**Шаг 3:** Убедиться что экспортируется из types.ts

**Трудоёмкость:** 2-3 часа
**Риск:** Низкий

---

## КАТЕГОРИЯ 3: Отсутствующие npm зависимости (4 ошибки)

### Файлы:
- `task-persister.ts:18` - `lru-cache`
- `yolo-mode-manager.ts:24` - `lru-cache`
- `template-engine.ts:19` - `zod`
- `template-schema.ts:16` - `zod`

### Решение:

```bash
pnpm add lru-cache zod
pnpm add -D @types/lru-cache  # если нужно
```

**Трудоёмкость:** 5 минут
**Риск:** Минимальный

---

## КАТЕГОРИЯ 4: Неиспользуемые переменные (42 ошибки)

### Типы:
- **TS6133**: Variable declared but never read
- **TS6196**: Import declared but never used

### Файлы с проблемами:

| Файл | Переменных | Примеры |
|------|------------|---------|
| `base-agent.ts` | 2 | `MCPRequest`, `MCPResponse` |
| `design-validator.agent.ts` | 3 | `pastDesigns`, `bestPractices`, `artifacts` |
| `post-deploy-monitor.agent.ts` | 3 | `deploymentInfo` (×3) |
| `project-manager.agent.ts` | 3 | `idx`, `dependencies` |
| `rfq-specialist.agent.ts` | 2 | `rfqData`, `suppliersData` |
| `skill-matcher.ts` | 2 | `SkillMetadata`, `skillDependencies` |
| И другие... | | |

### Решение:

**Вариант A: Использовать переменные**

```typescript
// Было:
const pastDesigns = await this.loadPastDesigns()
// pastDesigns нигде не используется

// Станет:
const pastDesigns = await this.loadPastDesigns()
this.analyzeWithHistory(pastDesigns)
```

**Вариант B: Удалить неиспользуемые**

```typescript
// Было:
import { MCPRequest, MCPResponse } from './types'
// MCPRequest, MCPResponse не используются

// Станет:
// (удалить импорт)
```

**Вариант C: Добавить underscore prefix**

```typescript
// Было:
const pastDesigns = await this.loadPastDesigns()

// Станет:
const _pastDesigns = await this.loadPastDesigns()
```

**РЕКОМЕНДАЦИЯ:**
- Для импортов → удалить
- Для переменных, которые нужны для будущего → добавить underscore
- Для мёртвого кода → удалить

**Трудоёмкость:** 1-2 часа
**Риск:** Минимальный

---

## КАТЕГОРИЯ 5: Отсутствующие свойства в типах (28 ошибок)

### Примеры ошибок:

```typescript
// TS2339: Property 'artifacts' does not exist on type 'AgentState'
state.artifacts  // ошибка

// TS2339: Property 'deliverables' does not exist on type 'AgentState'
state.deliverables  // ошибка

// TS2339: Property 'result' does not exist on type 'AgentResult'
agentResult.result  // ошибка
```

### Причина:

Типы `AgentState` и `AgentResult` не содержат эти свойства, но код ожидает их.

### Решение:

**Шаг 1:** Проверить `src/agents/types.ts`:

```typescript
export interface AgentState {
  messages: BaseMessage[]
  task: string
  taskType: TaskType
  context: Record<string, any>
  currentAgent: string
  agentResults: AgentResult[]
  mcpData: Record<string, any>
  nextAction: string
  requiresApproval: boolean
  // ❌ Отсутствуют:
  // artifacts?: Artifact[]
  // deliverables?: Deliverable[]
  // workflow?: Workflow
}
```

**Шаг 2:** Добавить отсутствующие свойства:

```typescript
export interface AgentState {
  // ... существующие свойства

  // Добавить:
  artifacts?: Artifact[]
  deliverables?: Deliverable[]
  workflow?: Workflow
}

export interface AgentResult {
  agentId: string
  output: any
  artifacts?: Artifact[]
  timestamp: string
  success: boolean

  // Добавить:
  result?: any
  agentName?: string
}
```

**Трудоёмкость:** 1-2 часа
**Риск:** Средний (может повлиять на runtime)

---

## КАТЕГОРИЯ 6: Неправильные типы (18 ошибок)

### Примеры:

```typescript
// TS2322: Type 'BaseMessage | { role: string }' is not assignable to type 'BaseMessage'
state.messages.push({ role: 'assistant', content: '...' })
// ❌ role не существует в BaseMessage

// TS2322: Type '"deployment"' is not assignable to type 'TaskType'
taskType: 'deployment'
// ❌ 'deployment' не в union TaskType
```

### Решение:

**Для BaseMessage:**

```typescript
// Было:
state.messages.push({ role: 'assistant', content: '...' })

// Станет:
import { AIMessage } from "@langchain/core/messages"
state.messages.push(new AIMessage({ content: '...' }))
```

**Для TaskType:**

```typescript
// Было:
type TaskType = 'bug_fix' | 'feature' | 'optimization' | 'architecture'

// Станет:
type TaskType =
  | 'bug_fix'
  | 'feature'
  | 'optimization'
  | 'architecture'
  | 'deployment'  // добавить
  | 'testing'     // добавить
```

**Трудоёмкость:** 2-3 часа
**Риск:** Средний

---

## КАТЕГОРИЯ 7: Implicit any (18 ошибок)

### Примеры:

```typescript
// TS7006: Parameter 'r' implicitly has an 'any' type
results.map(r => r.output)
//          ^ нужен тип

// TS7006: Parameter 'sum' implicitly has an 'any' type
votes.reduce((sum, v) => sum + v.weight, 0)
//            ^    ^ нужны типы
```

### Решение:

```typescript
// Было:
results.map(r => r.output)

// Станет:
results.map((r: AgentResult) => r.output)

// Было:
votes.reduce((sum, v) => sum + v.weight, 0)

// Станет:
votes.reduce((sum: number, v: Vote) => sum + v.weight, 0)
```

**Трудоёмкость:** 1 час
**Риск:** Минимальный

---

## ПЛАН ИСПРАВЛЕНИЯ ПО ПРИОРИТЕТУ

### Фаза 1: Быстрые победы (30 минут)

| # | Действие | Ошибок исправит |
|---|----------|-----------------|
| 1 | `pnpm add lru-cache zod` | 4 |
| 2 | Удалить неиспользуемые импорты | 15 |
| 3 | Добавить `@ts-nocheck` в orchestrator.ts (временно) | 52 |

**Итого:** 71 ошибка (-37%)

---

### Фаза 2: Типы (2-3 часа)

| # | Действие | Ошибок исправит |
|---|----------|-----------------|
| 4 | Добавить отсутствующие типы в types.ts | 24 |
| 5 | Расширить AgentState и AgentResult | 28 |
| 6 | Расширить TaskType | 2 |

**Итого:** 54 ошибки (-28%)

---

### Фаза 3: Рефакторинг агентов (3-4 часа)

| # | Действие | Ошибок исправит |
|---|----------|-----------------|
| 7 | Исправить BaseMessage usage | 8 |
| 8 | Добавить типы к параметрам (implicit any) | 18 |
| 9 | Удалить/использовать неиспользуемые переменные | 27 |

**Итого:** 53 ошибки (-27%)

---

### Фаза 4: LangGraph (опционально, 4-6 часов)

| # | Действие | Ошибок исправит |
|---|----------|-----------------|
| 10a | Обновить orchestrator.ts под новый API | 52 |
| **ИЛИ** | | |
| 10b | Удалить orchestrator.ts, использовать workflow-engine.ts | 52 |

---

## Детальный чеклист

### Файлы для исправления (по приоритету):

```
[ ] package.json - добавить lru-cache, zod
[ ] src/orchestration/types.ts - добавить 17 типов
[ ] src/agents/types.ts - расширить AgentState, AgentResult
[ ] src/agents/orchestrator.ts - @ts-nocheck или удалить
[ ] src/orchestration/brainstorming-session.ts - исправить импорты
[ ] src/orchestration/party-session.ts - исправить импорты
[ ] src/agents/roles/product-manager.agent.ts - 22 ошибки
[ ] src/agents/roles/merge-coordinator.agent.ts - 12 ошибок
[ ] src/templates/template-engine.ts - 10 ошибок
[ ] src/orchestration/documentation-manager.ts - 9 ошибок
[ ] src/agents/roles/project-manager.agent.ts - 8 ошибок
[ ] src/orchestration/help-system.ts - 7 ошибок
[ ] src/agents/roles/design-validator.agent.ts - 6 ошибок
[ ] src/orchestration/skill-matcher.ts - 5 ошибок
[ ] src/templates/template-schema.ts - 4 ошибки
[ ] src/orchestration/config-loader.ts - 3 ошибки
```

---

## Ожидаемый результат

| Метрика | До | После Фазы 1 | После Фазы 2 | После Фазы 3 |
|---------|-----|--------------|--------------|--------------|
| TypeScript ошибок | 194 | 123 | 69 | 16 |
| Компиляция | ❌ | ❌ | ⚠️ | ✅ |
| Тесты | ❌ | ❌ | ⚠️ | ✅ |

---

## Рекомендуемый подход

1. **Начать с Фазы 1** — быстро уменьшить количество ошибок
2. **Продолжить Фазой 2** — исправить типы
3. **Фаза 3** — исправить агентов по одному
4. **Фаза 4** — решить судьбу LangGraph

**Общее время:** 8-12 часов
**Риск:** Низкий-средний

---

## Альтернативный подход: "Чистый старт"

Если количество ошибок кажется слишком большим:

1. Удалить все сломанные файлы
2. Оставить только работающие:
   - BMAD Integration (все работает)
   - workflow-engine.ts
   - Базовые агенты
3. Перестроить остальное по мере необходимости

**Файлы для сохранения:**
```
src/orchestration/workflow-engine.ts ✅
src/orchestration/complexity-analyzer.ts ✅
src/orchestration/adversarial-review.ts ✅
src/orchestration/context-cascade.ts ✅
src/orchestration/document-registry.ts ✅
src/orchestration/elicitation/ ✅
src/utils/document-sharding.ts ✅
src/agents/base-agent.ts ✅ (после fix)
src/agents/roles/ ✅ (большинство)
```

**Файлы для удаления:**
```
src/agents/orchestrator.ts ❌
src/orchestration/brainstorming-session.ts ❌
src/orchestration/party-session.ts ❌
src/agents/roles/product-manager.agent.ts ❌
src/agents/roles/merge-coordinator.agent.ts ❌
```
