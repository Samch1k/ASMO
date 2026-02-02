/**
 * ExecutorFactory - Creates and manages execution mode selection
 *
 * Provides unified interface for Session and API execution modes.
 * Automatically selects the best available executor.
 */

import { SessionExecutor, getSessionExecutor, type SessionExecutorConfig } from './session-executor'
import { APIExecutor, getAPIExecutor, type APIExecutorConfig } from './api-executor'
import type { AgentState } from '../../agents/types'
import type { ModelTier } from '../routing-logger'
import type { AgentExecutionOutput } from '../agent-executor'

// =============================================================================
// TYPES
// =============================================================================

export type ExecutionMode = 'session' | 'api' | 'auto'

export interface ExecutorFactoryConfig {
  /** Preferred execution mode */
  preferredMode: ExecutionMode
  /** Session executor config */
  session?: Partial<SessionExecutorConfig>
  /** API executor config */
  api?: Partial<APIExecutorConfig>
  /** Enable verbose logging */
  verbose: boolean
}

export interface UnifiedExecutionContext {
  taskId: string
  prompt: string
  state: AgentState
  model?: ModelTier
  systemPrompt?: string
  /** Override execution mode for this task */
  mode?: ExecutionMode
}

export interface UnifiedExecutionResult {
  success: boolean
  output?: AgentExecutionOutput
  rawResponse?: string
  error?: string
  metrics: {
    duration: number
    mode: 'session' | 'api'
    model?: string
    inputTokens?: number
    outputTokens?: number
    estimatedCost?: number
  }
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: ExecutorFactoryConfig = {
  preferredMode: 'auto',
  verbose: false
}

// =============================================================================
// EXECUTOR FACTORY
// =============================================================================

/**
 * ExecutorFactory - Unified execution interface
 *
 * Manages both Session and API executors, automatically selecting
 * the best available option based on configuration and availability.
 */
export class ExecutorFactory {
  private config: ExecutorFactoryConfig
  private sessionExecutor: SessionExecutor
  private apiExecutor: APIExecutor

  constructor(config?: Partial<ExecutorFactoryConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.sessionExecutor = getSessionExecutor(config?.session)
    this.apiExecutor = getAPIExecutor(config?.api)
  }

  /**
   * Execute a task using the appropriate executor
   */
  async execute(context: UnifiedExecutionContext): Promise<UnifiedExecutionResult> {
    const mode = this.resolveExecutionMode(context.mode)

    if (this.config.verbose) {
      console.log(`🔀 [ExecutorFactory] Resolved mode: ${mode}`)
    }

    if (mode === 'session') {
      return this.executeWithSession(context)
    } else {
      return this.executeWithAPI(context)
    }
  }

  /**
   * Execute using session mode
   */
  private async executeWithSession(
    context: UnifiedExecutionContext
  ): Promise<UnifiedExecutionResult> {
    const result = await this.sessionExecutor.execute({
      taskId: context.taskId,
      prompt: context.prompt,
      state: context.state,
      model: context.model
    })

    return {
      success: result.success,
      output: result.output,
      rawResponse: result.rawResponse,
      error: result.error,
      metrics: {
        duration: result.metrics.duration,
        mode: 'session'
      }
    }
  }

  /**
   * Execute using API mode
   */
  private async executeWithAPI(
    context: UnifiedExecutionContext
  ): Promise<UnifiedExecutionResult> {
    const result = await this.apiExecutor.execute({
      taskId: context.taskId,
      prompt: context.prompt,
      state: context.state,
      model: context.model || 'sonnet',
      systemPrompt: context.systemPrompt
    })

    return {
      success: result.success,
      output: result.output,
      rawResponse: result.rawResponse,
      error: result.error,
      metrics: {
        duration: result.metrics.duration,
        mode: 'api',
        model: result.metrics.model,
        inputTokens: result.metrics.inputTokens,
        outputTokens: result.metrics.outputTokens,
        estimatedCost: result.metrics.estimatedCost
      }
    }
  }

  /**
   * Resolve which execution mode to use
   */
  private resolveExecutionMode(override?: ExecutionMode): 'session' | 'api' {
    const requested = override || this.config.preferredMode

    // If specific mode requested and available, use it
    if (requested === 'session' && this.sessionExecutor.isAvailable()) {
      return 'session'
    }

    if (requested === 'api' && this.apiExecutor.isAvailable()) {
      return 'api'
    }

    // Auto mode: prefer session (free), fall back to API
    if (requested === 'auto') {
      if (this.sessionExecutor.isAvailable()) {
        return 'session'
      }
      if (this.apiExecutor.isAvailable()) {
        return 'api'
      }
    }

    // Default to session if nothing else works
    // (session mode is always "available" in Claude Code)
    return 'session'
  }

  /**
   * Get available execution modes
   */
  getAvailableModes(): Array<{
    mode: 'session' | 'api'
    available: boolean
    info: ReturnType<SessionExecutor['getInfo']> | ReturnType<APIExecutor['getInfo']>
  }> {
    return [
      {
        mode: 'session',
        available: this.sessionExecutor.isAvailable(),
        info: this.sessionExecutor.getInfo()
      },
      {
        mode: 'api',
        available: this.apiExecutor.isAvailable(),
        info: this.apiExecutor.getInfo()
      }
    ]
  }

  /**
   * Get the preferred/resolved mode
   */
  getPreferredMode(): 'session' | 'api' {
    return this.resolveExecutionMode()
  }

  /**
   * Set preferred mode
   */
  setPreferredMode(mode: ExecutionMode): void {
    this.config.preferredMode = mode
  }

  /**
   * Get executor info summary
   */
  getInfo(): {
    preferredMode: ExecutionMode
    resolvedMode: 'session' | 'api'
    sessionAvailable: boolean
    apiAvailable: boolean
  } {
    return {
      preferredMode: this.config.preferredMode,
      resolvedMode: this.resolveExecutionMode(),
      sessionAvailable: this.sessionExecutor.isAvailable(),
      apiAvailable: this.apiExecutor.isAvailable()
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ExecutorFactoryConfig>): void {
    this.config = { ...this.config, ...config }

    if (config.session) {
      this.sessionExecutor.updateConfig(config.session)
    }
    if (config.api) {
      this.apiExecutor.updateConfig(config.api)
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let factoryInstance: ExecutorFactory | null = null

/**
 * Get singleton ExecutorFactory instance
 */
export function getExecutorFactory(config?: Partial<ExecutorFactoryConfig>): ExecutorFactory {
  if (!factoryInstance) {
    factoryInstance = new ExecutorFactory(config)
  }
  return factoryInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetExecutorFactory(): void {
  factoryInstance = null
}
