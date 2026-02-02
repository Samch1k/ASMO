/**
 * RetrospectiveAgent - Automated workflow analysis and continuous improvement
 *
 * BMad Day 3: Analyzes completed workflows, identifies patterns, and generates
 * actionable recommendations for future improvements.
 *
 * ## Architecture
 *
 * This agent is part of the automatic retrospective analysis infrastructure. It runs
 * automatically after workflow completion and provides rule-based recommendations.
 *
 * ### Relationship with asmo-analyze/asmo-enhance skills (archived)
 *
 * The asmo skills (`asmo-analyze` and `asmo-enhance`) were manual, user-facing skills
 * that provided deeper AI-powered analysis of the metrics saved by this agent. As of
 * 2026-01-26, these skills were archived during the skill format consolidation.
 *
 * **Two-tier analysis system:**
 * 1. **RetrospectiveAgent (this file)** - Automatic infrastructure
 *    - Runs after every workflow
 *    - Saves metrics to `.asmo/` directory
 *    - Provides rule-based recommendations
 *    - No cost, no user interaction
 *
 * 2. **asmo skills (archived)** - Optional deep analysis
 *    - Manual invocation: `/asmo-analyze latest`
 *    - Reads saved metrics for AI-powered insights
 *    - Provides enhanced recommendations with code examples
 *    - Free (uses Claude Code CLI subscription)
 *
 * **Data Flow:**
 * Workflow completes → RetrospectiveAgent runs → Saves metrics → Basic recommendations
 * (Optional) → User runs asmo-analyze → Enhanced AI recommendations
 *
 * For detailed architecture documentation, see: `.cursor/docs/retrospective-system.md`
 */

import Anthropic from '@anthropic-ai/sdk'
import type { MetricsPersister } from './metrics-persister'
import type { WorkflowMetrics, AgentStepMetrics } from './metrics-collector'
import type { LearningInsight } from './learning-loop'

// ============================================================================
// Data Models
// ============================================================================

export interface RetrospectiveAnalysis {
  workflowId: string
  workflowName: string
  executionSummary: ExecutionSummary
  phaseAnalysis: PhaseAnalysis[]
  successFactors: SuccessFactor[]
  improvementAreas: ImprovementArea[]
  recommendations: Recommendation[]
  comparisonWithHistory: HistoricalComparison
  overallScore: number
  confidence: number
  generatedAt: Date
}

export interface ExecutionSummary {
  totalDuration: number
  success: boolean
  stepCount: number
  phaseCount: number
  parallelStepsExecuted: number
  retryCount: number
  approvalCount: number
}

export interface PhaseAnalysis {
  phase: string
  duration: number
  stepCount: number
  successRate: number
  averageConfidence: number
  bottlenecks: string[]
  highlights: string[]
  issues: string[]
}

export interface SuccessFactor {
  factor: string
  description: string
  impact: 'high' | 'medium' | 'low'
  reproducible: boolean
}

export interface ImprovementArea {
  area: string
  currentState: string
  desiredState: string
  gap: string
  priority: 'high' | 'medium' | 'low'
}

export interface Recommendation {
  id: string
  category: 'performance' | 'quality' | 'process' | 'tooling'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  expectedImpact: string
  effort: 'low' | 'medium' | 'high'
  actionable: boolean
  dependencies: string[]
  estimatedTimeReduction?: number
}

export interface HistoricalComparison {
  averageDuration: number
  durationPercentile: number
  successRateTrend: 'improving' | 'stable' | 'declining'
  performanceVsAverage: number
  rank: number
  totalRuns: number
}

// ============================================================================
// RetrospectiveAgent
// ============================================================================

export class RetrospectiveAgent {
  private anthropic?: Anthropic
  private metricsPersister: MetricsPersister

