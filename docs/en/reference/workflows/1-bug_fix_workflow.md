# 🐛 Bug Fix Workflow

> Debug → Fix → Test pipeline for bug fixes

## Overview

| Property | Value |
|----------|-------|
| **ID** | `bug_fix_workflow` |
| **Estimated Time** | 1h 5m |
| **Phases** | 3 |
| **Agents Involved** | 3 |

## Trigger Conditions

### Keywords
`bug`, `error`, `broken`, `fail`, `crash`, `fix`

### Task Types
- bug_fix

### Required Skills
- `debugging`
- `code_writing`



## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | debugger | investigation | bug_report, root_cause_analysis | 15m | - |
| 2 | developer | fix_implementation | code, unit_tests | 30m | - |
| 3 | tester | verification | test_results | 20m | - |

## Phase Details

### Phase 1: investigation

**Agent:** `debugger`

Investigate root cause of the bug

**Deliverables:**
- bug_report
- root_cause_analysis

**Exit Criteria:** Root cause identified and documented

**Timeout:** 15m


### Phase 2: fix_implementation

**Agent:** `developer`

Implement the fix based on investigation

**Deliverables:**
- code
- unit_tests

**Exit Criteria:** Fix implemented and unit tests pass

**Timeout:** 30m


### Phase 3: verification

**Agent:** `tester`

Verify bug is fixed with E2E tests

**Deliverables:**
- test_results

**Exit Criteria:** Bug no longer reproduces in E2E tests

**Timeout:** 20m


## Success Criteria

All tests pass and bug is resolved

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('bug_fix_workflow')

// Or adaptive selection by task description
const result = await engine.execute('bug...')
```

---

[← Back to Workflows](./index.md)
