/**
 * Elicitation Types - BMAD Integration
 *
 * Type definitions for the Advanced Elicitation module.
 */

/**
 * Available elicitation technique identifiers
 */
export type ElicitationTechniqueId =
  | 'first-principles'
  | 'red-team-blue-team'
  | 'pre-mortem'
  | 'socratic'
  | 'devils-advocate'

/**
 * Elicitation technique interface
 */
export interface ElicitationTechnique {
  /** Unique identifier */
  id: ElicitationTechniqueId
  /** Human-readable name */
  name: string
  /** Description of the technique */
  description: string
  /** When to use this technique */
  useCase: string
  /** Generate a prompt for this technique */
  generatePrompt(content: string, context?: Record<string, any>): string
}

/**
 * Insight extracted from elicitation
 */
export interface ElicitationInsight {
  /** Insight identifier */
  id: string
  /** Category of insight */
  category: 'assumption' | 'risk' | 'opportunity' | 'question' | 'recommendation'
  /** Insight content */
  content: string
  /** Confidence level (0-1) */
  confidence: number
  /** Source technique that generated this insight */
  source: ElicitationTechniqueId
}

/**
 * Recommendation from elicitation
 */
export interface ElicitationRecommendation {
  /** Recommendation identifier */
  id: string
  /** Priority level */
  priority: 'high' | 'medium' | 'low'
  /** Recommendation content */
  content: string
  /** Rationale for this recommendation */
  rationale: string
  /** Expected impact */
  impact: string
  /** Source technique */
  source: ElicitationTechniqueId
}

/**
 * Result of applying an elicitation technique
 */
export interface ElicitationResult {
  /** Original content that was analyzed */
  original: string
  /** Technique used */
  technique: ElicitationTechniqueId
  /** Insights discovered */
  insights: ElicitationInsight[]
  /** Recommendations generated */
  recommendations: ElicitationRecommendation[]
  /** Revised content (if applicable) */
  revisedContent?: string
  /** Summary of the elicitation */
  summary: string
  /** Timestamp of analysis */
  timestamp: string
  /** Duration of analysis in milliseconds */
  durationMs: number
}

/**
 * Configuration for ElicitationManager
 */
export interface ElicitationManagerConfig {
  /** Enable elicitation (default: true) */
  enabled?: boolean
  /** Default techniques to apply */
  defaultTechniques?: ElicitationTechniqueId[]
  /** Workflows that should have elicitation applied */
  applyToWorkflows?: string[]
  /** Maximum insights per technique */
  maxInsightsPerTechnique?: number
  /** Enable verbose logging */
  verbose?: boolean
}

/**
 * Multi-technique elicitation result
 */
export interface MultiElicitationResult {
  /** Original content */
  original: string
  /** Results from each technique */
  results: ElicitationResult[]
  /** Combined insights from all techniques */
  allInsights: ElicitationInsight[]
  /** Combined recommendations from all techniques */
  allRecommendations: ElicitationRecommendation[]
  /** Final revised content (merged from all techniques) */
  finalContent?: string
  /** Overall summary */
  summary: string
  /** Total duration */
  totalDurationMs: number
}
