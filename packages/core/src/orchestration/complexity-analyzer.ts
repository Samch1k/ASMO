/**
 * ComplexityAnalyzer - Analyze task complexity using LLM reasoning
 *
 * BMAD Phase 1: Complexity Analysis & Adaptive Selection
 *
 * Features:
 * - Analyze task description and project context
 * - Calculate complexity score (0-100)
 * - Map to complexity levels (trivial, simple, medium, complex, enterprise)
 * - Recommend appropriate workflow
 * - Suggest required agents
 * - Provide confidence scores and reasoning
 *
 * Uses LLMProviderFactory for LLM access:
 * - Session mode (default, $0) → `claude -p "prompt"`
 * - API mode (fallback) → Anthropic SDK
 * - Heuristics as final fallback if no provider available
 */

import { getLLMProvider } from '../llm/provider-factory'
import type { ILLMProvider } from '../llm/types'
import type {
  ComplexityScore,
  ComplexityLevel,
  ComplexityFactors,
  ProjectContext,
  Workflow
} from './types'
import { PromptValidator } from './prompt-validator'

/**
 * Complexity analysis configuration
 */
export interface ComplexityAnalyzerConfig {
  /**
   * LLM provider mode
   * - 'auto' (default): Session → API → Heuristics
   * - 'api': Force API mode (requires ANTHROPIC_API_KEY)
   * - 'session': Force Session mode (requires Claude CLI)
   * - 'heuristics': Force heuristics only (no LLM)
   * @default 'auto'
   */
  llmMode?: 'auto' | 'api' | 'session' | 'heuristics'

  /**
   * Maximum tokens for LLM response
   * @default 2000
   */
  maxTokens?: number

  /**
   * Complexity thresholds for level mapping
   */
  thresholds?: {
    trivial: number    // 0-20
    simple: number     // 21-40
    medium: number     // 41-60
    complex: number    // 61-80
    enterprise: number // 81-100
  }
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<ComplexityAnalyzerConfig> = {
  llmMode: 'auto',
  maxTokens: 2000,
  thresholds: {
    trivial: 20,
    simple: 40,
    medium: 60,
    complex: 80,
    enterprise: 100
  }
}

/**
 * ComplexityAnalyzer - Analyze task complexity to recommend appropriate workflow
 */
export class ComplexityAnalyzer {
  private config: Required<ComplexityAnalyzerConfig>
  private workflows: Map<string, Workflow> = new Map()
  /** Tracks which mode was used for the last analysis */
  private lastAnalysisMode: 'session' | 'api' | 'heuristics' = 'heuristics'
  private lastProvider: string = 'heuristics'
  /** Prompt validator for input sanitization */
  private promptValidator: PromptValidator
  private verbose: boolean

  constructor(config?: ComplexityAnalyzerConfig, verbose?: boolean) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.promptValidator = new PromptValidator()
    this.verbose = verbose ?? false
  }

  /**
   * Register workflows for recommendation
   */
  registerWorkflows(workflows: Workflow[]): void {
    this.workflows.clear()
    for (const workflow of workflows) {
      this.workflows.set(workflow.id, workflow)
    }
  }

