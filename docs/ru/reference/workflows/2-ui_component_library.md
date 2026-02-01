# 🎨 UI Component Library Development

> UX-first component development: Design UX → Implement UI → Test Accessibility

## Обзор

| Параметр | Значение |
|----------|----------|
| **ID** | `ui_component_library` |
| **Время выполнения** | 1h 20m |
| **Количество фаз** | 3 |
| **Агентов задействовано** | 3 |

## Условия запуска

### Ключевые слова
`ui component`, `design system`, `component library`, `reusable component`, `ui элемент`, `компонент библиотеки`

### Типы задач
- feature

### Необходимые навыки
- `ui_development`
- `react`
- `accessibility`
- `ux_design`



## Фазы выполнения

| # | Агент | Фаза | Артефакты | Timeout | Approve |
|---|-------|------|-----------|---------|---------|
| 1 | ux-designer | design | user_flows, wireframes | 20m | - |
| 2 | ui-developer | implementation | react_component, component_tests | 40m | - |
| 3 | tester | testing | accessibility_test_results, responsive_test_results | 20m | - |

## Детальное описание фаз

### Фаза 1: design

**Агент:** `ux-designer`

Design component UX: user flows, wireframes, states, accessibility

**Артефакты:**
- user_flows
- wireframes
- component_specifications
- accessibility_checklist
- interaction_patterns

**Критерий завершения:** Component UX designed with all states and accessibility requirements documented

**Timeout:** 20m


### Фаза 2: implementation

**Агент:** `ui-developer`

Implement React component following UX specifications

**Артефакты:**
- react_component
- component_tests
- storybook_stories
- typescript_types

**Критерий завершения:** Component implemented with all variants, responsive, and unit tested

**Timeout:** 40m


### Фаза 3: testing

**Агент:** `tester`

Test accessibility (WCAG 2.1 AA) and responsive behavior

**Артефакты:**
- accessibility_test_results
- responsive_test_results
- browser_compatibility_results

**Критерий завершения:** Component passes WCAG 2.1 AA and works across breakpoints

**Timeout:** 20m


## Критерий успеха

Component is accessible, responsive, and ready for production use

## Использование

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Запуск по ID
const result = await engine.execute('ui_component_library')

// Или адаптивный выбор по описанию задачи
const result = await engine.execute('ui component...')
```

---

[← Назад к списку workflows](./index.md)
