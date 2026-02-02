# Test Architect Agent (TEA)

Test Engineering Architect for comprehensive test strategy and quality assurance.

## Overview

The Test Architect Agent (TEA) designs and oversees testing strategies for software projects. It handles risk-based testing, quality gates, release readiness, and test automation frameworks.

## Capabilities

| Skill | Description |
|-------|-------------|
| `test_strategy` | Comprehensive test planning |
| `risk_based_testing` | Priority-based test selection |
| `quality_gates` | Quality criteria definition |
| `release_readiness` | Release validation |
| `test_automation` | Automation framework design |
| `regression_analysis` | Regression impact assessment |
| `test_maintenance` | Test suite optimization |
| `coverage_analysis` | Code coverage strategies |

## TEA Workflows

The Test Architect Agent supports 8 specialized testing workflows:

| Workflow | Description |
|----------|-------------|
| `tea-1-risk-assessment` | Identify testing risks and priorities |
| `tea-2-test-strategy` | Define comprehensive test approach |
| `tea-3-test-design` | Design test cases and scenarios |
| `tea-4-test-automation` | Automation framework setup |
| `tea-5-quality-gates` | Define quality criteria |
| `tea-6-release-readiness` | Validate release criteria |
| `tea-7-regression-analysis` | Analyze regression impact |
| `tea-8-test-maintenance` | Optimize test suite |

## Configuration

```yaml
# agents.yaml
test-architect:
  id: test-architect
  name: Test Architect
  model_preference: sonnet
  role:
    id: test-architect
    seniority: lead
    expertise:
      - test_strategy
      - quality_engineering
      - automation_frameworks
```

## Usage

```typescript
import { TestArchitectAgent } from '@asmo/core'

const tea = new TestArchitectAgent()

const result = await tea.execute({
  task: 'Create test strategy for payment processing module',
  context: {
    module: 'payments',
    riskLevel: 'high',
    coverage: { current: 45, target: 80 }
  }
})

console.log(result.context.testStrategy)
console.log(result.context.qualityGates)
```

## Test Strategy Components

### Risk Assessment
- Business impact analysis
- Technical complexity evaluation
- Historical defect patterns
- Integration points identification

### Quality Gates
- Code coverage thresholds
- Performance benchmarks
- Security scan requirements
- Documentation completeness

### Automation Framework
- Tool selection (Jest, Playwright, etc.)
- CI/CD integration
- Parallel execution strategy
- Reporting and dashboards

## Output Artifacts

- Test Strategy Document
- Risk Assessment Matrix
- Quality Gate Definitions
- Test Plan
- Automation Framework Specification

## MCP Integrations

- **Filesystem MCP**: Analyzes existing tests and code
- **Memory MCP**: Tracks test history and patterns
- **Context7 MCP**: References testing best practices

## See Also

- [TEA Testing Guide](/docs/en/guides/tea-testing.md)
- [Quality Assurance Workflow](/docs/en/reference/workflows/3-quality-assurance.md)
- [Tester Agent](/docs/en/reference/agents/core/tester.md)
