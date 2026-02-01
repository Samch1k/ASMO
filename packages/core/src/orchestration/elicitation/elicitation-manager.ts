/**
 * Elicitation Manager - BMAD Integration
 *
 * Manages the application of elicitation techniques to content.
 * Coordinates with agents to apply various thinking techniques
 * for deeper analysis and improved decision-making.
 *
 * @example
 * ```typescript
 * const manager = new ElicitationManager({ verbose: true })
 * const result = await manager.applyElicitation(content, 'first-principles', agent)
 * ```
 */

import { BaseAgent } from '../../agents/base-agent'
import { AgentState } from '../../agents/types'
import {
  ElicitationTechniqueId,
  ElicitationResult,
  ElicitationInsight,
  ElicitationRecommendation,
  ElicitationManagerConfig,
  MultiElicitationResult
} from './types'
import { getTechnique, getAvailableTechniques } from './techniques'

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ElicitationManagerConfig = {
  enabled: true,
  defaultTechniques: ['first-principles', 'pre-mortem'],
  applyToWorkflows: ['create-prd', 'create-architecture'],
  maxInsightsPerTechnique: 10,
  verbose: false
}

/**
 * Elicitation Manager
 *
 * Applies elicitation techniques to content for deeper analysis.
 */
export class ElicitationManager {
  private config: ElicitationManagerConfig

