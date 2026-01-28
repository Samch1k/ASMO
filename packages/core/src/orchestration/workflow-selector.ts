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
  ComplexityScore,
  ProjectContext
} from './types'
import { ComplexityAnalyzer, ComplexityAnalyzerConfig } from './complexity-analyzer'

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
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<WorkflowSelectorConfig, 'complexityConfig'>> = {
  autoSelect: true,
  confidenceThreshold: 0.7,
  maxAlternatives: 2
}

/**
 * WorkflowSelector - Select appropriate workflow based on task complexity
 */
export class WorkflowSelector {
  private config: Required<Omit<WorkflowSelectorConfig, 'complexityConfig'>>
  private complexityAnalyzer: ComplexityAnalyzer
  private workflows: Map<string, Workflow> = new Map()

  constructor(config?: WorkflowSelectorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.complexityAnalyzer = new ComplexityAnalyzer(config?.complexityConfig)
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
