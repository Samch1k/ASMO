/**
 * HelpSystem - Context-aware help and recommendations
 *
 * BMAD Phase 3: Intelligent Help System
 *
 * Features:
 * - Analyze user queries and recommend workflows
 * - Provide clear explanations and reasoning
 * - Suggest alternatives with trade-offs
 * - Troubleshoot common issues
 * - Estimate time and complexity
 * - Link to relevant documentation
 *
 * Inspired by BMAD's /bmad-help command
 */

import type {
  HelpResponse,
  TroubleshootResponse,
  ErrorContext,
  ProjectContext,
  ComplexityScore,
  Workflow
} from './types.js'
import { ComplexityAnalyzer } from './complexity-analyzer.js'

/**
 * Help system configuration
 */
export interface HelpSystemConfig {
  /**
   * LLM model to use for help generation
   * @default 'claude-sonnet-3-5'
   */
  model?: string

  /**
   * Temperature for LLM (0.0-1.0)
   * Lower = more consistent, Higher = more creative
   * @default 0.3
   */
  temperature?: number

  /**
   * Maximum tokens for LLM response
   * @default 3000
   */
  maxTokens?: number

  /**
   * Minimum confidence threshold for recommendations
   * @default 0.6
   */
  confidenceThreshold?: number

  /**
   * Number of alternative suggestions to provide
   * @default 2
   */
  maxAlternatives?: number

  /**
   * Complexity analyzer for task analysis
   */
  complexityAnalyzer?: ComplexityAnalyzer
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<HelpSystemConfig, 'complexityAnalyzer'>> = {
  model: 'claude-sonnet-3-5',
  temperature: 0.3,
  maxTokens: 3000,
  confidenceThreshold: 0.6,
  maxAlternatives: 2
}

/**
 * HelpSystem - Provide context-aware help and recommendations
 */
export class HelpSystem {
  private config: Required<Omit<HelpSystemConfig, 'complexityAnalyzer'>>
  private complexityAnalyzer: ComplexityAnalyzer
  private workflows: Map<string, Workflow> = new Map()

  constructor(config?: HelpSystemConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.complexityAnalyzer = config?.complexityAnalyzer || new ComplexityAnalyzer()
  }

  /**
   * Register workflows for recommendations
   */
  registerWorkflows(workflows: Workflow[]): void {
    this.workflows.clear()
    for (const workflow of workflows) {
      this.workflows.set(workflow.id, workflow)
    }
    this.complexityAnalyzer.registerWorkflows(workflows)
  }

  /**
   * Analyze user query and recommend workflow
   *
   * @param query - User's natural language query (e.g., "How do I add authentication?")
   * @param context - Project context (optional)
   * @returns Help response with workflow recommendation and reasoning
   */
  async analyzeQuery(
    query: string,
    context?: ProjectContext
  ): Promise<HelpResponse> {
    // Analyze task complexity
    const complexity = await this.complexityAnalyzer.analyzeTask(query, context)

    // Get recommended workflow
    const workflow = this.workflows.get(complexity.recommendedWorkflow)
    if (!workflow) {
      throw new Error(`Recommended workflow not found: ${complexity.recommendedWorkflow}`)
    }

    // Calculate confidence in recommendation
    const confidence = this.calculateRecommendationConfidence(complexity, workflow, query)

    // Find alternative workflows
    const alternatives = this.findAlternativeWorkflows(complexity, workflow, query)

    // Estimate time based on workflow and complexity
    const estimatedTime = this.estimateTime(workflow, complexity)

    // Build reasoning
    const reasoning = this.buildReasoning(query, complexity, workflow, confidence)

    return {
      recommendedWorkflow: workflow.id,
      confidence,
      reasoning,
      estimatedTime,
      requiredAgents: complexity.recommendedAgents,
      alternatives,
      complexity
    }
  }

