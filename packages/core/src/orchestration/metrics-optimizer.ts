/**
 * MetricsOptimizer - Adaptive workflow optimization based on historical metrics
 *
 * Part of BMad Framework integration (Day 2)
 * Uses historical performance data to optimize workflow execution
 *
 * Features:
 * - Bottleneck detection and parallelization recommendations
 * - Redundant step identification and removal
 * - Dynamic timeout adjustment based on agent performance
 * - Workflow step reordering for efficiency
 * - Automatic optimization application (with safety checks)
 */

import type { Workflow, WorkflowStep } from './workflow-engine'
import type { WorkflowMetrics, AgentStepMetrics } from './metrics-collector'
import type { MetricsPersister } from './metrics-persister'
import { getConfigManager } from './config/config-manager'

/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
  type: 'parallelize' | 'skip_step' | 'adjust_timeout' | 'reorder_steps'
  description: string
  affectedSteps: number[]
  expectedImprovement: string
  confidence: number
  priority: 'high' | 'medium' | 'low'
  autoApply: boolean
}

/**
 * Optimized workflow result
 */
export interface OptimizedWorkflow {
  workflow: Workflow
  recommendations: OptimizationRecommendation[]
  appliedOptimizations: OptimizationRecommendation[]
  estimatedTimeReduction: number
  confidence: number
}

/**
 * Parallelization candidate
 */
interface ParallelizationCandidate {
  step1: WorkflowStep
  step2: WorkflowStep
  reason: string
  safetyScore: number
}

/**
 * MetricsOptimizer - Analyzes historical data and optimizes workflows
 */
export class MetricsOptimizer {
  private minHistoricalRuns: number
  private parallelizationSafetyThreshold: number
  // ✨ Priority 2: Optimization thresholds from config
  private optimizationConfig: {
    phasePenalty: number
    deliverableDependencyPenalty: number
    highSuccessBonus: number
    minArtifactsThreshold: number
    lowArtifactsScore: number
    minConfidenceThreshold: number
    lowConfidenceScore: number
    defaultTimeoutMs: number
    timeoutConfidence: number
  }

  constructor(private persister: MetricsPersister) {
    // ✨ Priority 2: Load config from ConfigManager if available
    const configManager = getConfigManager()
    if (configManager.isInitialized()) {
      const metricsConfig = configManager.getMetricsOptimizerConfig()
      this.minHistoricalRuns = metricsConfig.minHistoricalRuns
      this.parallelizationSafetyThreshold = metricsConfig.parallelizationSafetyThreshold
      this.optimizationConfig = {
        phasePenalty: metricsConfig.optimization.phasePenalty,
        deliverableDependencyPenalty: metricsConfig.optimization.deliverableDependencyPenalty,
        highSuccessBonus: metricsConfig.optimization.highSuccessBonus,
        minArtifactsThreshold: metricsConfig.optimization.minArtifactsThreshold,
        lowArtifactsScore: metricsConfig.optimization.lowArtifactsScore,
        minConfidenceThreshold: metricsConfig.optimization.minConfidenceThreshold,
        lowConfidenceScore: metricsConfig.optimization.lowConfidenceScore,
        defaultTimeoutMs: metricsConfig.optimization.defaultTimeoutMs,
        timeoutConfidence: metricsConfig.optimization.timeoutConfidence
      }
    } else {
      // Fallback to defaults
      this.minHistoricalRuns = 3
      this.parallelizationSafetyThreshold = 0.7
      this.optimizationConfig = {
        phasePenalty: 0.3,
        deliverableDependencyPenalty: 0.4,
        highSuccessBonus: 0.1,
        minArtifactsThreshold: 1.0,
        lowArtifactsScore: 0.3,
        minConfidenceThreshold: 0.5,
        lowConfidenceScore: 0.4,
        defaultTimeoutMs: 30000,
        timeoutConfidence: 0.8
      }
    }
  }

