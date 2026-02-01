# 🎨 UI Component Library Development

> UX-first component development: Design UX → Implement UI → Test Accessibility

## Overview

| Property | Value |
|----------|-------|
| **ID** | `ui_component_library` |
| **Estimated Time** | 1h 20m |
| **Phases** | 3 |
| **Agents Involved** | 3 |

## Trigger Conditions

### Keywords
`ui component`, `design system`, `component library`, `reusable component`, `ui элемент`, `компонент библиотеки`

### Task Types
- feature

### Required Skills
- `ui_development`
- `react`
- `accessibility`
- `ux_design`



## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | ux-designer | design | user_flows, wireframes | 20m | - |
| 2 | ui-developer | implementation | react_component, component_tests | 40m | - |
| 3 | tester | testing | accessibility_test_results, responsive_test_results | 20m | - |

## Phase Details

### Phase 1: design

**Agent:** `ux-designer`

Design component UX: user flows, wireframes, states, accessibility

**Deliverables:**
- user_flows
- wireframes
- component_specifications
- accessibility_checklist
- interaction_patterns

**Exit Criteria:** Component UX designed with all states and accessibility requirements documented

**Timeout:** 20m


### Phase 2: implementation

**Agent:** `ui-developer`

Implement React component following UX specifications

**Deliverables:**
- react_component
- component_tests
- storybook_stories
- typescript_types

**Exit Criteria:** Component implemented with all variants, responsive, and unit tested

**Timeout:** 40m


### Phase 3: testing

**Agent:** `tester`

Test accessibility (WCAG 2.1 AA) and responsive behavior

**Deliverables:**
- accessibility_test_results
- responsive_test_results
- browser_compatibility_results

**Exit Criteria:** Component passes WCAG 2.1 AA and works across breakpoints

**Timeout:** 20m


## Success Criteria

Component is accessible, responsive, and ready for production use

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('ui_component_library')

// Or adaptive selection by task description
const result = await engine.execute('ui component...')
```

---

[← Back to Workflows](./index.md)
