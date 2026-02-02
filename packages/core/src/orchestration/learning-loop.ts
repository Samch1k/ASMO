/**
 * LearningLoop - Analyze workflow patterns and extract learnings
 *
 * Part of BMad Framework integration
 * Implements continuous improvement cycle: Execute → Analyze → Learn → Improve
 *
 * Features:
 * - Bottleneck identification
 * - Error pattern detection
 * - Optimization opportunity discovery
 * - Best practice extraction
 * - LLM-powered insight generation
 */

// @ts-nocheck - Uses optional pg dependency with dynamic require

import type { WorkflowMetrics, AgentStepMetrics } from './metrics-collector'
import { getLLMProvider, type ILLMProvider, type ModelTier } from '../llm'
import { MetricsPersister } from './metrics-persister'
import { getConfigManager } from './config/config-manager'

/**
 * Learning insight types
 */
export interface LearningInsight {
  type: 'bottleneck' | 'error_pattern' | 'optimization' | 'best_practice'
  description: string
  recommendation: string
  confidenceScore: number
  priority: 'high' | 'medium' | 'low'
  affectedPhases?: string[]
  affectedAgents?: string[]
}

/**
 * Learning session result
 */
export interface LearningSession {
  sessionId?: number
  workflowId: string
  sessionType: string
  findings: LearningInsight[]
  recommendations: string[]
  confidenceScore: number
  implemented: boolean
  createdAt: Date
}

/**
 * LearningLoop - Continuous improvement through pattern analysis
 */
export class LearningLoop {
  private llmProvider: ILLMProvider
  private llmModel: ModelTier
  private persister: MetricsPersister

  constructor(persister?: MetricsPersister) {
    // Load config from ConfigManager if available
    const configManager = getConfigManager()
    let llmConfig = {
      model: 'sonnet' as ModelTier,
      temperature: 0.2,
      maxTokens: 4096
    }

    if (configManager.isInitialized()) {
      const learningConfig = configManager.getLearningLoopConfig()
      // Map model name to tier
      const modelName = learningConfig.llm.modelName || ''
      if (modelName.includes('opus')) {
        llmConfig.model = 'opus'
      } else if (modelName.includes('haiku')) {
        llmConfig.model = 'haiku'
      }
      llmConfig.temperature = learningConfig.llm.temperature ?? llmConfig.temperature
      llmConfig.maxTokens = learningConfig.llm.maxTokens || llmConfig.maxTokens
    }

    this.llmProvider = getLLMProvider()
    this.llmModel = llmConfig.model
    this.persister = persister || new MetricsPersister()
  }

  /**
   * Analyze workflow execution and extract learnings
   */
  async analyzeExecution(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    historicalMetrics: WorkflowMetrics[]
  ): Promise<LearningSession> {
    console.log('🔄 [LearningLoop] Starting analysis...')

    const findings: LearningInsight[] = []

    // 1. Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(stepMetrics, workflowMetrics)
    findings.push(...bottlenecks)

    // 2. Detect error patterns
    const errorPatterns = this.detectErrorPatterns(stepMetrics, historicalMetrics)
    findings.push(...errorPatterns)

    // 3. Find optimization opportunities (LLM-based)
    try {
      const optimizations = await this.findOptimizations(
        workflowMetrics,
        stepMetrics,
        historicalMetrics
      )
      findings.push(...optimizations)
    } catch (error: any) {
      console.warn('⚠️  [LearningLoop] Failed to generate LLM optimizations:', error.message)
    }

    // 4. Extract best practices
    const bestPractices = this.extractBestPractices(stepMetrics, historicalMetrics)
    findings.push(...bestPractices)

    // 5. Generate actionable recommendations
    const recommendations = this.generateRecommendations(findings)

    // 6. Calculate overall confidence
    const confidenceScore = findings.length > 0
      ? findings.reduce((sum, f) => sum + f.confidenceScore, 0) / findings.length
      : 0

    const session: LearningSession = {
      workflowId: workflowMetrics.workflowId,
      sessionType: 'post_execution_analysis',
      findings,
      recommendations,
      confidenceScore,
      implemented: false,
      createdAt: new Date()
    }

    // Persist to database (SQLite)
    await this.persistLearningSession(session)

    console.log(`✅ [LearningLoop] Analysis complete: ${findings.length} insights, ${recommendations.length} recommendations`)

    return session
  }

