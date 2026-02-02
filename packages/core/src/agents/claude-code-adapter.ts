import { RoleManager } from '../orchestration/role-manager'
import { ConfigLoader } from '../orchestration/config-loader'
import { Role, Skill } from './types'
import type { ComplexityScore, SessionTypeDecision } from '../orchestration/types'

/**
 * Analysis result from prompt analysis
 */
export interface AnalysisResult {
  /** Recommended role IDs ordered by relevance */
  recommendedRoles: string[]

  /** Required skill IDs extracted from the prompt */
  requiredSkills: string[]

  /** Suggested workflow ID (if matches a predefined workflow) */
  suggestedWorkflow: string | null

  /** Confidence score (0-1) for this analysis */
  confidence: number

  /** Human-readable reasoning for the recommendations */
  reasoning: string
}

/**
 * ClaudeCodeAdapter - Analyzes user prompts to determine roles and skills
 *
 * This adapter enables AI assistants (Claude Code, Cursor) to automatically
 * interact with the role-based agent system by analyzing user prompts and
 * recommending appropriate roles, skills, and workflows.
 *
 * Usage:
 * ```typescript
 * const adapter = new ClaudeCodeAdapter()
 * await adapter.initialize()
 *
 * const analysis = await adapter.analyzePrompt("Fix the bug in authentication")
 * // => {
 * //      recommendedRoles: ['debugger', 'developer'],
 * //      requiredSkills: ['bug_diagnosis', 'code_writing', 'authentication'],
 * //      suggestedWorkflow: 'bug_fix_workflow',
 * //      confidence: 0.92
 * //    }
 * ```
 */
export class ClaudeCodeAdapter {
  private roleManager!: RoleManager
  private configLoader!: ConfigLoader
  private initialized = false

  private skillsCache: Map<string, Skill> = new Map()

  /**
   * Initialize the adapter by loading configurations
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    console.log('🔧 Initializing ClaudeCodeAdapter...')

    // Initialize ConfigLoader
    this.configLoader = new ConfigLoader('.cursor/config')
    await this.configLoader.initialize()

    // Initialize RoleManager
    this.roleManager = new RoleManager(this.configLoader)
    await this.roleManager.loadRoles()

    // Load skills into cache
    const skills = await this.configLoader.loadSkills()
    for (const skill of skills) {
      this.skillsCache.set(skill.id, skill)
    }

    this.initialized = true

    console.log('✅ ClaudeCodeAdapter initialized')
    console.log(`   - Loaded ${this.roleManager.getRoleCount()} roles`)
    console.log(`   - Loaded ${this.skillsCache.size} skills`)
  }

  /**
   * Analyze a user prompt to determine required roles and skills
   *
   * Algorithm:
   * 1. Extract keywords from prompt
   * 2. Match keywords to trigger_keywords in role activation rules
   * 3. Identify task type (bug_fix, feature, deployment, etc.)
   * 4. Find roles by task type
   * 5. Extract implicit skills from keywords
   * 6. Find roles by skills
   * 7. Combine and deduplicate results
   * 8. Rank by priority and relevance
   * 9. Match to predefined workflows
   * 10. Calculate confidence score
   *
   * @param userPrompt - The user's task description
   * @returns Analysis result with recommendations
   */
  async analyzePrompt(userPrompt: string): Promise<AnalysisResult> {
    this.checkInitialized()

    console.log('\n🔍 Analyzing prompt:', userPrompt)

    // Step 1: Extract keywords
    const keywords = this.extractKeywords(userPrompt)
    console.log('   Keywords:', keywords)

    // Step 2: Identify task type
    const taskType = this.identifyTaskType(userPrompt, keywords)
    console.log('   Task type:', taskType)

    // Step 3: Find roles by keywords
    const rolesByKeywords = this.roleManager.findRolesByKeywords(keywords)
    console.log(`   Roles by keywords: ${rolesByKeywords.map(r => r.id).join(', ')}`)

    // Step 4: Find roles by task type
    const rolesByTaskType = taskType
      ? this.roleManager.findRolesByTaskType(taskType)
      : []
    console.log(`   Roles by task type: ${rolesByTaskType.map(r => r.id).join(', ')}`)

    // Step 5: Extract implicit skills from keywords
    const implicitSkills = this.extractImplicitSkills(keywords, taskType)
    console.log(`   Implicit skills: ${implicitSkills.join(', ')}`)

    // Step 6: Find roles by skills
    const rolesBySkills = implicitSkills.flatMap(skillId =>
      this.roleManager.findRolesBySkill(skillId)
    )
    console.log(`   Roles by skills: ${rolesBySkills.map(r => r.id).join(', ')}`)

    // Step 7: Combine and deduplicate
    const allRoles = [...rolesByKeywords, ...rolesByTaskType, ...rolesBySkills]
    const uniqueRoles = this.deduplicateAndRank(allRoles)

    // Step 8: Take top roles
    const recommendedRoles = uniqueRoles.slice(0, 3).map(r => r.id)
    console.log(`   Recommended roles: ${recommendedRoles.join(' → ')}`)

    // Step 9: Match to workflow
    const suggestedWorkflow = this.findMatchingWorkflow(
      userPrompt,
      taskType,
      recommendedRoles
    )
    console.log(`   Suggested workflow: ${suggestedWorkflow ?? 'none'}`)

    // Step 10: Calculate confidence
    const confidence = this.calculateConfidence(
      uniqueRoles,
      implicitSkills,
      suggestedWorkflow
    )
    console.log(`   Confidence: ${(confidence * 100).toFixed(0)}%`)

    // Generate reasoning
    const reasoning = this.generateReasoning(
      taskType,
      keywords,
      recommendedRoles,
      implicitSkills,
      suggestedWorkflow
    )

    return {
      recommendedRoles,
      requiredSkills: implicitSkills,
      suggestedWorkflow,
      confidence,
      reasoning
    }
  }

