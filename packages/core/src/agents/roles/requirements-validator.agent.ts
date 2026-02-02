import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Requirements Validator Agent - Validates requirements completeness and quality
 *
 * Capabilities:
 * - Validates requirements using INVEST criteria
 * - Checks for completeness and clarity
 * - Identifies missing edge cases
 * - Ensures stakeholder alignment
 * - Scores requirements quality (0-100)
 *
 * INVEST Criteria:
 * - Independent: Requirements should be self-contained
 * - Negotiable: Details can be discussed and adjusted
 * - Valuable: Provides clear value to stakeholders
 * - Estimable: Can be estimated for effort
 * - Small: Appropriately sized (not too large)
 * - Testable: Can be verified with tests
 *
 * MCP Integrations:
 * - Memory MCP (P0): Store validation history
 * - Filesystem MCP (P1): Read requirement documents
 */
export class RequirementsValidatorAgent extends BaseAgent {
  constructor() {
    super('requirements-validator', [
      'requirements_validation',
      'completeness_check',
      'stakeholder_alignment',
      'quality_assurance',
      'invest_criteria'
    ])
  }

  /**
   * Execute requirements validation workflow
   *
   * Process:
   * 1. Extract requirements from state (user stories, acceptance criteria)
   * 2. Check Memory MCP for similar past validations
   * 3. Validate using INVEST criteria
   * 4. Check for completeness (edge cases, error handling, etc.)
   * 5. Score requirements quality (0-100)
   * 6. Generate validation report with approval/rejection
   * 7. Store validation in Memory MCP for learning
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔍 Validating requirements...')

    try {
      // STEP 1: Extract requirements from state
      const requirements = this.extractRequirements(state)

      if (!requirements || requirements.length === 0) {
        this.log('No requirements found in state', 'warn')
        return this.createRejectionResult(
          'No requirements provided',
          'Requirements must include user stories or acceptance criteria'
        )
      }

      // STEP 2: Check Memory MCP for similar validations
      this.log('Checking validation history...')
      // Check for similar past validations (result used for future context improvements)
      await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `requirements validation ${state.task}`,
        type: 'validation_report',
        limit: 3
      })

      // STEP 3: Validate using INVEST criteria
      this.log('Applying INVEST criteria...')
      const investValidation = await this.validateINVEST(requirements)

      // STEP 4: Check completeness
      this.log('Checking completeness...')
      const completenessCheck = await this.checkCompleteness(requirements, state.task)

      // STEP 5: Score requirements quality
      const qualityScore = this.calculateQualityScore(investValidation, completenessCheck)

      // STEP 6: Generate validation report
      const approved = qualityScore >= 70 // Threshold: 70/100
      const validationReport = this.generateValidationReport(
        requirements,
        investValidation,
        completenessCheck,
        qualityScore,
        approved
      )

      // STEP 7: Store validation in Memory MCP
      if (approved) {
        this.log('✅ Requirements approved - storing validation...')
      } else {
        this.log('⚠️  Requirements need improvement - storing feedback...', 'warn')
      }

      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Requirements Validation: ${state.task}`,
          entityType: 'validation_report',
          observations: [
            `Quality Score: ${qualityScore}/100`,
            `Approved: ${approved}`,
            `INVEST Score: ${investValidation.score}/60`,
            `Completeness Score: ${completenessCheck.score}/40`,
            ...validationReport.issues
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        validationReport.fullReport,
        {
          approved,
          qualityScore,
          investScore: investValidation.score,
          completenessScore: completenessCheck.score
        }
      )

      // Create result
      const result = this.createResult(
        approved ? 'success' : 'needs_approval',
        {
          approved,
          qualityScore,
          validationReport,
          recommendation: approved
            ? 'Requirements are ready for design phase'
            : 'Requirements need revision before proceeding'
        },
        [artifact]
      )

      // Update state
      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        requiresApproval: !approved,
        nextAction: approved ? 'proceed_to_design' : 'revise_requirements'
      }

    } catch (error: any) {
      this.log(`Requirements validation failed: ${error.message}`, 'error')

      const errorResult = this.createResult(
        'failed',
        { error: error.message },
        []
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, errorResult],
        requiresApproval: true,
        nextAction: 'error_recovery'
      }
    }
  }

  /**
   * Extract requirements from state
   * Looks for user stories, acceptance criteria, and feature descriptions
   */
  private extractRequirements(state: AgentState): string[] {
    const requirements: string[] = []

    // Extract from task
    if (state.task) {
      requirements.push(state.task)
    }

    // Extract from messages (looking for user stories, acceptance criteria)
    for (const message of state.messages) {
      const content = typeof message.content === 'string' ? message.content : ''

      // Look for user story patterns
      const userStoryMatch = content.match(/(?:As a|As an|User story).*?(?:I want|I need|I can).*?(?:So that|In order to).*/gi)
      if (userStoryMatch) {
        requirements.push(...userStoryMatch)
      }

      // Look for acceptance criteria
      const acMatch = content.match(/(?:Acceptance criteria|Given.*When.*Then).*/gi)
      if (acMatch) {
        requirements.push(...acMatch)
      }
    }

    // Extract from agent results (previous agents may have refined requirements)
    for (const result of state.agentResults) {
      if (result.output?.user_stories) {
        requirements.push(...result.output.user_stories)
      }
      if (result.output?.acceptance_criteria) {
        requirements.push(...result.output.acceptance_criteria)
      }
    }

    return requirements
  }

