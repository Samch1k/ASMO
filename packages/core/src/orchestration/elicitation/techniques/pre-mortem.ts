/**
 * Pre-mortem Elicitation Technique
 *
 * Imagine the project has failed and work backwards to identify
 * what could have caused the failure.
 */

import { ElicitationTechnique } from '../types'

export const preMortemTechnique: ElicitationTechnique = {
  id: 'pre-mortem',
  name: 'Pre-mortem Analysis',
  description:
    'Imagine the project has failed spectacularly. ' +
    'Work backwards to identify all possible causes of failure.',
  useCase:
    'Use before major decisions, project kickoffs, or when launching ' +
    'critical features to identify hidden risks.',

  generatePrompt(content: string, context: Record<string, any> = {}): string {
    const projectName = context.projectName || 'this project'
    const timeframe = context.timeframe || '6 months from now'

    return `## Pre-mortem Analysis

### Scenario Setup

It is ${timeframe}. ${projectName} has FAILED COMPLETELY.
The solution/feature described below did not work out.
Your task is to work backwards and identify what went wrong.

### The Failed Initiative:
${content}

${context.additionalContext ? `### Additional Context:\n${context.additionalContext}\n` : ''}

---

### Instructions

You are conducting a pre-mortem analysis. This technique asks you to imagine
failure has already occurred and then identify the causes.

This is NOT about finding bugs in code. This is about identifying strategic,
organizational, and execution risks that could doom the entire initiative.

### Failure Categories to Explore

1. **Technical Failures**
   - What technical challenges proved insurmountable?
   - What integrations broke down?
   - What scalability issues emerged?
   - What technical debt accumulated?

2. **Team & Organization Failures**
   - What team dynamics caused problems?
   - What communication breakdowns occurred?
   - What skill gaps became critical?
   - What burnout or turnover happened?

3. **Market & Business Failures**
   - What market assumptions were wrong?
   - What competitor moves undermined us?
   - What business model flaws emerged?
   - What customer needs were misunderstood?

4. **Process & Execution Failures**
   - What deadlines were missed and why?
   - What scope creep occurred?
   - What quality issues slipped through?
   - What stakeholder conflicts derailed progress?

5. **External Failures**
   - What regulatory changes impacted us?
   - What economic shifts affected viability?
   - What vendor/partner issues arose?
   - What unforeseen events occurred?

---

## Output Format:

### Failure Narrative
Write a brief narrative (3-5 paragraphs) describing how the project failed.
Make it specific and believable.

### Root Causes
| Cause | Category | Likelihood | Impact | Warning Signs |
|-------|----------|------------|--------|---------------|
| [cause] | [technical/team/market/process/external] | [high/medium/low] | [critical/high/medium] | [early indicators] |

### Prevention Strategies
For each high-likelihood, high-impact cause:
- What could we do NOW to prevent this?
- What early warning system should we establish?
- Who should own this risk?

### Key Insights
- [Insights about hidden risks and vulnerabilities]

### Recommendations
- [Prioritized list of preventive actions]

### Decision Points
- What decisions should we reconsider based on this analysis?
- What go/no-go criteria should we establish?`
  }
}
