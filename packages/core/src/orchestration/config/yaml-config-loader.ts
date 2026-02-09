/**
 * YAML Config Loader
 *
 * Variant D: YAML Config + MD Prompts + Optional TS Logic
 *
 * Loads agent and model configurations from YAML files.
 * Provides typed access to configuration with validation.
 */

import * as fs from 'fs'
import * as path from 'path'
import { parse as yamlParse } from 'yaml'
import type { ModelTier } from '../routing-logger'

// =============================================================================
// TYPES - Agent Config
// =============================================================================

export interface AgentSkillConfig {
  id: string
  weight: number
}

export interface AgentRoleConfig {
  id: string
  name: string
  expertise: string[]
  seniority: 'junior' | 'mid' | 'senior' | 'lead'
  allowed_mcps: string[]
}

export interface AgentExecutionConfig {
  max_retries: number
  timeout_ms: number
  min_issues_required?: number  // For adversarial reviewer
}

export interface AgentConfig {
  id: string
  name: string
  description: string
  model_preference: ModelTier
  role: AgentRoleConfig
  skills: AgentSkillConfig[]
  capabilities: string[]
  prompt_template: string
  config: AgentExecutionConfig
}

export interface AgentGroupConfig {
  [groupName: string]: string[]
}

export interface AgentsYamlConfig {
  version: string
  agents: Record<string, AgentConfig>
  groups: AgentGroupConfig
}

// =============================================================================
// TYPES - Model Config
// =============================================================================

export interface ModelCharacteristics {
  reasoning: 'basic' | 'good' | 'excellent'
  speed: 'slow' | 'medium' | 'fast'
  cost: 'low' | 'medium' | 'high'
  context_window: number
  max_output: number
}

export interface ModelExecutionConfig {
  temperature: number
  top_p: number
}

export interface ModelConfig {
  id: ModelTier
  name: string
  provider: string
  model_id: string
  description: string
  characteristics: ModelCharacteristics
  best_for: string[]
  config: ModelExecutionConfig
}

export interface RoutingConfig {
  default_model: ModelTier
  complexity_thresholds: {
    haiku_max: number
    sonnet_max: number
  }
  task_type_overrides: Record<string, ModelTier>
  keyword_inference: Record<ModelTier, string[]>
}

export interface ExecutionModeConfig {
  enabled: boolean
  description: string
  config: Record<string, unknown>
}

export interface CostEstimationConfig {
  input_cost_per_1m: Record<ModelTier, number>
  output_cost_per_1m: Record<ModelTier, number>
  avg_tokens_per_task: Record<string, number>
}

export interface ReliabilityConfig {
  default_retries: number
  initial_retry_delay_ms: number
  retry_multiplier: number
  max_retry_delay_ms: number
  timeouts: Record<ModelTier, number>
  rate_limit: {
    enabled: boolean
    extra_delay_multiplier: number
    max_concurrent_requests: number
  }
}

export interface ModelsYamlConfig {
  version: string
  models: Record<ModelTier, ModelConfig>
  routing: RoutingConfig
  execution_modes: Record<string, ExecutionModeConfig>
  cost_estimation: CostEstimationConfig
  reliability: ReliabilityConfig
}

// =============================================================================
// YAML CONFIG LOADER
// =============================================================================

/**
 * YamlConfigLoader - Loads and validates YAML configuration files
 */
export class YamlConfigLoader {
  private configDir: string
  private agentsConfig: AgentsYamlConfig | null = null
  private modelsConfig: ModelsYamlConfig | null = null

  constructor(configDir?: string) {
    // Fallback chain for finding config directory
    if (configDir) {
      this.configDir = configDir
    } else {
      this.configDir = this.findConfigDir()
    }
  }

  /**
   * Find config directory with fallback chain
   */
  private findConfigDir(): string {
    const possiblePaths = [
      path.join(process.cwd(), 'packages/core/src/orchestration/config'),  // Monorepo dev
      path.join(__dirname),                                                  // Bundled (might work if copied)
      path.join(__dirname, '../orchestration/config'),                       // Relative from dist
      path.join(__dirname, '../../src/orchestration/config'),                // Dist back to src
    ]

    for (const dir of possiblePaths) {
      const agentsPath = path.join(dir, 'agents.yaml')
      if (fs.existsSync(agentsPath)) {
        return dir
      }
    }

    // Default to first path even if not found (will error later with clear message)
    return possiblePaths[0]
  }

