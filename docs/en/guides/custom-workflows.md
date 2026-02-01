# Custom Workflows

Learn how to create project-specific workflows for AI1st.

## Overview

Custom workflows allow you to:

- Define project-specific processes
- Customize agent sequences
- Add custom phases and checkpoints
- Integrate with your tooling

## Workflow Structure

```json
{
  "id": "my_workflow",
  "name": "My Custom Workflow",
  "description": "What this workflow does",
  "trigger_condition": {
    "keywords": ["keyword1", "keyword2"],
    "task_types": ["task_type"],
    "required_skills": ["skill1", "skill2"],
    "complexity_range": ["medium", "complex"]
  },
  "steps": [
    {
      "order": 1,
      "role_id": "agent_id",
      "phase": "phase_name",
      "description": "What this step does",
      "deliverables": ["output1", "output2"],
      "exit_criteria": "When to move forward",
      "timeout": "30m"
    }
  ],
  "estimated_time": "2h",
  "success_criteria": "Definition of done"
}
```

## Step 1: Define the Workflow

Create a JSON file:

```json
// .ai1st/workflows/deployment-workflow.json
{
  "id": "safe_deployment",
  "name": "Safe Deployment Workflow",
  "description": "Deploy with rollback capability and monitoring",
  "trigger_condition": {
    "keywords": [
      "deploy",
      "release",
      "ship to production"
    ],
    "task_types": ["deployment"],
    "required_skills": ["deployment", "monitoring"],
    "complexity_range": ["medium", "complex"]
  },
  "steps": [
    {
      "order": 1,
      "role_id": "tester",
      "phase": "pre_deployment_testing",
      "description": "Run full test suite before deployment",
      "deliverables": [
        "test_results",
        "coverage_report"
      ],
      "exit_criteria": "All tests pass with >80% coverage",
      "timeout": "30m"
    },
    {
      "order": 2,
      "role_id": "devops",
      "phase": "staging_deployment",
      "description": "Deploy to staging environment",
      "deliverables": [
        "staging_url",
        "deployment_logs"
      ],
      "exit_criteria": "Staging deployment successful",
      "timeout": "15m"
    },
    {
      "order": 3,
      "role_id": "tester",
      "phase": "staging_verification",
      "description": "Verify staging deployment",
      "deliverables": [
        "smoke_test_results"
      ],
      "exit_criteria": "Smoke tests pass on staging",
      "timeout": "20m"
    },
    {
      "order": 4,
      "role_id": "devops",
      "phase": "production_deployment",
      "description": "Deploy to production with canary release",
      "deliverables": [
        "production_url",
        "canary_metrics"
      ],
      "exit_criteria": "Canary shows healthy metrics",
      "timeout": "30m",
      "requires_approval": true
    },
    {
      "order": 5,
      "role_id": "post-deploy-monitor",
      "phase": "monitoring",
      "description": "Monitor production health",
      "deliverables": [
        "health_report",
        "error_rates"
      ],
      "exit_criteria": "Error rate below threshold for 15 minutes",
      "timeout": "20m"
    }
  ],
  "estimated_time": "2h",
  "success_criteria": "Production deployment successful with healthy metrics"
}
```

## Step 2: Add Parallel Execution

For steps that can run simultaneously:

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "architect",
      "phase": "design",
      "parallel_with": ["ux-designer"],
      "deliverables": ["architecture"]
    },
    {
      "order": 1,
      "role_id": "ux-designer",
      "phase": "design",
      "parallel_with": ["architect"],
      "deliverables": ["wireframes"]
    },
    {
      "order": 2,
      "role_id": "developer",
      "phase": "implementation",
      "description": "Implement after design is complete"
    }
  ]
}
```

## Step 3: Register the Workflow

### Configuration File

```typescript
// .ai1st/config/workflows.config.ts
export default {
  customWorkflows: [
    '.ai1st/workflows/deployment-workflow.json',
    '.ai1st/workflows/review-workflow.json'
  ]
}
```

### Programmatic Registration

```typescript
import { WorkflowEngine } from '@ai1st/core'
import safeDeployment from './.ai1st/workflows/deployment-workflow.json'

