/**
 * TaskRouter - Intelligent routing of tasks to agents and models
 *
 * Routes tasks based on:
 * - Task complexity (trivial → enterprise)
 * - Required skills
 * - Model capabilities (Opus for complex, Haiku for simple)
 * - Agent specializations
 */

import type { ModelTier, RoutingDecision } from './routing-logger'
import { getRoutingLogger } from './routing-logger'
import type { ComplexityLevel } from './task-persister'

// =============================================================================
// TYPES
// =============================================================================

export interface RoutingConfig {
  /** Default model for unknown complexity */
  defaultModel: ModelTier
  /** Complexity thresholds for model selection */
  complexityThresholds: {
    haiku: number    // <= this score uses haiku
    sonnet: number   // <= this score uses sonnet
    // > sonnet threshold uses opus
  }
  /** Model overrides by task type */
  taskTypeOverrides?: Record<string, ModelTier>
  /** Agent preferences by skill */
  agentPreferences?: Record<string, string[]>
}

export interface TaskContext {
  id: string
  description: string
  taskType?: string
  complexity?: {
    score: number
    level: ComplexityLevel
  }
  requiredSkills?: string[]
  preferredAgent?: string
  metadata?: Record<string, unknown>
}

export interface RoutingResult {
  model: ModelTier
  agent?: string
  rationale: string
  alternatives?: Array<{
    model: ModelTier
    agent?: string
    reason: string
  }>
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: RoutingConfig = {
  defaultModel: 'sonnet',
  complexityThresholds: {
    haiku: 30,   // Trivial/Simple tasks
    sonnet: 70   // Medium/Complex tasks (>70 = Opus)
  },
  taskTypeOverrides: {
    // Quick tasks → Haiku
    'quick_fix': 'haiku',
    'simple_query': 'haiku',
    'documentation': 'haiku',
    'code_formatting': 'haiku',

    // Balanced tasks → Sonnet
    'code_review': 'sonnet',
    'bug_fix': 'sonnet',
    'feature_implementation': 'sonnet',
    'refactoring': 'sonnet',

    // Complex tasks → Opus
    'architecture_design': 'opus',
    'security_audit': 'opus',
    'system_design': 'opus',
    'complex_debugging': 'opus',
    'performance_optimization': 'opus'
  },
  agentPreferences: {
    'code_review': ['code_reviewer', 'senior_developer'],
    'architecture': ['architect', 'senior_developer'],
    'testing': ['test_architect', 'tester'],
    'documentation': ['tech_writer', 'product_manager'],
    'security': ['security_analyst', 'architect']
  }
}

// =============================================================================
// TASK ROUTER
// =============================================================================

/**
 * TaskRouter - Routes tasks to appropriate models and agents
 */
export class TaskRouter {
  private config: RoutingConfig
  private logger = getRoutingLogger()

  constructor(config?: Partial<RoutingConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      complexityThresholds: {
        ...DEFAULT_CONFIG.complexityThresholds,
        ...config?.complexityThresholds
      }
    }
  }

  /**
   * Route a task to model and optionally agent
   */
  route(task: TaskContext): RoutingResult {
    const model = this.selectModel(task)
    const agent = this.selectAgent(task)
    const rationale = this.buildRationale(task, model, agent)

    // Log the decision
    const decision: RoutingDecision = {
      taskId: task.id,
      taskDescription: task.description,
      selectedModel: model,
      selectedAgent: agent,
      rationale,
      complexity: task.complexity?.score,
      timestamp: new Date()
    }
    this.logger.logDecision(decision)

    return {
      model,
      agent,
      rationale,
      alternatives: this.getAlternatives(task, model)
    }
  }

  /**
   * Select model based on task characteristics
   */
  private selectModel(task: TaskContext): ModelTier {
    // 1. Check task type override
    if (task.taskType && this.config.taskTypeOverrides?.[task.taskType]) {
      return this.config.taskTypeOverrides[task.taskType]
    }

    // 2. Check complexity score (normalize to 0-100 range)
    if (task.complexity?.score !== undefined) {
      const score = Math.max(0, Math.min(100, task.complexity.score))
      if (score <= this.config.complexityThresholds.haiku) {
        return 'haiku'
      }
      if (score <= this.config.complexityThresholds.sonnet) {
        return 'sonnet'
      }
      return 'opus'
    }

    // 3. Check complexity level
    if (task.complexity?.level) {
      return this.modelFromLevel(task.complexity.level)
    }

    // 4. Infer from keywords in description
    return this.inferModelFromDescription(task.description)
  }

