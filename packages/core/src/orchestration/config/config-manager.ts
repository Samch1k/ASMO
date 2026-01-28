/**
 * ConfigManager - Manages orchestration configuration with layered loading
 *
 * Loading Strategy (3-tier cascade):
 * 1. Start with defaults (from defaults.ts)
 * 2. Override with config file (orchestration.config.ts if exists)
 * 3. Override with environment variables (if set)
 *
 * Pattern: Mirrors ChecklistManager and TeamManager singleton pattern
 */

import { join } from 'path'
import { existsSync } from 'fs'
import type { OrchestrationConfig } from './types'
import { DEFAULT_ORCHESTRATION_CONFIG } from './defaults'

/**
 * ConfigManager class
 *
 * Manages configuration loading and access for all orchestration components.
 * Implements singleton pattern for global access.
 */
export class ConfigManager {
  private config: OrchestrationConfig
  private initialized = false

  constructor() {
    // Start with defaults
    this.config = this.deepClone(DEFAULT_ORCHESTRATION_CONFIG)
  }

  /**
   * Initialize ConfigManager by loading configuration
   *
   * @param configPath - Optional path to config file
   */
  async initialize(configPath?: string): Promise<void> {
    if (this.initialized) {
      console.warn('⚠️  ConfigManager already initialized')
      return
    }

    // Layer 1: Start with defaults (already loaded in constructor)
    this.config = this.deepClone(DEFAULT_ORCHESTRATION_CONFIG)

    // Layer 2: Load config file if exists
    await this.loadConfigFile(configPath)

    // Layer 3: Override with environment variables
    this.applyEnvironmentOverrides()

    this.initialized = true
    console.log('✅ ConfigManager initialized')
  }

  /**
   * Load configuration from file (Layer 2)
   */
  private async loadConfigFile(configPath?: string): Promise<void> {
    const path =
      configPath ||
      join(
        process.cwd(),
        '.cursor/config/orchestration/orchestration.config.ts'
      )

    // Check if file exists
    if (!existsSync(path)) {
      console.log(
        '💡 No config file found, using defaults (create orchestration.config.ts to customize)'
      )
      return
    }

    try {
      // Dynamic import for TypeScript config file
      const configModule = await import(path)
      const fileConfig: Partial<OrchestrationConfig> =
        configModule.default || configModule.config

      // Deep merge config file with defaults
      this.config = this.deepMerge(this.config, fileConfig)
      console.log(`✅ Loaded config from: ${path}`)
    } catch (error) {
      console.error(`❌ Failed to load config file: ${error}`)
      console.log('💡 Using default configuration')
    }
  }

  /**
   * Apply environment variable overrides (Layer 3)
   */
  private applyEnvironmentOverrides(): void {
    // WorkflowEngine overrides
    if (process.env.MAX_PARALLEL_AGENTS) {
      this.config.workflowEngine.max_parallel_agents = parseInt(
        process.env.MAX_PARALLEL_AGENTS,
        10
      )
      console.log(
        `🔧 ENV override: max_parallel_agents = ${this.config.workflowEngine.max_parallel_agents}`
      )
    }
    if (process.env.DEFAULT_TIMEOUT) {
      this.config.workflowEngine.default_timeout = process.env.DEFAULT_TIMEOUT
      console.log(
        `🔧 ENV override: default_timeout = ${this.config.workflowEngine.default_timeout}`
      )
    }
    if (process.env.CONTINUE_ON_PARTIAL_FAILURE !== undefined) {
      this.config.workflowEngine.continue_on_partial_failure =
        process.env.CONTINUE_ON_PARTIAL_FAILURE === 'true'
      console.log(
        `🔧 ENV override: continue_on_partial_failure = ${this.config.workflowEngine.continue_on_partial_failure}`
      )
    }

    // ApprovalCheckpoint overrides
    if (process.env.AUTO_APPROVE !== undefined) {
      this.config.approvalCheckpoint.autoApprove =
        process.env.AUTO_APPROVE === 'true'
      console.log(
        `🔧 ENV override: autoApprove = ${this.config.approvalCheckpoint.autoApprove}`
      )
    }
    if (process.env.SKIP_CHECKPOINTS !== undefined) {
      this.config.approvalCheckpoint.skipCheckpoints =
        process.env.SKIP_CHECKPOINTS === 'true'
      console.log(
        `🔧 ENV override: skipCheckpoints = ${this.config.approvalCheckpoint.skipCheckpoints}`
      )
    }

    // IterationManager overrides
    if (process.env.MAX_RETRIES) {
      this.config.iterationManager.maxRetries = parseInt(
        process.env.MAX_RETRIES,
        10
      )
      console.log(
        `🔧 ENV override: maxRetries = ${this.config.iterationManager.maxRetries}`
      )
    }
    if (process.env.INITIAL_DELAY_MS) {
      this.config.iterationManager.initialDelayMs = parseInt(
        process.env.INITIAL_DELAY_MS,
        10
      )
      console.log(
        `🔧 ENV override: initialDelayMs = ${this.config.iterationManager.initialDelayMs}`
      )
    }
  }

