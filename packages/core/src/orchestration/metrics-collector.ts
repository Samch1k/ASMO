/**
 * MetricsCollector - Collect workflow and agent execution metrics
 *
 * Part of BMad Framework integration
 * Tracks execution metrics for Learning Loop analysis
 *
 * Features:
 * - Workflow-level metrics (duration, success rate, phase timings)
 * - Agent-level metrics (per-step execution, confidence scores)
 * - Real-time tracking with minimal overhead
 * - Ready for persistence to PostgreSQL
 */

import type { AgentState } from '../agents/types'
import type { Workflow, WorkflowStep, StepResult } from './types'
import { randomUUID } from 'crypto'
import { getConfigManager } from './config/config-manager'

/**
 * Complete workflow execution metrics
 */
export interface WorkflowMetrics {
  workflowId: string
  workflowName: string
  taskDescription: string
  taskType: string
  totalDurationMs: number
  phaseDurations: Record<string, number>
  success: boolean
  stepCount: number
  parallelStepsExecuted: number
  approvalCount: number
  retryCount: number
  createdAt: Date
  completedAt?: Date
}

/**
 * Per-agent execution metrics
 */
export interface AgentStepMetrics {
  workflowId: string
  workflowName: string
  agentId: string
  phase: string
  stepOrder: number
  durationMs: number
  startTime: Date
  success: boolean
  errorMessage?: string
  retryCount: number
  confidenceScore: number
  artifactsCreated: number
}

/**
 * MetricsCollector - Lightweight metrics tracking during workflow execution
 */
export class MetricsCollector {
  private currentWorkflowId?: string
  private workflowStartTime?: number
  private stepStartTimes: Map<string, number> = new Map()
  private phaseStartTimes: Map<string, number> = new Map()
  private phaseDurations: Map<string, number> = new Map()
  private stepMetrics: AgentStepMetrics[] = []
  private currentWorkflowName?: string
  private thresholds: {
    stepDurationMultiplier: number
    phaseDurationMultiplier: number
  }

  constructor() {
    const configManager = getConfigManager()
    if (configManager.isInitialized()) {
      const metricsConfig = configManager.getMetricsCollectorConfig()
      this.thresholds = {
        stepDurationMultiplier: metricsConfig.bottleneckThresholds.stepDurationMultiplier,
        phaseDurationMultiplier: metricsConfig.bottleneckThresholds.phaseDurationMultiplier
      }
    } else {
      // Fallback to defaults
      this.thresholds = {
        stepDurationMultiplier: 2.0,
        phaseDurationMultiplier: 1.5
      }
    }
  }

  /**
   * Get bottleneck thresholds (for use by other components)
   */
  getThresholds() {
    return { ...this.thresholds }
  }

  /**
   * Start metrics collection for a workflow
   */
  startWorkflowMetrics(workflow: Workflow, _initialState: AgentState): string {
    this.currentWorkflowId = randomUUID()
    this.currentWorkflowName = workflow.name
    this.workflowStartTime = Date.now()
    this.stepStartTimes.clear()
    this.phaseStartTimes.clear()
    this.phaseDurations.clear()
    this.stepMetrics = []

    console.log(`📊 [MetricsCollector] Started collection for workflow: ${workflow.id} (${this.currentWorkflowId})`)

    return this.currentWorkflowId
  }

  /**
   * Record step start time
   */
  recordStepStart(step: WorkflowStep, agentId: string): void {
    if (!this.currentWorkflowId) {
      console.warn('⚠️  [MetricsCollector] Attempted to record step start without workflow context')
      return
    }

    const key = `${step.order}-${agentId}`
    this.stepStartTimes.set(key, Date.now())

    // Track phase start if this is first step in phase
    if (!this.phaseStartTimes.has(step.phase)) {
      this.phaseStartTimes.set(step.phase, Date.now())
      console.log(`📊 [MetricsCollector] Phase '${step.phase}' started`)
    }
  }

  /**
   * Record step completion with metrics
   */
  recordStepCompletion(
    step: WorkflowStep,
    agentId: string,
    result: StepResult,
    state: AgentState
  ): void {
    if (!this.currentWorkflowId || !this.currentWorkflowName) {
      console.warn('⚠️  [MetricsCollector] Attempted to record step completion without workflow context')
      return
    }

    const key = `${step.order}-${agentId}`
    const startTime = this.stepStartTimes.get(key)

    if (!startTime) {
      console.warn(`⚠️  [MetricsCollector] No start time found for step ${key}`)
      return
    }

    const durationMs = Date.now() - startTime

    // Extract agent result for detailed metrics
    const agentResult = state.agentResults?.find(r => r.agentId === agentId)

    const metrics: AgentStepMetrics = {
      workflowId: this.currentWorkflowId,
      workflowName: this.currentWorkflowName,
      agentId,
      phase: step.phase,
      stepOrder: step.order,
      durationMs,
      startTime: new Date(startTime),
      success: result.success,
      errorMessage: result.error,
      retryCount: 0, // TODO: Get from IterationManager when integrated
      confidenceScore: agentResult?.confidence || 0,
      artifactsCreated: agentResult?.artifacts?.length || 0
    }

    this.stepMetrics.push(metrics)

    console.log(`📊 [MetricsCollector] Step ${step.order} (${agentId}) completed in ${durationMs}ms - ${result.success ? 'SUCCESS' : 'FAILED'}`)
  }

  /**
   * Record phase completion
   */
  recordPhaseCompletion(phase: string): void {
    const startTime = this.phaseStartTimes.get(phase)

    if (startTime) {
      const duration = Date.now() - startTime
      this.phaseDurations.set(phase, duration)
      console.log(`📊 [MetricsCollector] Phase '${phase}' completed in ${(duration / 1000).toFixed(1)}s`)
    } else {
      console.warn(`⚠️  [MetricsCollector] No start time found for phase '${phase}'`)
    }
  }