  constructor(metricsPersister: MetricsPersister) {
    this.metricsPersister = metricsPersister

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.anthropic = new Anthropic({ apiKey })
    } else {
      console.log('⚠️  [RetrospectiveAgent] No ANTHROPIC_API_KEY, will save analysis for Claude Code skills')
    }
  }

  /**
   * Generate comprehensive retrospective analysis for completed workflow
   */
  async generateRetrospective(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    learningInsights?: LearningInsight[]
  ): Promise<RetrospectiveAnalysis> {
    console.log('🔍 [RetrospectiveAgent] Generating retrospective analysis...')
    console.log(`📊 [RetrospectiveAgent] Analyzing ${stepMetrics.length} steps, ${this.formatDuration(workflowMetrics.totalDurationMs)} execution`)

    // 1. Get historical data for comparison
    const historicalData = await this.metricsPersister.getWorkflowHistory(
      workflowMetrics.workflowName,
      50
    )

    // 2. Create execution summary
    const executionSummary = this.createExecutionSummary(workflowMetrics)

    // 3. Analyze phase performance
    const phaseAnalysis = this.analyzePhasePerformance(
      workflowMetrics,
      stepMetrics
    )

    // 4. Identify success factors (rule-based)
    const successFactors = this.identifySuccessFactors(
      workflowMetrics,
      stepMetrics,
      historicalData
    )

    // 5. Identify improvement areas (rule-based)
    const improvementAreas = this.identifyImprovementAreas(
      workflowMetrics,
      stepMetrics,
      historicalData
    )

    // 6. Generate recommendations (LLM-powered)
    const recommendations = await this.generateRecommendations(
      workflowMetrics,
      stepMetrics,
      phaseAnalysis,
      successFactors,
      improvementAreas,
      learningInsights
    )

    // 7. Compare with historical data
    const comparisonWithHistory = this.compareWithHistory(
      workflowMetrics,
      historicalData
    )

    // 8. Calculate overall score
    const overallScore = this.calculateOverallScore(
      workflowMetrics,
      stepMetrics,
      comparisonWithHistory
    )

    // 9. Calculate confidence
    const confidence = this.calculateConfidence(
      historicalData.length,
      stepMetrics.length
    )

    const retrospective: RetrospectiveAnalysis = {
      workflowId: workflowMetrics.workflowId,
      workflowName: workflowMetrics.workflowName,
      executionSummary,
      phaseAnalysis,
      successFactors,
      improvementAreas,
      recommendations,
      comparisonWithHistory,
      overallScore,
      confidence,
      generatedAt: new Date()
    }

    console.log(`✅ [RetrospectiveAgent] Retrospective complete`)
    console.log(`   Overall Score: ${overallScore.toFixed(1)}/10`)
    console.log(`   Success Factors: ${successFactors.length}`)
    console.log(`   Improvement Areas: ${improvementAreas.length}`)
    console.log(`   Recommendations: ${recommendations.length}`)

    return retrospective
  }

  /**
   * Create execution summary from workflow metrics
   */
  private createExecutionSummary(metrics: WorkflowMetrics): ExecutionSummary {
    return {
      totalDuration: metrics.totalDurationMs,
      success: metrics.success,
      stepCount: metrics.stepCount,
      phaseCount: Object.keys(metrics.phaseDurations).length,
      parallelStepsExecuted: metrics.parallelStepsExecuted,
      retryCount: metrics.retryCount,
      approvalCount: metrics.approvalCount
    }
  }

  /**
   * Analyze performance of each phase
   */
  private analyzePhasePerformance(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[]
  ): PhaseAnalysis[] {
    const phaseMap = new Map<string, PhaseAnalysis>()

    // Group steps by phase
    for (const step of stepMetrics) {
      if (!phaseMap.has(step.phase)) {
        phaseMap.set(step.phase, {
          phase: step.phase,
          duration: 0,
          stepCount: 0,
          successRate: 0,
          averageConfidence: 0,
          bottlenecks: [],
          highlights: [],
          issues: []
        })
      }

      const phase = phaseMap.get(step.phase)!
      phase.duration += step.durationMs
      phase.stepCount += 1
      phase.successRate += step.success ? 1 : 0
      phase.averageConfidence += step.confidenceScore || 0
    }

    // Calculate averages and identify issues
    const analyses: PhaseAnalysis[] = []
    for (const [_phaseName, analysis] of phaseMap) {
      analysis.successRate = (analysis.successRate / analysis.stepCount) * 100
      analysis.averageConfidence = analysis.averageConfidence / analysis.stepCount

      // Identify bottlenecks (phases taking >30% of total time)
      const percentageOfTotal = (analysis.duration / workflowMetrics.totalDurationMs) * 100
      if (percentageOfTotal > 30) {
        analysis.bottlenecks.push(
          `Phase took ${percentageOfTotal.toFixed(0)}% of total time (${this.formatDuration(analysis.duration)})`
        )
      }

      // Identify highlights
      if (analysis.successRate === 100) {
        analysis.highlights.push('100% success rate')
      }
      if (analysis.averageConfidence > 0.9) {
        analysis.highlights.push(`High confidence (${(analysis.averageConfidence * 100).toFixed(0)}%)`)
      }

      // Identify issues
      if (analysis.successRate < 80) {
        analysis.issues.push(`Low success rate (${analysis.successRate.toFixed(0)}%)`)
      }
      if (analysis.averageConfidence < 0.6) {
        analysis.issues.push(`Low confidence (${(analysis.averageConfidence * 100).toFixed(0)}%)`)
      }

      analyses.push(analysis)
    }

    return analyses
  }

  /**
   * Identify success factors from execution (rule-based)
   */
  private identifySuccessFactors(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    historicalData: WorkflowMetrics[]
  ): SuccessFactor[] {
    const factors: SuccessFactor[] = []

    // Factor 1: Parallel execution
    if (workflowMetrics.parallelStepsExecuted > 0) {
      factors.push({
        factor: 'Parallel Execution',
        description: `${workflowMetrics.parallelStepsExecuted} steps executed in parallel`,
        impact: 'high',
        reproducible: true
      })
    }

    // Factor 2: High confidence scores
    const avgConfidence = stepMetrics.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / stepMetrics.length
    if (avgConfidence > 0.85) {
      factors.push({
        factor: 'High Agent Confidence',
        description: `Average confidence score: ${(avgConfidence * 100).toFixed(0)}%`,
        impact: 'medium',
        reproducible: true
      })
    }

    // Factor 3: Zero retries
    if (workflowMetrics.retryCount === 0) {
      factors.push({
        factor: 'No Retry Attempts',
        description: 'All steps succeeded on first attempt',
        impact: 'medium',
        reproducible: false
      })
    }

    // Factor 4: Faster than average
    if (historicalData.length >= 3) {
      const avgDuration = historicalData.reduce((sum, w) => sum + w.totalDurationMs, 0) / historicalData.length
      if (workflowMetrics.totalDurationMs < avgDuration * 0.85) {
        const improvement = ((avgDuration - workflowMetrics.totalDurationMs) / avgDuration * 100).toFixed(0)
        factors.push({
          factor: 'Above Average Performance',
          description: `${improvement}% faster than historical average`,
          impact: 'high',
          reproducible: true
        })
      }
    }

    return factors
  }

  /**
   * Identify improvement areas (rule-based)
   */
  private identifyImprovementAreas(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    historicalData: WorkflowMetrics[]
  ): ImprovementArea[] {
    const areas: ImprovementArea[] = []

    // Area 1: Retry attempts
    if (workflowMetrics.retryCount > 0) {
      areas.push({
        area: 'Retry Attempts',
        currentState: `${workflowMetrics.retryCount} retry attempts occurred`,
        desiredState: 'Zero retry attempts',
        gap: 'Investigate root causes of failures and improve reliability',
        priority: 'high'
      })
    }

    // Area 2: Low confidence steps
    const lowConfidenceSteps = stepMetrics.filter(s => (s.confidenceScore || 0) < 0.6)
    if (lowConfidenceSteps.length > 0) {
      areas.push({
        area: 'Agent Confidence',
        currentState: `${lowConfidenceSteps.length} steps with low confidence (<60%)`,
        desiredState: 'All steps with confidence >80%',
        gap: 'Review and improve prompts, provide better context',
        priority: 'medium'
      })
    }

    // Area 3: Manual approval delays
    if (workflowMetrics.approvalCount > 0 && historicalData.length >= 3) {
      areas.push({
        area: 'Approval Delays',
        currentState: `${workflowMetrics.approvalCount} manual approval checkpoints`,
        desiredState: 'Automated approval for low-risk phases',
        gap: 'Implement approval criteria and auto-approval rules',
        priority: 'medium'
      })
    }

    // Area 4: Slower than average
    if (historicalData.length >= 3) {
      const avgDuration = historicalData.reduce((sum, w) => sum + w.totalDurationMs, 0) / historicalData.length
      if (workflowMetrics.totalDurationMs > avgDuration * 1.2) {
        const degradation = ((workflowMetrics.totalDurationMs - avgDuration) / avgDuration * 100).toFixed(0)
        areas.push({
          area: 'Execution Performance',
          currentState: `${degradation}% slower than historical average`,
          desiredState: 'Match or exceed average performance',
          gap: 'Identify bottlenecks and optimize slow phases',
          priority: 'high'
        })
      }
    }

    return areas
  }

  /**
   * Save metrics and analysis context for Claude Code skills
   */
  private async saveAnalysisContext(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    phaseAnalysis: PhaseAnalysis[],
    successFactors: SuccessFactor[],
    improvementAreas: ImprovementArea[],
    learningInsights?: LearningInsight[]
  ): Promise<void> {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Create .asmo directory if it doesn't exist
    const asmoDir = path.join(process.cwd(), '.asmo')
    try {
      await fs.mkdir(asmoDir, { recursive: true })
    } catch (error) {
      // Directory already exists, ignore
    }

    // Save full metrics as JSON for programmatic access
    const metricsPath = path.join(asmoDir, `metrics-${workflowMetrics.workflowId}.json`)
    const metricsData = {
      workflowMetrics,
      stepMetrics,
      phaseAnalysis,
      successFactors,
      improvementAreas,
      learningInsights: learningInsights || []
    }
    await fs.writeFile(metricsPath, JSON.stringify(metricsData, null, 2), 'utf-8')

    // Save human-readable context for skills
    const contextPath = path.join(asmoDir, `analysis-context-${workflowMetrics.workflowId}.md`)
    const contextMd = this.formatAnalysisContext(
      workflowMetrics,
      stepMetrics,
      phaseAnalysis,
      successFactors,
      improvementAreas,
      learningInsights
    )
    await fs.writeFile(contextPath, contextMd, 'utf-8')

    // Save latest symlink for easy access
    const latestMetricsPath = path.join(asmoDir, 'metrics-latest.json')
    const latestContextPath = path.join(asmoDir, 'analysis-context-latest.md')

    try {
      await fs.unlink(latestMetricsPath)
      await fs.unlink(latestContextPath)
    } catch {
      // Symlinks don't exist, ignore
    }

    await fs.symlink(path.basename(metricsPath), latestMetricsPath)
    await fs.symlink(path.basename(contextPath), latestContextPath)

    console.log(`💾 [BMad] Metrics saved for Claude Code analysis:`)
    console.log(`   ${metricsPath}`)
    console.log(`   ${contextPath}`)
  }

  /**
   * Format analysis context as human-readable markdown
   */
  private formatAnalysisContext(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    phaseAnalysis: PhaseAnalysis[],
    successFactors: SuccessFactor[],
    improvementAreas: ImprovementArea[],
    learningInsights?: LearningInsight[]
  ): string {
    const lines: string[] = []

    lines.push(`# BMad Workflow Analysis Context`)
    lines.push(``)
    lines.push(`**Workflow ID**: ${workflowMetrics.workflowId}`)
    lines.push(`**Workflow Name**: ${workflowMetrics.workflowName}`)
    lines.push(`**Duration**: ${this.formatDuration(workflowMetrics.totalDurationMs)}`)
    lines.push(`**Success**: ${workflowMetrics.success ? '✅' : '❌'}`)
    lines.push(`**Generated**: ${new Date().toISOString()}`)
    lines.push(``)

    // Workflow Summary
    lines.push(`## Workflow Summary`)
    lines.push(``)
    lines.push(`- **Total Steps**: ${stepMetrics.length}`)
    lines.push(`- **Parallel Steps**: ${workflowMetrics.parallelStepsExecuted}`)
    lines.push(`- **Retry Attempts**: ${workflowMetrics.retryCount}`)
    lines.push(`- **Approval Checkpoints**: ${workflowMetrics.approvalCount}`)
    lines.push(``)

    // Phase Analysis
    lines.push(`## Phase Analysis`)
    lines.push(``)
    for (const phase of phaseAnalysis) {
      lines.push(`### ${phase.phase}`)
      lines.push(``)
      lines.push(`- **Duration**: ${this.formatDuration(phase.duration)} (${((phase.duration / workflowMetrics.totalDurationMs) * 100).toFixed(0)}% of total)`)
      lines.push(`- **Steps**: ${phase.stepCount}`)
      lines.push(`- **Success Rate**: ${phase.successRate.toFixed(0)}%`)
      lines.push(`- **Avg Confidence**: ${(phase.averageConfidence * 100).toFixed(0)}%`)

      if (phase.bottlenecks.length > 0) {
        lines.push(`- **Bottlenecks**: ${phase.bottlenecks.join('; ')}`)
      }
      if (phase.highlights.length > 0) {
        lines.push(`- **Highlights**: ${phase.highlights.join('; ')}`)
      }
      if (phase.issues.length > 0) {
        lines.push(`- **Issues**: ${phase.issues.join('; ')}`)
      }
      lines.push(``)
    }

    // Step Details
    lines.push(`## Step Details`)
    lines.push(``)
    lines.push(`| Agent | Phase | Duration | Confidence | Success | Retries |`)
    lines.push(`|-------|-------|----------|------------|---------|---------|`)
    for (const step of stepMetrics) {
      const confidence = (step.confidenceScore || 0) * 100
      lines.push(`| ${step.agentId} | ${step.phase} | ${this.formatDuration(step.durationMs)} | ${confidence.toFixed(0)}% | ${step.success ? '✅' : '❌'} | ${step.retryCount} |`)
    }
    lines.push(``)

    // Success Factors
    if (successFactors.length > 0) {
      lines.push(`## Success Factors`)
      lines.push(``)
      for (const factor of successFactors) {
        lines.push(`- **${factor.factor}** (${factor.impact} impact): ${factor.description}`)
      }
      lines.push(``)
    }

    // Improvement Areas
    if (improvementAreas.length > 0) {
      lines.push(`## Improvement Areas`)
      lines.push(``)
      for (const area of improvementAreas) {
        lines.push(`### ${area.area} (${area.priority} priority)`)
        lines.push(``)
        lines.push(`- **Current**: ${area.currentState}`)
        lines.push(`- **Desired**: ${area.desiredState}`)
        lines.push(`- **Gap**: ${area.gap}`)
        lines.push(``)
      }
    }

    // Learning Insights
    if (learningInsights && learningInsights.length > 0) {
      lines.push(`## Learning Insights`)
      lines.push(``)
      for (const insight of learningInsights) {
        lines.push(`- **${insight.type}**: ${insight.description}`)
        if (insight.recommendation) {
          lines.push(`  - Recommendation: ${insight.recommendation}`)
        }
      }
      lines.push(``)
    }

    // Instructions for Claude
    lines.push(`---`)
    lines.push(``)
    lines.push(`## For AI Analysis`)
    lines.push(``)
    lines.push(`Use the /asmo-analyze or /asmo-enhance skill to generate enhanced recommendations based on this context.`)
    lines.push(``)
    lines.push(`Focus on:`)
    lines.push(`1. Identifying specific bottlenecks and their root causes`)
    lines.push(`2. Generating actionable recommendations with measurable impact`)
    lines.push(`3. Prioritizing by ROI (impact vs effort)`)
    lines.push(`4. Providing implementation guidance with code examples`)
    lines.push(`5. Considering trade-offs and risks`)
    lines.push(``)

    return lines.join('\n')
  }

  /**
   * Generate actionable recommendations using LLM
   */
  private async generateRecommendations(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    phaseAnalysis: PhaseAnalysis[],
    successFactors: SuccessFactor[],
    improvementAreas: ImprovementArea[],
    learningInsights?: LearningInsight[]
  ): Promise<Recommendation[]> {
    // If no Anthropic API key, save context for Claude Code skills and return basic recommendations
    if (!this.anthropic) {
      console.log('⚠️  [BMad] No API key available, saving analysis context for skills...')
      await this.saveAnalysisContext(
        workflowMetrics,
        stepMetrics,
        phaseAnalysis,
        successFactors,
        improvementAreas,
        learningInsights
      )

      // Generate basic rule-based recommendations
      const basicRecommendations = this.generateBasicRecommendations(
        workflowMetrics,
        stepMetrics,
        phaseAnalysis,
        improvementAreas
      )

      console.log(`💡 [BMad] ${basicRecommendations.length} basic recommendations generated`)
      console.log(`💡 [BMad] For enhanced AI insights, run: /asmo-analyze latest`)

      return basicRecommendations
    }

    // Build comprehensive context for LLM
    const context = {
      workflow: {
        name: workflowMetrics.workflowName,
        duration: this.formatDuration(workflowMetrics.totalDurationMs),
        success: workflowMetrics.success,
        stepCount: stepMetrics.length,
        parallelSteps: workflowMetrics.parallelStepsExecuted,
        retries: workflowMetrics.retryCount
      },
      phases: phaseAnalysis.map(p => ({
        name: p.phase,
        duration: this.formatDuration(p.duration),
        steps: p.stepCount,
        successRate: `${p.successRate.toFixed(0)}%`,
        confidence: `${(p.averageConfidence * 100).toFixed(0)}%`,
        bottlenecks: p.bottlenecks,
        issues: p.issues
      })),
      successFactors: successFactors.map(f => f.description),
      improvementAreas: improvementAreas.map(a => ({
        area: a.area,
        gap: a.gap,
        priority: a.priority
      })),
      learningInsights: learningInsights?.map(l => ({
        type: l.type,
        description: l.description,
        recommendation: l.recommendation
      })) || []
    }

    const prompt = `You are an expert at analyzing software development workflows and providing actionable recommendations for improvement.

Analyze this workflow execution and generate 3-6 specific, actionable recommendations.

Workflow Context:
${JSON.stringify(context, null, 2)}

Requirements:
1. Each recommendation must be SPECIFIC and ACTIONABLE (not generic advice)
2. Include expected impact (time saved, quality improved, etc.)
3. Estimate effort (low/medium/high)
4. Prioritize by impact vs effort ratio
5. Focus on quick wins (high impact, low effort) first
6. Consider both immediate and strategic improvements

Return ONLY a JSON array of recommendations in this exact format:
[
  {
    "category": "performance|quality|process|tooling",
    "priority": "critical|high|medium|low",
    "title": "Brief title (max 60 chars)",
    "description": "Specific action to take",
    "expectedImpact": "Measurable impact (e.g., '15% time reduction', 'Eliminate 80% of retries')",
    "effort": "low|medium|high",
    "dependencies": ["list", "of", "prerequisite", "actions"],
    "estimatedTimeReduction": 15
  }
]

No preamble, no explanation, just the JSON array.`

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        temperature: 0.3,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = response.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse LLM response
      const recommendations = JSON.parse(content.text) as Array<Omit<Recommendation, 'id' | 'actionable'>>

      // Add IDs and actionable flag
      return recommendations.map((rec, index) => ({
        id: `rec-${Date.now()}-${index}`,
        actionable: true,
        ...rec
      }))
    } catch (error) {
      console.error('⚠️  [RetrospectiveAgent] LLM analysis failed:', error)

      // Fallback: Generate basic recommendations
      return this.generateBasicRecommendations(
        workflowMetrics,
        stepMetrics,
        phaseAnalysis,
        improvementAreas
      )
    }
  }

  /**
   * Generate basic rule-based recommendations (no LLM required)
   */
  private generateBasicRecommendations(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    phaseAnalysis: PhaseAnalysis[],
    improvementAreas: ImprovementArea[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    // Recommendation 1: Address retries
    if (workflowMetrics.retryCount > 0) {
      recommendations.push({
        id: `rec-basic-retries`,
        category: 'quality',
        priority: 'high',
        title: 'Investigate and eliminate retry attempts',
        description: `${workflowMetrics.retryCount} retry attempts occurred. Investigate root causes and improve reliability.`,
        expectedImpact: `Eliminate ${workflowMetrics.retryCount} retries per workflow`,
        effort: 'medium',
        actionable: true,
        dependencies: []
      })
    }

    // Recommendation 2: Address low confidence steps
    const lowConfidenceSteps = stepMetrics.filter(s => (s.confidenceScore || 0) < 0.7)
    if (lowConfidenceSteps.length > 0) {
      recommendations.push({
        id: `rec-basic-confidence`,
        category: 'quality',
        priority: 'medium',
        title: `Improve agent confidence in ${lowConfidenceSteps.length} steps`,
        description: `Agents with low confidence: ${lowConfidenceSteps.map(s => s.agentId).join(', ')}. Review prompts and provide better context.`,
        expectedImpact: 'Better output quality, fewer revisions',
        effort: 'medium',
        actionable: true,
        dependencies: []
      })
    }

    // Recommendation 3: Parallel execution opportunities
    if (stepMetrics.length >= 2 && workflowMetrics.parallelStepsExecuted === 0) {
      recommendations.push({
        id: `rec-basic-parallel`,
        category: 'performance',
        priority: 'high',
        title: 'Enable parallel execution for independent steps',
        description: 'Analyze workflow for steps that can run in parallel to reduce execution time.',
        expectedImpact: '30-50% time reduction in affected phases',
        effort: 'medium',
        actionable: true,
        dependencies: []
      })
    }

    // Recommendation 4: Bottleneck phases
    for (const phase of phaseAnalysis) {
      if (phase.bottlenecks.length > 0) {
        recommendations.push({
          id: `rec-basic-bottleneck-${phase.phase}`,
          category: 'performance',
          priority: 'high',
          title: `Optimize ${phase.phase} phase (bottleneck)`,
          description: phase.bottlenecks[0],
          expectedImpact: 'Reduce overall workflow time',
          effort: 'medium',
          actionable: true,
          dependencies: []
        })
      }
    }

    // Recommendation 5: Based on improvement areas
    for (const area of improvementAreas.slice(0, 2)) {
      recommendations.push({
        id: `rec-basic-improvement-${area.area.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'process',
        priority: area.priority,
        title: `Address ${area.area}`,
        description: area.gap,
        expectedImpact: 'Improvement in workflow reliability and quality',
        effort: 'medium',
        actionable: true,
        dependencies: []
      })
    }

    return recommendations
  }

  /**
   * Compare current execution with historical data
   */
  private compareWithHistory(
    current: WorkflowMetrics,
    historical: WorkflowMetrics[]
  ): HistoricalComparison {
    if (historical.length === 0) {
      return {
        averageDuration: current.totalDurationMs,
        durationPercentile: 50,
        successRateTrend: 'stable',
        performanceVsAverage: 0,
        rank: 1,
        totalRuns: 1
      }
    }

    const avgDuration = historical.reduce((sum, w) => sum + w.totalDurationMs, 0) / historical.length
    const successCount = historical.filter(w => w.success).length
    const successRate = (successCount / historical.length) * 100

    // Calculate percentile
    const sortedDurations = [...historical.map(w => w.totalDurationMs), current.totalDurationMs].sort((a, b) => a - b)
    const rank = sortedDurations.indexOf(current.totalDurationMs) + 1
    const durationPercentile = (rank / sortedDurations.length) * 100

    // Determine success rate trend (last 5 runs)
    const recent = historical.slice(-5)
    const recentSuccessRate = (recent.filter(w => w.success).length / recent.length) * 100
    let successRateTrend: 'improving' | 'stable' | 'declining' = 'stable'
    if (recentSuccessRate > successRate + 10) {
      successRateTrend = 'improving'
    } else if (recentSuccessRate < successRate - 10) {
      successRateTrend = 'declining'
    }

    // Performance vs average
    const performanceVsAverage = ((avgDuration - current.totalDurationMs) / avgDuration) * 100

    return {
      averageDuration: avgDuration,
      durationPercentile,
      successRateTrend,
      performanceVsAverage,
      rank,
      totalRuns: historical.length + 1
    }
  }

  /**
   * Calculate overall workflow score (0-10)
   */
  private calculateOverallScore(
    workflowMetrics: WorkflowMetrics,
    stepMetrics: AgentStepMetrics[],
    comparison: HistoricalComparison
  ): number {
    let score = 10.0

    // Success penalty
    if (!workflowMetrics.success) {
      score -= 3.0
    }

    // Retry penalty
    score -= Math.min(workflowMetrics.retryCount * 0.5, 2.0)

    // Performance penalty (if slower than average)
    if (comparison.performanceVsAverage < -20) {
      score -= 1.5
    } else if (comparison.performanceVsAverage < 0) {
      score -= 0.5
    }

    // Confidence bonus/penalty
    const avgConfidence = stepMetrics.reduce((sum, s) => sum + (s.confidenceScore || 0), 0) / stepMetrics.length
    if (avgConfidence > 0.9) {
      score += 0.5
    } else if (avgConfidence < 0.6) {
      score -= 1.0
    }

    // Parallel execution bonus
    if (workflowMetrics.parallelStepsExecuted > 0) {
      score += 0.5
    }

    return Math.max(0, Math.min(10, score))
  }

  /**
   * Calculate confidence in the analysis (0-1)
   */
  private calculateConfidence(historicalRuns: number, stepCount: number): number {
    let confidence = 0.5 // Base confidence

    // More historical data = higher confidence
    if (historicalRuns >= 20) {
      confidence += 0.3
    } else if (historicalRuns >= 10) {
      confidence += 0.2
    } else if (historicalRuns >= 5) {
      confidence += 0.1
    }

    // More steps = more data = higher confidence
    if (stepCount >= 10) {
      confidence += 0.2
    } else if (stepCount >= 5) {
      confidence += 0.1
    }

    return Math.min(1.0, confidence)
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(durationMs: number): string {
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }
}
