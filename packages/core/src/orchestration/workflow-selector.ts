/**
 * WorkflowSelector - Select appropriate workflow based on complexity analysis
 *
 * BMAD Phase 1: Complexity Analysis & Adaptive Selection
 *
 * Features:
 * - Automatic workflow selection based on complexity
 * - User override capability
 * - Alternative workflow suggestions
 * - Confidence scoring
 * - Clear reasoning for recommendations
 *
 * Inspired by BMAD's adaptive workflow selection
 */

import type {
  Workflow,
  WorkflowSelection,
  EnhancedWorkflowSelection,
  ComplexityScore,
  ProjectContext
} from './types'
import { ComplexityAnalyzer, ComplexityAnalyzerConfig } from './complexity-analyzer'
import { ClaudeCodeAdapter, AnalysisResult } from '../agents/claude-code-adapter'
import { SkillMatcher } from './skill-matcher'

/**
 * Workflow selector configuration
 */
export interface WorkflowSelectorConfig {
  /**
   * Enable automatic workflow selection
   * @default true
   */
  autoSelect?: boolean

  /**
   * Minimum confidence threshold for automatic selection
   * If confidence is below this, prompt user for confirmation
   * @default 0.7
   */
  confidenceThreshold?: number

  /**
   * Number of alternative workflows to suggest
   * @default 2
   */
  maxAlternatives?: number

  /**
   * Complexity analyzer configuration
   */
  complexityConfig?: ComplexityAnalyzerConfig

  /**
   * Enable hybrid analysis (BMAD + ClaudeCodeAdapter + SkillMatcher)
   * @default false
   */
  enableHybridAnalysis?: boolean

  /**
   * ClaudeCodeAdapter instance (required for hybrid analysis)
   */
  claudeCodeAdapter?: ClaudeCodeAdapter

  /**
   * SkillMatcher instance (required for hybrid analysis)
   */
  skillMatcher?: SkillMatcher
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<WorkflowSelectorConfig, 'complexityConfig' | 'claudeCodeAdapter' | 'skillMatcher'>> = {
  autoSelect: true,
  confidenceThreshold: 0.7,
  maxAlternatives: 2,
  enableHybridAnalysis: false
}

/**
 * WorkflowSelector - Select appropriate workflow based on task complexity
 */
export class WorkflowSelector {
  private config: Required<Omit<WorkflowSelectorConfig, 'complexityConfig' | 'claudeCodeAdapter' | 'skillMatcher'>>
  private complexityAnalyzer: ComplexityAnalyzer
  private workflows: Map<string, Workflow> = new Map()

  // Hybrid analysis components (optional)
  private claudeCodeAdapter?: ClaudeCodeAdapter
  private skillMatcher?: SkillMatcher

  constructor(config?: WorkflowSelectorConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      enableHybridAnalysis: config?.enableHybridAnalysis ?? false
    }
    this.complexityAnalyzer = new ComplexityAnalyzer(config?.complexityConfig)

    // Store hybrid analysis components if provided
    if (config?.claudeCodeAdapter) {
      this.claudeCodeAdapter = config.claudeCodeAdapter
    }
    if (config?.skillMatcher) {
      this.skillMatcher = config.skillMatcher
    }
  }

  /**
   * Register workflows for selection
   */
  registerWorkflows(workflows: Workflow[]): void {
    this.workflows.clear()
    for (const workflow of workflows) {
      this.workflows.set(workflow.id, workflow)
    }
    this.complexityAnalyzer.registerWorkflows(workflows)
  }