  /**
   * Analyze workflow and generate optimization recommendations
   */
  async analyzeWorkflow(
    workflow: Workflow,
    applyOptimizations = false
  ): Promise<OptimizedWorkflow> {
    console.log(`\n🔍 [MetricsOptimizer] Analyzing workflow: ${workflow.name}`)

    // 1. Get historical metrics
    const historicalMetrics = await this.persister.getWorkflowHistory(workflow.name, 10)

    if (historicalMetrics.length < this.minHistoricalRuns) {
      console.log(
        `⚠️  [MetricsOptimizer] Insufficient historical data (${historicalMetrics.length}/${this.minHistoricalRuns} runs)`
      )
      return {
        workflow,
        recommendations: [],
        appliedOptimizations: [],
        estimatedTimeReduction: 0,
        confidence: 0
      }
    }

    console.log(`📊 [MetricsOptimizer] Found ${historicalMetrics.length} historical runs`)

    // 2. Identify optimization opportunities
    const recommendations: OptimizationRecommendation[] = []

    // 2.1 Parallelization opportunities
    const parallelizationRecs = await this.identifyParallelizationOpportunities(
      workflow,
      historicalMetrics
    )
    recommendations.push(...parallelizationRecs)

    // 2.2 Redundant steps
    const redundantStepRecs = await this.identifyRedundantSteps(workflow, historicalMetrics)
    recommendations.push(...redundantStepRecs)

    // 2.3 Timeout adjustments
    const timeoutRecs = await this.adjustTimeouts(workflow, historicalMetrics)
    recommendations.push(...timeoutRecs)

    // 2.4 Step reordering
    const reorderRecs = await this.identifyReorderingOpportunities(workflow, historicalMetrics)
    recommendations.push(...reorderRecs)

    // 3. Calculate estimated time reduction
    const estimatedTimeReduction = this.calculateTimeReduction(recommendations, historicalMetrics)

    // 4. Calculate overall confidence
    const confidence = this.calculateConfidence(recommendations, historicalMetrics.length)

    console.log(`💡 [MetricsOptimizer] Generated ${recommendations.length} recommendations`)
    console.log(`⏱️  [MetricsOptimizer] Estimated time reduction: ${estimatedTimeReduction}%`)
    console.log(`📈 [MetricsOptimizer] Confidence: ${(confidence * 100).toFixed(0)}%`)

    // 5. Apply optimizations if requested
    let optimizedWorkflow = workflow
    const appliedOptimizations: OptimizationRecommendation[] = []

    if (applyOptimizations) {
      const autoApplyRecs = recommendations.filter(r => r.autoApply)
      if (autoApplyRecs.length > 0) {
        console.log(`\n🔧 [MetricsOptimizer] Applying ${autoApplyRecs.length} optimizations...`)
        optimizedWorkflow = this.applyOptimizations(workflow, autoApplyRecs)
        appliedOptimizations.push(...autoApplyRecs)
      }
    }

    return {
      workflow: optimizedWorkflow,
      recommendations,
      appliedOptimizations,
      estimatedTimeReduction,
      confidence
    }
  }