  /**
   * Generate a system prompt for Claude/Cursor with role context
   *
   * This creates a detailed system prompt that includes:
   * - Role descriptions
   * - Required skills
   * - Workflow steps (if applicable)
   * - Permissions and constraints
   *
   * Phase 3 of hybrid system integration:
   * - Optionally includes BMAD complexity analysis
   * - Optionally includes Party/Brainstorming mode configuration
   * - Maintains backward compatibility (parameters are optional)
   *
   * @param analysis - The analysis result from analyzePrompt()
   * @param complexity - Optional complexity analysis from BMAD
   * @param sessionType - Optional session type decision (sequential/party/brainstorming)
   * @returns Formatted system prompt
   */
  generateSystemPrompt(
    analysis: AnalysisResult,
    complexity?: ComplexityScore,
    sessionType?: SessionTypeDecision
  ): string {
    const roles = analysis.recommendedRoles
      .map(id => this.roleManager.getRole(id))
      .filter((r): r is Role => r !== undefined)

    let prompt = '# Role-Based Agent System Context\n\n'

    prompt += '## Your Assigned Roles\n\n'
    for (const role of roles) {
      prompt += `### ${role.name} (${role.role_type})\n`
      prompt += `${role.description}\n\n`

      prompt += `**Skills**: ${role.required_skills.join(', ')}\n\n`

      if (role.can_modify_code) {
        prompt += '✅ **Permissions**: Can modify code\n'
      } else {
        prompt += '⚠️  **Restrictions**: Cannot modify code directly (reasoning role)\n'
      }

      if (role.can_deploy) {
        prompt += '✅ **Permissions**: Can deploy to production\n'
      }

      if (role.can_run_tests) {
        prompt += '✅ **Permissions**: Can run tests\n'
      }

      if (role.requires_plan) {
        prompt += '📋 **Requirement**: Must follow an architectural plan\n'
      }

      if (role.requires_approval) {
        prompt += '👤 **Requirement**: Requires human approval before execution\n'
      }

      prompt += `\n**Allowed MCP Servers**: ${role.allowed_mcps.join(', ')}\n\n`
      prompt += '---\n\n'
    }

    prompt += '## Required Skills\n\n'
    for (const skillId of analysis.requiredSkills) {
      const skill = this.skillsCache.get(skillId)
      if (skill) {
        prompt += `- **${skill.name}** (${skill.complexity}): ${skill.description}\n`
      }
    }

    if (analysis.suggestedWorkflow) {
      prompt += '\n## Suggested Workflow\n\n'
      prompt += `Follow the **${analysis.suggestedWorkflow}** workflow.\n\n`
      prompt += this.getWorkflowDescription(analysis.suggestedWorkflow)
    }

    prompt += '\n## Analysis Reasoning\n\n'
    prompt += analysis.reasoning + '\n'

    // Phase 3: Add BMAD complexity section if provided
    if (complexity) {
      prompt += '\n' + this.addComplexitySection(complexity)
    }

    // Phase 3: Add Party/Brainstorming mode section if provided
    if (sessionType && sessionType.type !== 'sequential') {
      prompt += '\n' + this.addPartyModeSection(sessionType)
    }

    return prompt
  }

