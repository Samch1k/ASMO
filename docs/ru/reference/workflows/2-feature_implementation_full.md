# ✨ Full Feature Implementation

> Complete feature lifecycle: Design → Implement → Test → Deploy

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `feature_implementation_full` |
| **Время выполнения** | 2h 25m |
| **Количество фаз** | 4 |
| **Агентов задействовано** | 6 |

## Условия запуска

### Ключевые слова
`implement feature`, `new feature`, `add functionality`, `create feature`, `реализуй фичу`, `новая функция`

### Типы задач
- feature

### Необходимые навыки
- `architecture_decisions`
- `code_writing`
- `feature_implementation`



## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | architect | design | adr, component_structure | 20m | ⚡ Parallel |
|  | ux-designer | design | user_flows, wireframes | 20m |  |
| 2 | developer | implementation | code, api_endpoints | 60m | ⚡ Parallel |
|  | ui-developer | implementation | react_components, ui_tests | 40m |  |
| 3 | tester | testing | e2e_tests, test_results | 30m | - |
| 4 | devops | deployment | deployment_logs | 15m | ✅ Required |

## Детальное описание фаз

### Фаза 1: Параллельное выполнение


#### architect - design

Design architecture and create ADR

**Артефакты:**
- adr
- component_structure
- api_design

**Критерий завершения:** Architecture documented and approved


#### ux-designer - design

Design user experience and UI flows

**Артефакты:**
- user_flows
- wireframes
- component_specifications

**Критерий завершения:** UX design completed and approved


### Фаза 2: Параллельное выполнение


#### developer - implementation

Implement backend logic and APIs with unit tests

**Артефакты:**
- code
- api_endpoints
- unit_tests
- documentation

**Критерий завершения:** Backend implemented and unit tests pass


#### ui-developer - implementation

Implement UI components following UX specifications

**Артефакты:**
- react_components
- ui_tests
- storybook_stories

**Критерий завершения:** UI implemented, responsive, and accessible


### Фаза 3: testing

**Агент:** `tester`

Create and run E2E tests

**Артефакты:**
- e2e_tests
- test_results

**Критерий завершения:** All E2E tests pass

**Timeout:** 30m


### Фаза 4: deployment

**Агент:** `devops`

Deploy to staging environment

**Артефакты:**
- deployment_logs

**Критерий завершения:** Deployed to staging successfully

**Timeout:** 15m

**⚠️ Требуется подтверждение перед продолжением**

## Критерий успеха

Feature deployed and working in staging with UX-designed UI

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('feature_implementation_full')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('implement feature...')
```

---

[← Назад к списку workflows](./index.md)