  /**
   * Troubleshoot an error or issue
   *
   * @param issue - Description of the issue
   * @param errorContext - Error context with stack trace, file, etc.
   * @returns Troubleshooting response with suggested fixes
   */
  async troubleshoot(
    issue: string,
    errorContext?: ErrorContext
  ): Promise<TroubleshootResponse> {
    // Analyze the error using heuristics
    const analysis = this.analyzeError(issue, errorContext)

    // Generate suggested fix based on common patterns
    const suggestedFix = this.generateSuggestedFix(analysis, errorContext)

    // Provide resolution steps
    const resolutionSteps = this.generateResolutionSteps(analysis, errorContext)

    // Find alternative fixes
    const alternatives = this.generateAlternativeFixes(analysis, errorContext)

    // Add documentation links
    const documentationLinks = this.findRelevantDocs(analysis, errorContext)

    // Calculate confidence in the fix
    const confidence = this.calculateFixConfidence(analysis, errorContext)

    return {
      suggestedFix,
      issueExplanation: analysis.explanation,
      resolutionSteps,
      alternatives,
      documentationLinks,
      confidence
    }
  }

  /**
   * Calculate confidence in workflow recommendation
   */
  private calculateRecommendationConfidence(
    complexity: ComplexityScore,
    workflow: Workflow,
    query: string
  ): number {
    let confidence = complexity.confidence

    // Boost confidence if query keywords match workflow trigger conditions
    const queryLower = query.toLowerCase()
    const workflowKeywords = this.getWorkflowKeywords(workflow)

    let keywordMatches = 0
    for (const keyword of workflowKeywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        keywordMatches++
      }
    }

    // Boost confidence for each keyword match
    if (keywordMatches > 0) {
      confidence = Math.min(confidence + (keywordMatches * 0.1), 1.0)
    }

    return confidence
  }

  /**
   * Get keywords from workflow trigger conditions
   */
  private getWorkflowKeywords(workflow: Workflow): string[] {
    const keywords: string[] = []

    // Extract from workflow name and description
    keywords.push(...workflow.name.toLowerCase().split(/\s+/))
    keywords.push(...workflow.description.toLowerCase().split(/\s+/))

    return keywords
  }

  /**
   * Find alternative workflows for the query
   */
  private findAlternativeWorkflows(
    complexity: ComplexityScore,
    primaryWorkflow: Workflow,
    query: string
  ): Array<{ workflowId: string; confidence: number; reasoning: string }> {
    const alternatives: Array<{ workflowId: string; confidence: number; reasoning: string }> = []

    for (const workflow of this.workflows.values()) {
      // Skip primary workflow
      if (workflow.id === primaryWorkflow.id) continue

      // Calculate confidence for this workflow
      const confidence = this.calculateRecommendationConfidence(complexity, workflow, query)

      // Only include if confidence is reasonable
      if (confidence >= this.config.confidenceThreshold) {
        alternatives.push({
          workflowId: workflow.id,
          confidence,
          reasoning: `${workflow.name}: ${workflow.description}${workflow.estimated_time ? ` (${workflow.estimated_time})` : ''}`
        })
      }
    }

    // Sort by confidence and take top N
    alternatives.sort((a, b) => b.confidence - a.confidence)
    return alternatives.slice(0, this.config.maxAlternatives)
  }

  /**
   * Estimate time to complete workflow
   */
  private estimateTime(workflow: Workflow, complexity: ComplexityScore): string {
    // Use workflow's estimated time if available
    if (workflow.estimated_time) {
      // Adjust based on complexity
      if (complexity.level === 'complex' || complexity.level === 'enterprise') {
        return `${workflow.estimated_time} (may be longer for ${complexity.level} tasks)`
      }
      return workflow.estimated_time
    }

    // Fallback: estimate based on complexity level
    const estimates: Record<string, string> = {
      trivial: '10-15 minutes',
      simple: '30-60 minutes',
      medium: '2-4 hours',
      complex: '1-2 days',
      enterprise: '3-5 days'
    }

    return estimates[complexity.level] || '1-2 hours'
  }

