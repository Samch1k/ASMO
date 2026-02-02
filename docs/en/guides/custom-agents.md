# Custom Agents

Learn how to create your own specialized agents for ASMO.

## Overview

Custom agents allow you to:

- Add domain-specific expertise
- Integrate with proprietary tools
- Customize agent behavior
- Extend ASMO capabilities

## Agent Structure

Every agent has these components:

```json
{
  "id": "my-custom-agent",
  "name": "My Custom Agent",
  "description": "Does something specific...",
  "category": "project_specific",
  "role_type": "hybrid",
  "can_modify_code": true,
  "requires_plan": false,
  "required_skills": ["skill1", "skill2"],
  "optional_skills": ["skill3"],
  "priority": 5,
  "allowed_mcps": ["filesystem", "memory"],
  "activation_rules": {
    "type": "auto_attached",
    "trigger_keywords": ["keyword1", "keyword2"],
    "task_types": ["task_type"]
  },
  "agent_class": "MyCustomAgent",
  "metadata": {
    "llm_temperature": 0.2,
    "max_tokens": 8192,
    "domain": "My Domain"
  }
}
```

## Step 1: Define the Role

Create a JSON file in your project:

```typescript
// .asmo/roles/payment-specialist.json
{
  "id": "payment-specialist",
  "name": "Payment Specialist",
  "description": "Handles payment integration, Stripe API, and transaction processing",
  "category": "project_specific",
  "role_type": "hybrid",
  "can_modify_code": true,
  "requires_plan": true,
  "required_skills": [
    "payment_integration",
    "stripe_api",
    "security"
  ],
  "optional_skills": [
    "compliance",
    "fraud_detection"
  ],
  "priority": 8,
  "allowed_mcps": [
    "filesystem",
    "context7",
    "stripe"
  ],
  "activation_rules": {
    "type": "auto_attached",
    "trigger_keywords": [
      "payment",
      "stripe",
      "checkout",
      "transaction",
      "billing"
    ],
    "task_types": [
      "payment",
      "integration"
    ]
  },
  "agent_class": "PaymentSpecialistAgent",
  "metadata": {
    "llm_temperature": 0.1,
    "max_tokens": 8192,
    "output_artifacts": ["code", "documentation"],
    "domain": "Payment Processing"
  }
}
```

## Step 2: Create the Agent Class

Implement the agent logic:

```typescript
// .asmo/agents/payment-specialist.ts
import { BaseAgent, AgentState, AgentResult } from '@asmo/core'

export class PaymentSpecialistAgent extends BaseAgent {
  readonly id = 'payment-specialist'
  readonly name = 'Payment Specialist'

  async execute(state: AgentState): Promise<AgentResult> {
    const { task, context } = state

    // 1. Analyze the payment task
    const analysis = await this.analyzeTask(task)

    // 2. Check security requirements
    if (analysis.requiresSecurity) {
      await this.runSecurityCheck(context)
    }

    // 3. Implement the payment logic
    const implementation = await this.implement(task, context)

    // 4. Generate tests
    const tests = await this.generateTests(implementation)

    return {
      success: true,
      output: {
        analysis,
        implementation,
        tests
      },
      artifacts: [
        { type: 'code', path: implementation.filePath },
        { type: 'test', path: tests.filePath }
      ]
    }
  }

  private async analyzeTask(task: string) {
    // Custom analysis logic
    return {
      type: this.detectPaymentType(task),
      requiresSecurity: task.includes('credit card') || task.includes('pci'),
      estimatedComplexity: 'medium'
    }
  }

  private detectPaymentType(task: string): string {
    if (task.includes('subscription')) return 'subscription'
    if (task.includes('one-time')) return 'one-time'
    return 'standard'
  }

  private async runSecurityCheck(context: any) {
    // PCI compliance checks, etc.
  }

  private async implement(task: string, context: any) {
    // Implementation logic using Stripe API
    return {
      filePath: 'src/payments/processor.ts',
      code: '// Payment implementation'
    }
  }

  private async generateTests(implementation: any) {
    return {
      filePath: 'tests/payments/processor.test.ts',
      tests: '// Payment tests'
    }
  }
}
```

