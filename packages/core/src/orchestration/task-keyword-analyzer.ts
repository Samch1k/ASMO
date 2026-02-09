/**
 * TaskKeywordAnalyzer - Centralized keyword-based task analysis
 *
 * Consolidates keyword matching logic from ComplexityAnalyzer and TaskRouter
 * to eliminate duplication and provide consistent task classification.
 */

export interface KeywordMatch {
  /** Matched keyword category */
  category: KeywordCategory
  /** Matched keywords */
  keywords: string[]
  /** Confidence score (0-1) */
  confidence: number
}

export type KeywordCategory =
  | 'trivial'
  | 'bug_fix'
  | 'architecture'
  | 'security'
  | 'performance'
  | 'database'
  | 'refactoring'
  | 'api'
  | 'feature'
  | 'high_risk'
  | 'data_impact'
  | 'security_impact'
  | 'performance_impact'

export interface KeywordAnalysisResult {
  /** Primary category (most confident match) */
  primaryCategory: KeywordCategory | null
  /** All matched categories */
  matches: KeywordMatch[]
  /** Impact flags */
  impacts: {
    dataChanges: boolean
    securityImpact: boolean
    performanceImpact: boolean
    highRisk: boolean
  }
}

/**
 * Keyword patterns organized by category
 */
const KEYWORD_PATTERNS: Record<KeywordCategory, string[]> = {
  // Trivial tasks (P1 - highest specificity)
  trivial: [
    'typo',
    'text change',
    'update text',
    'rename',
    'format',
    'minor',
    'small fix',
    'update comment'
  ],

  // Bug fixes (P2 - specific intent)
  bug_fix: [
    'bug',
    'fix',
    'error',
    'memory leak',
    'crash',
    'debug'
  ],

  // Architecture/Design (P3 - high complexity)
  architecture: [
    'architecture',
    'design system',
    'system design',
    'entire system',
    'scalab' // matches scalable, scalability
  ],

  // Security/Auth (P3 - critical)
  security: [
    'security',
    'auth',
    'encryption',
    'oauth',
    'security audit',
    'critical'
  ],

  // Performance (P4)
  performance: [
    'performance',
    'optimize',
    'speed',
    'faster'
  ],

  // Database/Migration (P5)
  database: [
    'database',
    'migration',
    'schema',
    'postgres',
    'mongodb',
    'sql'
  ],

  // Refactoring (P6)
  refactoring: [
    'refactor',
    'cleanup',
    'improve' // only when not combined with "add"
  ],

  // API Design (P7)
  api: [
    'api',
    'endpoint',
    'rest',
    'graphql'
  ],

  // New Features (P8 - lowest priority)
  feature: [
    'add',
    'create',
    'implement',
    'feature'
  ],

  // High-risk modifiers (cross-category)
  high_risk: [
    'core',
    'modify',
    'redesign',
    'migrate'
  ],

  // Impact flags (can be combined with any category)
  data_impact: [
    'database',
    'schema',
    'migration',
    'data'
  ],

  security_impact: [
    'security',
    'auth',
    'encryption',
    'credential'
  ],

  performance_impact: [
    'performance',
    'optimize',
    'speed',
    'cache'
  ]
}

/**
 * TaskKeywordAnalyzer - Analyze task descriptions using keyword matching
 */
export class TaskKeywordAnalyzer {
  /**
   * Analyze task description and return matched categories
   *
   * @param taskDescription - User's task description
   * @returns Analysis result with matched categories and impacts
   */
  analyze(taskDescription: string): KeywordAnalysisResult {
    const taskLower = taskDescription.toLowerCase()
    const matches: KeywordMatch[] = []

    // Analyze each category
    for (const [category, keywords] of Object.entries(KEYWORD_PATTERNS)) {
      const matchedKeywords = keywords.filter(kw => 
        this.matchKeyword(taskLower, kw, category as KeywordCategory)
      )

      if (matchedKeywords.length > 0) {
        matches.push({
          category: category as KeywordCategory,
          keywords: matchedKeywords,
          confidence: this.calculateConfidence(matchedKeywords, keywords.length)
        })
      }
    }

    // Sort matches by confidence (highest first)
    matches.sort((a, b) => b.confidence - a.confidence)

    // Determine primary category (exclude impact flags)
    const primaryMatch = matches.find(m => 
      !['high_risk', 'data_impact', 'security_impact', 'performance_impact'].includes(m.category)
    )

    // Extract impact flags
    const impacts = {
      dataChanges: matches.some(m => m.category === 'data_impact' || m.category === 'database'),
      securityImpact: matches.some(m => m.category === 'security_impact' || m.category === 'security'),
      performanceImpact: matches.some(m => m.category === 'performance_impact' || m.category === 'performance'),
      highRisk: matches.some(m => m.category === 'high_risk')
    }

    return {
      primaryCategory: primaryMatch?.category ?? null,
      matches,
      impacts
    }
  }