  /**
   * Analyze task complexity
   *
   * @param taskDescription - User's task description
   * @param context - Project context (optional)
   * @returns Complexity analysis with recommendations
   */
  async analyzeTask(
    taskDescription: string,
    context?: ProjectContext
  ): Promise<ComplexityScore> {
    if (this.verbose) {
      console.log('🔍 [ComplexityAnalyzer] Analyzing task complexity...')
      console.log(`   Task: ${taskDescription.slice(0, 80)}${taskDescription.length > 80 ? '...' : ''}`)
    }

    // Validate and sanitize prompt
    const sanitizedPrompt = this.promptValidator.validateOrThrow(taskDescription)

    // Override llmMode from context if provided (from CLI flags)
    // No mutation of this.config — safe for concurrent calls
    const effectiveConfig = context?.llmMode
      ? { ...this.config, llmMode: context.llmMode }
      : this.config

    if (this.verbose) {
      console.log(`   LLM Mode: ${effectiveConfig.llmMode}`)
    }

    // Build analysis prompt with sanitized input
    const prompt = this.buildAnalysisPrompt(sanitizedPrompt, context)

    // Call LLM for analysis (or use heuristics if LLM not available)
    console.log(`[ComplexityAnalyzer] Analyzing task: "${sanitizedPrompt.substring(0, 80)}${sanitizedPrompt.length > 80 ? '...' : ''}"`)
    const analysisResult = await this.callLLM(prompt, sanitizedPrompt, effectiveConfig)

    // Parse LLM response
    const complexity = this.parseComplexityResponse(analysisResult)

    // Map score to level
    complexity.level = this.scoreToLevel(complexity.score, effectiveConfig)

    // Add task description for intent detection in workflow recommendation
    complexity.taskDescription = taskDescription

    // Recommend workflow based on complexity
    complexity.recommendedWorkflow = this.recommendWorkflow(complexity)

    // Add metadata for transparency
    complexity.metadata = {
      analysisMode: this.lastAnalysisMode,
      provider: this.lastProvider,
      timestamp: new Date()
    }

    if (this.verbose) {
      console.log(`   Complexity: ${complexity.level} (score: ${complexity.score}/100)`)
      console.log(`   Provider: ${this.lastProvider} (${this.lastAnalysisMode} mode)`)
      if (complexity.recommendedWorkflow) {
        console.log(`   Recommended: ${complexity.recommendedWorkflow}`)
      }
      console.log(
        `[ComplexityAnalyzer] Result: score=${complexity.score}/100, level=${complexity.level}, ` +
        `confidence=${(complexity.confidence * 100).toFixed(0)}%, mode=${this.lastAnalysisMode}`
      )
      console.log(`[ComplexityAnalyzer] Reasoning: ${complexity.reasoning}`)
      console.log(
        `[ComplexityAnalyzer] Recommended workflow: ${complexity.recommendedWorkflow}, ` +
        `agents: [${complexity.recommendedAgents.join(', ')}]`
      )
    }

    return complexity
  }

  /**
   * Build LLM prompt for complexity analysis
   */
  private buildAnalysisPrompt(
    taskDescription: string,
    context?: ProjectContext
  ): string {
    return `Analyze the complexity of this software development task and provide a detailed assessment.

Task Description:
${taskDescription}

${context ? `Project Context:
- Project Path: ${context.projectPath || 'Not specified'}
- Project Size: ${context.projectSize || 'Unknown'}
- Tech Stack: ${context.techStack?.join(', ') || 'Not specified'}
- Files in Project: ${context.files?.length || 0}
- Recent Changes: ${context.recentChanges?.length || 0}
` : ''}

Analyze the following complexity factors:

1. **Files Affected**: How many files will likely need changes?
   - 1 file = low complexity
   - 2-5 files = medium complexity
   - 6+ files = high complexity

2. **Dependencies**: How many external dependencies or integrations?
   - None or 1-2 = low
   - 3-5 = medium
   - 6+ = high

3. **Risk Level**: What's the risk of breaking things?
   - Low: Isolated changes, easy to test
   - Medium: Some integration points, moderate testing needed
   - High: Core system changes, extensive testing required

4. **Domain Expertise**: Does this require specialized knowledge?
   - No: Standard patterns and practices
   - Yes: Requires deep domain knowledge (security, performance, etc.)

5. **Estimated LOC**: How many lines of code will change?
   - <50 = trivial
   - 50-200 = simple
   - 200-500 = medium
   - 500-1000 = complex
   - 1000+ = enterprise

6. **Data Changes**: Will this modify database schemas or data structures?
7. **Security Impact**: Are there security implications?
8. **Performance Impact**: Could this affect system performance?

Provide your analysis in the following JSON format:
{
  "score": 0-100,
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of the complexity assessment",
  "factors": {
    "filesAffected": number,
    "dependencies": number,
    "riskLevel": "low" | "medium" | "high",
    "domainExpertiseRequired": boolean,
    "estimatedLOC": number,
    "dataChanges": boolean,
    "securityImpact": boolean,
    "performanceImpact": boolean
  },
  "recommendedAgents": ["agent1", "agent2", ...]
}

Be objective and realistic in your assessment. Consider both the immediate task and potential side effects.`
  }

