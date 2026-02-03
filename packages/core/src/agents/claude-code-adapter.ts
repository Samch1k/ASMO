import { RoleManager } from '../orchestration/role-manager'
import { ConfigLoader, getConfigLoader } from '../orchestration/config-loader'
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
 * User intent types for phase detection
 */
export type PhaseIntent = 'review' | 'implement' | 'refactor' | 'test' | 'design' | 'fix' | 'deploy' | 'unknown'

/**
 * Result from LLM-based phase analysis
 *
 * Used by PhaseDetector to determine optimal workflow starting phase
 */
export interface PhaseAnalysisResult {
  /** Recommended phase to start from */
  recommendedPhase: string

  /** Alternative phases that could also work */
  alternativePhases: string[]

  /** Detected user intent */
  intent: PhaseIntent

  /** Confidence score (0-1) */
  confidence: number

  /** Reasoning from LLM explaining the choice */
  reasoning: string

  /** Phases that should be skipped */
  skipPhases: string[]

  /** Prerequisites that are missing (warning) */
  missingPrerequisites: string[]
}

/**
 * Phase information for LLM analysis
 */
export interface PhaseForAnalysis {
  name: string
  description: string
  order: number
  prerequisites?: string[]
  skipIf?: string[]
}

/**
 * Context for phase analysis
 */
export interface PhaseAnalysisContext {
  hasImplementation: boolean
  hasTests: boolean
  hasDocs: boolean
  files: string[]
  recentChanges?: string
}

/**
 * Workflow info for phase analysis
 */
export interface WorkflowForPhaseAnalysis {
  name: string
  description: string
  phases: PhaseForAnalysis[]
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

    // Initialize ConfigLoader using fallback chain
    this.configLoader = await getConfigLoader()

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
   * Analyze task and workflow to determine optimal starting phase
   *
   * LLM-based phase detection: analyzes the task, workflow phases, and project context
   * to recommend the optimal phase to start from.
   *
   * @param task - User's task description
   * @param workflow - Workflow with phases to analyze
   * @param context - Project context (existing files, tests, docs)
   * @returns PhaseAnalysisResult with recommended phase and reasoning
   */
  async analyzePhase(
    task: string,
    workflow: WorkflowForPhaseAnalysis,
    context: PhaseAnalysisContext
  ): Promise<PhaseAnalysisResult> {
    this.checkInitialized()

    // Build comprehensive prompt for phase detection
    const prompt = this.buildPhaseAnalysisPrompt(task, workflow, context)

    // Use existing analyzePrompt to get LLM analysis
    const response = await this.analyzePrompt(prompt)

    // Parse and enhance the response for phase detection
    return this.parsePhaseAnalysisResponse(response, workflow, context, task)
  }

  /**
   * Build prompt for LLM-based phase analysis
   */
  private buildPhaseAnalysisPrompt(
    task: string,
    workflow: WorkflowForPhaseAnalysis,
    context: PhaseAnalysisContext
  ): string {
    const phasesStr = workflow.phases.map((p, i) => `
${i + 1}. **${p.name}**
   Description: ${p.description}
   Prerequisites: ${p.prerequisites?.join(', ') || 'none'}
   Skip if: ${p.skipIf?.join(', ') || 'never'}
`).join('\n')

    const filesStr = context.files.length > 0
      ? context.files.slice(0, 10).join(', ')
      : '(no files found)'

    return `
You are a workflow phase analyzer. Analyze the task and determine the optimal starting phase.

## Task
"${task}"

## Workflow: ${workflow.name}
${workflow.description}

## Available Phases (in execution order):
${phasesStr}

## Current Project State
- Has implementation code: ${context.hasImplementation}
- Has tests: ${context.hasTests}
- Has documentation: ${context.hasDocs}
- Files: ${filesStr}

## Instructions
1. Determine user's PRIMARY INTENT from the task
2. Check which phase prerequisites are already met
3. Identify phases that should be skipped (based on skipIf conditions)
4. Recommend the optimal starting phase

IMPORTANT RULES:
- If intent is "review" but NO code exists → recommend implementation phase
- If intent is "test" but NO code exists → recommend implementation phase
- If code already exists and intent is "implement" → start from implementation (not design)
- When in doubt, prefer earlier phases (safer)

Based on your analysis, provide your recommendations.
`.trim()
  }

