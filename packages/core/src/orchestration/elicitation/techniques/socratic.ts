/**
 * Socratic Questioning Elicitation Technique
 *
 * Uses deep, probing questions to examine underlying beliefs,
 * assumptions, and logic in the content.
 */

import { ElicitationTechnique } from '../types'

export const socraticTechnique: ElicitationTechnique = {
  id: 'socratic',
  name: 'Socratic Questioning',
  description:
    'Use systematic, probing questions to examine the underlying ' +
    'reasoning, assumptions, and implications of the content.',
  useCase:
    'Use when validating requirements, reviewing designs, or when ' +
    'you need to deeply understand the reasoning behind decisions.',

  generatePrompt(content: string, context: Record<string, any> = {}): string {
    return `## Socratic Questioning Analysis

You will analyze the following content using Socratic questioning methodology.
Your goal is to probe deeply into the reasoning and assumptions.

### Content to Analyze:
${content}

${context.additionalContext ? `### Additional Context:\n${context.additionalContext}\n` : ''}

---

### Socratic Question Categories

Apply each category of Socratic questions to the content:

#### 1. Clarifying Questions
Questions that help understand what is actually being said.
- What exactly do you mean by [X]?
- Can you give an example of [X]?
- How does [X] relate to [Y]?
- What is the central issue here?

#### 2. Probing Assumptions
Questions that challenge underlying beliefs.
- What are you assuming when you say [X]?
- Why do you assume [X]?
- What would happen if [assumption] were false?
- What if the opposite were true?

#### 3. Probing Reasons and Evidence
Questions about the basis for claims.
- What evidence supports [X]?
- How do you know [X]?
- What makes you think [X] is true?
- Is this evidence sufficient?

#### 4. Questioning Viewpoints and Perspectives
Questions about alternative views.
- What are alternative ways to look at this?
- Who would disagree and why?
- What would [stakeholder X] say about this?
- What perspective is missing?

#### 5. Probing Implications and Consequences
Questions about what follows from the claims.
- If [X] is true, what else must be true?
- What are the consequences of [X]?
- How does [X] affect [Y]?
- What are the long-term implications?

#### 6. Questions about the Question
Meta-level questions about the inquiry itself.
- Why is this question important?
- What are we really trying to solve?
- Are we asking the right questions?
- What question should we be asking instead?

---

## Output Format:

### Key Questions by Category

#### Clarifying Questions
1. [Question]
   - Why this matters: [explanation]
   - Possible answers: [options]

#### Assumption Questions
1. [Question]
   - Hidden assumption: [what's being assumed]
   - Risk if wrong: [consequence]

#### Evidence Questions
1. [Question]
   - Current evidence: [what exists]
   - Gap: [what's missing]

#### Perspective Questions
1. [Question]
   - Alternative view: [different perspective]
   - Insight: [what we learn]

#### Implication Questions
1. [Question]
   - Consequence if true: [what follows]
   - Consequence if false: [alternative outcome]

### Critical Insights
- [Insights discovered through questioning]

### Unresolved Questions
- [Questions that need answers before proceeding]

### Recommendations
- [Actions based on the Socratic analysis]`
  }
}