const engine = new WorkflowEngine(registry)
engine.registerWorkflow(safeDeployment)
```

## Step 4: Use the Workflow

### By ID

```typescript
const result = await engine.executeWorkflow('safe_deployment', {
  version: '1.2.3',
  environment: 'production'
})
```

### Adaptive Selection

If trigger conditions match, it will be selected automatically:

```typescript
const result = await engine.execute('Deploy version 1.2.3 to production')
// Matches keywords: deploy, production
// Selected workflow: safe_deployment
```

## Workflow Properties

### Trigger Conditions

```json
{
  "trigger_condition": {
    "keywords": ["deploy", "release"],     // Match task description
    "task_types": ["deployment"],          // Match task type
    "required_skills": ["deployment"],     // Match required skills
    "complexity_range": ["medium", "complex"]  // Match complexity
  }
}
```

### Step Properties

| Property | Required | Description |
|----------|----------|-------------|
| `order` | Yes | Execution order (1, 2, 3...) |
| `role_id` | Yes | Agent to execute |
| `phase` | Yes | Phase name |
| `description` | Yes | What the step does |
| `deliverables` | Yes | Expected outputs |
| `exit_criteria` | Yes | Success condition |
| `timeout` | Yes | Max execution time |
| `parallel_with` | No | Agents to run in parallel |
| `requires_approval` | No | Need approval to continue |

### Metadata

```json
{
  "metadata": {
    "category": "deployment",
    "version": "1.0.0",
    "author": "DevOps Team",
    "tags": ["production", "canary"]
  }
}
```

## Advanced Patterns

### Conditional Steps

Use metadata for conditional logic:

```json
{
  "order": 3,
  "role_id": "security-specialist",
  "phase": "security_check",
  "metadata": {
    "condition": "hasSecurityChanges"
  }
}
```

Handle in code:

```typescript
const step = workflow.steps[2]
if (step.metadata?.condition === 'hasSecurityChanges') {
  if (!context.hasSecurityChanges) {
    // Skip this step
    continue
  }
}
```

### Rollback Steps

```json
{
  "rollback_steps": [
    {
      "role_id": "devops",
      "phase": "rollback",
      "description": "Rollback to previous version",
      "trigger_on": "failure"
    }
  ]
}
```

### Quality Gates

```json
{
  "quality_gates": [
    {
      "after_phase": "testing",
      "criteria": {
        "test_coverage": ">= 80%",
        "no_critical_bugs": true
      }
    }
  ]
}
```

## Testing Workflows

```typescript
// tests/workflows/deployment.test.ts
import { WorkflowEngine, MockRegistry } from '@ai1st/core/testing'
import safeDeployment from '../../.ai1st/workflows/deployment-workflow.json'

describe('Safe Deployment Workflow', () => {
  it('should execute all steps in order', async () => {
    const registry = new MockRegistry()
    const engine = new WorkflowEngine(registry)
    engine.registerWorkflow(safeDeployment)

    const result = await engine.executeWorkflow('safe_deployment', {
      version: '1.0.0'
    })

    expect(result.status).toBe('completed')
    expect(result.steps).toHaveLength(5)
    expect(result.steps[3].phase).toBe('production_deployment')
  })

  it('should require approval for production', async () => {
    const step = safeDeployment.steps.find(
      s => s.phase === 'production_deployment'
    )
    expect(step.requires_approval).toBe(true)
  })
})
```

## Best Practices

### 1. Clear Phase Names

```json
// Good
"phase": "pre_deployment_testing"

// Bad
"phase": "step1"
```

### 2. Specific Exit Criteria

```json
// Good
"exit_criteria": "All tests pass with >80% coverage"

// Bad
"exit_criteria": "Done"
```

### 3. Realistic Timeouts

```json
// Match actual execution time
"timeout": "30m"  // Not too short, not too long
```

### 4. Meaningful Deliverables

```json
"deliverables": [
  "test_results",
  "coverage_report",
  "deployment_logs"
]
```

### 5. Approval for High-Risk Steps

```json
{
  "phase": "production_deployment",
  "requires_approval": true
}
```

## See Also

- [Workflow Concepts](../concepts/workflows.md)
- [Workflow Catalog](../reference/workflows/index.md)
- [Custom Agents](./custom-agents.md)