  /**
   * Build reasoning for recommendation
   */
  private buildReasoning(
    query: string,
    complexity: ComplexityScore,
    workflow: Workflow,
    confidence: number
  ): string {
    const parts: string[] = []

    // Start with query analysis
    parts.push(`For your task: "${query}"`)

    // Add complexity assessment
    parts.push(`Complexity: ${complexity.level} (score: ${complexity.score}/100)`)

    // Add workflow recommendation
    parts.push(`Recommended: ${workflow.name} - ${workflow.description}`)

    // Add confidence note
    if (confidence >= 0.8) {
      parts.push('High confidence - this workflow is well-suited for your task.')
    } else if (confidence >= 0.6) {
      parts.push('Moderate confidence - review alternatives to ensure best fit.')
    } else {
      parts.push('Low confidence - consider reviewing alternatives or providing more context.')
    }

    // Add complexity factors if significant
    const significantFactors: string[] = []
    if (complexity.factors.securityImpact) significantFactors.push('security impact')
    if (complexity.factors.performanceImpact) significantFactors.push('performance impact')
    if (complexity.factors.dataChanges) significantFactors.push('data changes')
    if (complexity.factors.domainExpertiseRequired) significantFactors.push('domain expertise')

    if (significantFactors.length > 0) {
      parts.push(`Key considerations: ${significantFactors.join(', ')}`)
    }

    return parts.join('. ')
  }

  /**
   * Analyze error to understand root cause
   */
  private analyzeError(
    issue: string,
    errorContext?: ErrorContext
  ): { explanation: string; category: string; severity: 'low' | 'medium' | 'high' } {
    const issueLower = issue.toLowerCase()
    const errorMessage = errorContext?.errorMessage?.toLowerCase() || ''

    // Categorize common errors
    if (issueLower.includes('typescript') || issueLower.includes('type error') || errorMessage.includes('type')) {
      return {
        explanation: 'TypeScript type error detected. This usually indicates a type mismatch or missing type definition.',
        category: 'typescript',
        severity: 'medium'
      }
    }

    if (issueLower.includes('import') || issueLower.includes('module') || errorMessage.includes('cannot find module')) {
      return {
        explanation: 'Module import error. The required module or file cannot be found.',
        category: 'import',
        severity: 'high'
      }
    }

    if (issueLower.includes('workflow') || issueLower.includes('agent')) {
      return {
        explanation: 'Workflow or agent execution error. Check workflow configuration and agent availability.',
        category: 'orchestration',
        severity: 'high'
      }
    }

    if (issueLower.includes('test') || issueLower.includes('failing')) {
      return {
        explanation: 'Test failure detected. Review test expectations and implementation.',
        category: 'testing',
        severity: 'medium'
      }
    }

    if (issueLower.includes('performance') || issueLower.includes('slow') || issueLower.includes('timeout')) {
      return {
        explanation: 'Performance issue detected. This may be caused by inefficient code or resource constraints.',
        category: 'performance',
        severity: 'medium'
      }
    }

    // Default
    return {
      explanation: 'General error detected. Review the error message and stack trace for more details.',
      category: 'general',
      severity: 'medium'
    }
  }

  /**
   * Generate suggested fix based on error analysis
   */
  private generateSuggestedFix(
    analysis: { category: string; explanation: string },
    errorContext?: ErrorContext
  ): string {
    switch (analysis.category) {
      case 'typescript':
        return 'Check type definitions and ensure proper type annotations. Run `npx tsc --noEmit` to see all type errors.'

      case 'import':
        return 'Verify the file path and ensure the module is installed. Check your import statement and file extension (.js, .ts).'

      case 'orchestration':
        return 'Verify workflow configuration and ensure all required agents are registered. Check the workflow JSON file for errors.'

      case 'testing':
        return 'Review test expectations and mock data. Ensure the implementation matches what the test expects.'

      case 'performance':
        return 'Profile the code to identify bottlenecks. Consider optimizing database queries or adding caching.'

      default:
        return 'Review the error message and stack trace. Check recent changes that may have introduced the issue.'
    }
  }

