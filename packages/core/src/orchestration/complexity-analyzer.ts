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
 * Inspired by BMAD's Scale-Domain-Adaptive system
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  ComplexityScore,
  ComplexityLevel,
  ComplexityFactors,
  ProjectContext,
  Workflow
} from './types'

/**
 * Complexity analysis configuration
 */
export interface ComplexityAnalyzerConfig {
  /**
   * Enable LLM-based analysis (requires ANTHROPIC_API_KEY)
   * When false, uses heuristic-based analysis
   * @default false
   */
  useLLM?: boolean

  /**
   * LLM model to use for analysis
   * @default 'claude-3-5-sonnet-20241022'
   */
  model?: string

  /**
   * Temperature for LLM (0.0-1.0)
   * Lower = more consistent, Higher = more creative
   * @default 0.2
   */
  temperature?: number

  /**
   * Maximum tokens for LLM response
   * @default 2000
   */
  maxTokens?: number

  /**
   * Number of retries for LLM calls
   * @default 3
   */
  maxRetries?: number

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
  useLLM: false,
  model: 'claude-3-5-sonnet-20241022',
  temperature: 0.2,
  maxTokens: 2000,
  maxRetries: 3,
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
  private anthropic: Anthropic | null = null

  constructor(config?: ComplexityAnalyzerConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Initialize Anthropic client if LLM mode is enabled
    if (this.config.useLLM) {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (apiKey) {
        this.anthropic = new Anthropic({ apiKey })
      } else {
        console.warn('[ComplexityAnalyzer] useLLM enabled but ANTHROPIC_API_KEY not set, falling back to heuristics')
      }
    }
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
    // Validate input
    if (!taskDescription || taskDescription.trim().length === 0) {
      throw new Error('Task description cannot be empty')
    }

    // Build analysis prompt
    const prompt = this.buildAnalysisPrompt(taskDescription, context)

    // Call LLM for analysis (or use heuristics if LLM not available)
    const analysisResult = await this.callLLM(prompt, taskDescription)

    // Parse LLM response
    const complexity = this.parseComplexityResponse(analysisResult)

    // Map score to level
    complexity.level = this.scoreToLevel(complexity.score)

    // Recommend workflow based on complexity
    complexity.recommendedWorkflow = this.recommendWorkflow(complexity)

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
   * When useLLM is enabled and Anthropic client is available, calls Claude API.
   * Otherwise falls back to heuristic-based analysis.
   */
  private async callLLM(prompt: string, taskDescription: string): Promise<string> {
    // Try LLM analysis if enabled
    if (this.config.useLLM && this.anthropic) {
      try {
        return await this.callAnthropicWithRetry(prompt)
      } catch (error) {
        console.warn('[ComplexityAnalyzer] LLM call failed, falling back to heuristics:', error)
      }
    }

    // Fallback to heuristic-based analysis
    return this.analyzeWithHeuristics(taskDescription)
  }

  /**
   * Call Anthropic API with retry logic
   */
  private async callAnthropicWithRetry(prompt: string): Promise<string> {
    const { maxRetries, model, temperature, maxTokens } = this.config
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await this.anthropic!.messages.create({
          model,
          max_tokens: maxTokens,
          temperature,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })

        const content = response.content[0]
        if (content.type === 'text') {
          // Extract JSON from response (may be wrapped in markdown)
          const jsonMatch = content.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            return jsonMatch[0]
          }
          return content.text
        }

        throw new Error('Unexpected response format from Anthropic')
      } catch (error) {
        lastError = error as Error

        // Don't retry on certain errors
        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          if (message.includes('invalid_api_key') || message.includes('authentication')) {
            throw error // Don't retry auth errors
          }
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)))
        }
      }
    }

    throw lastError || new Error('LLM call failed after retries')
  }

  /**
   * Heuristic-based complexity analysis
   *
   * Used as fallback when LLM is not available or fails.
   * Analyzes keywords in task description to estimate complexity.
   */
  private analyzeWithHeuristics(taskDescription: string): string {
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

    return JSON.stringify({
      score,
      confidence: 0.75, // Heuristic confidence
      reasoning,
      factors,
      recommendedAgents: Array.from(new Set(recommendedAgents)) // Remove duplicates
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
  private scoreToLevel(score: number): ComplexityLevel {
    const { thresholds } = this.config

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
      return this.getDefaultWorkflowForLevel(complexity.level)
    }

    // Try to match based on complexity level and task type
    const { level, factors } = complexity

    // Bug fix workflow
    if (level === 'trivial' || level === 'simple') {
      const bugFixWorkflow = this.findWorkflowByKeyword('bug')
      if (bugFixWorkflow) return bugFixWorkflow.id
    }

    // Feature development workflow
    if (level === 'simple' || level === 'medium') {
      const featureWorkflow = this.findWorkflowByKeyword('feature')
      if (featureWorkflow) return featureWorkflow.id
    }

    // Complex workflows
    if (level === 'complex' || level === 'enterprise') {
      // Architecture design for high complexity
      if (factors.filesAffected > 10) {
        const archWorkflow = this.findWorkflowByKeyword('architecture')
        if (archWorkflow) return archWorkflow.id
      }

      // Security audit
      if (factors.securityImpact) {
        const securityWorkflow = this.findWorkflowByKeyword('security')
        if (securityWorkflow) return securityWorkflow.id
      }

      // Performance optimization
      if (factors.performanceImpact) {
        const perfWorkflow = this.findWorkflowByKeyword('performance')
        if (perfWorkflow) return perfWorkflow.id
      }

      // Database migration
      if (factors.dataChanges) {
        const dbWorkflow = this.findWorkflowByKeyword('database')
        if (dbWorkflow) return dbWorkflow.id
      }
    }

    // Fallback to default
    return this.getDefaultWorkflowForLevel(level)
  }

  /**
   * Find workflow by keyword in name or description
   */
  private findWorkflowByKeyword(keyword: string): Workflow | undefined {
    for (const workflow of this.workflows.values()) {
      const nameMatch = workflow.name.toLowerCase().includes(keyword)
      const descMatch = workflow.description.toLowerCase().includes(keyword)
      if (nameMatch || descMatch) {
        return workflow
      }
    }
    return undefined
  }

  /**
   * Get default workflow ID for complexity level
   */
  private getDefaultWorkflowForLevel(level: ComplexityLevel): string {
    switch (level) {
      case 'trivial':
      case 'simple':
        return '1-quick-flow'
      case 'medium':
        return '2-feature-development'
      case 'complex':
      case 'enterprise':
        return '3-quality-assurance'
      default:
        return '2-feature-development'
    }
  }
}