  /**
   * Deep merge two objects
   */
  private deepMerge<T>(target: T, source: Partial<T>): T {
    if (!source) return target

    const result: any = { ...target }

    for (const key in source) {
      const sourceValue = source[key]
      const targetValue = result[key]

      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        // Recursively merge nested objects
        result[key] = this.deepMerge(targetValue, sourceValue)
      } else {
        // Override with source value (including arrays)
        result[key] = sourceValue
      }
    }

    return result
  }

  /**
   * Deep clone an object
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  }

  /**
   * Get full configuration
   */
  getConfig(): OrchestrationConfig {
    if (!this.initialized) {
      console.warn('⚠️  ConfigManager not initialized, returning defaults')
      return DEFAULT_ORCHESTRATION_CONFIG
    }
    return this.config
  }

  /**
   * Get WorkflowEngine configuration
   */
  getWorkflowEngineConfig() {
    return this.config.workflowEngine
  }

  /**
   * Get IterationManager configuration
   */
  getIterationManagerConfig() {
    return this.config.iterationManager
  }

  /**
   * Get ApprovalCheckpoint configuration
   */
  getApprovalCheckpointConfig() {
    return this.config.approvalCheckpoint
  }

  /**
   * Get PhaseManager configuration
   */
  getPhaseManagerConfig() {
    return this.config.phaseManager
  }

  /**
   * Get MetricsCollector configuration
   */
  getMetricsCollectorConfig() {
    return this.config.metricsCollector
  }

  /**
   * Get LearningLoop configuration
   */
  getLearningLoopConfig() {
    return this.config.learningLoop
  }

  /**
   * Get MetricsOptimizer configuration
   */
  getMetricsOptimizerConfig() {
    return this.config.metricsOptimizer
  }

  /**
   * Check if ConfigManager is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Update configuration at runtime (useful for testing)
   *
   * @param updates - Partial configuration to merge
   */
  updateConfig(updates: Partial<OrchestrationConfig>): void {
    this.config = this.deepMerge(this.config, updates)
    console.log('🔧 Configuration updated at runtime')
  }

  /**
   * Reset to defaults (useful for testing)
   */
  reset(): void {
    this.config = this.deepClone(DEFAULT_ORCHESTRATION_CONFIG)
    this.initialized = false
    console.log('🔄 ConfigManager reset to defaults')
  }
}

// ============================================================================
// SINGLETON PATTERN (matches TeamManager and ChecklistManager)
// ============================================================================

let configManagerInstance: ConfigManager | null = null

/**
 * Get ConfigManager singleton instance
 */
export function getConfigManager(): ConfigManager {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager()
  }
  return configManagerInstance
}

/**
 * Reset ConfigManager singleton (useful for testing)
 */
export function resetConfigManager(): void {
  if (configManagerInstance) {
    configManagerInstance.reset()
  }
  configManagerInstance = null
}