  /**
   * Select agent based on task skills
   */
  private selectAgent(task: TaskContext): string | undefined {
    // 1. Respect preferred agent
    if (task.preferredAgent) {
      return task.preferredAgent
    }

    // 2. Match by required skills
    if (task.requiredSkills?.length) {
      for (const skill of task.requiredSkills) {
        const agents = this.config.agentPreferences?.[skill]
        if (agents?.length) {
          return agents[0] // Return first preferred agent for this skill
        }
      }
    }

    // 3. Match by task type
    if (task.taskType) {
      const agents = this.config.agentPreferences?.[task.taskType]
      if (agents?.length) {
        return agents[0]
      }
    }

    // No specific agent needed
    return undefined
  }

  /**
   * Convert complexity level to model
   */
  private modelFromLevel(level: ComplexityLevel): ModelTier {
    const levelMap: Record<ComplexityLevel, ModelTier> = {
      trivial: 'haiku',
      simple: 'haiku',
      medium: 'sonnet',
      complex: 'sonnet',
      enterprise: 'opus'
    }
    return levelMap[level]
  }

  /**
   * Infer model from description keywords
   */
  private inferModelFromDescription(description: string): ModelTier {
    const lower = description.toLowerCase()

    // Opus indicators
    const opusKeywords = [
      'architect', 'design system', 'security audit', 'complex',
      'enterprise', 'scalab', 'migration', 'critical'
    ]
    if (opusKeywords.some(k => lower.includes(k))) {
      return 'opus'
    }

    // Haiku indicators
    const haikuKeywords = [
      'simple', 'quick', 'typo', 'format', 'trivial',
      'minor', 'small fix', 'update comment', 'rename'
    ]
    if (haikuKeywords.some(k => lower.includes(k))) {
      return 'haiku'
    }

    // Default to sonnet
    return this.config.defaultModel
  }

  /**
   * Build human-readable rationale
   */
  private buildRationale(task: TaskContext, model: ModelTier, agent?: string): string {
    const parts: string[] = []

    if (task.complexity?.score !== undefined) {
      parts.push(`Complexity score ${task.complexity.score} (${task.complexity.level})`)
    }

    if (task.taskType) {
      parts.push(`Task type: ${task.taskType}`)
    }

    parts.push(`Selected model: ${model}`)

    if (agent) {
      parts.push(`Assigned agent: ${agent}`)
    }

    return parts.join(' → ')
  }

  /**
   * Get alternative routing options
   */
  private getAlternatives(
    _task: TaskContext,
    selectedModel: ModelTier
  ): RoutingResult['alternatives'] {
    const alternatives: RoutingResult['alternatives'] = []

    // Always include adjacent models as alternatives
    if (selectedModel !== 'opus') {
      alternatives.push({
        model: 'opus',
        reason: 'For maximum quality and complex reasoning'
      })
    }

    if (selectedModel !== 'haiku') {
      alternatives.push({
        model: 'haiku',
        reason: 'For faster response and lower cost'
      })
    }

    return alternatives
  }

  /**
   * Update routing config
   */
  updateConfig(config: Partial<RoutingConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      complexityThresholds: {
        ...this.config.complexityThresholds,
        ...config?.complexityThresholds
      }
    }
  }

  /**
   * Get current config
   */
  getConfig(): RoutingConfig {
    return { ...this.config }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let routerInstance: TaskRouter | null = null

/**
 * Get singleton TaskRouter instance
 */
export function getTaskRouter(config?: Partial<RoutingConfig>): TaskRouter {
  if (!routerInstance) {
    routerInstance = new TaskRouter(config)
  }
  return routerInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetTaskRouter(): void {
  routerInstance = null
}
