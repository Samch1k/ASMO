# 🧪 Multi-Layer Testing

> Parallel unit + E2E + performance tests before deployment

## Overview

| Property | Value |
|----------|-------|
| **ID** | `comprehensive_testing` |
| **Estimated Time** | 35m |
| **Phases** | 2 |
| **Agents Involved** | 3 |

## Trigger Conditions

### Keywords
`test everything`, `full test`, `comprehensive test`, `тест все`, `полный тест`, `run all tests`

### Task Types
- testing

### Required Skills
- `unit_testing`
- `e2e_testing`
- `performance_analysis`



## Execution Phases

| # | Agent | Phase | Deliverables | Timeout | Approval |
|---|-------|-------|--------------|---------|----------|
| 1 | tester | unit_testing | unit_test_results | 15m | ⚡ Parallel |
|  | tester | e2e_testing | e2e_test_results | 25m |  |
|  | optimizer | performance_testing | performance_test_results | 20m |  |
| 2 | devops | deployment | deployment_logs | 10m | ✅ Required |

## Phase Details

### Phase 1: Parallel Execution


#### tester - unit_testing

Run unit tests

**Deliverables:**
- unit_test_results

**Exit Criteria:** All unit tests pass


#### tester - e2e_testing

Run E2E tests with Playwright

**Deliverables:**
- e2e_test_results

**Exit Criteria:** All E2E tests pass


#### optimizer - performance_testing

Run performance benchmarks

**Deliverables:**
- performance_test_results

**Exit Criteria:** Performance benchmarks meet thresholds


### Phase 2: deployment

**Agent:** `devops`

Deploy if all tests pass

**Deliverables:**
- deployment_logs

**Exit Criteria:** Deployed successfully

**Timeout:** 10m

**⚠️ Approval required before continuing**

## Success Criteria

All test layers pass and deployed

## Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Execute by ID
const result = await engine.execute('comprehensive_testing')

// Or adaptive selection by task description
const result = await engine.execute('test everything...')
```

---

[← Back to Workflows](./index.md)