  constructor(config: Partial<ElicitationManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Apply a single elicitation technique to content
   *
   * @param content - Content to analyze
   * @param techniqueId - Technique to apply
   * @param agent - Agent to perform the analysis
   * @param context - Additional context
   * @returns Elicitation result
   */
  async applyElicitation(
    content: string,
    techniqueId: ElicitationTechniqueId,
    agent: BaseAgent,
    context: Record<string, any> = {}
  ): Promise<ElicitationResult> {
    const startTime = Date.now()

    const technique = getTechnique(techniqueId)
    if (!technique) {
      throw new Error(`Unknown elicitation technique: ${techniqueId}`)
    }

    this.log(`Applying ${technique.name} technique...`)

    // Generate the prompt
    const prompt = technique.generatePrompt(content, context)

    // Build agent state
    const state: AgentState = {
      messages: [],
      task: prompt,
      taskType: 'architecture',
      context: {
        ...context,
        elicitationType: techniqueId,
        originalContent: content
      },
      currentAgent: 'elicitation-analyst',
      agentResults: [],
      mcpData: {},
      nextAction: 'analyze',
      requiresApproval: false
    }

    // Execute analysis
    const result = await agent.execute(state)

    // Extract insights and recommendations
    const insights = this.extractInsights(result, techniqueId)
    const recommendations = this.extractRecommendations(result, techniqueId)
    const revisedContent = this.extractRevisedContent(result)

    const durationMs = Date.now() - startTime
    this.log(`${technique.name} complete in ${durationMs}ms`)

    return {
      original: content,
      technique: techniqueId,
      insights: insights.slice(0, this.config.maxInsightsPerTechnique),
      recommendations,
      revisedContent,
      summary: this.generateSummary(insights, recommendations),
      timestamp: new Date().toISOString(),
      durationMs
    }
  }

  /**
   * Apply multiple elicitation techniques to content
   *
   * @param content - Content to analyze
   * @param techniqueIds - Techniques to apply (defaults to config)
   * @param agent - Agent to perform the analysis
   * @param context - Additional context
   * @returns Combined results from all techniques
   */
  async applyMultipleElicitations(
    content: string,
    techniqueIds: ElicitationTechniqueId[] = this.config.defaultTechniques || [],
    agent: BaseAgent,
    context: Record<string, any> = {}
  ): Promise<MultiElicitationResult> {
    const startTime = Date.now()
    const results: ElicitationResult[] = []

    for (const techniqueId of techniqueIds) {
      try {
        const result = await this.applyElicitation(content, techniqueId, agent, context)
        results.push(result)
      } catch (error) {
        this.log(`Failed to apply ${techniqueId}: ${error}`, 'error')
      }
    }

    // Combine all insights and recommendations
    const allInsights = results.flatMap(r => r.insights)
    const allRecommendations = results.flatMap(r => r.recommendations)

    // Deduplicate and prioritize
    const uniqueInsights = this.deduplicateInsights(allInsights)
    const uniqueRecommendations = this.deduplicateRecommendations(allRecommendations)

    return {
      original: content,
      results,
      allInsights: uniqueInsights,
      allRecommendations: uniqueRecommendations,
      finalContent: this.mergeRevisedContent(results),
      summary: this.generateMultiSummary(results, uniqueInsights, uniqueRecommendations),
      totalDurationMs: Date.now() - startTime
    }
  }

  /**
   * Check if elicitation should be applied to a workflow
   *
   * @param workflowId - Workflow identifier
   * @returns true if elicitation should be applied
   */
  shouldApplyToWorkflow(workflowId: string): boolean {
    if (!this.config.enabled) return false
    return this.config.applyToWorkflows?.includes(workflowId) ?? false
  }

  /**
   * Get available techniques
   */
  getAvailableTechniques(): ElicitationTechniqueId[] {
    return getAvailableTechniques()
  }

  /**
   * Get technique details
   */
  getTechniqueDetails(techniqueId: ElicitationTechniqueId) {
    return getTechnique(techniqueId)
  }

  /**
   * Get default techniques
   */
  getDefaultTechniques(): ElicitationTechniqueId[] {
    return this.config.defaultTechniques || []
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ElicitationManagerConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Private methods

  private extractInsights(
    result: Partial<AgentState>,
    source: ElicitationTechniqueId
  ): ElicitationInsight[] {
    const insights: ElicitationInsight[] = []

    // Extract from agent results
    for (const agentResult of result.agentResults || []) {
      if (agentResult.output?.insights) {
        for (const insight of agentResult.output.insights) {
          insights.push(this.normalizeInsight(insight, source))
        }
      }

      // Parse from artifact content
      for (const artifact of agentResult.artifacts || []) {
        const parsed = this.parseInsightsFromContent(artifact.content, source)
        insights.push(...parsed)
      }
    }

    // Extract from context
    if (result.context?.insights && Array.isArray(result.context.insights)) {
      for (const insight of result.context.insights) {
        insights.push(this.normalizeInsight(insight, source))
      }
    }

    return insights
  }

  private extractRecommendations(
    result: Partial<AgentState>,
    source: ElicitationTechniqueId
  ): ElicitationRecommendation[] {
    const recommendations: ElicitationRecommendation[] = []

    for (const agentResult of result.agentResults || []) {
      if (agentResult.output?.recommendations) {
        for (const rec of agentResult.output.recommendations) {
          recommendations.push(this.normalizeRecommendation(rec, source))
        }
      }

      for (const artifact of agentResult.artifacts || []) {
        const parsed = this.parseRecommendationsFromContent(artifact.content, source)
        recommendations.push(...parsed)
      }
    }

    if (result.context?.recommendations && Array.isArray(result.context.recommendations)) {
      for (const rec of result.context.recommendations) {
        recommendations.push(this.normalizeRecommendation(rec, source))
      }
    }

    return recommendations
  }

  private extractRevisedContent(result: Partial<AgentState>): string | undefined {
    // Check context for revised content
    if (result.context?.revisedContent) {
      return result.context.revisedContent
    }

    // Check artifacts for revised content
    for (const agentResult of result.agentResults || []) {
      for (const artifact of agentResult.artifacts || []) {
        if (artifact.metadata?.type === 'revised-content') {
          return artifact.content
        }
      }
    }

    return undefined
  }

  private normalizeInsight(raw: any, source: ElicitationTechniqueId): ElicitationInsight {
    return {
      id: raw.id || this.generateId('insight'),
      category: this.normalizeInsightCategory(raw.category),
      content: raw.content || raw.description || String(raw),
      confidence: typeof raw.confidence === 'number' ? raw.confidence : 0.7,
      source
    }
  }

  private normalizeRecommendation(
    raw: any,
    source: ElicitationTechniqueId
  ): ElicitationRecommendation {
    return {
      id: raw.id || this.generateId('rec'),
      priority: this.normalizePriority(raw.priority),
      content: raw.content || raw.description || String(raw),
      rationale: raw.rationale || '',
      impact: raw.impact || '',
      source
    }
  }

  private normalizeInsightCategory(
    category: any
  ): ElicitationInsight['category'] {
    const valid: ElicitationInsight['category'][] = [
      'assumption', 'risk', 'opportunity', 'question', 'recommendation'
    ]
    const normalized = String(category).toLowerCase()
    return valid.includes(normalized as any) ? (normalized as any) : 'recommendation'
  }

  private normalizePriority(priority: any): 'high' | 'medium' | 'low' {
    const normalized = String(priority).toLowerCase()
    if (normalized === 'high' || normalized === 'critical') return 'high'
    if (normalized === 'low' || normalized === 'minor') return 'low'
    return 'medium'
  }

  private parseInsightsFromContent(
    content: string,
    source: ElicitationTechniqueId
  ): ElicitationInsight[] {
    const insights: ElicitationInsight[] = []

    // Parse markdown list items under "Insights" section
    const insightSection = content.match(/### (?:Key )?Insights\n([\s\S]*?)(?=###|$)/i)
    if (insightSection) {
      const lines = insightSection[1].split('\n').filter(l => l.trim().startsWith('-'))
      for (const line of lines) {
        const text = line.replace(/^-\s*/, '').trim()
        if (text) {
          insights.push({
            id: this.generateId('insight'),
            category: 'recommendation',
            content: text,
            confidence: 0.7,
            source
          })
        }
      }
    }

    return insights
  }

  private parseRecommendationsFromContent(
    content: string,
    source: ElicitationTechniqueId
  ): ElicitationRecommendation[] {
    const recommendations: ElicitationRecommendation[] = []

    // Parse markdown list items under "Recommendations" section
    const recSection = content.match(/### Recommendations\n([\s\S]*?)(?=###|$)/i)
    if (recSection) {
      const lines = recSection[1].split('\n').filter(l => l.trim().startsWith('-'))
      for (const line of lines) {
        const text = line.replace(/^-\s*/, '').trim()
        if (text) {
          recommendations.push({
            id: this.generateId('rec'),
            priority: 'medium',
            content: text,
            rationale: '',
            impact: '',
            source
          })
        }
      }
    }

    return recommendations
  }

  private deduplicateInsights(insights: ElicitationInsight[]): ElicitationInsight[] {
    const seen = new Map<string, ElicitationInsight>()

    for (const insight of insights) {
      const key = insight.content.substring(0, 50).toLowerCase()
      if (!seen.has(key) || seen.get(key)!.confidence < insight.confidence) {
        seen.set(key, insight)
      }
    }

    return Array.from(seen.values())
  }

  private deduplicateRecommendations(
    recommendations: ElicitationRecommendation[]
  ): ElicitationRecommendation[] {
    const seen = new Map<string, ElicitationRecommendation>()

    for (const rec of recommendations) {
      const key = rec.content.substring(0, 50).toLowerCase()
      if (!seen.has(key)) {
        seen.set(key, rec)
      }
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return Array.from(seen.values()).sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    )
  }

  private mergeRevisedContent(results: ElicitationResult[]): string | undefined {
    // Return the most recent revised content
    for (const result of [...results].reverse()) {
      if (result.revisedContent) {
        return result.revisedContent
      }
    }
    return undefined
  }

  private generateSummary(
    insights: ElicitationInsight[],
    recommendations: ElicitationRecommendation[]
  ): string {
    return [
      `Elicitation Analysis Complete`,
      `- ${insights.length} insights discovered`,
      `- ${recommendations.length} recommendations generated`,
      insights.length > 0 ? `Top insight: ${insights[0].content.substring(0, 100)}...` : ''
    ]
      .filter(Boolean)
      .join('\n')
  }

  private generateMultiSummary(
    results: ElicitationResult[],
    insights: ElicitationInsight[],
    recommendations: ElicitationRecommendation[]
  ): string {
    const techniques = results.map(r => r.technique).join(', ')
    return [
      `Multi-Technique Elicitation Complete`,
      `- Techniques applied: ${techniques}`,
      `- Total insights: ${insights.length}`,
      `- Total recommendations: ${recommendations.length}`,
      `- Total duration: ${results.reduce((sum, r) => sum + r.durationMs, 0)}ms`
    ].join('\n')
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  }

  private log(message: string, level: 'info' | 'error' = 'info'): void {
    if (this.config.verbose) {
      if (level === 'error') {
        console.error(`[ElicitationManager] ${message}`)
      } else {
        console.log(`[ElicitationManager] ${message}`)
      }
    }
  }
}