  /**
   * Parse LLM response into PhaseAnalysisResult
   */
  private parsePhaseAnalysisResponse(
    response: AnalysisResult,
    workflow: WorkflowForPhaseAnalysis,
    context: PhaseAnalysisContext,
    task: string
  ): PhaseAnalysisResult {
    const reasoning = response.reasoning.toLowerCase()
    const taskLower = task.toLowerCase()

    // Detect intent from task and reasoning
    const intent = this.detectPhaseIntent(taskLower, reasoning)

    // Determine recommended phase based on intent and context
    const { recommendedPhase, alternatives, skipPhases, missingPrerequisites } =
      this.determinePhaseFromIntent(intent, workflow, context, reasoning)

    // Calculate confidence based on various factors
    const confidence = this.calculatePhaseConfidence(
      response.confidence,
      intent,
      context,
      alternatives.length
    )

    // Generate enhanced reasoning
    const enhancedReasoning = this.generatePhaseReasoning(
      intent,
      recommendedPhase,
      context,
      response.reasoning
    )

    return {
      recommendedPhase,
      alternativePhases: alternatives,
      intent,
      confidence,
      reasoning: enhancedReasoning,
      skipPhases,
      missingPrerequisites
    }
  }

  /**
   * Detect primary intent from task and reasoning
   */
  private detectPhaseIntent(task: string, reasoning: string): PhaseIntent {
    const combined = `${task} ${reasoning}`

    // Review keywords (EN + RU)
    if (/\b(review|ревью|проверь|check|audit|inspect|security|безопасност)\b/i.test(combined)) {
      return 'review'
    }

    // Test keywords (EN + RU)
    if (/\b(test|тест|coverage|e2e|unit|qa|качеств)\b/i.test(combined)) {
      return 'test'
    }

    // Refactor keywords (EN + RU)
    if (/\b(refactor|рефактор|optimize|оптимиз|clean|improve|улучш|медленн|slow|performance)\b/i.test(combined)) {
      return 'refactor'
    }

    // Fix/Debug keywords (EN + RU)
    if (/\b(fix|исправ|bug|баг|debug|отлад|error|ошибк|crash)\b/i.test(combined)) {
      return 'fix'
    }

    // Design keywords (EN + RU)
    if (/\b(design|дизайн|brainstorm|мозговой|архитект|architect|plan|подумаем|think)\b/i.test(combined)) {
      return 'design'
    }

    // Deploy keywords (EN + RU)
    if (/\b(deploy|деплой|release|релиз|publish|опубликов|production|прод)\b/i.test(combined)) {
      return 'deploy'
    }

    // Implement keywords (EN + RU)
    if (/\b(implement|реализ|создай|create|build|add|добав|напис|write|develop|разработ)\b/i.test(combined)) {
      return 'implement'
    }

    return 'unknown'
  }