  /**
   * Identify parallelization opportunities
   */
  private async identifyParallelizationOpportunities(
    workflow: Workflow,
    historicalMetrics: WorkflowMetrics[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // Get average step metrics for this workflow
    const stepMetricsPromises = historicalMetrics.map(wm =>
      this.persister.getAgentMetricsForWorkflow(wm.workflowId)
    )
    const allStepMetrics = await Promise.all(stepMetricsPromises)

    // Find sequential steps that could run in parallel
    const candidates = this.findParallelizationCandidates(workflow, allStepMetrics.flat())

    for (const candidate of candidates) {
      const { step1, step2, reason, safetyScore } = candidate

      recommendations.push({
        type: 'parallelize',
        description: `Run step ${step1.order} (${step1.role_id}) and step ${step2.order} (${step2.role_id}) in parallel`,
        affectedSteps: [step1.order, step2.order],
        expectedImprovement: `~${this.estimateParallelSpeedup(step1, step2, allStepMetrics.flat())}% faster`,
        confidence: safetyScore,
        priority: safetyScore > 0.8 ? 'high' : safetyScore > 0.6 ? 'medium' : 'low',
        autoApply: safetyScore >= this.parallelizationSafetyThreshold
      })
    }

    return recommendations
  }

  /**
   * Find parallelization candidates
   */
  private findParallelizationCandidates(
    workflow: Workflow,
    stepMetrics: AgentStepMetrics[]
  ): ParallelizationCandidate[] {
    const candidates: ParallelizationCandidate[] = []

    // Group steps by order to find sequential steps
    const stepsByOrder = new Map<number, WorkflowStep[]>()
    for (const step of workflow.steps) {
      if (!stepsByOrder.has(step.order)) {
        stepsByOrder.set(step.order, [])
      }
      stepsByOrder.get(step.order)!.push(step)
    }

    // Find consecutive orders with single steps (sequential execution)
    const orders = Array.from(stepsByOrder.keys()).sort((a, b) => a - b)

    for (let i = 0; i < orders.length - 1; i++) {
      const currentOrder = orders[i]
      const nextOrder = orders[i + 1]

      const currentSteps = stepsByOrder.get(currentOrder)!
      const nextSteps = stepsByOrder.get(nextOrder)!

      // Only consider if both are single steps (not already parallel)
      if (currentSteps.length === 1 && nextSteps.length === 1) {
        const step1 = currentSteps[0]
        const step2 = nextSteps[0]

        // Check if steps can be parallelized (safety analysis)
        const safetyScore = this.assessParallelizationSafety(step1, step2, stepMetrics)

        if (safetyScore > 0.5) {
          candidates.push({
            step1,
            step2,
            reason: `Steps are independent and can run concurrently`,
            safetyScore
          })
        }
      }
    }

    return candidates
  }

  /**
   * Assess safety of parallelizing two steps
   */
  private assessParallelizationSafety(
    step1: WorkflowStep,
    step2: WorkflowStep,
    stepMetrics: AgentStepMetrics[]
  ): number {
    let safetyScore = 1.0

    // Reduce safety if steps are in different phases (likely dependencies)
    if (step1.phase !== step2.phase) {
      safetyScore -= this.optimizationConfig.phasePenalty
    }

    // Reduce safety if step2 depends on step1 deliverables
    const step1Deliverables = step1.deliverables || []
    const step2ExitCriteria = step2.exit_criteria?.toLowerCase() || ''

    for (const deliverable of step1Deliverables) {
      if (step2ExitCriteria.includes(deliverable.toLowerCase())) {
        safetyScore -= this.optimizationConfig.deliverableDependencyPenalty
      }
    }

    // Increase safety if both steps have high success rates
    const step1SuccessRate = this.getStepSuccessRate(step1, stepMetrics)
    const step2SuccessRate = this.getStepSuccessRate(step2, stepMetrics)

    if (step1SuccessRate > 0.9 && step2SuccessRate > 0.9) {
      safetyScore += this.optimizationConfig.highSuccessBonus
    }

    return Math.max(0, Math.min(1, safetyScore))
  }

  /**
   * Get success rate for a step
   */
  private getStepSuccessRate(step: WorkflowStep, stepMetrics: AgentStepMetrics[]): number {
    const relevantMetrics = stepMetrics.filter(m => m.phase === step.phase)
    if (relevantMetrics.length === 0) return 1.0

    const successCount = relevantMetrics.filter(m => m.success).length
    return successCount / relevantMetrics.length
  }

  /**
   * Estimate parallel speedup
   */
  private estimateParallelSpeedup(
    step1: WorkflowStep,
    step2: WorkflowStep,
    stepMetrics: AgentStepMetrics[]
  ): number {
    const step1Avg = this.getAverageDuration(step1, stepMetrics)
    const step2Avg = this.getAverageDuration(step2, stepMetrics)

    const sequentialTime = step1Avg + step2Avg
    const parallelTime = Math.max(step1Avg, step2Avg)

    return Math.round(((sequentialTime - parallelTime) / sequentialTime) * 100)
  }

  /**
   * Get average duration for a step
   */
  private getAverageDuration(step: WorkflowStep, stepMetrics: AgentStepMetrics[]): number {
    const relevantMetrics = stepMetrics.filter(m => m.phase === step.phase)
    if (relevantMetrics.length === 0) return this.optimizationConfig.defaultTimeoutMs

    const totalDuration = relevantMetrics.reduce((sum, m) => sum + m.durationMs, 0)
    return totalDuration / relevantMetrics.length
  }

  /**
   * Identify redundant steps
   */
  private async identifyRedundantSteps(
    workflow: Workflow,
    historicalMetrics: WorkflowMetrics[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // Get step metrics
    const stepMetricsPromises = historicalMetrics.map(wm =>
      this.persister.getAgentMetricsForWorkflow(wm.workflowId)
    )
    const allStepMetrics = await Promise.all(stepMetricsPromises)

    // Analyze each step for redundancy indicators
    for (const step of workflow.steps) {
      const redundancyScore = this.assessStepRedundancy(step, allStepMetrics.flat())

      if (redundancyScore > 0.6) {
        recommendations.push({
          type: 'skip_step',
          description: `Consider removing step ${step.order} (${step.role_id}) - low value added`,
          affectedSteps: [step.order],
          expectedImprovement: `~${this.estimateSkipImpact(step, allStepMetrics.flat())}% faster`,
          confidence: redundancyScore,
          priority: redundancyScore > 0.8 ? 'medium' : 'low',
          autoApply: false // Never auto-apply step removal (safety)
        })
      }
    }

    return recommendations
  }

  /**
   * Assess step redundancy
   */
  private assessStepRedundancy(step: WorkflowStep, stepMetrics: AgentStepMetrics[]): number {
    let redundancyScore = 0

    // Check if step produces minimal artifacts
    const stepMetricsForRole = stepMetrics.filter(m => m.phase === step.phase)
    const avgArtifacts =
      stepMetricsForRole.reduce((sum, m) => sum + m.artifactsCreated, 0) /
      stepMetricsForRole.length

    if (avgArtifacts < this.optimizationConfig.minArtifactsThreshold) {
      redundancyScore += this.optimizationConfig.lowArtifactsScore
    }

    // Check if step has low confidence scores
    const avgConfidence =
      stepMetricsForRole.reduce((sum, m) => sum + m.confidenceScore, 0) /
      stepMetricsForRole.length

    if (avgConfidence < this.optimizationConfig.minConfidenceThreshold) {
      redundancyScore += this.optimizationConfig.lowConfidenceScore
    }

    return redundancyScore
  }

  /**
   * Estimate impact of skipping a step
   */
  private estimateSkipImpact(step: WorkflowStep, stepMetrics: AgentStepMetrics[]): number {
    const stepAvg = this.getAverageDuration(step, stepMetrics)
    const totalAvg =
      stepMetrics.reduce((sum, m) => sum + m.durationMs, 0) / stepMetrics.length

    return Math.round((stepAvg / totalAvg) * 100)
  }

  /**
   * Adjust timeouts based on historical performance
   */
  private async adjustTimeouts(
    workflow: Workflow,
    historicalMetrics: WorkflowMetrics[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // Get step metrics
    const stepMetricsPromises = historicalMetrics.map(wm =>
      this.persister.getAgentMetricsForWorkflow(wm.workflowId)
    )
    const allStepMetrics = await Promise.all(stepMetricsPromises)

    // Analyze timeout for each step
    for (const step of workflow.steps) {
      const currentTimeout = this.parseTimeout(step.timeout || '30m')
      const avgDuration = this.getAverageDuration(step, allStepMetrics.flat())
      const maxDuration = this.getMaxDuration(step, allStepMetrics.flat())

      // Recommend timeout adjustment if current timeout is too high or too low
      const optimalTimeout = Math.ceil(maxDuration * 1.5) // 150% of max observed duration

      if (Math.abs(currentTimeout - optimalTimeout) > currentTimeout * 0.2) {
        // >20% difference
        const improvement = currentTimeout > optimalTimeout ? 'reduce' : 'increase'

        recommendations.push({
          type: 'adjust_timeout',
          description: `${improvement === 'reduce' ? 'Reduce' : 'Increase'} timeout for step ${step.order} (${step.role_id}) from ${this.formatTimeout(currentTimeout)} to ${this.formatTimeout(optimalTimeout)}`,
          affectedSteps: [step.order],
          expectedImprovement:
            improvement === 'reduce' ? 'Faster failure detection' : 'Prevent false timeouts',
          confidence: this.optimizationConfig.timeoutConfidence,
          priority: 'low',
          autoApply: true
        })
      }
    }

    return recommendations
  }

  /**
   * Get max duration for a step
   */
  private getMaxDuration(step: WorkflowStep, stepMetrics: AgentStepMetrics[]): number {
    const relevantMetrics = stepMetrics.filter(m => m.phase === step.phase)
    if (relevantMetrics.length === 0) return this.optimizationConfig.defaultTimeoutMs

    return Math.max(...relevantMetrics.map(m => m.durationMs))
  }

  /**
   * Parse timeout string to milliseconds
   */
  private parseTimeout(timeout: string): number {
    const match = timeout.match(/^(\d+)(s|m|h)$/)
    if (!match) return 30 * 60 * 1000

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's':
        return value * 1000
      case 'm':
        return value * 60 * 1000
      case 'h':
        return value * 60 * 60 * 1000
      default:
        return 30 * 60 * 1000
    }
  }

  /**
   * Format milliseconds to timeout string
   */
  private formatTimeout(ms: number): string {
    if (ms < 60000) {
      return `${Math.ceil(ms / 1000)}s`
    } else if (ms < 3600000) {
      return `${Math.ceil(ms / 60000)}m`
    } else {
      return `${Math.ceil(ms / 3600000)}h`
    }
  }

  /**
   * Identify step reordering opportunities
   */
  private async identifyReorderingOpportunities(
    workflow: Workflow,
    historicalMetrics: WorkflowMetrics[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = []

    // Placeholder: Complex dependency analysis needed
    // For now, skip reordering recommendations

    return recommendations
  }

  /**
   * Calculate estimated time reduction
   */
  private calculateTimeReduction(
    recommendations: OptimizationRecommendation[],
    historicalMetrics: WorkflowMetrics[]
  ): number {
    // Parse improvement percentages from recommendations
    let totalReduction = 0

    for (const rec of recommendations) {
      if (rec.type === 'parallelize' || rec.type === 'skip_step') {
        const match = rec.expectedImprovement.match(/(\d+)%/)
        if (match) {
          totalReduction += parseInt(match[1])
        }
      }
    }

    // Cap at 50% maximum reduction (safety)
    return Math.min(50, totalReduction)
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(
    recommendations: OptimizationRecommendation[],
    historicalRunCount: number
  ): number {
    if (recommendations.length === 0) return 0

    // Average confidence of all recommendations
    const avgConfidence =
      recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length

    // Adjust based on historical run count
    const dataConfidence = Math.min(1, historicalRunCount / 10)

    return (avgConfidence + dataConfidence) / 2
  }

  /**
   * Apply optimizations to workflow
   */
  private applyOptimizations(
    workflow: Workflow,
    recommendations: OptimizationRecommendation[]
  ): Workflow {
    const optimizedWorkflow: Workflow = JSON.parse(JSON.stringify(workflow))

    for (const rec of recommendations) {
      switch (rec.type) {
        case 'parallelize':
          this.applyParallelization(optimizedWorkflow, rec)
          break
        case 'adjust_timeout':
          this.applyTimeoutAdjustment(optimizedWorkflow, rec)
          break
        // Note: skip_step and reorder_steps are not auto-applied for safety
      }
    }

    return optimizedWorkflow
  }

  /**
   * Apply parallelization optimization
   */
  private applyParallelization(workflow: Workflow, rec: OptimizationRecommendation): void {
    const [order1, order2] = rec.affectedSteps

    // Find steps
    const step1 = workflow.steps.find(s => s.order === order1)
    const step2 = workflow.steps.find(s => s.order === order2)

    if (!step1 || !step2) return

    // Make both steps have the same order (parallel execution)
    step2.order = step1.order
    step2.parallel_with = [step1.role_id]
    step1.parallel_with = step1.parallel_with || []
    step1.parallel_with.push(step2.role_id)

    console.log(`✅ [MetricsOptimizer] Applied parallelization: ${step1.role_id} + ${step2.role_id}`)
  }

  /**
   * Apply timeout adjustment
   */
  private applyTimeoutAdjustment(workflow: Workflow, rec: OptimizationRecommendation): void {
    const order = rec.affectedSteps[0]
    const step = workflow.steps.find(s => s.order === order)

    if (!step) return

    // Extract new timeout from description
    const match = rec.description.match(/to (\d+[smh])/)
    if (match) {
      step.timeout = match[1]
      console.log(`✅ [MetricsOptimizer] Adjusted timeout for ${step.role_id}: ${step.timeout}`)
    }
  }
}
