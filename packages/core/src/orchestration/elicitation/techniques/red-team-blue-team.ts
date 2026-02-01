/**
 * Red Team / Blue Team Elicitation Technique
 *
 * Simulates both attack (red team) and defense (blue team) perspectives
 * to identify vulnerabilities and strengthen the solution.
 */

import { ElicitationTechnique } from '../types'

export const redTeamBlueTeamTechnique: ElicitationTechnique = {
  id: 'red-team-blue-team',
  name: 'Red Team / Blue Team Analysis',
  description:
    'Simulate adversarial thinking (red team) to find weaknesses, ' +
    'then defensive thinking (blue team) to propose mitigations.',
  useCase:
    'Use for security reviews, risk assessment, and stress-testing ' +
    'solutions against potential threats or failures.',

  generatePrompt(content: string, context: Record<string, any> = {}): string {
    return `## Red Team / Blue Team Analysis

You will analyze the following content from both adversarial (Red Team) and
defensive (Blue Team) perspectives.

### Content to Analyze:
${content}

${context.additionalContext ? `### Additional Context:\n${context.additionalContext}\n` : ''}

---

## PHASE 1: RED TEAM (Adversarial Perspective)

Think like an attacker, a competitor, or Murphy's Law personified.
Your goal is to break, exploit, or defeat this solution.

### Attack Vectors
1. **Security Exploits**: How could a malicious actor exploit this?
2. **Edge Cases**: What inputs or scenarios would break this?
3. **Resource Attacks**: How could this be overwhelmed or starved?
4. **Social Engineering**: How could human factors be exploited?
5. **Supply Chain**: What dependencies could be compromised?
6. **Timing Attacks**: What race conditions or timing issues exist?

### Failure Modes
- What are the single points of failure?
- What happens when dependencies fail?
- What data could be corrupted or lost?
- What happens under extreme load?

### Competitive Threats
- How could a competitor undermine this?
- What market changes would make this obsolete?

---

## PHASE 2: BLUE TEAM (Defensive Perspective)

Now switch to defensive mode. For each vulnerability identified above,
propose mitigations and hardening measures.

### Defense Strategies
For each attack vector identified:
1. **Prevention**: How can we prevent this attack entirely?
2. **Detection**: How can we detect if this attack occurs?
3. **Response**: How do we respond when detected?
4. **Recovery**: How do we recover from successful attacks?

### Hardening Recommendations
- What monitoring should be in place?
- What redundancies are needed?
- What fallbacks should exist?
- What circuit breakers are needed?

---

## Output Format:

### Red Team Findings
| Threat | Severity | Attack Vector | Likelihood |
|--------|----------|---------------|------------|
| [threat] | [critical/high/medium/low] | [description] | [high/medium/low] |

### Blue Team Mitigations
| Threat | Mitigation | Implementation Effort | Priority |
|--------|------------|----------------------|----------|
| [threat] | [mitigation] | [low/medium/high] | [P0/P1/P2] |

### Key Insights
- [Insights from the adversarial analysis]

### Recommendations
- [Prioritized list of security improvements]`
  }
}