  /**
   * Extract keywords from user prompt
   * Normalizes and cleans the prompt text
   */
  private extractKeywords(prompt: string): string[] {
    // Normalize
    const normalized = prompt
      .toLowerCase()
      .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
      .replace(/\s+/g, ' ')
      .trim()

    // Split into words
    const words = normalized.split(' ')

    // Filter stop words and short words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
      'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
      'when', 'where', 'why', 'how'
    ])

    const keywords = words
      .filter(word => word.length > 2)
      .filter(word => !stopWords.has(word))

    // Remove duplicates
    return Array.from(new Set(keywords))
  }

  /**
   * Identify task type from prompt and keywords
   */
  private identifyTaskType(
    prompt: string,
    keywords: string[]
  ): string | null {
    const promptLower = prompt.toLowerCase()

    // Bug fix patterns
    if (
      keywords.some(k =>
        ['bug', 'fix', 'error', 'issue', 'broken', 'crash', 'fail'].includes(k)
      ) ||
      promptLower.includes('не работает') || // Russian: "doesn't work"
      promptLower.includes('исправь') || // Russian: "fix"
      promptLower.includes('ошибка') // Russian: "error"
    ) {
      return 'bug_fix'
    }

    // Deployment patterns
    if (
      keywords.some(k =>
        ['deploy', 'deployment', 'release', 'production', 'publish'].includes(k)
      ) ||
      promptLower.includes('деплой') || // Russian: "deploy"
      promptLower.includes('выкатить') // Russian: "roll out"
    ) {
      return 'deployment'
    }

    // Testing patterns
    if (
      keywords.some(k =>
        ['test', 'testing', 'qa', 'quality', 'e2e', 'unit'].includes(k)
      ) ||
      promptLower.includes('тест') // Russian: "test"
    ) {
      return 'testing'
    }

    // Optimization patterns
    if (
      keywords.some(k =>
        ['optimize', 'optimization', 'performance', 'slow', 'faster'].includes(k)
      ) ||
      promptLower.includes('оптимизи') // Russian: "optimize"
    ) {
      return 'optimization'
    }

    // Architecture patterns
    if (
      keywords.some(k =>
        ['architect', 'architecture', 'design', 'structure', 'adr'].includes(k)
      ) ||
      promptLower.includes('архитектур') // Russian: "architecture"
    ) {
      return 'architecture'
    }

    // Refactor patterns
    if (
      keywords.some(k => ['refactor', 'refactoring', 'cleanup', 'clean'].includes(k)) ||
      promptLower.includes('рефактор') // Russian: "refactor"
    ) {
      return 'refactor'
    }

    // Feature patterns (default for implementation tasks)
    if (
      keywords.some(k =>
        ['implement', 'add', 'create', 'build', 'feature', 'new'].includes(k)
      ) ||
      promptLower.includes('реализ') || // Russian: "implement"
      promptLower.includes('добавь') || // Russian: "add"
      promptLower.includes('созда') // Russian: "create"
    ) {
      return 'feature'
    }

    return null
  }

  /**
   * Extract implicit skills from keywords and task type
   * Maps common keywords to skill IDs
   */
  private extractImplicitSkills(
    keywords: string[],
    taskType: string | null
  ): string[] {
    const skills: Set<string> = new Set()

    // Map keywords to skills
    const keywordSkillMap: Record<string, string[]> = {
      // Development skills
      code: ['code_writing'],
      coding: ['code_writing'],
      implement: ['code_writing', 'feature_implementation'],
      implementation: ['code_writing', 'feature_implementation'],
      write: ['code_writing'],
      develop: ['code_writing'],

      // Testing skills
      test: ['unit_testing', 'e2e_testing'],
      testing: ['unit_testing', 'e2e_testing'],
      'e2e': ['e2e_testing'],
      unit: ['unit_testing'],
      qa: ['test_coverage_analysis', 'bug_reproduction'],

      // Debugging skills
      bug: ['debugging', 'bug_reproduction'],
      debug: ['debugging'],
      fix: ['debugging', 'code_writing'],
      error: ['debugging'],
      crash: ['debugging'],

      // Deployment skills
      deploy: ['deployment', 'ci_cd'],
      deployment: ['deployment', 'ci_cd'],
      release: ['deployment'],
      production: ['deployment'],
      cicd: ['ci_cd'],
      'ci-cd': ['ci_cd'],

      // Architecture skills
      architect: ['architecture_decisions', 'system_design'],
      architecture: ['architecture_decisions', 'system_design'],
      design: ['system_design'],
      adr: ['architecture_decisions'],

      // Optimization skills
      optimize: ['performance_optimization'],
      optimization: ['performance_optimization'],
      performance: ['performance_optimization'],
      slow: ['performance_optimization'],

      // Authentication/Security
      auth: ['authentication', 'security'],
      authentication: ['authentication'],
      login: ['authentication'],
      security: ['security'],

      // Database
      database: ['data_modeling', 'database_operations'],
      sql: ['database_operations'],
      query: ['database_operations'],

      // UI/UX
      ui: ['ui_implementation'],
      interface: ['ui_implementation'],
      ux: ['ux_design']
      // Note: 'design' already mapped above to system_design
    }

    // Add skills based on keywords
    for (const keyword of keywords) {
      const mappedSkills = keywordSkillMap[keyword]
      if (mappedSkills) {
        mappedSkills.forEach(skill => skills.add(skill))
      }
    }

    // Add skills based on task type
    const taskTypeSkillMap: Record<string, string[]> = {
      bug_fix: ['debugging', 'code_writing', 'bug_reproduction'],
      feature: ['code_writing', 'feature_implementation', 'unit_testing'],
      deployment: ['deployment', 'ci_cd', 'infrastructure_management'],
      testing: ['e2e_testing', 'unit_testing', 'test_coverage_analysis'],
      optimization: ['performance_optimization', 'code_writing'],
      architecture: ['architecture_decisions', 'system_design'],
      refactor: ['code_writing', 'refactoring']
    }

    if (taskType && taskTypeSkillMap[taskType]) {
      taskTypeSkillMap[taskType].forEach(skill => skills.add(skill))
    }

    // Ensure TypeScript expert skill for coding tasks
    if (
      skills.has('code_writing') ||
      skills.has('feature_implementation') ||
      skills.has('refactoring')
    ) {
      skills.add('typescript_expert')
    }

    return Array.from(skills)
  }

  /**
   * Deduplicate roles and rank by priority and relevance
   * Higher priority roles appear first
   */
  private deduplicateAndRank(roles: Role[]): Role[] {
    // Create map to deduplicate
    const roleMap = new Map<string, { role: Role; occurrences: number }>()

    for (const role of roles) {
      if (roleMap.has(role.id)) {
        roleMap.get(role.id)!.occurrences++
      } else {
        roleMap.set(role.id, { role, occurrences: 1 })
      }
    }

    // Sort by occurrences (relevance) and priority
    return Array.from(roleMap.values())
      .sort((a, b) => {
        // First by occurrences (more occurrences = more relevant)
        if (a.occurrences !== b.occurrences) {
          return b.occurrences - a.occurrences
        }
        // Then by priority (higher priority = more important)
        return b.role.priority - a.role.priority
      })
      .map(entry => entry.role)
  }

  /**
   * Find matching workflow based on task characteristics
   * Returns workflow ID or null
   */
  private findMatchingWorkflow(
    _prompt: string,
    taskType: string | null,
    recommendedRoles: string[]
  ): string | null {
    // Predefined workflow patterns
    const workflows: Record<
      string,
      { taskTypes: string[]; requiredRoles: string[] }
    > = {
      bug_fix_workflow: {
        taskTypes: ['bug_fix'],
        requiredRoles: ['debugger', 'developer']
      },
      feature_implementation_full: {
        taskTypes: ['feature'],
        requiredRoles: ['architect', 'developer', 'tester']
      },
      deployment_automation: {
        taskTypes: ['deployment'],
        requiredRoles: ['devops']
      },
      performance_investigation: {
        taskTypes: ['optimization'],
        requiredRoles: ['debugger', 'optimizer']
      },
      comprehensive_testing: {
        taskTypes: ['testing'],
        requiredRoles: ['tester']
      }
    }

    // Match workflow
    for (const [workflowId, pattern] of Object.entries(workflows)) {
      // Check task type match
      if (taskType && pattern.taskTypes.includes(taskType)) {
        // Check if any required roles are in recommendations
        const hasRequiredRole = pattern.requiredRoles.some(requiredRole =>
          recommendedRoles.includes(requiredRole)
        )

        if (hasRequiredRole) {
          return workflowId
        }
      }
    }

    return null
  }

  /**
   * Calculate confidence score for the analysis
   * Factors: role matches, skill coverage, workflow match
   */
  private calculateConfidence(
    roles: Role[],
    skills: string[],
    workflow: string | null
  ): number {
    let confidence = 0

    // Base confidence from number of role matches
    if (roles.length > 0) {
      confidence += 0.4 // At least one role matched
      if (roles.length >= 2) {
        confidence += 0.2 // Multiple roles matched
      }
    }

    // Confidence from skills
    if (skills.length > 0) {
      confidence += 0.2 // Skills identified
      if (skills.length >= 3) {
        confidence += 0.1 // Multiple skills identified
      }
    }

    // Confidence from workflow match
    if (workflow) {
      confidence += 0.1 // Workflow matched
    }

    return Math.min(confidence, 1.0)
  }

  /**
   * Generate human-readable reasoning for the analysis
   */
  private generateReasoning(
    taskType: string | null,
    keywords: string[],
    recommendedRoles: string[],
    skills: string[],
    workflow: string | null
  ): string {
    const reasons: string[] = []

    // Task type reasoning
    if (taskType) {
      const taskTypeDescriptions: Record<string, string> = {
        bug_fix: 'Detected bug fixing task',
        feature: 'Detected feature implementation task',
        deployment: 'Detected deployment task',
        testing: 'Detected testing task',
        optimization: 'Detected optimization task',
        architecture: 'Detected architecture design task',
        refactor: 'Detected refactoring task'
      }

      const description = taskTypeDescriptions[taskType] || `Detected ${taskType} task`
      reasons.push(`${description} (keywords: ${keywords.slice(0, 3).join(', ')})`)
    }

    // Skills reasoning
    if (skills.length > 0) {
      reasons.push(
        `Required skills include ${skills.slice(0, 3).join(', ')}${skills.length > 3 ? ' and others' : ''}`
      )
    }

    // Roles reasoning
    if (recommendedRoles.length > 0) {
      const roleNames = recommendedRoles
        .map(id => {
          const role = this.roleManager.getRole(id)
          return role ? role.name : id
        })
        .join(' → ')

      reasons.push(`Recommended execution flow: ${roleNames}`)
    }

    // Workflow reasoning
    if (workflow) {
      reasons.push(`Matches predefined workflow: ${workflow}`)
    }

    return reasons.join('. ') + '.'
  }

  /**
   * Get workflow description (placeholder - workflows not yet implemented)
   */
  private getWorkflowDescription(workflowId: string): string {
    const descriptions: Record<string, string> = {
      bug_fix_workflow: `
1. **Debugger**: Investigate and identify root cause
2. **Developer**: Implement fix
3. **Tester**: Verify bug no longer reproduces
`,
      feature_implementation_full: `
1. **Architect**: Design system architecture
2. **Developer**: Implement feature
3. **Tester**: Create and run tests
4. **DevOps**: Deploy to staging/production
`,
      deployment_automation: `
1. **Tester**: Run pre-deployment tests
2. **DevOps**: Deploy to production
`,
      performance_investigation: `
1. **Debugger + Optimizer** (parallel): Analyze errors and performance
2. **Developer**: Implement fixes and optimizations
3. **Tester**: Verify improvements
`,
      comprehensive_testing: `
1. **Tester** (multiple): Unit tests, E2E tests, Performance tests (parallel)
2. **DevOps**: Deploy if all tests pass
`
    }

    return descriptions[workflowId] || 'Workflow details not available.'
  }

  /**
   * Check if adapter is initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'ClaudeCodeAdapter not initialized. Call initialize() first.'
      )
    }
  }

  /**
   * Get RoleManager instance (for MCP server access)
   */
  getRoleManager(): RoleManager {
    this.checkInitialized()
    return this.roleManager
  }

  /**
   * Add complexity analysis section to system prompt (Phase 3)
   *
   * @param complexity - Complexity analysis from BMAD
   * @returns Formatted complexity section
   */
  private addComplexitySection(complexity: ComplexityScore): string {
    let section = '## Complexity Analysis (BMAD)\n\n'
    section += `**Score**: ${complexity.score}/100 (${complexity.level})\n`
    section += `**Confidence**: ${(complexity.confidence * 100).toFixed(0)}%\n\n`

    section += '### Complexity Factors\n\n'
    section += `- **Files Affected**: ${complexity.factors.filesAffected}\n`
    section += `- **Dependencies**: ${complexity.factors.dependencies}\n`
    section += `- **Risk Level**: ${complexity.factors.riskLevel}\n`
    section += `- **Domain Expertise Required**: ${complexity.factors.domainExpertiseRequired ? 'Yes' : 'No'}\n`
    section += `- **Estimated LOC**: ${complexity.factors.estimatedLOC}\n`
    section += `- **Data Changes**: ${complexity.factors.dataChanges ? 'Yes' : 'No'}\n`
    section += `- **Security Impact**: ${complexity.factors.securityImpact ? 'Yes' : 'No'}\n`
    section += `- **Performance Impact**: ${complexity.factors.performanceImpact ? 'Yes' : 'No'}\n\n`

    section += `**Recommended Agents**: ${complexity.recommendedAgents.join(', ')}\n\n`
    section += `**Reasoning**: ${complexity.reasoning}\n`

    return section
  }

  /**
   * Add party/brainstorming mode section to system prompt (Phase 3)
   *
   * @param sessionType - Session type decision from SkillMatcher
   * @returns Formatted session type section
   */
  private addPartyModeSection(sessionType: SessionTypeDecision): string {
    const modeTitle = sessionType.type === 'brainstorming' ? 'Brainstorming' : 'Party'
    let section = `## ${modeTitle} Mode Active\n\n`

    section += `**Type**: ${sessionType.type}\n`

    if (sessionType.maxRounds) {
      section += `**Max Rounds**: ${sessionType.maxRounds}\n`
    }

    if (sessionType.convergenceThreshold) {
      section += `**Convergence Threshold**: ${(sessionType.convergenceThreshold * 100).toFixed(0)}%\n`
    }

    if (sessionType.generateADR) {
      section += `**ADR Generation**: Yes - Architecture Decision Record will be generated\n`
    }

    section += '\n'
    section += `**Reasoning**: ${sessionType.reasoning}\n\n`

    if (sessionType.type === 'brainstorming') {
      section += '### Brainstorming Process\n\n'
      section += '1. **Round 1**: Independent Proposals - Each agent proposes solutions\n'
      section += '2. **Round 2**: Cross Critique - Agents review and critique proposals\n'
      section += '3. **Round 3**: Synthesis & Voting - Combine best ideas and vote\n'
      section += '4. **Round 4**: Final Decision + ADR - Document the chosen approach\n'
    } else if (sessionType.type === 'party') {
      section += '### Party Mode Process\n\n'
      section += 'Multiple agents collaborate in parallel, discussing and refining the solution until consensus is reached.\n'
    }

    return section
  }

  /**
   * Get all skills (for MCP server access)
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skillsCache.values())
  }
}