  /**
   * Call LLM for analysis with fallback to heuristics
   *
   * Uses LLMProviderFactory to get the best available provider:
   * - Session mode ($0, via Claude CLI subscription)
   * - API mode (pay-per-use, via ANTHROPIC_API_KEY)
   * - Heuristics (final fallback if no provider available)
   * 
   * Respects config.llmMode for forced modes:
   * - 'auto': Session → API → Heuristics (default)
   * - 'api': Force API mode only
   * - 'session': Force Session mode only
   * - 'heuristics': Skip LLM entirely
   */
  private async callLLM(prompt: string, taskDescription: string, config: Required<ComplexityAnalyzerConfig>): Promise<string> {
    const { llmMode } = config

    // Force heuristics mode (--no-llm flag)
    if (llmMode === 'heuristics') {
      console.warn('[ComplexityAnalyzer] LLM disabled via config, using heuristics')
      this.lastAnalysisMode = 'heuristics'
      this.lastProvider = 'heuristics'
      return this.analyzeWithHeuristics(taskDescription)
    }

    let provider: ILLMProvider | null = null

    try {
      // Get provider based on mode
      if (llmMode === 'api') {
        // Force API mode (--use-api flag)
        provider = getLLMProvider('anthropic')
      } else if (llmMode === 'session') {
        // Force Session mode
        provider = getLLMProvider('session')
      } else {
        // Auto mode: Session → API
        provider = getLLMProvider()
      }
    } catch {
      // Provider not available
      if (llmMode === 'api') {
        console.error('[ComplexityAnalyzer] API mode requested but ANTHROPIC_API_KEY not set')
        throw new Error('API mode requires ANTHROPIC_API_KEY environment variable')
      } else if (llmMode === 'session') {
        console.error('[ComplexityAnalyzer] Session mode requested but Claude CLI not available')
        throw new Error('Session mode requires Claude CLI to be installed and authenticated')
      }
      // Auto mode: fall through to heuristics
    }

    if (provider) {
      try {
        // Track which mode we're using
        this.lastAnalysisMode = provider.id === 'session' ? 'session' : 'api'
        this.lastProvider = provider.name
        console.log(`[ComplexityAnalyzer] LLM provider: ${this.lastProvider} (mode: ${this.lastAnalysisMode})`)

        const response = await provider.generate(prompt, {
          maxTokens: config.maxTokens,
          temperature: 0.2
        })

        // Extract JSON from response (may be wrapped in markdown)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          return jsonMatch[0]
        }
        return response.content
      } catch (error) {
        console.warn('[ComplexityAnalyzer] LLM call failed:', error)
        
        // In forced modes, throw error instead of falling back
        if (llmMode === 'api' || llmMode === 'session') {
          throw new Error(`${llmMode} mode failed: ${error instanceof Error ? error.message : String(error)}`)
        }
        
        // Auto mode: fall through to heuristics
      }
    }

