# TEA Module - Test Architecture

The TEA (Test Architecture) module provides enterprise-grade testing workflows managed by the Test Architect agent.

## Overview

TEA offers 8 specialized workflows for comprehensive testing:

```
┌─────────────────────────────────────────────────────────────────┐
│                       TEA Module                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Planning           Execution          Maintenance              │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐             │
│  │Risk      │      │Test      │       │Regression│             │
│  │Assessment│──────│Design    │───────│Analysis  │             │
│  └──────────┘      └──────────┘       └──────────┘             │
│       │                 │                  │                    │
│       ▼                 ▼                  ▼                    │
│  ┌──────────┐      ┌──────────┐       ┌──────────┐             │
│  │Test      │      │Automation│       │Test      │             │
│  │Strategy  │──────│Framework │───────│Maintenance│             │
│  └──────────┘      └──────────┘       └──────────┘             │
│       │                 │                                       │
│       ▼                 ▼                                       │
│  ┌──────────┐      ┌──────────┐                                 │
│  │Quality   │      │Release   │                                 │
│  │Gates     │──────│Readiness │                                 │
│  └──────────┘      └──────────┘                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## TEA Workflows

### 1. Risk Assessment (`tea-1-risk-assessment`)

Identify testing risks and prioritize areas.

```typescript
const result = await engine.execute('tea-1-risk-assessment', {
  task: 'Assess testing risks for payment module',
  context: { module: 'payments', complexity: 'high' }
})
```

**Outputs:**
- Risk matrix
- Prioritized risk list
- Mitigation recommendations

### 2. Test Strategy (`tea-2-test-strategy`)

Define comprehensive test approach.

```typescript
const result = await engine.execute('tea-2-test-strategy', {
  task: 'Create test strategy for e-commerce platform'
})
```

**Outputs:**
- Test strategy document
- Test level definitions
- Coverage targets
- Tool recommendations

### 3. Test Design (`tea-3-test-design`)

Design test cases and scenarios.

```typescript
const result = await engine.execute('tea-3-test-design', {
  task: 'Design test cases for user registration',
  context: { feature: 'registration', requirements: [...] }
})
```

**Outputs:**
- Test case specifications
- Test data requirements
- Expected results
- Traceability matrix

### 4. Test Automation (`tea-4-test-automation`)

Create automation framework and scripts.

```typescript
const result = await engine.execute('tea-4-test-automation', {
  task: 'Implement automation for checkout flow',
  context: { framework: 'playwright', language: 'typescript' }
})
```

**Outputs:**
- Automation framework setup
- Test scripts
- CI/CD integration
- Reporting configuration

### 5. Quality Gates (`tea-5-quality-gates`)

Define quality criteria and gates.

```typescript
const result = await engine.execute('tea-5-quality-gates', {
  task: 'Define quality gates for release pipeline'
})
```

**Outputs:**
- Quality gate definitions
- Pass/fail criteria
- Metric thresholds
- Escalation procedures

### 6. Release Readiness (`tea-6-release-readiness`)

Validate release criteria.

```typescript
const result = await engine.execute('tea-6-release-readiness', {
  task: 'Assess release readiness for v2.0',
  context: { version: '2.0', testResults: {...} }
})
```

**Outputs:**
- Readiness assessment
- Outstanding risks
- Go/no-go recommendation
- Deployment checklist

### 7. Regression Analysis (`tea-7-regression-analysis`)

Analyze regression impact.

```typescript
const result = await engine.execute('tea-7-regression-analysis', {
  task: 'Analyze regression impact of authentication changes',
  context: { changedFiles: [...], testHistory: {...} }
})
```

**Outputs:**
- Impact analysis
- Affected test cases
- Regression suite recommendations
- Priority order

### 8. Test Maintenance (`tea-8-test-maintenance`)

Optimize and maintain test suite.

```typescript
const result = await engine.execute('tea-8-test-maintenance', {
  task: 'Optimize slow-running test suite',
  context: { executionTimes: {...}, failureRates: {...} }
})
```

**Outputs:**
- Maintenance recommendations
- Flaky test identification
- Optimization suggestions
- Cleanup candidates

## Test Architect Agent

The `TestArchitectAgent` powers all TEA workflows:

```typescript
import { TestArchitectAgent } from '@ai1st/core'

const architect = new TestArchitectAgent()
const info = architect.getInfo()

console.log('Capabilities:', info.capabilities)
// ['test_strategy', 'risk_based_testing', 'quality_gates', 'release_readiness']
```

## Configuration

```typescript
const config = {
  tea: {
    enabled: true,
    qualityGateThreshold: 80  // Minimum quality score
  }
}
```

## Quality Metrics

TEA tracks these quality metrics:

| Metric | Description | Threshold |
|--------|-------------|-----------|
| Code Coverage | Lines covered by tests | 80% |
| Test Pass Rate | Passing tests ratio | 95% |
| Critical Bugs | P0/P1 bug count | 0 |
| Test Execution Time | Total runtime | < 30min |
| Flaky Test Rate | Tests with inconsistent results | < 2% |

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: TEA Quality Gates

on: [push, pull_request]

jobs:
  tea-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run Tests
        run: pnpm test

      - name: TEA Quality Gate
        run: |
          npx ai1st tea quality-gates \
            --coverage-file coverage/lcov.info \
            --test-results test-results.json \
            --threshold 80
```

## Workflow Selection Guide

| Scenario | Recommended Workflow |
|----------|---------------------|
| New project setup | tea-1 → tea-2 → tea-3 |
| New feature | tea-3 → tea-4 |
| Before release | tea-5 → tea-6 |
| After changes | tea-7 |
| Performance issues | tea-8 |
| Full audit | tea-1 through tea-8 |

## Best Practices

1. **Start with Risk Assessment:**
   - Always begin with tea-1 for new projects
   - Prioritize testing based on risk

2. **Define Clear Quality Gates:**
   - Set measurable thresholds
   - Automate gate checking in CI/CD

3. **Maintain Test Suite Health:**
   - Run tea-8 periodically
   - Address flaky tests immediately

4. **Document Everything:**
   - Keep test strategy up to date
   - Maintain traceability matrices

## Related

- [Test Architect Agent](../reference/agents/test-architect.md)
- [Quality Gates Workflow](../reference/workflows/tea-5-quality-gates.md)
- [Adversarial Review](../concepts/adversarial-review.md)