  /**
   * Generate step-by-step resolution steps
   */
  private generateResolutionSteps(
    analysis: { category: string },
    errorContext?: ErrorContext
  ): string[] {
    const commonSteps = [
      'Review the error message and stack trace',
      'Check recent code changes using `git diff`',
      'Verify all dependencies are installed: `npm install`'
    ]

    const categorySteps: Record<string, string[]> = {
      typescript: [
        'Run TypeScript compiler: `npx tsc --noEmit`',
        'Check type definitions in the file',
        'Add missing type annotations',
        'Verify imported types match exported types'
      ],
      import: [
        'Verify the file exists at the specified path',
        'Check import statement syntax (.js vs .ts)',
        'Ensure the module is listed in package.json',
        'Run `npm install` to install missing dependencies'
      ],
      orchestration: [
        'Check workflow JSON file for syntax errors',
        'Verify all agents referenced in workflow exist',
        'Review WorkflowEngine initialization',
        'Check agent registration in AgentRegistry'
      ],
      testing: [
        'Run the specific test: `npm test -- <test-file>`',
        'Review test expectations and assertions',
        'Check mock data and fixtures',
        'Update test snapshots if needed'
      ],
      performance: [
        'Profile the code to identify slow sections',
        'Check database query performance',
        'Review algorithm complexity',
        'Add caching where appropriate'
      ]
    }

    return [...commonSteps, ...(categorySteps[analysis.category] || [])]
  }

  /**
   * Generate alternative fixes
   */
  private generateAlternativeFixes(
    analysis: { category: string },
    errorContext?: ErrorContext
  ): string[] {
    const alternatives: Record<string, string[]> = {
      typescript: [
        'Use `any` type temporarily to bypass the error (not recommended for production)',
        'Refactor the code to avoid the type issue',
        'Update tsconfig.json to be more permissive (use cautiously)'
      ],
      import: [
        'Use a different import syntax (default vs named)',
        'Check if the module has been renamed or moved',
        'Use absolute imports instead of relative imports'
      ],
      orchestration: [
        'Try a different workflow that accomplishes the same goal',
        'Manually execute the workflow steps without the orchestration system',
        'Check if the workflow needs to be updated for recent changes'
      ],
      testing: [
        'Skip the failing test temporarily with `.skip()`',
        'Update the test to match new implementation',
        'Check if the test is testing implementation details vs behavior'
      ],
      performance: [
        'Add indexes to database tables',
        'Use pagination to limit data fetched',
        'Implement lazy loading for large datasets'
      ]
    }

    return alternatives[analysis.category] || [
      'Try a different approach to solve the same problem',
      'Consult documentation or community resources',
      'Ask for help in project chat or issue tracker'
    ]
  }

  /**
   * Find relevant documentation links
   */
  private findRelevantDocs(
    analysis: { category: string },
    errorContext?: ErrorContext
  ): string[] {
    // TODO: Replace with actual documentation URLs when available
    const docsByCategory: Record<string, string[]> = {
      typescript: [
        'TypeScript Handbook: https://www.typescriptlang.org/docs/',
        'TypeScript Deep Dive: https://basarat.gitbook.io/typescript/'
      ],
      import: [
        'ES Modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
        'Node.js Modules: https://nodejs.org/api/modules.html'
      ],
      orchestration: [
        'Workflow Configuration Guide: docs/workflows/',
        'Agent Development Guide: docs/agents/'
      ],
      testing: [
        'Jest Documentation: https://jestjs.io/docs/getting-started',
        'Testing Best Practices: docs/testing/'
      ],
      performance: [
        'Performance Optimization: docs/performance/',
        'Node.js Performance: https://nodejs.org/en/docs/guides/simple-profiling/'
      ]
    }

    return docsByCategory[analysis.category] || []
  }

  /**
   * Calculate confidence in the suggested fix
   */
  private calculateFixConfidence(
    analysis: { category: string; severity: 'low' | 'medium' | 'high' },
    errorContext?: ErrorContext
  ): number {
    let confidence = 0.7 // Base confidence

    // Higher confidence for well-categorized errors
    if (analysis.category !== 'general') {
      confidence += 0.1
    }

    // Lower confidence for high-severity errors (usually more complex)
    if (analysis.severity === 'high') {
      confidence -= 0.1
    }

    // Higher confidence if we have detailed error context
    if (errorContext?.stackTrace || errorContext?.file) {
      confidence += 0.1
    }

    return Math.max(0.3, Math.min(confidence, 1.0))
  }
}
