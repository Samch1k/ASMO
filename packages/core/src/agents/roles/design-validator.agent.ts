import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Design Validator Agent - Validates system design and architecture decisions
 *
 * Capabilities:
 * - Validates Architecture Decision Records (ADRs)
 * - Reviews API contracts for consistency
 * - Checks database schema design
 * - Validates design patterns and best practices
 * - Detects design smells and anti-patterns
 * - Ensures alignment with requirements
 *
 * Validation Areas:
 * - Architecture consistency
 * - API design (REST/GraphQL best practices)
 * - Database normalization and indexes
 * - Security considerations
 * - Scalability patterns
 * - Maintainability
 *
 * MCP Integrations:
 * - Memory MCP (P0): Store design validations
 * - Supabase MCP (P0): Analyze database schema
 * - Context7 MCP (P1): Research design patterns
 * - Filesystem MCP (P1): Read ADR documents
 */
export class DesignValidatorAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('design-validator', [
      'design_review',
      'architecture_validation',
      'consistency_check',
      'pattern_detection',
      'api_review',
      'database_review'
    ])

    // Initialize Claude LLM
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1, // Low temperature for consistent validation
      maxTokens: 4096
    })
  }

  /**
   * Execute design validation workflow
   *
   * Process:
   * 1. Extract design artifacts from state (ADRs, API contracts, schemas)
   * 2. Check Memory MCP for similar past designs
   * 3. Analyze current database schema via Supabase MCP
   * 4. Research best practices via Context7 MCP
   * 5. Validate architecture consistency
   * 6. Validate API design
   * 7. Validate database schema
   * 8. Check for design smells
   * 9. Generate validation report with approval/rejection
   * 10. Store validation in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔍 Validating design and architecture...')

    try {
      // STEP 1: Extract design artifacts from state
      const designArtifacts = this.extractDesignArtifacts(state)

      if (!designArtifacts.hasDesign) {
        this.log('No design artifacts found in state', 'warn')
        return this.createRejectionResult(
          'No design artifacts provided',
          'Design validation requires ADRs, API contracts, or database schemas'
        )
      }

      // STEP 2: Check Memory MCP for similar designs
      this.log('Checking design history...')
      // Check for similar past designs (result used for future context improvements)
      await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `design validation ${state.task}`,
        type: 'design_review',
        limit: 3
      })

      // STEP 3: Analyze current database schema via Supabase MCP
      this.log('Analyzing current database schema...')
      const currentSchema = await this.requestMCP('supabase', {
        action: 'list_tables',
        project_id: process.env.SUPABASE_PROJECT_ID
      })

      // STEP 4: Research best practices
      this.log('Researching design best practices...')
      // Fetch best practices (result used for future context improvements)
      await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/anthropics/prompt-eng-interactive-tutorial',
        topic: `${state.taskType} design patterns and best practices`,
        tokens: 2000
      })

      // STEP 5-8: Perform validations
      const validations = await Promise.all([
        this.validateArchitecture(designArtifacts, state.task),
        this.validateAPIDesign(designArtifacts),
        this.validateDatabaseSchema(designArtifacts, currentSchema),
        this.detectDesignSmells(designArtifacts)
      ])

      const [archValidation, apiValidation, dbValidation, smellsDetection] = validations

      // Calculate overall score
      const totalScore = this.calculateDesignScore(
        archValidation,
        apiValidation,
        dbValidation,
        smellsDetection
      )

      // STEP 9: Generate validation report
      const approved = totalScore >= 75 // Threshold: 75/100
      const validationReport = this.generateValidationReport(
        designArtifacts,
        archValidation,
        apiValidation,
        dbValidation,
        smellsDetection,
        totalScore,
        approved
      )

      // STEP 10: Store validation in Memory MCP
      if (approved) {
        this.log('✅ Design approved - storing validation...')
      } else {
        this.log('⚠️  Design needs improvement - storing feedback...', 'warn')
      }

      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Design Validation: ${state.task}`,
          entityType: 'design_review',
          observations: [
            `Total Score: ${totalScore}/100`,
            `Approved: ${approved}`,
            `Architecture: ${archValidation.score}/30`,
            `API Design: ${apiValidation.score}/25`,
            `Database: ${dbValidation.score}/25`,
            `Design Smells: ${smellsDetection.score}/20`,
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
          totalScore,
          architectureScore: archValidation.score,
          apiScore: apiValidation.score,
          databaseScore: dbValidation.score,
          smellsScore: smellsDetection.score
        }
      )

      // Create result
      const result = this.createResult(
        approved ? 'success' : 'needs_approval',
        {
          approved,
          totalScore,
          validationReport,
          recommendation: approved
            ? 'Design is ready for implementation phase'
            : 'Design needs revision before implementation'
        },
        [artifact]
      )

      // Update state
      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        requiresApproval: !approved,
        nextAction: approved ? 'proceed_to_implementation' : 'revise_design'
      }

    } catch (error: any) {
      this.log(`Design validation failed: ${error.message}`, 'error')

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
   * Extract design artifacts from state
   */
  private extractDesignArtifacts(state: AgentState): {
    hasDesign: boolean
    adr?: string
    apiContracts: string[]
    databaseSchema?: string
    diagrams: string[]
  } {
    const artifacts: {
      hasDesign: boolean
      adr?: string
      apiContracts: string[]
      databaseSchema?: string
      diagrams: string[]
    } = {
      hasDesign: false,
      apiContracts: [] as string[],
      diagrams: [] as string[]
    }

    // Extract from agent results (Architect agent produces ADRs)
    for (const result of state.agentResults) {
      for (const artifact of result.artifacts) {
        if (artifact.type === 'adr') {
          artifacts.adr = artifact.content
          artifacts.hasDesign = true
        }
        if (artifact.type === 'diagram') {
          artifacts.diagrams.push(artifact.content)
          artifacts.hasDesign = true
        }
        // API contracts might be in documentation artifacts
        if (artifact.type === 'documentation' && artifact.content.includes('API')) {
          artifacts.apiContracts.push(artifact.content)
          artifacts.hasDesign = true
        }
      }

      // Check output for database schema
      if (result.output?.database_schema) {
        artifacts.databaseSchema = JSON.stringify(result.output.database_schema)
        artifacts.hasDesign = true
      }
      if (result.output?.api_contracts) {
        artifacts.apiContracts.push(...result.output.api_contracts)
        artifacts.hasDesign = true
      }
    }

    return artifacts
  }

  /**
   * Validate architecture consistency and decisions
   * Score: 0-30 points
   */
  private async validateArchitecture(artifacts: any, task: string): Promise<{
    score: number
    issues: string[]
    feedback: string
  }> {
    if (!artifacts.adr && artifacts.diagrams.length === 0) {
      return {
        score: 10,
        issues: ['No ADR or architecture diagrams provided'],
        feedback: 'Architecture documentation is minimal. Consider creating an ADR.'
      }
    }

    const prompt = `Review the following architecture design for the task: "${task}"

${artifacts.adr ? `ADR:\n${artifacts.adr}\n` : ''}
${artifacts.diagrams.length > 0 ? `Diagrams: ${artifacts.diagrams.length} provided\n` : ''}

Evaluate:
1. Architecture decisions are well-justified (0-10 points)
2. Design aligns with requirements (0-10 points)
3. Scalability and maintainability considered (0-10 points)

Provide response in JSON format:
{
  "score": 24,
  "issues": ["Caching strategy not addressed", "Load balancing not mentioned"],
  "feedback": "Architecture is solid but could benefit from..."
}

Score guidelines:
- 25-30: Excellent architecture, well-documented
- 20-24: Good architecture, minor improvements needed
- 15-19: Acceptable but has gaps
- 0-14: Significant issues, needs revision`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 15, issues: ['Could not parse validation'], feedback: 'Validation incomplete' }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Validate API design (REST/GraphQL best practices)
   * Score: 0-25 points
   */
  private async validateAPIDesign(artifacts: any): Promise<{
    score: number
    issues: string[]
    feedback: string
  }> {
    if (artifacts.apiContracts.length === 0) {
      return {
        score: 15,
        issues: ['No API contracts defined'],
        feedback: 'Consider defining API endpoints and contracts explicitly'
      }
    }

    const prompt = `Review the following API design:

${artifacts.apiContracts.join('\n\n')}

Evaluate:
1. RESTful principles followed (proper HTTP methods, status codes) (0-10 points)
2. API consistency and naming conventions (0-8 points)
3. Error handling and validation defined (0-7 points)

Provide response in JSON format:
{
  "score": 21,
  "issues": ["Missing error codes documentation", "Inconsistent naming"],
  "feedback": "API design follows REST principles but..."
}

Score guidelines:
- 22-25: Excellent API design
- 18-21: Good design, minor issues
- 12-17: Acceptable but needs improvement
- 0-11: Significant issues`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 12, issues: ['Could not parse validation'], feedback: 'Validation incomplete' }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Validate database schema design
   * Score: 0-25 points
   */
  private async validateDatabaseSchema(artifacts: any, currentSchema: any): Promise<{
    score: number
    issues: string[]
    feedback: string
  }> {
    if (!artifacts.databaseSchema) {
      return {
        score: 15,
        issues: ['No database schema changes defined'],
        feedback: 'If database changes are needed, please document schema'
      }
    }

    const prompt = `Review the following database schema design:

Proposed Schema:
${artifacts.databaseSchema}

Current Schema:
${JSON.stringify(currentSchema, null, 2)}

Evaluate:
1. Normalization (avoiding redundancy) (0-8 points)
2. Indexes for query performance (0-8 points)
3. Foreign keys and constraints (0-9 points)

Provide response in JSON format:
{
  "score": 20,
  "issues": ["Missing index on user_id", "Consider adding composite index"],
  "feedback": "Schema is well-normalized but..."
}

Score guidelines:
- 22-25: Excellent schema design
- 18-21: Good design, minor optimizations possible
- 12-17: Acceptable but has gaps
- 0-11: Needs significant revision`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 12, issues: ['Could not parse validation'], feedback: 'Validation incomplete' }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Detect design smells and anti-patterns
   * Score: 0-20 points (fewer smells = higher score)
   */
  private async detectDesignSmells(artifacts: any): Promise<{
    score: number
    smells: string[]
    feedback: string
  }> {
    const designContent = [
      artifacts.adr,
      ...artifacts.apiContracts,
      artifacts.databaseSchema
    ].filter(Boolean).join('\n\n')

    const prompt = `Analyze the following design for anti-patterns and design smells:

${designContent}

Common design smells to check:
- God objects (classes/modules doing too much)
- Tight coupling
- Circular dependencies
- Magic numbers/strings
- Missing error handling
- Security vulnerabilities (SQL injection, XSS, etc.)
- N+1 query problems

Provide response in JSON format:
{
  "score": 16,
  "smells": ["Potential N+1 query in user listing", "Magic number: 100 limit"],
  "feedback": "Design is clean with minor code smells..."
}

Score guidelines:
- 18-20: Clean design, no significant smells
- 14-17: Minor smells, easily fixable
- 10-13: Several smells, should be addressed
- 0-9: Major smells, needs refactoring`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { score: 10, smells: ['Could not parse validation'], feedback: 'Validation incomplete' }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Calculate overall design score
   * Architecture: 30, API: 25, Database: 25, Smells: 20 = 100 total
   */
  private calculateDesignScore(
    arch: { score: number },
    api: { score: number },
    db: { score: number },
    smells: { score: number }
  ): number {
    return arch.score + api.score + db.score + smells.score
  }

  /**
   * Generate comprehensive validation report
   */
  private generateValidationReport(
    _artifacts: any,
    archValidation: any,
    apiValidation: any,
    dbValidation: any,
    smellsDetection: any,
    totalScore: number,
    approved: boolean
  ): {
    fullReport: string
    issues: string[]
    recommendations: string[]
  } {
    const allIssues = [
      ...archValidation.issues,
      ...apiValidation.issues,
      ...dbValidation.issues,
      ...smellsDetection.smells
    ]

    const recommendations: string[] = []

    if (archValidation.score < 20) {
      recommendations.push('Improve architecture documentation with detailed ADR')
    }
    if (apiValidation.score < 18) {
      recommendations.push('Refine API contracts following REST best practices')
    }
    if (dbValidation.score < 18) {
      recommendations.push('Review database schema for normalization and indexing')
    }
    if (smellsDetection.score < 14) {
      recommendations.push('Address identified design smells before implementation')
    }

    const fullReport = `# Design Validation Report

## Overall Score: ${totalScore}/100

**Status**: ${approved ? '✅ APPROVED' : '⚠️ NEEDS REVISION'}

## Architecture Review (${archValidation.score}/30)

${archValidation.feedback}

${archValidation.issues.length > 0 ? `### Issues:
${archValidation.issues.map((i: string) => `- ${i}`).join('\n')}` : ''}

## API Design Review (${apiValidation.score}/25)

${apiValidation.feedback}

${apiValidation.issues.length > 0 ? `### Issues:
${apiValidation.issues.map((i: string) => `- ${i}`).join('\n')}` : ''}

## Database Schema Review (${dbValidation.score}/25)

${dbValidation.feedback}

${dbValidation.issues.length > 0 ? `### Issues:
${dbValidation.issues.map((i: string) => `- ${i}`).join('\n')}` : ''}

## Design Smells Detection (${smellsDetection.score}/20)

${smellsDetection.feedback}

${smellsDetection.smells.length > 0 ? `### Detected Smells:
${smellsDetection.smells.map((s: string) => `- ${s}`).join('\n')}` : ''}

## Summary

**Total Issues**: ${allIssues.length}
**Approval Threshold**: 75/100

${recommendations.length > 0 ? `### Recommendations:
${recommendations.map(r => `- ${r}`).join('\n')}` : ''}

---

**Validated by**: Design Validator Agent
**Timestamp**: ${new Date().toISOString()}
${approved ? '**Next Step**: Proceed to Implementation Phase' : '**Next Step**: Revise Design'}
`

    return { fullReport, issues: allIssues, recommendations }
  }

  /**
   * Create rejection result when no design artifacts provided
   */
  private createRejectionResult(title: string, message: string): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      `# Design Validation Failed

## ${title}

${message}

**Action Required**: Provide design artifacts before validation can proceed.

Required artifacts:
- Architecture Decision Record (ADR)
- API contracts and endpoints
- Database schema (if applicable)
- Architecture diagrams (optional but recommended)
`,
      { approved: false, totalScore: 0 }
    )

    const result = this.createResult(
      'needs_approval',
      { approved: false, error: message },
      [artifact]
    )

    return {
      agentResults: [result],
      requiresApproval: true,
      nextAction: 'provide_design'
    }
  }
}