  /**
   * Identify performance bottlenecks from step metrics
   */
  private identifyBottlenecks(
    stepMetrics: AgentStepMetrics[],
    workflowMetrics: WorkflowMetrics
  ): LearningInsight[] {
    const insights: LearningInsight[] = []

    if (stepMetrics.length === 0) return insights

    // Calculate average duration
    const avgDuration = stepMetrics.reduce((sum, s) => sum + s.durationMs, 0) / stepMetrics.length

    // Sort by duration descending
    const sortedByDuration = [...stepMetrics].sort((a, b) => b.durationMs - a.durationMs)

    // Bottleneck threshold: 2x average duration
    const bottleneckThreshold = avgDuration * 2

    // Analyze top 3 slowest steps
    for (const step of sortedByDuration.slice(0, 3)) {
      if (step.durationMs > bottleneckThreshold) {
        const percentageAbove = ((step.durationMs / avgDuration - 1) * 100).toFixed(0)
        const durationSeconds = (step.durationMs / 1000).toFixed(1)

        insights.push({
          type: 'bottleneck',
          description: `Agent '${step.agentId}' in phase '${step.phase}' took ${durationSeconds}s (${percentageAbove}% above average)`,
          recommendation: `Optimize '${step.agentId}' execution or consider caching intermediate results. Review LLM prompt efficiency and reduce unnecessary MCP calls.`,
          confidenceScore: 0.9,
          priority: parseInt(percentageAbove) > 100 ? 'high' : 'medium',
          affectedPhases: [step.phase],
          affectedAgents: [step.agentId]
        })
      }
    }

    // Phase-level bottleneck analysis
    const phaseDurations = workflowMetrics.phaseDurations
    const avgPhaseDuration = Object.values(phaseDurations).reduce((sum: number, d) => sum + (d as number), 0) / Object.keys(phaseDurations).length

    for (const [phase, duration] of Object.entries(phaseDurations)) {
      const durationMs = duration as number
      if (durationMs > avgPhaseDuration * 1.5) {
        const percentageAbove = ((durationMs / avgPhaseDuration - 1) * 100).toFixed(0)
        const durationSeconds = (durationMs / 1000).toFixed(1)

        insights.push({
          type: 'bottleneck',
          description: `Phase '${phase}' took ${durationSeconds}s (${percentageAbove}% above average phase duration)`,
          recommendation: `Review all agents in '${phase}' phase. Consider parallelizing sequential steps if possible.`,
          confidenceScore: 0.85,
          priority: parseInt(percentageAbove) > 50 ? 'high' : 'medium',
          affectedPhases: [phase]
        })
      }
    }

    return insights
  }

  /**
   * Detect recurring error patterns
   */
  private detectErrorPatterns(
    stepMetrics: AgentStepMetrics[],
    historicalMetrics: WorkflowMetrics[]
  ): LearningInsight[] {
    const insights: LearningInsight[] = []

    // Find failed steps in current execution
    const failedSteps = stepMetrics.filter(s => !s.success)

    if (failedSteps.length > 0) {
      // Group by agent
      const errorsByAgent = new Map<string, { count: number; phases: Set<string>; errors: string[] }>()

      for (const step of failedSteps) {
        if (!errorsByAgent.has(step.agentId)) {
          errorsByAgent.set(step.agentId, { count: 0, phases: new Set(), errors: [] })
        }

        const agentErrors = errorsByAgent.get(step.agentId)!
        agentErrors.count++
        agentErrors.phases.add(step.phase)
        if (step.errorMessage) {
          agentErrors.errors.push(step.errorMessage)
        }
      }

      for (const [agentId, data] of errorsByAgent) {
        const phaseList = Array.from(data.phases).join(', ')
        const errorSummary = data.errors.length > 0
          ? ` Common error: "${data.errors[0].substring(0, 100)}..."`
          : ''

        insights.push({
          type: 'error_pattern',
          description: `Agent '${agentId}' failed ${data.count} time(s) in phases: ${phaseList}.${errorSummary}`,
          recommendation: `Review and strengthen error handling in '${agentId}' agent. Add input validation and fallback strategies. Consider retry logic improvements.`,
          confidenceScore: 0.85,
          priority: data.count > 1 ? 'high' : 'medium',
          affectedAgents: [agentId],
          affectedPhases: Array.from(data.phases)
        })
      }
    }

    // Analyze historical failure patterns
    if (historicalMetrics.length >= 3) {
      const recentFailures = historicalMetrics.filter(m => !m.success)
      const failureRate = (recentFailures.length / historicalMetrics.length) * 100

      if (failureRate > 20) {
        insights.push({
          type: 'error_pattern',
          description: `Workflow '${historicalMetrics[0].workflowName}' has ${failureRate.toFixed(0)}% failure rate over last ${historicalMetrics.length} executions`,
          recommendation: `Investigate root causes of failures. Review workflow configuration, agent dependencies, and external service reliability.`,
          confidenceScore: 0.8,
          priority: 'high'
        })
      }
    }

    return insights
  }

