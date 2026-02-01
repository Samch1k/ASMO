/**
 * First Principles Elicitation Technique
 *
 * Breaks down content into fundamental components and rebuilds
 * understanding from the ground up, questioning assumptions.
 */

import { ElicitationTechnique } from '../types'

export const firstPrinciplesTechnique: ElicitationTechnique = {
  id: 'first-principles',
  name: 'First Principles Analysis',
  description:
    'Deconstruct the content into its most fundamental components, ' +
    'question every assumption, and rebuild understanding from basic truths.',
  useCase:
    'Use when evaluating complex solutions, validating architectural decisions, ' +
    'or when you suspect the solution is based on unverified assumptions.',

  generatePrompt(content: string, context: Record<string, any> = {}): string {
    return `## First Principles Analysis

You are performing a First Principles analysis on the following content.
Your goal is to break down the solution/design into its most fundamental components
and question every assumption.

### Content to Analyze:
${content}

${context.additionalContext ? `### Additional Context:\n${context.additionalContext}\n` : ''}

### Instructions:

1. **Identify Core Assumptions**
   List every assumption being made (explicit or implicit).
   For each assumption, ask: "Is this actually true? Can we verify this?"

2. **Decompose to Fundamentals**
   Break down the solution into its most basic components.
   What are the irreducible elements?

3. **Question the Foundation**
   For each fundamental:
   - Why is this necessary?
   - What problem does this solve at its core?
   - Are there alternative fundamentals that could work?

4. **Rebuild from Basics**
   If you were to solve this problem knowing only the fundamentals:
   - What solution would you arrive at?
   - How does it differ from the proposed solution?
   - What does this difference tell us?

5. **Identify Hidden Constraints**
   What constraints are being assumed that might not be real?
   What would change if those constraints were removed?

### Output Format:

Provide your analysis in the following structure:

#### Assumptions Identified
- [List each assumption with verification status]

#### Fundamental Components
- [List the irreducible elements]

#### Key Questions
- [Questions that challenge the foundation]

#### Alternative Approach
- [Describe what a rebuilt-from-fundamentals solution might look like]

#### Insights
- [Key insights from this analysis]

#### Recommendations
- [Actionable recommendations based on findings]`
  }
}