  /**
   * Validate requirements against INVEST criteria
   * Returns score out of 60 (10 points per criterion)
   */
  private async validateINVEST(requirements: string[]): Promise<{
    score: number
    details: Record<string, { score: number; feedback: string }>
  }> {
    const prompt = `Validate the following requirements against INVEST criteria.
For each criterion, provide a score (0-10) and brief feedback.

Requirements:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

INVEST Criteria:
1. Independent: Are requirements self-contained and can be implemented independently?
2. Negotiable: Are details flexible and open to discussion?
3. Valuable: Do requirements provide clear value to users/stakeholders?
4. Estimable: Can effort be estimated? Are requirements clear enough?
5. Small: Are requirements appropriately sized (not too large)?
6. Testable: Can requirements be verified with tests?

Provide response in JSON format:
{
  "independent": { "score": 8, "feedback": "..." },
  "negotiable": { "score": 7, "feedback": "..." },
  "valuable": { "score": 9, "feedback": "..." },
  "estimable": { "score": 8, "feedback": "..." },
  "small": { "score": 7, "feedback": "..." },
  "testable": { "score": 9, "feedback": "..." }
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 2048
    })

    // Parse JSON from response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback if LLM doesn't return JSON
      return {
        score: 30,
        details: {
          independent: { score: 5, feedback: 'Could not parse validation results' },
          negotiable: { score: 5, feedback: 'Could not parse validation results' },
          valuable: { score: 5, feedback: 'Could not parse validation results' },
          estimable: { score: 5, feedback: 'Could not parse validation results' },
          small: { score: 5, feedback: 'Could not parse validation results' },
          testable: { score: 5, feedback: 'Could not parse validation results' }
        }
      }
    }

    const details = JSON.parse(jsonMatch[0])
    const score = Object.values(details).reduce((sum: number, item: any) => sum + item.score, 0)

    return { score, details }
  }

  /**
   * Check requirements completeness
   * Returns score out of 40
   */
  private async checkCompleteness(requirements: string[], task: string): Promise<{
    score: number
    missing: string[]
    feedback: string
  }> {
    const prompt = `Check the completeness of the following requirements for the task: "${task}"

Requirements:
${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Check for:
1. Edge cases covered (error handling, invalid input, boundary conditions)
2. Non-functional requirements (performance, security, accessibility)
3. Success criteria defined
4. Dependencies identified
5. Assumptions documented

Provide response in JSON format:
{
  "score": 32,
  "missing": ["Edge case: empty input", "Security: authentication requirements"],
  "feedback": "Requirements cover most scenarios but missing edge case handling..."
}

Score: 0-40 points
- 40: All aspects covered comprehensively
- 30-39: Most aspects covered, minor gaps
- 20-29: Some gaps, needs improvement
- 0-19: Major gaps, significant revision needed`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.1,
      maxTokens: 2048
    })

    // Parse JSON
    const jsonMatch = response.content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 20,
        missing: ['Could not parse completeness check'],
        feedback: 'Validation incomplete due to parsing error'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Calculate overall quality score
   * INVEST: 60 points, Completeness: 40 points = 100 total
   */
  private calculateQualityScore(
    investValidation: { score: number },
    completenessCheck: { score: number }
  ): number {
    return investValidation.score + completenessCheck.score
  }

  /**
   * Generate comprehensive validation report
   */
  private generateValidationReport(
    requirements: string[],
    investValidation: any,
    completenessCheck: any,
    qualityScore: number,
    approved: boolean
  ): {
    fullReport: string
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Collect issues from INVEST validation
    for (const [criterion, data] of Object.entries(investValidation.details)) {
      const criterionData = data as { score: number; feedback: string }
      if (criterionData.score < 7) {
        issues.push(`${criterion}: ${criterionData.feedback}`)
      }
    }

    // Add completeness issues
    if (completenessCheck.missing && completenessCheck.missing.length > 0) {
      issues.push(...completenessCheck.missing.map((m: string) => `Missing: ${m}`))
    }

    // Generate recommendations
    if (qualityScore < 70) {
      recommendations.push('Revise requirements to address identified issues')
      recommendations.push('Ensure all INVEST criteria score >= 7/10')
      recommendations.push('Add missing elements from completeness check')
    }

    if (investValidation.details.testable.score < 7) {
      recommendations.push('Define clear acceptance criteria for testability')
    }

    if (completenessCheck.score < 30) {
      recommendations.push('Document edge cases and error handling scenarios')
      recommendations.push('Add non-functional requirements (performance, security)')
    }

    // Generate full report
    const fullReport = `# Requirements Validation Report

## Overall Quality Score: ${qualityScore}/100

**Status**: ${approved ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}

## INVEST Criteria (${investValidation.score}/60)

${Object.entries(investValidation.details).map(([criterion, data]: [string, any]) => {
  return `- **${criterion.charAt(0).toUpperCase() + criterion.slice(1)}**: ${data.score}/10
  ${data.feedback}`
}).join('\n')}

## Completeness Check (${completenessCheck.score}/40)

${completenessCheck.feedback}

${completenessCheck.missing.length > 0 ? `
### Missing Elements:
${completenessCheck.missing.map((m: string) => `- ${m}`).join('\n')}
` : ''}

## Issues (${issues.length})

${issues.length > 0 ? issues.map(i => `- ${i}`).join('\n') : 'No major issues identified'}

## Recommendations

${recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : '- Requirements are ready for next phase'}

## Requirements Reviewed

${requirements.map((r, i) => `${i + 1}. ${r}`).join('\n')}

---

**Validated by**: Requirements Validator Agent
**Timestamp**: ${new Date().toISOString()}
**Approval Threshold**: 70/100
${approved ? '**Next Step**: Proceed to Design Phase' : '**Next Step**: Revise Requirements'}
`

    return { fullReport, issues, recommendations }
  }

  /**
   * Create rejection result when no requirements provided
   */
  private createRejectionResult(title: string, message: string): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      `# Requirements Validation Failed

## ${title}

${message}

**Action Required**: Provide requirements before validation can proceed.

Accepted formats:
- User stories (As a... I want... So that...)
- Acceptance criteria (Given... When... Then...)
- Feature descriptions with clear success criteria
`,
      { approved: false, qualityScore: 0 }
    )

    const result = this.createResult(
      'needs_approval',
      { approved: false, error: message },
      [artifact]
    )

    return {
      agentResults: [result],
      requiresApproval: true,
      nextAction: 'provide_requirements'
    }
  }
}
