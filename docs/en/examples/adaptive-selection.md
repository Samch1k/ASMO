# Adaptive Selection Example

Let AI1st automatically select the best workflow for your task.

## Scenario

You need to add user authentication. Instead of choosing a workflow manually, let AI1st analyze the task and select the appropriate workflow.

## Basic Adaptive Selection

```typescript
import { WorkflowEngine, AgentRegistry } from '@ai1st/core'

async function main() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  // Just describe what you need
  const result = await engine.execute(
    'Add user authentication with OAuth2 and JWT tokens'
  )

  console.log('Selected workflow:', result.workflowId)
  console.log('Complexity score:', result.metrics.complexityScore)
}
```

## Detailed Analysis

Get the full analysis before executing:

```typescript
async function analyzeTask() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  const task = 'Add user authentication with OAuth2 and JWT tokens'

  // Get selection with analysis
  const selection = await engine.selectWorkflowAdaptively(task, {
    projectSize: 'large',
    techStack: ['React', 'Node.js', 'PostgreSQL']
  })

  console.log('\n📊 Task Analysis')
  console.log('================')
  console.log(`Task: ${task}`)
  console.log(`\nComplexity:`)
  console.log(`  Score: ${selection.complexity.score}/100`)
  console.log(`  Level: ${selection.complexity.level}`)
  console.log(`  Confidence: ${(selection.confidence * 100).toFixed(0)}%`)

  console.log(`\nFactors:`)
  const factors = selection.complexity.factors
  console.log(`  Files affected: ${factors.filesAffected}`)
  console.log(`  Dependencies: ${factors.dependencies}`)
  console.log(`  Risk level: ${factors.riskLevel}`)
  console.log(`  Security impact: ${factors.securityImpact}`)
  console.log(`  Domain expertise: ${factors.domainExpertiseRequired}`)

  console.log(`\nRecommendation:`)
  console.log(`  Workflow: ${selection.workflow.name}`)
  console.log(`  Agents: ${selection.complexity.recommendedAgents.join(', ')}`)
  console.log(`  Reasoning: ${selection.reasoning}`)

  // Now execute with the selected workflow
  console.log('\n🚀 Executing selected workflow...')
  const result = await engine.executeWorkflow(selection.workflow.id, { task })

  console.log('\n✅ Complete!')
  console.log(`  Status: ${result.status}`)
  console.log(`  Artifacts: ${result.artifacts.length}`)
}

analyzeTask()
```

## Example Output

```
📊 Task Analysis
================
Task: Add user authentication with OAuth2 and JWT tokens

Complexity:
  Score: 68/100
  Level: complex
  Confidence: 85%

Factors:
  Files affected: 12
  Dependencies: 5
  Risk level: high
  Security impact: true
  Domain expertise: true

Recommendation:
  Workflow: Security Audit
  Agents: architect, security-specialist, developer, tester
  Reasoning: Authentication with OAuth2 requires security expertise.
             High security impact and external dependencies suggest
             the security audit workflow for proper review.

🚀 Executing selected workflow...

✅ Complete!
  Status: completed
  Artifacts: 8
```

## Comparing Different Tasks

```typescript
async function compareTasks() {
  const registry = new AgentRegistry()
  const engine = new WorkflowEngine(registry)
  await engine.initialize()

  const tasks = [
    'Fix typo in README',
    'Add loading spinner to dashboard',
    'Implement user profile page',
    'Add OAuth2 authentication',
    'Design microservices architecture'
  ]

  console.log('Task Complexity Analysis\n')
  console.log('| Task | Score | Level | Workflow |')
  console.log('|------|-------|-------|----------|')

  for (const task of tasks) {
    const selection = await engine.selectWorkflowAdaptively(task)
    console.log(
      `| ${task.slice(0, 30)}... | ${selection.complexity.score} | ${selection.complexity.level} | ${selection.workflow.name} |`
    )
  }
}
```

## Output

```
Task Complexity Analysis

| Task | Score | Level | Workflow |
|------|-------|-------|----------|
| Fix typo in README... | 12 | trivial | Bug Fix Workflow |
| Add loading spinner to dashbo... | 28 | simple | Bug Fix Workflow |
| Implement user profile page... | 45 | medium | Full Feature Implementation |
| Add OAuth2 authentication... | 68 | complex | Security Audit |
| Design microservices architec... | 85 | enterprise | Architecture Design |
```

## With Project Context

Improve accuracy by providing context:

```typescript
const selection = await engine.selectWorkflowAdaptively(
  'Add payment processing with Stripe',
  {
    projectSize: 'large',
    techStack: ['Next.js', 'Node.js', 'PostgreSQL', 'Stripe'],
    hasTests: true,
    hasCICD: true,
    teamSize: 8,
    domain: 'e-commerce'
  }
)
```

## Handling Low Confidence

```typescript
const selection = await engine.selectWorkflowAdaptively(task)

if (selection.confidence < 0.6) {
  console.log('⚠️ Low confidence in selection')
  console.log('Alternatives:')
  for (const alt of selection.alternatives) {
    console.log(`  - ${alt.workflow.name} (${(alt.confidence * 100).toFixed(0)}%)`)
  }

  // Ask user or use fallback
}
```

## Next Steps

- [Multi-Agent Example](./multi-agent.md) - Use Party Mode
- [Adaptive Workflow Guide](../guides/adaptive-workflow.md) - Deep dive
