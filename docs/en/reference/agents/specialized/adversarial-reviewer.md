# Adversarial Reviewer Agent

Critical code reviewer that MUST find issues - no rubber-stamp approvals.

## Overview

The Adversarial Reviewer Agent performs rigorous code review with a mandate to find issues. Unlike standard code review, this agent uses escalating scrutiny levels and MUST identify problems before approval.

## Key Principle

> "Every code change has room for improvement. The reviewer's job is to find it."

This agent implements the BMAD Adversarial Review pattern where:
- First pass: Normal review
- Second pass: Increased scrutiny if no issues found
- Third pass: Assume problems exist and find them

## Capabilities

| Skill | Description |
|-------|-------------|
| `adversarial_review` | Critical issue finding |
| `code_review` | Comprehensive code analysis |
| `security_review` | Security vulnerability detection |
| `performance_review` | Performance issue identification |
| `architecture_review` | Design pattern evaluation |
| `best_practices` | Coding standards enforcement |

## Review Categories

### Security Issues
- Authentication/authorization flaws
- Input validation gaps
- Injection vulnerabilities
- Data exposure risks

### Performance Issues
- Inefficient algorithms
- N+1 query patterns
- Memory leaks
- Unnecessary computations

### Code Quality
- Code duplication
- Complex conditionals
- Missing error handling
- Unclear naming

### Architecture
- Tight coupling
- Single responsibility violations
- Missing abstractions
- Scalability concerns

## Configuration

```yaml
# orchestration.config.ts
adversarialReview:
  enabled: true
  minIssuesRequired: 1
  maxRetries: 3
  escalationLevels:
    - normal
    - increased_scrutiny
    - assume_problems_exist
```

## Usage

```typescript
import { AdversarialReviewerAgent } from '@asmo/core'
import { AdversarialReviewSession } from '@asmo/core'

const reviewer = new AdversarialReviewerAgent()

// Direct agent usage
const result = await reviewer.execute({
  task: 'Review authentication middleware',
  context: { code: authMiddlewareCode }
})

// Or use the review session
const session = new AdversarialReviewSession({
  minIssuesRequired: 2
})

const review = await session.executeReview(artifact, reviewer)
console.log(review.issues)       // Array of found issues
console.log(review.approved)     // false until issues resolved
```

## Review Output

```typescript
interface AdversarialReviewResult {
  issues: ReviewIssue[]
  approved: boolean
  escalationLevel: 'normal' | 'increased' | 'maximum'
  summary: string
  recommendations: string[]
}

interface ReviewIssue {
  severity: 'critical' | 'major' | 'minor' | 'suggestion'
  category: 'security' | 'performance' | 'quality' | 'architecture'
  location: string
  description: string
  suggestion: string
}
```

## Escalation Process

1. **Level 1 (Normal)**: Standard thorough review
2. **Level 2 (Increased)**: Focus on edge cases, error paths, security
3. **Level 3 (Maximum)**: Assume problems exist, examine every line

If no issues found after Level 3, approval is granted with a warning.

## MCP Integrations

- **Filesystem MCP**: Reads code files and related context
- **Memory MCP**: Tracks recurring issues and patterns
- **Context7 MCP**: References security best practices

## See Also

- [Adversarial Review Concept](/docs/en/concepts/adversarial-review.md)
- [Adversarial Review Workflow](/docs/en/reference/workflows/11-adversarial-review.md)
- [Code Reviewer Agent](./code-reviewer.md)