  /**
   * Load agents configuration
   */
  loadAgentsConfig(): AgentsYamlConfig {
    if (this.agentsConfig) {
      return this.agentsConfig
    }

    const filePath = path.join(this.configDir, 'agents.yaml')
    this.agentsConfig = this.loadYamlFile<AgentsYamlConfig>(filePath)
    return this.agentsConfig
  }

  /**
   * Load models configuration
   */
  loadModelsConfig(): ModelsYamlConfig {
    if (this.modelsConfig) {
      return this.modelsConfig
    }

    const filePath = path.join(this.configDir, 'models.yaml')
    this.modelsConfig = this.loadYamlFile<ModelsYamlConfig>(filePath)
    return this.modelsConfig
  }

  /**
   * Get agent config by ID
   */
  getAgent(agentId: string): AgentConfig | undefined {
    const config = this.loadAgentsConfig()
    return config.agents[agentId]
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentConfig[] {
    const config = this.loadAgentsConfig()
    return Object.values(config.agents)
  }

  /**
   * Get agents by group
   */
  getAgentsByGroup(groupName: string): AgentConfig[] {
    const config = this.loadAgentsConfig()
    const agentIds = config.groups[groupName] || []
    return agentIds
      .map(id => config.agents[id])
      .filter((a): a is AgentConfig => a !== undefined)
  }

  /**
   * Get agents by skill
   */
  getAgentsBySkill(skillId: string): AgentConfig[] {
    const config = this.loadAgentsConfig()
    return Object.values(config.agents).filter(agent =>
      agent.skills.some(s => s.id === skillId)
    )
  }

  /**
   * Get model config by tier
   */
  getModel(tier: ModelTier): ModelConfig | undefined {
    const config = this.loadModelsConfig()
    return config.models[tier]
  }

  /**
   * Get routing configuration
   */
  getRoutingConfig(): RoutingConfig {
    const config = this.loadModelsConfig()
    return config.routing
  }

  /**
   * Get reliability configuration
   */
  getReliabilityConfig(): ReliabilityConfig {
    const config = this.loadModelsConfig()
    return config.reliability
  }

  /**
   * Get execution mode configuration
   */
  getExecutionMode(mode: string): ExecutionModeConfig | undefined {
    const config = this.loadModelsConfig()
    return config.execution_modes[mode]
  }

  /**
   * Select model for task based on routing rules
   */
  selectModelForTask(
    taskType?: string,
    complexityScore?: number,
    description?: string
  ): ModelTier {
    const routing = this.getRoutingConfig()

    // 1. Check task type override
    if (taskType && routing.task_type_overrides[taskType]) {
      return routing.task_type_overrides[taskType]
    }

    // 2. Check complexity score
    if (complexityScore !== undefined) {
      if (complexityScore <= routing.complexity_thresholds.haiku_max) {
        return 'haiku'
      }
      if (complexityScore <= routing.complexity_thresholds.sonnet_max) {
        return 'sonnet'
      }
      return 'opus'
    }

    // 3. Check keywords in description
    if (description) {
      const lower = description.toLowerCase()

      // Check opus keywords
      if (routing.keyword_inference.opus?.some(k => lower.includes(k))) {
        return 'opus'
      }

      // Check haiku keywords
      if (routing.keyword_inference.haiku?.some(k => lower.includes(k))) {
        return 'haiku'
      }
    }

    // 4. Default
    return routing.default_model
  }

  /**
   * Estimate cost for a task
   */
  estimateCost(
    model: ModelTier,
    inputTokens: number,
    outputTokens: number
  ): { input: number; output: number; total: number } {
    const config = this.loadModelsConfig()
    const cost = config.cost_estimation

    const inputCost = (inputTokens / 1_000_000) * cost.input_cost_per_1m[model]
    const outputCost = (outputTokens / 1_000_000) * cost.output_cost_per_1m[model]

    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost
    }
  }

  /**
   * Reload configuration (clear cache)
   */
  reload(): void {
    this.agentsConfig = null
    this.modelsConfig = null
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  private loadYamlFile<T>(filePath: string): T {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const config = yamlParse(content) as T

    if (!config) {
      throw new Error(`Failed to parse YAML: ${filePath}`)
    }

    return config
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let loaderInstance: YamlConfigLoader | null = null

/**
 * Get singleton YamlConfigLoader instance
 */
export function getYamlConfigLoader(configDir?: string): YamlConfigLoader {
  if (!loaderInstance) {
    loaderInstance = new YamlConfigLoader(configDir)
  }
  return loaderInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetYamlConfigLoader(): void {
  loaderInstance = null
}