  /**
   * Select workflow based on task description
   *
   * @param taskDescription - User's task description
   * @param context - Project context (optional)
   * @param userPreference - User-specified workflow ID (overrides automatic selection)
   * @returns Workflow selection with reasoning
   */
  async selectWorkflow(
    taskDescription: string,
    context?: ProjectContext,
    userPreference?: string
  ): Promise<WorkflowSelection> {
    // Analyze task complexity
    const complexity = await this.complexityAnalyzer.analyzeTask(taskDescription, context)

    // If user specified a workflow, use it (with validation)
    if (userPreference) {
      return this.selectUserPreference(userPreference, complexity)
    }

    // Get recommended workflow
    const workflow = this.workflows.get(complexity.recommendedWorkflow)
    if (!workflow) {
      throw new Error(`Recommended workflow not found: ${complexity.recommendedWorkflow}`)
    }

    // Calculate confidence in recommendation
    const confidence = this.calculateConfidence(complexity, workflow)

    // Get alternative workflows
    const alternatives = this.findAlternatives(complexity, workflow)

    // Build selection result
    const selection: WorkflowSelection = {
      workflow,
      confidence,
      reasoning: this.buildReasoning(complexity, workflow, confidence),
      complexity,
      alternatives
    }

    return selection
  }

  /**
   * Select workflow using hybrid analysis (BMAD + ClaudeCodeAdapter + SkillMatcher)
   *
   * Phase 1 of hybrid system integration:
   * - BMAD (ComplexityAnalyzer): Complexity scoring and workflow recommendation
   * - ClaudeCodeAdapter: Agent selection and skill identification
   * - SkillMatcher: Workflow pattern detection
   *
   * Merge priorities:
   * - Workflow ID: SkillMatcher (80%) > BMAD (20%)
   * - Agents: ClaudeCodeAdapter (90%) > BMAD (10%)
   * - Complexity: BMAD (100%)
   *
   * @param taskDescription - User's task description
   * @param context - Project context (optional)
   * @returns Enhanced workflow selection with agent and skill recommendations
   */
  async selectWorkflowHybrid(
    taskDescription: string,
    context?: ProjectContext
  ): Promise<EnhancedWorkflowSelection> {
    // Validate hybrid analysis is enabled
    if (!this.config.enableHybridAnalysis) {
      throw new Error(
        'Hybrid analysis is not enabled. Set enableHybridAnalysis: true and provide claudeCodeAdapter and skillMatcher'
      )
    }

    if (!this.claudeCodeAdapter || !this.skillMatcher) {
      throw new Error(
        'ClaudeCodeAdapter and SkillMatcher are required for hybrid analysis'
      )
    }

    console.log('\n🔬 Starting hybrid workflow analysis...')

    // Step 1: Run all three analyzers in parallel for efficiency
    console.log('   📊 Running parallel analysis...')
    const [
      complexityResult,
      adapterResult,
      detectedPatterns
    ] = await Promise.all([
      this.complexityAnalyzer.analyzeTask(taskDescription, context),
      this.claudeCodeAdapter.analyzePrompt(taskDescription),
      Promise.resolve(this.skillMatcher.detectWorkflowPatterns(taskDescription))
    ])

    console.log(`   ✅ BMAD: ${complexityResult.level} (${complexityResult.score})`)
    console.log(`   ✅ Adapter: ${adapterResult.recommendedRoles.join(', ')}`)
    console.log(`   ✅ Patterns: ${detectedPatterns?.join(', ') || 'none'}`)

    // Step 2: Merge workflow selection with priorities
    const selectedWorkflow = this.mergeWorkflowSelection(
      complexityResult,
      adapterResult,
      detectedPatterns
    )

    console.log(`   🎯 Selected workflow: ${selectedWorkflow.id}`)

    // Step 3: Merge agent recommendations
    const recommendedAgents = this.mergeAgentRecommendations(
      complexityResult,
      adapterResult
    )

    console.log(`   👥 Recommended agents: ${recommendedAgents.join(' → ')}`)

    // Step 4: Calculate combined confidence
    const confidenceBreakdown = this.calculateCombinedConfidence(
      complexityResult,
      adapterResult,
      (detectedPatterns?.length ?? 0) > 0
    )

    console.log(`   🎲 Combined confidence: ${(confidenceBreakdown.combined * 100).toFixed(0)}%`)

    // Step 5: Determine merge strategy used
    const mergeStrategy = this.determineMergeStrategy(
      complexityResult,
      adapterResult,
      detectedPatterns
    )

    // Step 6: Generate enhanced reasoning
    const reasoning = this.generateHybridReasoning(
      complexityResult,
      adapterResult,
      detectedPatterns,
      mergeStrategy
    )

    // Step 7: Find alternatives
    const alternatives = this.findAlternatives(complexityResult, selectedWorkflow)

    // Build enhanced result
    const result: EnhancedWorkflowSelection = {
      // Base WorkflowSelection fields
      workflow: selectedWorkflow,
      confidence: confidenceBreakdown.combined,
      reasoning,
      complexity: complexityResult,
      alternatives,

      // Enhanced fields
      recommendedAgents,
      identifiedSkills: adapterResult.requiredSkills,
      detectedPatterns,
      agentAnalysis: adapterResult,
      confidenceBreakdown,
      mergeStrategy
    }

    console.log('   ✨ Hybrid analysis complete!\n')

    return result
  }

