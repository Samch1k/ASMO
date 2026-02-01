/**
 * Devil's Advocate Elicitation Technique
 *
 * Deliberately takes the opposite position to test
 * the strength of arguments and uncover weaknesses.
 */

import { ElicitationTechnique } from '../types'

export const devilsAdvocateTechnique: ElicitationTechnique = {
  id: 'devils-advocate',
  name: "Devil's Advocate Analysis",
  description:
    "Deliberately argue against the proposed solution to test its strength " +
    'and uncover weaknesses in reasoning.',
  useCase:
    'Use when validating important decisions, reviewing proposals, or ' +
    'when there\'s a risk of groupthink or confirmation bias.',

  generatePrompt(content: string, context: Record<string, any> = {}): string {
    return `## Devil's Advocate Analysis

You are playing the role of Devil's Advocate. Your job is to argue AGAINST
the proposed solution/approach, not because you believe it's wrong, but
to test its strength and uncover hidden weaknesses.

### Content to Argue Against:
${content}

${context.additionalContext ? `### Additional Context:\n${context.additionalContext}\n` : ''}

---

### Your Mission

Take the opposite position. If the content says "we should do X,"
argue for "we should NOT do X" or "we should do Y instead."

This is not about being negative. It's about stress-testing ideas.

### Devil's Advocate Framework

#### 1. Counter-Arguments
For each major claim or decision in the content:
- What is the strongest argument AGAINST this?
- What would a thoughtful critic say?
- What does the opposing view get right?

#### 2. Alternative Solutions
- What are the alternatives not being considered?
- Why might an alternative be better?
- What would a competitor choose instead?

#### 3. Hidden Costs
- What costs are being underestimated?
- What opportunities are being missed by choosing this path?
- What technical debt is being created?

#### 4. Timing Challenges
- Why is now the wrong time for this?
- What should we wait for before proceeding?
- What should we do first instead?

#### 5. Scope Critique
- Why is this too ambitious? (or too limited?)
- What's being over-engineered?
- What's being under-engineered?

#### 6. Stakeholder Concerns
- Which stakeholders will resist this and why?
- Whose needs are not being met?
- Who loses if this succeeds?

---

## Output Format:

### The Case AGAINST

Write a compelling argument (3-5 paragraphs) explaining why this
approach is flawed. Be specific and substantive.

### Counter-Arguments Table
| Claim in Content | Counter-Argument | Strength of Counter |
|------------------|------------------|---------------------|
| [original claim] | [argument against] | [strong/medium/weak] |

### Strongest Objections
List the top 3 most serious objections that must be addressed:

1. **[Objection Title]**
   - The argument: [detailed counter-argument]
   - Why it matters: [impact if objection is valid]
   - How to address: [potential response]

2. **[Objection Title]**
   - The argument: [detailed counter-argument]
   - Why it matters: [impact if objection is valid]
   - How to address: [potential response]

3. **[Objection Title]**
   - The argument: [detailed counter-argument]
   - Why it matters: [impact if objection is valid]
   - How to address: [potential response]

### Alternative Approaches
| Alternative | Pros | Cons | When Better |
|-------------|------|------|-------------|
| [alternative] | [advantages] | [disadvantages] | [scenarios] |

### What Would Strengthen the Case
Based on playing devil's advocate, here's what would make the
original proposal more defensible:
- [improvement 1]
- [improvement 2]
- [improvement 3]

### Verdict
After playing devil's advocate, assess:
- Overall strength of original proposal: [strong/moderate/weak]
- Most critical weakness to address: [description]
- Recommendation: [proceed/modify/reconsider]`
  }
}