  /**
   * Match keyword with special rules
   */
  private matchKeyword(taskLower: string, keyword: string, category: KeywordCategory): boolean {
    // Special case: "improve" should not match if "add" is present (refactoring)
    if (category === 'refactoring' && keyword === 'improve') {
      return taskLower.includes('improve') && !taskLower.includes('add')
    }

    // Special case: "entire" + "system" combination for architecture
    if (category === 'architecture' && keyword === 'entire system') {
      return taskLower.includes('entire') && taskLower.includes('system')
    }

    // Special case: "design" + "implement" combination
    if (category === 'architecture' && keyword === 'design system') {
      if (taskLower.includes('design system')) return true
      return taskLower.includes('design') && taskLower.includes('implement')
    }

    // Default: simple substring match
    return taskLower.includes(keyword)
  }

  /**
   * Calculate confidence score based on matches
   */
  private calculateConfidence(matchedKeywords: string[], totalKeywords: number): number {
    // Base confidence from match ratio
    const matchRatio = matchedKeywords.length / totalKeywords
    
    // Boost confidence for multiple matches (stronger signal)
    const multiMatchBoost = Math.min(matchedKeywords.length * 0.1, 0.3)
    
    // Final confidence capped at 1.0
    return Math.min(matchRatio + multiMatchBoost, 1.0)
  }

  /**
   * Check if task matches a specific category
   *
   * @param taskDescription - Task description
   * @param category - Category to check
   * @returns True if task matches category
   */
  hasCategory(taskDescription: string, category: KeywordCategory): boolean {
    const result = this.analyze(taskDescription)
    return result.matches.some(m => m.category === category)
  }

  /**
   * Get all matching categories for a task
   *
   * @param taskDescription - Task description
   * @returns Array of matched category names
   */
  getCategories(taskDescription: string): KeywordCategory[] {
    const result = this.analyze(taskDescription)
    return result.matches.map(m => m.category)
  }

  /**
   * Get complexity estimate based on keyword analysis (for heuristics)
   *
   * @param taskDescription - Task description
   * @returns Estimated complexity score (0-100)
   */
  estimateComplexity(taskDescription: string): number {
    const result = this.analyze(taskDescription)

    if (!result.primaryCategory) {
      return 30 // Default: simple task
    }

    // Map categories to complexity scores
    const complexityMap: Record<KeywordCategory, number> = {
      trivial: 15,
      bug_fix: 25,
      architecture: 75,
      security: 70,
      performance: 65,
      database: 60,
      refactoring: 50,
      api: 50,
      feature: 55,
      high_risk: 0,        // Modifier only
      data_impact: 0,      // Modifier only
      security_impact: 0,  // Modifier only
      performance_impact: 0 // Modifier only
    }

    let score = complexityMap[result.primaryCategory]

    // Apply high-risk modifier (+10)
    if (result.impacts.highRisk) {
      score += 10
    }

    return Math.min(score, 100)
  }

  /**
   * Get model tier recommendation based on keywords
   *
   * @param taskDescription - Task description
   * @returns Recommended model tier
   */
  recommendModelTier(taskDescription: string): 'haiku' | 'sonnet' | 'opus' {
    const result = this.analyze(taskDescription)

    // Opus-tier categories
    const opusTier: KeywordCategory[] = ['architecture', 'security']
    if (result.matches.some(m => opusTier.includes(m.category))) {
      return 'opus'
    }

    // Haiku-tier categories
    const haikuTier: KeywordCategory[] = ['trivial']
    if (result.matches.some(m => haikuTier.includes(m.category))) {
      return 'haiku'
    }

    // Default: Sonnet
    return 'sonnet'
  }
}
