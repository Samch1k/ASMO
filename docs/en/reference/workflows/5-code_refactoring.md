# ♻️ Code Refactoring

> Systematic code quality improvement while maintaining functionality

## Overview

| Property | Value |
|----------|-------|
| **ID** | `code_refactoring` |
| **Estimated Time** | 3h 30m |
| **Phases** | 5 |
| **Agents Involved** | 4 |

## Trigger Conditions

### Keywords
`refactor`, `cleanup`, `improve code`, `technical debt`, `code quality`, `рефакторинг`

### Task Types
- refactoring
- code_quality
- maintenance

### Required Skills
- `code_writing`
- `architecture_review`
- `code_optimization`

### Complexity Range
- simple
- medium
- complex

## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | architect | analysis | code_analysis_report, improvement_recommendations | 30m | - |
| 2 | code-reviewer | assessment | quality_assessment, prioritized_issues | 20m | - |
| 3 | tester | test_preparation | baseline_tests, test_coverage_report | 40m | - |
| 4 | developer | refactoring | refactored_code, updated_tests | 90m | - |
| 5 | code-reviewer | validation | quality_comparison, review_report | 30m | - |

## Phase Details

### Phase 1: analysis

**Agent:** `architect`

Analyze current code structure and identify improvement opportunities

**Deliverables:**
- code_analysis_report
- improvement_recommendations
- refactoring_plan

**Exit Criteria:** Refactoring scope and approach clearly defined

**Timeout:** 30m


### Phase 2: assessment

**Agent:** `code-reviewer`

Review code quality issues and prioritize refactoring targets

**Deliverables:**
- quality_assessment
- prioritized_issues
- risk_analysis

**Exit Criteria:** Refactoring priorities established with risk assessment

**Timeout:** 20m


### Phase 3: test_preparation

**Agent:** `tester`

Establish baseline tests to ensure no functionality regression

**Deliverables:**
- baseline_tests
- test_coverage_report
- regression_test_suite

**Exit Criteria:** Comprehensive test suite in place before refactoring

**Timeout:** 40m


### Phase 4: refactoring

**Agent:** `developer`

Implement refactoring changes incrementally with continuous testing

**Deliverables:**
- refactored_code
- updated_tests
- migration_guide

**Exit Criteria:** Code refactored, all tests passing, functionality preserved

**Timeout:** 90m


### Phase 5: validation

**Agent:** `code-reviewer`

Verify refactoring improved code quality without breaking functionality

**Deliverables:**
- quality_comparison
- review_report
- approval

**Exit Criteria:** Code quality improved and functionality verified

**Timeout:** 30m


## Success Criteria

Code quality improved, all tests passing, no functionality regression, documentation updated

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('code_refactoring')

// Or adaptive selection by task description
const result = await engine.execute('refactor...')
```

---

[← Back to Workflows](./index.md)