  /**
   * Finalize and return complete workflow metrics
   */
  finalizeMetrics(
    workflow: Workflow,
    finalState: AgentState,
    success: boolean
  ): WorkflowMetrics {
    if (!this.currentWorkflowId || !this.workflowStartTime) {
      throw new Error('[MetricsCollector] Cannot finalize metrics: collection not started')
    }

    const totalDurationMs = Date.now() - this.workflowStartTime

    // Convert phase durations map to object
    const phaseDurations: Record<string, number> = {}
    this.phaseDurations.forEach((duration, phase) => {
      phaseDurations[phase] = duration
    })

    // Count approvals from workflow definition
    const approvalCount = workflow.steps.filter(s => s.requires_approval).length

    // Count parallel steps
    const parallelStepsExecuted = workflow.steps.filter(
      s => s.parallel_with && s.parallel_with.length > 0
    ).length

    // Aggregate retry count from step metrics
    const retryCount = this.stepMetrics.reduce((sum, m) => sum + m.retryCount, 0)

    const metrics: WorkflowMetrics = {
      workflowId: this.currentWorkflowId,
      workflowName: workflow.name,
      taskDescription: finalState.task,
      taskType: finalState.taskType,
      totalDurationMs,
      phaseDurations,
      success,
      stepCount: workflow.steps.length,
      parallelStepsExecuted,
      approvalCount,
      retryCount,
      createdAt: new Date(this.workflowStartTime),
      completedAt: new Date()
    }

    console.log(`📊 [MetricsCollector] Workflow finalized:`, {
      id: metrics.workflowId,
      name: metrics.workflowName,
      duration: `${(totalDurationMs / 1000).toFixed(1)}s`,
      success: metrics.success,
      steps: metrics.stepCount,
      parallelSteps: metrics.parallelStepsExecuted
    })

    return metrics
  }

  /**
   * Get all step metrics for current workflow
   */
  getStepMetrics(): AgentStepMetrics[] {
    return [...this.stepMetrics]
  }

  /**
   * Get current workflow ID
   */
  getCurrentWorkflowId(): string | undefined {
    return this.currentWorkflowId
  }

  /**
   * Check if collection is active
   */
  isCollecting(): boolean {
    return this.currentWorkflowId !== undefined && this.workflowStartTime !== undefined
  }

  /**
   * Get metrics summary for logging
   */
  getSummary(): {
    workflowId: string | undefined
    workflowName: string | undefined
    elapsedMs: number
    stepsRecorded: number
    phasesCompleted: number
  } {
    return {
      workflowId: this.currentWorkflowId,
      workflowName: this.currentWorkflowName,
      elapsedMs: this.workflowStartTime ? Date.now() - this.workflowStartTime : 0,
      stepsRecorded: this.stepMetrics.length,
      phasesCompleted: this.phaseDurations.size
    }
  }

  /**
   * Reset collector for next workflow
   */
  reset(): void {
    console.log(`📊 [MetricsCollector] Resetting collector (workflow: ${this.currentWorkflowId})`)

    this.currentWorkflowId = undefined
    this.currentWorkflowName = undefined
    this.workflowStartTime = undefined
    this.stepStartTimes.clear()
    this.phaseStartTimes.clear()
    this.phaseDurations.clear()
    this.stepMetrics = []
  }
}

/**
 * Calculate average metrics from historical data
 */
export function calculateAverageMetrics(metrics: WorkflowMetrics[]): {
  avgDuration: number
  avgSuccessRate: number
  avgStepsCount: number
  avgParallelExecution: number
} {
  if (metrics.length === 0) {
    return {
      avgDuration: 0,
      avgSuccessRate: 0,
      avgStepsCount: 0,
      avgParallelExecution: 0
    }
  }

  const sum = metrics.reduce(
    (acc, m) => ({
      duration: acc.duration + m.totalDurationMs,
      successCount: acc.successCount + (m.success ? 1 : 0),
      steps: acc.steps + m.stepCount,
      parallel: acc.parallel + m.parallelStepsExecuted
    }),
    { duration: 0, successCount: 0, steps: 0, parallel: 0 }
  )

  return {
    avgDuration: sum.duration / metrics.length,
    avgSuccessRate: (sum.successCount / metrics.length) * 100,
    avgStepsCount: sum.steps / metrics.length,
    avgParallelExecution: sum.parallel / metrics.length
  }
}

/**
 * Find bottleneck phases from metrics
 */
export function identifyBottlenecks(
  metrics: WorkflowMetrics[],
  threshold = 0.3 // Phase taking >30% of total time
): Array<{ phase: string; avgDuration: number; percentage: number }> {
  if (metrics.length === 0) return []

  // Aggregate phase durations
  const phaseStats = new Map<string, number[]>()

  for (const metric of metrics) {
    for (const [phase, duration] of Object.entries(metric.phaseDurations)) {
      if (!phaseStats.has(phase)) {
        phaseStats.set(phase, [])
      }
      phaseStats.get(phase)!.push(duration as number)
    }
  }

  // Calculate averages
  const avgTotalDuration = metrics.reduce((sum, m) => sum + m.totalDurationMs, 0) / metrics.length

  const bottlenecks = []
  for (const [phase, durations] of phaseStats) {
    const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length
    const percentage = avgDuration / avgTotalDuration

    if (percentage >= threshold) {
      bottlenecks.push({ phase, avgDuration, percentage })
    }
  }

  return bottlenecks.sort((a, b) => b.percentage - a.percentage)
}
