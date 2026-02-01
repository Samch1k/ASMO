# Advanced Elicitation

Advanced Elicitation is a set of techniques for deeper analysis and rethinking of generated content. These techniques help uncover hidden assumptions, identify risks, and improve decision-making.

## Overview

AI-generated content benefits from structured re-examination. Elicitation techniques apply different analytical lenses to:

- Challenge assumptions
- Identify blind spots
- Stress-test decisions
- Generate alternative perspectives

## Available Techniques

### 1. First Principles Analysis

Break down content to its fundamental components and rebuild from basic truths.

```typescript
import { ElicitationManager, firstPrinciplesTechnique } from '@ai1st/core'

const manager = new ElicitationManager()
const result = await manager.applyElicitation(
  prdContent,
  'first-principles',
  agent
)
```

**Use When:**
- Designing new systems from scratch
- Challenging conventional approaches
- Simplifying complex solutions

**Questions Asked:**
- What are the fundamental requirements?
- What assumptions are we making?
- Can we solve this more simply?

### 2. Red Team / Blue Team

Simulate attack and defense perspectives on the content.

```typescript
const result = await manager.applyElicitation(
  architectureDoc,
  'red-team-blue-team',
  agent
)
```

**Use When:**
- Security-critical systems
- Competitive analysis
- Risk assessment

**Perspectives:**
- **Red Team**: Find weaknesses, attack vectors, failure modes
- **Blue Team**: Defend decisions, propose mitigations

### 3. Pre-mortem Analysis

Imagine the project has failed and work backwards to identify causes.

```typescript
const result = await manager.applyElicitation(
  projectPlan,
  'pre-mortem',
  agent
)
```

**Use When:**
- Project planning
- Risk identification
- Scope definition

**Questions Asked:**
- "It's 6 months later and the project failed. What went wrong?"
- What were the warning signs we ignored?
- What dependencies failed?

### 4. Socratic Questioning

Apply deep, probing questions to examine assumptions.

```typescript
const result = await manager.applyElicitation(
  designDoc,
  'socratic',
  agent
)
```

**Use When:**
- Clarifying requirements
- Validating design decisions
- Training and knowledge transfer

**Question Types:**
- Clarifying: "What do you mean by...?"
- Probing assumptions: "Why do you assume...?"
- Exploring implications: "What would happen if...?"

### 5. Devil's Advocate

Argue the opposite position to stress-test decisions.

```typescript
const result = await manager.applyElicitation(
  techChoice,
  'devils-advocate',
  agent
)
```

**Use When:**
- Technology selection
- Architecture decisions
- Controversial choices

**Approach:**
- Argue against the proposed solution
- Present alternative viewpoints
- Challenge the status quo

## Multi-Technique Application

Apply multiple techniques for comprehensive analysis:

```typescript
const result = await manager.applyMultipleElicitations(
  content,
  ['first-principles', 'pre-mortem', 'devils-advocate'],
  agent
)

console.log('Total insights:', result.allInsights.length)
console.log('Recommendations:', result.allRecommendations.length)
```

## Configuration

```typescript
const config = {
  elicitation: {
    enabled: true,
    defaultTechniques: ['first-principles', 'pre-mortem'],
    applyToWorkflows: ['create-prd', 'create-architecture'],
    maxInsightsPerTechnique: 10,
    verbose: false
  }
}
```

## Result Structure

```typescript
interface ElicitationResult {
  original: string          // Original content
  technique: string         // Technique applied
  insights: Insight[]       // Discovered insights
  recommendations: Rec[]    // Actionable recommendations
  revisedContent?: string   // Improved content (optional)
  summary: string          // Brief summary
  durationMs: number       // Processing time
}

interface Insight {
  id: string
  category: 'assumption' | 'risk' | 'opportunity' | 'question' | 'recommendation'
  content: string
  confidence: number  // 0-1
  source: string      // Technique that found it
}
```

## Workflow Integration

Elicitation is automatically applied to configured workflows:

```json
{
  "id": "create-prd",
  "steps": [
    {
      "name": "generate-prd",
      "agent": "analyst"
    },
    {
      "name": "elicitation",
      "techniques": ["first-principles", "pre-mortem"]
    }
  ]
}
```

## Best Practices

1. **Match technique to content type:**
   - PRD → First Principles, Pre-mortem
   - Architecture → Red Team/Blue Team, Devil's Advocate
   - Requirements → Socratic Questioning

2. **Apply early in the process:**
   - Better to find issues during planning than implementation

3. **Combine complementary techniques:**
   - First Principles + Pre-mortem for new projects
   - Red Team + Socratic for security reviews

4. **Review all insights:**
   - Even low-confidence insights may reveal blind spots

## Comparison Table

| Technique | Best For | Focus |
|-----------|----------|-------|
| First Principles | New designs | Fundamentals |
| Red/Blue Team | Security | Attack/Defense |
| Pre-mortem | Planning | Failure modes |
| Socratic | Requirements | Deep understanding |
| Devil's Advocate | Decisions | Alternatives |

## Related

- [Adversarial Review](./adversarial-review.md)
- [Context Cascade](./context-cascade.md)
- [Analyst Agent](../reference/agents/analyst.md)