  /**
   * Determine recommended phase based on intent and context
   */
  private determinePhaseFromIntent(
    intent: PhaseIntent,
    workflow: WorkflowForPhaseAnalysis,
    context: PhaseAnalysisContext,
    _reasoning: string
  ): {
    recommendedPhase: string
    alternatives: string[]
    skipPhases: string[]
    missingPrerequisites: string[]
  } {
    const phases = workflow.phases
    const firstPhase = phases[0]?.name || 'unknown'
    const alternatives: string[] = []
    const skipPhases: string[] = []
    const missingPrerequisites: string[] = []

    // Helper to find phase by keywords
    const findPhase = (keywords: string[]): string | undefined => {
      return phases.find(p =>
        keywords.some(kw => p.name.toLowerCase().includes(kw))
      )?.name
    }

    let recommendedPhase = firstPhase

    switch (intent) {
      case 'review': {
        // Review requires existing code
        if (!context.hasImplementation) {
          missingPrerequisites.push('implementation code')
          // Fall back to implementation/test_first phase
          recommendedPhase = findPhase(['test_first', 'implement', 'development']) || firstPhase
        } else {
          recommendedPhase = findPhase(['review', 'audit']) || firstPhase
          // Can skip earlier implementation phases
          const reviewIndex = phases.findIndex(p => p.name === recommendedPhase)
          if (reviewIndex > 0) {
            skipPhases.push(...phases.slice(0, reviewIndex).map(p => p.name))
          }
          // Test phase could be alternative
          const testPhase = findPhase(['test'])
          if (testPhase && testPhase !== recommendedPhase) {
            alternatives.push(testPhase)
          }
        }
        break
      }

      case 'test': {
        // Testing requires implementation
        if (!context.hasImplementation) {
          missingPrerequisites.push('implementation code')
          recommendedPhase = findPhase(['test_first', 'implement', 'development']) || firstPhase
        } else {
          recommendedPhase = findPhase(['test', 'qa', 'verification']) || firstPhase
        }
        break
      }

      case 'refactor': {
        // Refactoring requires existing code
        if (!context.hasImplementation) {
          missingPrerequisites.push('implementation code')
          recommendedPhase = findPhase(['test_first', 'implement']) || firstPhase
        } else {
          recommendedPhase = findPhase(['refactor', 'optim', 'clean']) || firstPhase
          // Review could be a prerequisite
          const reviewPhase = findPhase(['review'])
          if (reviewPhase) {
            alternatives.push(reviewPhase)
          }
        }
        break
      }

      case 'fix': {
        // Bug fixing - start from analysis/debug if available, otherwise implementation
        const debugPhase = findPhase(['debug', 'analysis', 'investigation', 'diagnos'])
        if (debugPhase) {
          recommendedPhase = debugPhase
        } else {
          recommendedPhase = findPhase(['implement', 'development', 'fix']) || firstPhase
        }
        break
      }

      case 'design': {
        // Design/brainstorming - start from earliest design phase
        recommendedPhase = findPhase(['design', 'brainstorm', 'research', 'analysis', 'planning']) || firstPhase
        break
      }

      case 'deploy': {
        // Deployment requires code and ideally tests
        if (!context.hasImplementation) {
          missingPrerequisites.push('implementation code')
          recommendedPhase = firstPhase
        } else if (!context.hasTests) {
          missingPrerequisites.push('tests (recommended)')
          recommendedPhase = findPhase(['deploy', 'release', 'publish']) || firstPhase
        } else {
          recommendedPhase = findPhase(['deploy', 'release', 'publish']) || firstPhase
        }
        break
      }

      case 'implement': {
        // Implementation - start from test_first or implementation phase
        if (context.hasImplementation) {
          // Code exists, start from implementation (skip design)
          recommendedPhase = findPhase(['implement', 'development', 'coding']) || firstPhase
          const implIndex = phases.findIndex(p => p.name === recommendedPhase)
          if (implIndex > 0) {
            // Can skip design phases
            const designPhases = phases.slice(0, implIndex).filter(p =>
              /design|research|analysis|planning/i.test(p.name)
            )
            skipPhases.push(...designPhases.map(p => p.name))
          }
        } else {
          // No code - start from beginning (test_first for TDD or first phase)
          recommendedPhase = findPhase(['test_first']) || firstPhase
        }
        break
      }

      default: {
        // Unknown intent - use first phase (safest)
        recommendedPhase = firstPhase
      }
    }

    return { recommendedPhase, alternatives, skipPhases, missingPrerequisites }
  }

  /**
   * Calculate confidence for phase recommendation
   */
  private calculatePhaseConfidence(
    baseConfidence: number,
    intent: PhaseIntent,
    context: PhaseAnalysisContext,
    alternativesCount: number
  ): number {
    let confidence = baseConfidence

    // Unknown intent reduces confidence
    if (intent === 'unknown') {
      confidence *= 0.6
    }

    // Many alternatives reduce confidence
    if (alternativesCount > 2) {
      confidence *= 0.9
    }

    // Context availability boosts confidence
    if (context.hasImplementation || context.hasTests || context.hasDocs) {
      confidence = Math.min(confidence * 1.1, 1.0)
    }

    // No context reduces confidence
    if (!context.hasImplementation && !context.hasTests && context.files.length === 0) {
      confidence *= 0.8
    }

    return Math.min(Math.max(confidence, 0), 1)
  }

  /**
   * Generate enhanced reasoning for phase selection
   */
  private generatePhaseReasoning(
    intent: PhaseIntent,
    recommendedPhase: string,
    context: PhaseAnalysisContext,
    baseReasoning: string
  ): string {
    const parts: string[] = []

    // Intent
    parts.push(`Detected intent: "${intent}"`)

    // Context summary
    const contextParts: string[] = []
    if (context.hasImplementation) contextParts.push('existing code')
    if (context.hasTests) contextParts.push('tests')
    if (context.hasDocs) contextParts.push('docs')

    if (contextParts.length > 0) {
      parts.push(`Found: ${contextParts.join(', ')}`)
    } else {
      parts.push('No existing artifacts found')
    }

    // Phase selection
    parts.push(`Selected phase: "${recommendedPhase}"`)

    // Original reasoning (trimmed)
    if (baseReasoning && baseReasoning.length > 0) {
      const trimmed = baseReasoning.length > 100
        ? baseReasoning.substring(0, 100) + '...'
        : baseReasoning
      parts.push(`Analysis: ${trimmed}`)
    }

    return parts.join('. ')
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
