# Adaptive Workflow Selection

Learn how AI1st automatically selects the best workflow for your tasks.

## Overview

Instead of manually choosing workflows, describe your task and let AI1st:

1. **Analyze** task complexity
2. **Match** required skills
3. **Select** optimal workflow
4. **Execute** with appropriate agents

## Basic Usage

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry)
await engine.initialize()

// Just describe what you need
const result = await engine.execute(
  'Add user authentication with OAuth2'
)

// AI1st automatically selects:
// - Complexity: 65 (complex)
// - Workflow: security_audit
// - Agents: architect, security-specialist, developer, tester
```

## Selection Process

### Step 1: Complexity Analysis

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Refactor the authentication module'
)

console.log(selection.complexity)
// {
//   score: 55,
//   level: 'medium',
//   confidence: 0.82,
//   factors: {
//     filesAffected: 8,
//     dependencies: 3,
//     riskLevel: 'medium',
//     domainExpertiseRequired: false,
//     estimatedLOC: 350,
//     dataChanges: false,
//     securityImpact: true,
//     performanceImpact: false
//   }
// }
```

### Step 2: Workflow Matching

```typescript
console.log(selection.workflow)
// {
//   id: 'code_refactoring',
//   name: 'Code Refactoring',
//   estimated_time: '3h 30m'
// }

console.log(selection.reasoning)
// "Task involves code quality improvement without adding new
// features. Matched refactoring keywords. Medium complexity
// suggests standard refactoring workflow..."
```

### Step 3: Agent Selection

```typescript
console.log(selection.complexity.recommendedAgents)
// ['architect', 'code-reviewer', 'developer', 'tester']
```

## Providing Context

Improve selection accuracy with project context:

```typescript
const result = await engine.execute(
  'Add payment processing',
  undefined,
  {
    projectSize: 'large',
    techStack: ['Node.js', 'PostgreSQL', 'Stripe'],
    hasTests: true,
    hasCICD: true,
    teamSize: 8
  }
)
```

### Context Options

| Option | Type | Description |
|--------|------|-------------|
| `projectSize` | 'small' \| 'medium' \| 'large' | Project scale |
| `techStack` | string[] | Technologies used |
| `hasTests` | boolean | Has test suite |
| `hasCICD` | boolean | Has CI/CD pipeline |
| `teamSize` | number | Team members |
| `domain` | string | Business domain |

## Complexity Thresholds

| Level | Score | Typical Selection |
|-------|-------|-------------------|
| Trivial | 0-20 | Bug Fix (YOLO Mode) |
| Simple | 21-40 | Bug Fix |
| Medium | 41-60 | Feature Development |
| Complex | 61-80 | Security Audit |
| Enterprise | 81-100 | Architecture Design |

## Customizing Selection

### Override Defaults

```typescript
// .ai1st/config/workflows.config.ts
export default {
  defaultWorkflows: {
    trivial: 'bug_fix_workflow',
    simple: 'feature_implementation_full',  // Override default
    medium: 'feature_implementation_full',
    complex: 'security_audit',
    enterprise: 'architecture_design'
  }
}
```

### Fallback Workflow

```typescript
export default {
  adaptiveSelection: {
    enabled: true,
    confidenceThreshold: 0.7,
    fallbackWorkflow: 'feature_implementation_full'
  }
}
```

### Disable Adaptive Selection

```typescript
// Force specific workflow
const result = await engine.executeWorkflow('bug_fix_workflow', {
  task: 'Fix login issue'
})
```

## Selection Confidence

Check selection confidence before executing:

```typescript
const selection = await engine.selectWorkflowAdaptively(task)

if (selection.confidence < 0.6) {
  console.log('Low confidence, consider manual selection')
  console.log('Alternatives:', selection.alternatives)
}
```

### Alternatives

```typescript
console.log(selection.alternatives)
// [
//   { workflow: 'feature_implementation_full', confidence: 0.65 },
//   { workflow: 'code_refactoring', confidence: 0.55 }
// ]
```

## Debugging Selection

### Get Detailed Analysis

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Add caching layer',
  { projectSize: 'large' }
)

console.log('Task:', 'Add caching layer')
console.log('Score:', selection.complexity.score)
console.log('Level:', selection.complexity.level)
console.log('Workflow:', selection.workflow.name)
console.log('Agents:', selection.complexity.recommendedAgents)
console.log('Reasoning:', selection.reasoning)
console.log('Confidence:', selection.confidence)
console.log('Factors:', JSON.stringify(selection.complexity.factors, null, 2))
```

### Logging

Enable debug logging:

```bash
export AI1ST_LOG_LEVEL=debug
```

## Best Practices

1. **Provide Context** - More context = better selection
2. **Use Natural Language** - Describe tasks clearly
3. **Check Confidence** - Verify high-impact selections
4. **Review Reasoning** - Understand why a workflow was chosen
5. **Iterate** - Refine task descriptions if needed

## See Also

- [Complexity Analysis](../concepts/complexity.md)
- [Available Workflows](../reference/workflows/index.md)
- [YOLO Mode](./yolo-mode.md)