## Step 3: Register the Agent

Register your custom agent:

```typescript
// .asmo/config/agents.config.ts
import { PaymentSpecialistAgent } from '../agents/payment-specialist'

export default {
  customAgents: [
    PaymentSpecialistAgent
  ],

  customRoles: [
    '.asmo/roles/payment-specialist.json'
  ]
}
```

Or programmatically:

```typescript
import { AgentRegistry } from '@asmo/core'
import { PaymentSpecialistAgent } from './.asmo/agents/payment-specialist'

const registry = new AgentRegistry()
registry.registerAgent(new PaymentSpecialistAgent())
```

## Step 4: Use the Agent

### In Workflows

```json
{
  "steps": [
    {
      "order": 1,
      "role_id": "payment-specialist",
      "phase": "implementation",
      "description": "Implement payment processing"
    }
  ]
}
```

### In Party Mode

```typescript
const session = await engine.executePartyMode(
  'Design checkout flow',
  ['architect', 'payment-specialist', 'security-specialist']
)
```

### Directly

```typescript
const agent = await registry.getAgent('payment-specialist')
const result = await agent.execute({
  task: 'Add Stripe subscription billing',
  context: { plan: 'monthly' }
})
```

## Agent Properties

### Role Types

| Type | Description | Example |
|------|-------------|---------|
| `reasoning` | Analysis and decisions | Architect |
| `execution` | Concrete actions | Developer |
| `hybrid` | Both reasoning and execution | Debugger |

### Permissions

```json
{
  "can_modify_code": true,   // Can write/edit code
  "requires_plan": true,     // Needs plan before execution
  "can_run_tests": true,     // Can execute tests
  "can_deploy": false        // Cannot deploy
}
```

### Activation Rules

```json
{
  "type": "auto_attached",   // or "manual"
  "trigger_keywords": [...], // Keywords that activate agent
  "task_types": [...]        // Task types that match
}
```

## Custom Skills

Define custom skills for your agent:

```json
// .asmo/skills/payment-skills.json
{
  "skills": [
    {
      "id": "stripe_api",
      "name": "Stripe API",
      "description": "Integrate with Stripe payment APIs",
      "category": "payment",
      "complexity": "advanced",
      "required_mcps": ["stripe"],
      "confidence_threshold": 0.85
    }
  ]
}
```

## Best Practices

### 1. Single Responsibility

Each agent should focus on one domain:

```typescript
// Good: Focused agent
class PaymentSpecialistAgent { }

// Bad: Too broad
class EverythingAgent { }
```

### 2. Clear Activation Rules

Use specific keywords:

```json
{
  "trigger_keywords": [
    "payment",
    "stripe",
    "checkout"
  ]
}
```

### 3. Appropriate Priority

Set priority based on importance:

```json
{
  "priority": 8  // 1-10, higher = more important
}
```

### 4. Proper Error Handling

```typescript
async execute(state: AgentState): Promise<AgentResult> {
  try {
    const result = await this.process(state)
    return { success: true, output: result }
  } catch (error) {
    return {
      success: false,
      error: error.message,
      suggestions: ['Check API credentials', 'Verify network']
    }
  }
}
```

### 5. Comprehensive Testing

```typescript
// tests/agents/payment-specialist.test.ts
describe('PaymentSpecialistAgent', () => {
  it('should detect subscription payments', async () => {
    const agent = new PaymentSpecialistAgent()
    const result = await agent.execute({
      task: 'Add subscription billing'
    })
    expect(result.output.analysis.type).toBe('subscription')
  })
})
```

## See Also

- [Agent Concepts](../concepts/agents.md)
- [Agent Catalog](../reference/agents/index.md)
- [Custom Workflows](./custom-workflows.md)
