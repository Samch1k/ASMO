# Adversarial Review

Adversarial Review is a critical code review approach where the reviewer **MUST** find issues. This technique ensures thorough analysis and prevents superficial approvals.

## Overview

Traditional code review often suffers from:
- Rubber-stamping approvals
- Superficial analysis
- Confirmation bias

Adversarial Review addresses these by requiring reviewers to actively find problems, with escalating scrutiny if initial passes don't uncover issues.

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                   Adversarial Review                     │
├─────────────────────────────────────────────────────────┤
│  Attempt 1: Standard Review                              │
│  ├─ Issues found? → Return issues                       │
│  └─ No issues? → Escalate                               │
│                                                          │
│  Attempt 2: Deep Analysis                                │
│  ├─ "Look harder for edge cases"                        │
│  ├─ Issues found? → Return issues                       │
│  └─ No issues? → Escalate                               │
│                                                          │
│  Attempt 3: Assume Problems Exist                        │
│  ├─ "There MUST be issues - find them"                  │
│  ├─ Issues found? → Return issues                       │
│  └─ No issues? → Approve with warning                   │
└─────────────────────────────────────────────────────────┘
```

## Usage

```typescript
import { AdversarialReviewSession, AdversarialReviewerAgent } from '@ai1st/core'

// Create session and reviewer
const session = new AdversarialReviewSession({
  minIssuesRequired: 1,
  maxRetries: 3
})
const reviewer = new AdversarialReviewerAgent()

// Execute review
const artifact = {
  id: 'auth-module',
  type: 'code',
  content: `
    function authenticate(user, password) {
      return db.query('SELECT * FROM users WHERE name=' + user)
    }
  `,
  metadata: { language: 'javascript' }
}

const result = await session.executeReview(artifact, reviewer)

console.log('Issues found:', result.issues.length)
console.log('Approved:', result.approved)
result.issues.forEach(issue => {
  console.log(`- [${issue.severity}] ${issue.title}`)
})
```

## Escalation Prompts

The system uses increasingly aggressive prompts:

### Level 1: Standard Review
> "Review this artifact critically. Identify any issues with code quality, security, performance, or maintainability."

### Level 2: Deep Analysis
> "The previous review found no issues. Look more carefully. Consider edge cases, error handling, security vulnerabilities, and potential race conditions."

### Level 3: Assume Problems Exist
> "No code is perfect. There MUST be issues with this artifact. Find them. Consider: security vulnerabilities, performance bottlenecks, maintainability concerns, missing error handling, edge cases."

## Configuration

```typescript
const config = {
  adversarialReview: {
    enabled: true,
    minIssuesRequired: 1,    // Minimum issues to find
    maxRetries: 3            // Escalation attempts
  }
}
```

## Issue Categories

The reviewer identifies issues in these categories:

| Category | Description |
|----------|-------------|
| `security` | Security vulnerabilities (XSS, SQL injection, etc.) |
| `performance` | Performance bottlenecks |
| `maintainability` | Code quality and maintainability concerns |
| `logic` | Logic errors or bugs |
| `edge-case` | Missing edge case handling |
| `error-handling` | Inadequate error handling |

## Severity Levels

| Level | Description |
|-------|-------------|
| `critical` | Must be fixed immediately |
| `major` | Should be fixed before merge |
| `minor` | Nice to fix, not blocking |
| `suggestion` | Optional improvement |

## Integration with Workflows

Adversarial Review is automatically applied in:

- `code-review` workflow (as mandatory step)
- `adversarial-review` workflow (dedicated)
- Any workflow with `adversarialReview: true` in step config

## Best Practices

1. **Set appropriate thresholds** - For critical code, require more issues
2. **Use with security-sensitive code** - Authentication, payments, data handling
3. **Combine with other techniques** - Use alongside regular review for balance
4. **Review the warnings** - "No issues after 3 attempts" deserves attention

## Related

- [Elicitation Techniques](./elicitation.md)
- [Code Reviewer Agent](../reference/agents/code-reviewer.md)
- [Adversarial Reviewer Agent](../reference/agents/adversarial-reviewer.md)