  /**
   * Merge workflow selection from all three sources
   * Priority: SkillMatcher (80%) > BMAD (20%)
   */
  private mergeWorkflowSelection(
    complexity: ComplexityScore,
    adapter: AnalysisResult,
    patterns: string[] | undefined
  ): Workflow {
    // Priority 1: SkillMatcher patterns (if detected)
    if (patterns && patterns.length > 0) {
      // Try to find workflow matching the pattern
      for (const pattern of patterns) {
        // Map pattern to workflow ID
        const workflowId = this.mapPatternToWorkflow(pattern)
        const workflow = this.workflows.get(workflowId)
        if (workflow) {
          return workflow
        }
      }
    }

    // Priority 2: ClaudeCodeAdapter suggested workflow (if confident)
    if (adapter.suggestedWorkflow && adapter.confidence >= 0.7) {
      const workflow = this.workflows.get(adapter.suggestedWorkflow)
      if (workflow) {
        return workflow
      }
    }

    // Priority 3: BMAD recommended workflow (fallback)
    const workflow = this.workflows.get(complexity.recommendedWorkflow)
    if (workflow) {
      return workflow
    }

    // Fallback: Return first workflow or throw
    const firstWorkflow = Array.from(this.workflows.values())[0]
    if (firstWorkflow) {
      return firstWorkflow
    }

    throw new Error('No workflows registered')
  }

  /**
   * Map SkillMatcher pattern to workflow ID
   */
  private mapPatternToWorkflow(pattern: string): string {
    const patternMap: Record<string, string> = {
      'tdd_workflow': 'tdd_workflow',
      'systematic_debugging_workflow': 'bug_fix_workflow',
      'design_brainstorming_workflow': 'architecture_design',
      'implementation_planning_workflow': 'feature_implementation_full'
    }

    return patternMap[pattern] || pattern
  }

  /**
   * Merge agent recommendations
   * Priority: ClaudeCodeAdapter (90%) > BMAD (10%)
   */
  private mergeAgentRecommendations(
    complexity: ComplexityScore,
    adapter: AnalysisResult
  ): string[] {
    // Start with ClaudeCodeAdapter recommendations (90% weight)
    const agents = new Set<string>(adapter.recommendedRoles)

    // Add BMAD recommendations if ClaudeCodeAdapter has low confidence
    if (adapter.confidence < 0.7) {
      // Add BMAD agents as fallback (10% weight)
      complexity.recommendedAgents.forEach(agent => agents.add(agent))
    }

    // Deduplicate and return
    return Array.from(agents)
  }

  /**
   * Calculate combined confidence from all sources
   */
  private calculateCombinedConfidence(
    complexity: ComplexityScore,
    adapter: AnalysisResult,
    hasPatterns: boolean
  ): EnhancedWorkflowSelection['confidenceBreakdown'] {
    const bmadConfidence = complexity.confidence
    const adapterConfidence = adapter.confidence
    const patternsConfidence = hasPatterns ? 0.9 : 0.0

    // Weighted average
    // BMAD: 30%, Adapter: 50%, Patterns: 20%
    let combined = bmadConfidence * 0.3 + adapterConfidence * 0.5

    if (hasPatterns) {
      combined = bmadConfidence * 0.2 + adapterConfidence * 0.3 + patternsConfidence * 0.5
    }

    return {
      bmad: bmadConfidence,
      adapter: adapterConfidence,
      patterns: patternsConfidence,
      combined: Math.min(combined, 1.0)
    }
  }