  /**
   * Find optimization opportunities using LLM analysis
   */
  private async findOptimizations(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    historicalMetrics: WorkflowMetrics[]
  ): Promise<LearningInsight[]> {
    if (historicalMetrics.length < 2) {
      return [] // Need historical data for comparison
    }

    // Prepare concise data summary for LLM
    const dataSummary = {
      current: {
        duration: workflowMetrics.totalDurationMs,
        success: workflowMetrics.success,
        stepCount: workflowMetrics.stepCount,
        parallelSteps: workflowMetrics.parallelStepsExecuted,
        phaseDurations: workflowMetrics.phaseDurations
      },
      historical: historicalMetrics.slice(0, 5).map(m => ({
        duration: m.totalDurationMs,
        success: m.success,
        parallelSteps: m.parallelStepsExecuted,
        phaseDurations: m.phaseDurations
      })),
      steps: stepMetrics.map(s => ({
        agent: s.agentId,
        phase: s.phase,
        duration: s.durationMs,
        success: s.success,
        order: s.stepOrder
      }))
    }

    const prompt = `Analyze this workflow execution and suggest optimizations.

Current Execution:
${JSON.stringify(dataSummary.current, null, 2)}

Historical Executions (last 5):
${JSON.stringify(dataSummary.historical, null, 2)}

Steps Breakdown:
${JSON.stringify(dataSummary.steps, null, 2)}

Identify optimization opportunities in these categories:
1. Parallelization - Sequential steps that could run concurrently
2. Redundancy - Unnecessary steps with low value
3. Sequencing - Steps that could be reordered for efficiency

Return ONLY a JSON array (no markdown, no extra text) with this format:
[
  {
    "type": "optimization",
    "description": "Brief description of the optimization opportunity",
    "recommendation": "Specific actionable recommendation",
    "confidenceScore": 0.7,
    "priority": "high"
  }
]

Limit to top 3 most impactful optimizations.`

    try {
      const response = await this.llmProvider.generate(prompt, {
        model: this.llmModel,
        temperature: 0.2,
        maxTokens: 4096
      })
      const content = response.content

      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0])
        return insights.map((i: any) => ({
          type: 'optimization' as const,
          description: i.description,
          recommendation: i.recommendation,
          confidenceScore: i.confidenceScore || 0.7,
          priority: i.priority || 'medium'
        }))
      }
    } catch (error: any) {
      console.error('❌ [LearningLoop] Failed to parse LLM optimization response:', error.message)
    }

    return []
  }

  /**
   * Extract best practices from successful executions
   */
  private extractBestPractices(
    stepMetrics: AgentStepMetrics[],
    historicalMetrics: WorkflowMetrics[]
  ): LearningInsight[] {
    const insights: LearningInsight[] = []

    // High-confidence agents
    const highConfidenceSteps = stepMetrics.filter(s => s.confidenceScore > 0.9 && s.success)

    if (highConfidenceSteps.length >= 3) {
      const agentList = highConfidenceSteps.map(s => s.agentId).join(', ')

      insights.push({
        type: 'best_practice',
        description: `${highConfidenceSteps.length} agents achieved confidence > 90%: ${agentList}`,
        recommendation: 'Document and replicate patterns from these high-performing agents. Share learnings with lower-confidence agents.',
        confidenceScore: 0.8,
        priority: 'low',
        affectedAgents: highConfidenceSteps.map(s => s.agentId)
      })
    }

    // Artifact productivity
    const highProductivitySteps = stepMetrics.filter(s => s.artifactsCreated >= 2 && s.success)

    if (highProductivitySteps.length > 0) {
      const topProducers = highProductivitySteps
        .sort((a, b) => b.artifactsCreated - a.artifactsCreated)
        .slice(0, 3)
        .map(s => `${s.agentId} (${s.artifactsCreated} artifacts)`)
        .join(', ')

      insights.push({
        type: 'best_practice',
        description: `High artifact productivity: ${topProducers}`,
        recommendation: 'Analyze output patterns of productive agents. Consider standardizing their structured output format.',
        confidenceScore: 0.75,
        priority: 'low',
        affectedAgents: highProductivitySteps.map(s => s.agentId)
      })
    }

    // Consistent success rate
    if (historicalMetrics.length >= 5) {
      const recentSuccesses = historicalMetrics.filter(m => m.success).length
      const successRate = (recentSuccesses / historicalMetrics.length) * 100

      if (successRate >= 95) {
        insights.push({
          type: 'best_practice',
          description: `Workflow maintains ${successRate.toFixed(0)}% success rate over ${historicalMetrics.length} executions`,
          recommendation: 'Document current configuration and patterns as a golden standard. Monitor for any deviations in future runs.',
          confidenceScore: 0.9,
          priority: 'low'
        })
      }
    }

    return insights
  }

  /**
   * Generate actionable recommendations from findings
   */
  private generateRecommendations(findings: LearningInsight[]): string[] {
    const recommendations: string[] = []

    // Group by priority
    const highPriority = findings.filter(f => f.priority === 'high')
    const mediumPriority = findings.filter(f => f.priority === 'medium')

    // Add high priority recommendations
    for (const finding of highPriority) {
      recommendations.push(`[${finding.type.toUpperCase()}] ${finding.recommendation}`)
    }

    // Add medium priority if space allows
    for (const finding of mediumPriority.slice(0, 3)) {
      recommendations.push(`[${finding.type.toUpperCase()}] ${finding.recommendation}`)
    }

    return recommendations
  }

  /**
   * Persist learning session to database (via MetricsPersister)
   */
  private async persistLearningSession(session: LearningSession): Promise<void> {
    const sessionId = await this.persister.persistLearningSession({
      workflowId: session.workflowId,
      sessionType: session.sessionType,
      findings: session.findings,
      recommendations: session.recommendations,
      confidenceScore: session.confidenceScore,
      implemented: session.implemented,
      createdAt: session.createdAt
    })

    if (sessionId) {
      session.sessionId = sessionId
    }
  }

  /**
   * Retrieve learning sessions for a workflow
   */
  async getLearningHistory(workflowId: string, limit: number = 5): Promise<LearningSession[]> {
    return this.persister.getLearningHistory(workflowId, limit)
  }

  /**
   * Get aggregated insights across all workflows
   */
  async getAggregatedInsights(limit: number = 50): Promise<{
    bottlenecks: Array<{ agent: string; count: number }>
    errorPatterns: Array<{ agent: string; count: number }>
    topRecommendations: string[]
  }> {
    const sessions = await this.persister.getRecentLearningSessions(limit)

    const bottleneckMap = new Map<string, number>()
    const errorPatternMap = new Map<string, number>()
    const recommendationMap = new Map<string, number>()

    for (const session of sessions) {
      const findings: LearningInsight[] = session.findings || []

      for (const finding of findings) {
        if (finding.type === 'bottleneck' && finding.affectedAgents) {
          for (const agent of finding.affectedAgents) {
            bottleneckMap.set(agent, (bottleneckMap.get(agent) || 0) + 1)
          }
        } else if (finding.type === 'error_pattern' && finding.affectedAgents) {
          for (const agent of finding.affectedAgents) {
            errorPatternMap.set(agent, (errorPatternMap.get(agent) || 0) + 1)
          }
        }
      }

      const recommendations: string[] = session.recommendations || []
      for (const rec of recommendations) {
        recommendationMap.set(rec, (recommendationMap.get(rec) || 0) + 1)
      }
    }

    return {
      bottlenecks: Array.from(bottleneckMap.entries())
        .map(([agent, count]) => ({ agent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      errorPatterns: Array.from(errorPatternMap.entries())
        .map(([agent, count]) => ({ agent, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      topRecommendations: Array.from(recommendationMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([rec]) => rec)
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.persister.close()
  }
}
