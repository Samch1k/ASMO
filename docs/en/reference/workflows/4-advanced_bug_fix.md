# 🔧 Advanced Bug Fix

> Comprehensive bug resolution with root cause analysis and prevention

## Overview

| Property | Value |
|----------|-------|
| **ID** | `advanced_bug_fix` |
| **Estimated Time** | 3h 20m |
| **Phases** | 5 |
| **Agents Involved** | 5 |

## Trigger Conditions

### Keywords
`complex bug`, `system bug`, `critical bug`, `production issue`, `outage`, `crash`

### Task Types
- bug_fix
- incident_response

### Required Skills
- `debugging`
- `root_cause_analysis`
- `system_design`

### Complexity Range
- medium
- complex

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | debugger | investigation | detailed_bug_report, root_cause_analysis | 45m | - |
| 2 | architect | solution_design | fix_design, prevention_strategy | 30m | - |
| 3 | developer | implementation | code, unit_tests | 60m | - |
| 4 | tester | verification | test_results, regression_test_results | 45m | - |
| 5 | code-reviewer | review | code_review_report, improvement_suggestions | 20m | - |

## Phase Details

### Phase 1: investigation

**Agent:** `debugger`

Deep investigation of the bug including system analysis

**Deliverables:**
- detailed_bug_report
- root_cause_analysis
- impact_assessment
- reproduction_steps

**Exit Criteria:** Root cause identified with full understanding of system impact

**Timeout:** 45m


### Phase 2: solution_design

**Agent:** `architect`

Design comprehensive fix that addresses root cause and prevents recurrence

**Deliverables:**
- fix_design
- prevention_strategy
- testing_strategy

**Exit Criteria:** Fix approach approved with prevention measures defined

**Timeout:** 30m


### Phase 3: implementation

**Agent:** `developer`

Implement fix with proper error handling and logging

**Deliverables:**
- code
- unit_tests
- integration_tests
- updated_documentation

**Exit Criteria:** Fix implemented with comprehensive tests

**Timeout:** 60m


### Phase 4: verification

**Agent:** `tester`

Thorough testing including edge cases and regression testing

**Deliverables:**
- test_results
- regression_test_results
- performance_impact_analysis

**Exit Criteria:** Bug verified as fixed with no regressions

**Timeout:** 45m


### Phase 5: review

**Agent:** `code-reviewer`

Review fix for quality and prevention measures

**Deliverables:**
- code_review_report
- improvement_suggestions

**Exit Criteria:** Code reviewed and approved

**Timeout:** 20m


## Success Criteria

Bug resolved, prevention measures in place, all tests passing, no regressions

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@asmo/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('advanced_bug_fix')

// Or adaptive selection by task description
const result = await engine.execute('complex bug...')
```

---

[← Back to Workflows](./index.md)