  /**
   * Determine which merge strategy was used
   */
  private determineMergeStrategy(
    complexity: ComplexityScore,
    adapter: AnalysisResult,
    patterns: string[] | undefined
  ): EnhancedWorkflowSelection['mergeStrategy'] {
    let workflowSource: 'bmad' | 'adapter' | 'patterns' = 'bmad'
    let reasoning = ''

    // Determine workflow source
    if (patterns && patterns.length > 0) {
      workflowSource = 'patterns'
      reasoning = `Workflow selected based on detected patterns: ${patterns.join(', ')}`
    } else if (adapter.suggestedWorkflow && adapter.confidence >= 0.7) {
      workflowSource = 'adapter'
      reasoning = `Workflow selected based on ClaudeCodeAdapter suggestion (confidence: ${adapter.confidence.toFixed(2)})`
    } else {
      workflowSource = 'bmad'
      reasoning = `Workflow selected based on BMAD complexity analysis (${complexity.level})`
    }

    // Agents always from adapter (unless low confidence)
    const agentsSource: 'adapter' | 'bmad' = adapter.confidence >= 0.7 ? 'adapter' : 'bmad'

    return {
      workflowSource,
      agentsSource,
      reasoning
    }
  }

  /**
   * Generate enhanced reasoning combining all sources
   */
  private generateHybridReasoning(
    complexity: ComplexityScore,
    adapter: AnalysisResult,
    patterns: string[] | undefined,
    mergeStrategy: EnhancedWorkflowSelection['mergeStrategy']
  ): string {
    const parts: string[] = []

    // Add complexity reasoning
    parts.push(`**Complexity**: ${complexity.reasoning}`)

    // Add adapter reasoning
    parts.push(`**Agent Analysis**: ${adapter.reasoning}`)

    // Add pattern detection
    if (patterns && patterns.length > 0) {
      parts.push(`**Detected Patterns**: ${patterns.join(', ')}`)
    }

    // Add merge strategy
    parts.push(`**Selection Strategy**: ${mergeStrategy.reasoning}`)

    return parts.join('\n\n')
  }