    // Fallback to heuristic-based analysis (only in auto mode)
    console.warn('[ComplexityAnalyzer] ⚠️  No LLM provider available, falling back to heuristics (lower accuracy ~60-75%)')
    console.warn('[ComplexityAnalyzer]   Tip: Install Claude CLI for free Session mode ($0) or set ANTHROPIC_API_KEY')
    this.lastAnalysisMode = 'heuristics'
    this.lastProvider = 'heuristics'
    return this.analyzeWithHeuristics(taskDescription)
  }

  /**
   * Heuristic-based complexity analysis
   *
   * Used as fallback when LLM is not available or fails.
   * Analyzes keywords in task description to estimate complexity.
   */
  private analyzeWithHeuristics(taskDescription: string): string {
    console.log(`[ComplexityAnalyzer] Running heuristic analysis...`)
    const taskLower = taskDescription.toLowerCase()

    let score = 30 // Default: simple task
    const factors: ComplexityFactors = {
      filesAffected: 1,
      dependencies: 0,
      riskLevel: 'low',
      domainExpertiseRequired: false,
      estimatedLOC: 50,
      dataChanges: false,
      securityImpact: false,
      performanceImpact: false
    }
    const recommendedAgents: string[] = ['developer']

    // Check for high-risk indicators that override other categories
    const isHighRisk = taskLower.includes('core') || taskLower.includes('modify') ||
                      taskLower.includes('redesign') || taskLower.includes('migrate')

    // Priority 1: Check for trivial tasks first (most specific)
    if (taskLower.includes('typo') || taskLower.includes('text change') || taskLower.includes('update text')) {
      score = 15
      factors.filesAffected = 1
      factors.estimatedLOC = 5
      recommendedAgents.push('tester')
    }
    // Priority 2: Bug fixes - check early as "fix" is very specific
    else if (taskLower.includes('bug') || taskLower.includes('fix') || taskLower.includes('error') ||
             taskLower.includes('memory leak') || taskLower.includes('crash')) {
      score = 25
      factors.filesAffected = 1
      factors.estimatedLOC = 30
      // Replace developer with debugger for bug fixes
      recommendedAgents[0] = 'debugger'
      recommendedAgents.push('tester')
    }
    // Priority 3: Architecture/design - check before generic keywords
    else if (taskLower.includes('architecture') || taskLower.includes('design system') ||
             (taskLower.includes('design') && taskLower.includes('implement')) ||
             (taskLower.includes('entire') && taskLower.includes('system'))) {
      score = 75
      factors.filesAffected = 10
      factors.dependencies = 5
      factors.riskLevel = 'high'
      factors.domainExpertiseRequired = true
      factors.estimatedLOC = 800
      recommendedAgents.push('architect', 'developer', 'ui-developer', 'tester', 'devops')
    }
    // Priority 3: Security/Auth - high complexity
    else if (taskLower.includes('security') || taskLower.includes('auth') ||
             taskLower.includes('encryption') || taskLower.includes('oauth')) {
      score = 70
      factors.securityImpact = true
      factors.domainExpertiseRequired = true
      factors.riskLevel = 'high'
      factors.filesAffected = 5
      factors.estimatedLOC = 400
      recommendedAgents.push('architect', 'developer', 'tester')
    }
    // Priority 4: Performance optimization
    else if (taskLower.includes('performance') || taskLower.includes('optimize') ||
             taskLower.includes('speed') || taskLower.includes('faster')) {
      score = 65
      factors.performanceImpact = true
      factors.domainExpertiseRequired = true
      factors.filesAffected = 3
      factors.estimatedLOC = 250
      recommendedAgents.push('developer', 'tester')
    }
    // Priority 5: Database/migration - medium-high complexity
    else if (taskLower.includes('database') || taskLower.includes('migration') ||
             taskLower.includes('schema') || taskLower.includes('postgres') ||
             taskLower.includes('mongodb')) {
      score = isHighRisk ? 70 : 60
      factors.dataChanges = true
      factors.riskLevel = isHighRisk ? 'high' : 'medium'
      factors.filesAffected = isHighRisk ? 8 : 4
      factors.estimatedLOC = isHighRisk ? 400 : 200
      if (isHighRisk) {
        recommendedAgents.push('architect', 'developer', 'tester')
      } else {
        recommendedAgents.push('developer', 'tester')
      }
    }
    // Priority 6: Refactoring - medium complexity
    else if (taskLower.includes('refactor') || taskLower.includes('cleanup') ||
             (taskLower.includes('improve') && !taskLower.includes('add'))) {
      score = 50
      factors.filesAffected = 3
      factors.estimatedLOC = 200
      recommendedAgents.push('architect', 'tester')
    }
    // Priority 7: API design - medium complexity
    else if (taskLower.includes('api') || taskLower.includes('endpoint') ||
             taskLower.includes('rest') || taskLower.includes('graphql')) {
      score = 50
      factors.dependencies = 3
      factors.filesAffected = 3
      factors.estimatedLOC = 150
      recommendedAgents.push('developer', 'tester')
    }
    // Priority 8: New features - medium complexity
    else if (taskLower.includes('add') || taskLower.includes('create') ||
             taskLower.includes('implement') || taskLower.includes('feature')) {
      score = 55
      factors.filesAffected = 4
      factors.dependencies = 2
      factors.estimatedLOC = 300
      recommendedAgents.push('architect', 'ui-developer', 'tester')
    }
    // Post-processing: Add impact flags based on keywords (can be combined)
    if (taskLower.includes('database') || taskLower.includes('schema') || taskLower.includes('migration')) {
      factors.dataChanges = true
    }
    if (taskLower.includes('security') || taskLower.includes('auth') || taskLower.includes('encryption')) {
      factors.securityImpact = true
    }
    if (taskLower.includes('performance') || taskLower.includes('optimize') || taskLower.includes('speed')) {
      factors.performanceImpact = true
    }

    const reasoning = this.generateReasoning(score, factors)
    const dedupedAgents = Array.from(new Set(recommendedAgents))

    console.log(`[ComplexityAnalyzer] Heuristic score: ${score}/100 | risk: ${factors.riskLevel} | files: ${factors.filesAffected} | LOC: ${factors.estimatedLOC}`)
    console.log(`[ComplexityAnalyzer] Heuristic flags: data=${factors.dataChanges}, security=${factors.securityImpact}, perf=${factors.performanceImpact}, expertise=${factors.domainExpertiseRequired}`)
    console.log(`[ComplexityAnalyzer] Heuristic agents: [${dedupedAgents.join(', ')}]`)

    return JSON.stringify({
      score,
      confidence: 0.75, // Heuristic confidence
      reasoning,
      factors,
      recommendedAgents: dedupedAgents
    })
  }

  /**
   * Generate reasoning text based on score and factors
   */
  private generateReasoning(score: number, factors: ComplexityFactors): string {
    const level = this.scoreToLevel(score)
    const reasons: string[] = []

    if (factors.filesAffected === 1) {
      reasons.push('Single file change')
    } else if (factors.filesAffected < 5) {
      reasons.push(`${factors.filesAffected} files affected`)
    } else {
      reasons.push(`Multiple files affected (${factors.filesAffected})`)
    }

    if (factors.dependencies > 0) {
      reasons.push(`${factors.dependencies} external dependencies`)
    }

    if (factors.riskLevel === 'high') {
      reasons.push('High risk of side effects')
    }

    if (factors.domainExpertiseRequired) {
      reasons.push('Requires specialized expertise')
    }

    if (factors.dataChanges) {
      reasons.push('Database schema changes')
    }

    if (factors.securityImpact) {
      reasons.push('Security implications')
    }

    if (factors.performanceImpact) {
      reasons.push('Performance considerations')
    }

    return `Complexity level: ${level} (score: ${score}/100). ${reasons.join('; ')}.`
  }

  /**
   * Parse LLM response into ComplexityScore
   */
  private parseComplexityResponse(response: string): ComplexityScore {
    try {
      const parsed = JSON.parse(response)

      return {
        score: parsed.score,
        level: 'simple', // Will be set by scoreToLevel
        confidence: parsed.confidence,
        reasoning: parsed.reasoning,
        recommendedWorkflow: '', // Will be set by recommendWorkflow
        recommendedAgents: parsed.recommendedAgents || [],
        factors: parsed.factors
      }
    } catch (error) {
      console.error('Failed to parse LLM response:', error)
      // Fallback to simple complexity
      return {
        score: 30,
        level: 'simple',
        confidence: 0.5,
        reasoning: 'Failed to analyze complexity, defaulting to simple',
        recommendedWorkflow: '',
        recommendedAgents: ['developer', 'tester'],
        factors: {
          filesAffected: 1,
          dependencies: 0,
          riskLevel: 'low',
          domainExpertiseRequired: false,
          estimatedLOC: 50,
          dataChanges: false,
          securityImpact: false,
          performanceImpact: false
        }
      }
    }
  }

  /**
   * Map complexity score to level
   */
  private scoreToLevel(score: number, config?: Required<ComplexityAnalyzerConfig>): ComplexityLevel {
    const { thresholds } = config || this.config

    if (score <= thresholds.trivial) return 'trivial'
    if (score <= thresholds.simple) return 'simple'
    if (score <= thresholds.medium) return 'medium'
    if (score <= thresholds.complex) return 'complex'
    return 'enterprise'
  }

  /**
   * Recommend workflow based on complexity
   *
   * Matches complexity level and task type to appropriate workflow
   */
  private recommendWorkflow(complexity: ComplexityScore): string {
    // If no workflows registered, return default
    if (this.workflows.size === 0) {
      const defaultId = this.getDefaultWorkflowForLevel(complexity.level)
      if (this.verbose) {
        console.log('   [recommendWorkflow] No workflows registered, using default')
        console.log(`      → Default workflow: ${defaultId}`)
      }
      return defaultId
    }

    // Try to match based on complexity level and task type
    const { level, factors } = complexity
    const taskDescription = complexity.taskDescription?.toLowerCase() || ''

    if (this.verbose) {
      console.log('   [recommendWorkflow] Detecting task intent...')
      console.log(`      Task description: ${taskDescription}`)
      console.log(`      Level: ${level}`)
    }

    // Detect task intent from description
    // Note: Don't use \b for Cyrillic, as word boundaries don't work with non-ASCII
    const isCreation = /(создать|создай|разработать|разработай|реализовать|реализуй|построить|построй|сделать|сделай|\badd\b|\bcreate\b|\bimplement\b|\bbuild\b|\bdevelop\b)/.test(taskDescription)
    const isFix = /(исправить|исправь|починить|почини|\bfix\b|\brepair\b|\bdebug\b|\bresolve\b)/.test(taskDescription)
    const isRefactor = /(рефакторинг|\brefactor\b|\bcleanup\b|\bimprove\b|\boptimize code\b)/.test(taskDescription)
    const isTest = /(тест|\btest\b|\btesting\b|\bqa\b|\bquality\b)/.test(taskDescription)

    if (this.verbose) {
      console.log(`      Intent: creation=${isCreation}, fix=${isFix}, refactor=${isRefactor}, test=${isTest}`)
    }

    // Bug fix workflow (high priority for fix tasks)
    if (isFix && (level === 'trivial' || level === 'simple')) {
      const bugFixWorkflow = this.findWorkflowByKeyword('bug')
      if (bugFixWorkflow) {
        console.log(`[ComplexityAnalyzer] Workflow match: "${bugFixWorkflow.id}" (rule: ${level} → bug_fix)`)
        return bugFixWorkflow.id
      }
    }

<<<<<<< Updated upstream
    // Feature creation/development workflow
    if (isCreation) {
      if (this.verbose) {
        console.log('      → Detected CREATION task')
      }
      // For complex creation tasks, prefer architecture design first
      if (level === 'complex' || level === 'enterprise') {
        const archWorkflow = this.findWorkflowByKeyword('architecture')
        if (this.verbose) {
          console.log(`      → Searching for architecture workflow: ${archWorkflow ? 'FOUND (' + archWorkflow.id + ')' : 'NOT FOUND'}`)
        }
        if (archWorkflow) return archWorkflow.id
=======
    // Feature development workflow
    if (level === 'simple' || level === 'medium') {
      const featureWorkflow = this.findWorkflowByKeyword('feature')
      if (featureWorkflow) {
        console.log(`[ComplexityAnalyzer] Workflow match: "${featureWorkflow.id}" (rule: ${level} → feature)`)
        return featureWorkflow.id
      }
    }

    // Complex workflows
    if (level === 'complex' || level === 'enterprise') {
      // Architecture design for high complexity
      if (factors.filesAffected > 10) {
        const archWorkflow = this.findWorkflowByKeyword('architecture')
        if (archWorkflow) {
          console.log(`[ComplexityAnalyzer] Workflow match: "${archWorkflow.id}" (rule: ${level} + files>${factors.filesAffected} → architecture)`)
          return archWorkflow.id
        }
>>>>>>> Stashed changes
      }

      // Otherwise use feature implementation
      const featureWorkflow = this.findWorkflowByKeyword('feature')
      if (this.verbose) {
        console.log(`      → Searching for feature workflow: ${featureWorkflow ? 'FOUND (' + featureWorkflow.id + ')' : 'NOT FOUND'}`)
      }
      if (featureWorkflow) return featureWorkflow.id
    }

    // Refactoring workflow
    if (isRefactor) {
      const refactorWorkflow = this.findWorkflowByKeyword('refactor')
      if (refactorWorkflow) return refactorWorkflow.id
    }

    // Testing workflow
    if (isTest) {
      const testWorkflow = this.findWorkflowByKeyword('test')
      if (testWorkflow) return testWorkflow.id
    }

    // Complex workflows - specific concerns
    if (level === 'complex' || level === 'enterprise') {
      // Security audit
      if (factors.securityImpact) {
        const securityWorkflow = this.findWorkflowByKeyword('security')
        if (securityWorkflow) {
          console.log(`[ComplexityAnalyzer] Workflow match: "${securityWorkflow.id}" (rule: ${level} + securityImpact → security)`)
          return securityWorkflow.id
        }
      }

      // Performance optimization
      if (factors.performanceImpact) {
        const perfWorkflow = this.findWorkflowByKeyword('performance')
        if (perfWorkflow) {
          console.log(`[ComplexityAnalyzer] Workflow match: "${perfWorkflow.id}" (rule: ${level} + performanceImpact → performance)`)
          return perfWorkflow.id
        }
      }

      // Database migration
      if (factors.dataChanges) {
        const dbWorkflow = this.findWorkflowByKeyword('database')
        if (dbWorkflow) {
          console.log(`[ComplexityAnalyzer] Workflow match: "${dbWorkflow.id}" (rule: ${level} + dataChanges → database)`)
          return dbWorkflow.id
        }
      }

      // High file count -> architecture design
      if (factors.filesAffected > 10) {
        const archWorkflow = this.findWorkflowByKeyword('architecture')
        if (archWorkflow) return archWorkflow.id
      }
    }

    // Fallback to default
<<<<<<< Updated upstream
    if (this.verbose) {
      console.log('      → No specific workflow matched, using default for level')
    }
    const defaultWorkflow = this.getDefaultWorkflowForLevel(level)
    if (this.verbose) {
      console.log(`      → Default workflow: ${defaultWorkflow}`)
    }
    return defaultWorkflow
=======
    const defaultId = this.getDefaultWorkflowForLevel(level)
    console.log(`[ComplexityAnalyzer] No specific match, fallback to default: ${defaultId} (level: ${level})`)
    return defaultId
>>>>>>> Stashed changes
  }

  /**
   * Find workflow by keyword in name or description
   * Prioritizes ID matches, then name matches, then description matches
   */
  private findWorkflowByKeyword(keyword: string): Workflow | undefined {
    const workflows = Array.from(this.workflows.values())

    // First try to find exact ID match (e.g., "architecture" -> "architecture_design")
    const idMatch = workflows.find(w => w.id.toLowerCase().includes(keyword))
    if (idMatch) return idMatch

    // Then try name match
    const nameMatch = workflows.find(w => w.name.toLowerCase().includes(keyword))
    if (nameMatch) return nameMatch

    // Finally try description match
    const descMatch = workflows.find(w => w.description.toLowerCase().includes(keyword))
    return descMatch
  }

  /**
   * Get default workflow ID for complexity level
   */
  private getDefaultWorkflowForLevel(level: ComplexityLevel): string {
    // Level-based keyword fallback: try to find registered workflow matching the level
    const levelKeywords: Record<string, string[]> = {
      'trivial': ['bug', 'fix', 'quick'],
      'simple': ['bug', 'fix', 'quick'],
      'medium': ['feature', 'development'],
      'complex': ['feature', 'development'],
      'enterprise': ['architecture', 'design']
    }

    const keywords = levelKeywords[level] || ['feature']
    for (const keyword of keywords) {
      const match = this.findWorkflowByKeyword(keyword)
      if (match) return match.id
    }

    // Hardcoded fallback when no workflows are registered
    switch (level) {
      case 'trivial':
      case 'simple':
        return 'bug_fix_workflow'
      case 'medium':
      case 'complex':
        return 'feature_implementation_full'
      case 'enterprise':
        return 'architecture_design'
      default:
        return 'feature_implementation_full'
    }
  }
}