  /**
   * Select workflow by user preference
   */
  private selectUserPreference(
    workflowId: string,
    complexity: ComplexityScore
  ): WorkflowSelection {
    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`)
    }

    // Check if user's choice matches complexity
    const isGoodMatch = this.isWorkflowSuitableForComplexity(workflow, complexity)
    const confidence = isGoodMatch ? 0.9 : 0.6

    return {
      workflow,
      confidence,
      reasoning: isGoodMatch
        ? `User selected ${workflow.name}, which is appropriate for this ${complexity.level} task.`
        : `User selected ${workflow.name}. Note: This task has ${complexity.level} complexity, consider ${complexity.recommendedWorkflow} as an alternative.`,
      complexity,
      alternatives: this.findAlternatives(complexity, workflow)
    }
  }

  /**
   * Calculate confidence in workflow recommendation
   */
  private calculateConfidence(
    complexity: ComplexityScore,
    workflow: Workflow
  ): number {
    // Start with complexity confidence
    let confidence = complexity.confidence

    // Boost if workflow matches complexity level perfectly
    if (this.isWorkflowSuitableForComplexity(workflow, complexity)) {
      confidence = Math.min(confidence + 0.1, 1.0)
    }

    // Reduce if workflow might be overkill or insufficient
    if (!this.isWorkflowSuitableForComplexity(workflow, complexity)) {
      confidence = Math.max(confidence - 0.2, 0.3)
    }

    return confidence
  }

  /**
   * Check if workflow is suitable for complexity level
   */
  private isWorkflowSuitableForComplexity(
    workflow: Workflow,
    complexity: ComplexityScore
  ): boolean {
    const workflowId = workflow.id.toLowerCase()
    const level = complexity.level

    // Quick flow: best for trivial/simple
    if (workflowId.includes('quick') || workflowId.includes('bug')) {
      return level === 'trivial' || level === 'simple'
    }

    // Feature development: best for simple/medium
    if (workflowId.includes('feature') || workflowId.includes('development')) {
      return level === 'simple' || level === 'medium'
    }

    // Quality assurance: best for medium/complex
    if (workflowId.includes('quality') || workflowId.includes('assurance')) {
      return level === 'medium' || level === 'complex' || level === 'enterprise'
    }

    // Architecture: best for complex/enterprise
    if (workflowId.includes('architecture') || workflowId.includes('design')) {
      return level === 'complex' || level === 'enterprise'
    }

    // Default: suitable for any complexity
    return true
  }

  /**
   * Find alternative workflows
   */
  private findAlternatives(
    complexity: ComplexityScore,
    selectedWorkflow: Workflow
  ): Array<{ workflowId: string; confidence: number; reasoning: string }> {
    const alternatives: Array<{ workflowId: string; confidence: number; reasoning: string }> = []

    for (const workflow of this.workflows.values()) {
      // Skip the selected workflow
      if (workflow.id === selectedWorkflow.id) continue

      // Check if workflow could be suitable
      const suitable = this.isWorkflowSuitableForComplexity(workflow, complexity)
      if (!suitable) continue

      // Calculate confidence for this alternative
      const confidence = this.calculateConfidence(complexity, workflow)

      // Add to alternatives if confidence is reasonable
      if (confidence >= 0.5) {
        alternatives.push({
          workflowId: workflow.id,
          confidence,
          reasoning: this.buildAlternativeReasoning(workflow, complexity)
        })
      }
    }

    // Sort by confidence (descending) and take top N
    alternatives.sort((a, b) => b.confidence - a.confidence)
    return alternatives.slice(0, this.config.maxAlternatives)
  }

  /**
   * Build reasoning text for workflow selection
   */
  private buildReasoning(
    complexity: ComplexityScore,
    workflow: Workflow,
    confidence: number
  ): string {
    const parts: string[] = []

    // Start with complexity assessment
    parts.push(complexity.reasoning)

    // Add workflow recommendation
    parts.push(
      `Recommended workflow: ${workflow.name} (${workflow.description})`
    )

    // Add confidence note
    if (confidence >= 0.8) {
      parts.push('High confidence in this recommendation.')
    } else if (confidence >= 0.6) {
      parts.push('Moderate confidence. Consider reviewing alternatives.')
    } else {
      parts.push('Low confidence. Please review alternatives or provide more context.')
    }

    // Add estimated time
    if (workflow.estimated_time) {
      parts.push(`Estimated time: ${workflow.estimated_time}`)
    }

    return parts.join(' ')
  }

  /**
   * Build reasoning for alternative workflow
   */
  private buildAlternativeReasoning(
    workflow: Workflow,
    complexity: ComplexityScore
  ): string {
    const reasons: string[] = []

    // Why this could be a good alternative
    if (workflow.id.includes('quick') && complexity.level === 'simple') {
      reasons.push('Faster execution for simple tasks')
    }

    if (workflow.id.includes('quality') && complexity.level === 'complex') {
      reasons.push('More thorough quality checks')
    }

    if (workflow.id.includes('architecture') && complexity.factors.filesAffected > 10) {
      reasons.push('Better for large-scale changes')
    }

    if (reasons.length === 0) {
      reasons.push('Alternative approach with different trade-offs')
    }

    return `${workflow.name}: ${reasons.join(', ')}`
  }

  /**
   * Get all registered workflows
   */
  getWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Get workflow by ID
   */
  getWorkflowById(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  /**
   * Check if auto-selection is enabled and confidence meets threshold
   */
  shouldAutoSelect(confidence: number): boolean {
    return this.config.autoSelect && confidence >= this.config.confidenceThreshold
  }
}
