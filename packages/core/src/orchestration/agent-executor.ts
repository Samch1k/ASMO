/**
 * AgentExecutor - Executes agents with retry, timeout, and error handling
 *
 * Features:
 * - Configurable retry with exponential backoff
 * - Timeout handling
 * - Error categorization and recovery
 * - Execution metrics
 */

import type { BaseAgent } from '../agents/base-agent'
import type { AgentState } from '../agents/types'
import type { ModelTier } from './routing-logger'
import { getRoutingLogger } from './routing-logger'
import { getCircuitBreakerManager, CircuitOpenError } from './reliability'
import { categorizeError as categorizeErrorFn, type ErrorCategory } from './errors'

// Re-export ErrorCategory for backward compatibility
export type { ErrorCategory } from './errors'

// Agent execution result (partial state update from execute())
export type AgentExecutionOutput = Partial<AgentState>

// =============================================================================
// TYPES
// =============================================================================

export interface ExecutorConfig {
  /** Maximum retry attempts */
  maxRetries: number
  /** Initial retry delay in ms */
  initialRetryDelay: number
  /** Retry delay multiplier */
  retryMultiplier: number
  /** Maximum retry delay in ms */
  maxRetryDelay: number
  /** Execution timeout in ms */
  timeout: number
  /** Whether to log verbose output */
  verbose: boolean
}

export interface ExecutionContext {
  taskId: string
  agent: BaseAgent
  state: AgentState
  model?: ModelTier
  routingLogId?: string
}

export interface ExecutionResult {
  success: boolean
  result?: AgentExecutionOutput
  error?: Error
  metrics: {
    attempts: number
    totalDuration: number
    retryDelays: number[]
  }
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: ExecutorConfig = {
  maxRetries: 3,
  initialRetryDelay: 1000,
  retryMultiplier: 2,
  maxRetryDelay: 30000,
  timeout: 120000, // 2 minutes
  verbose: false
}

// =============================================================================
// AGENT EXECUTOR
// =============================================================================

/**
 * AgentExecutor - Execute agents with reliability guarantees
 */
export class AgentExecutor {
  private config: ExecutorConfig
  private logger = getRoutingLogger()

  constructor(config?: Partial<ExecutorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute an agent with retry and timeout
   * Protected by circuit breaker to prevent cascading failures
   */
  async execute(context: ExecutionContext): Promise<ExecutionResult> {
    const startTime = Date.now()
    const metrics = {
      attempts: 0,
      totalDuration: 0,
      retryDelays: [] as number[]
    }

    // Get circuit breaker for agent execution
    // Single breaker for all agent executions to prevent cascading failures
    const circuitBreaker = getCircuitBreakerManager().get('agent-execution')

    // Check if circuit is open
    if (circuitBreaker.getState() === 'OPEN') {
      metrics.totalDuration = Date.now() - startTime
      return {
        success: false,
        error: new CircuitOpenError('Circuit breaker open for agent execution - too many failures'),
        metrics
      }
    }

    let lastError: Error | undefined
    let currentDelay = this.config.initialRetryDelay

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      metrics.attempts++

      try {
        if (this.config.verbose) {
          console.log(`🔄 [Executor] Attempt ${attempt + 1}/${this.config.maxRetries + 1} for task ${context.taskId}`)
        }

        const result = await this.executeWithTimeout(context)

        // Success - log outcome
        metrics.totalDuration = Date.now() - startTime

        if (context.routingLogId) {
          this.logger.logOutcome(context.routingLogId, {
            success: true,
            duration: metrics.totalDuration
          })
        }

        return {
          success: true,
          result,
          metrics
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const category = this.categorizeError(lastError)

        if (this.config.verbose) {
          console.log(`⚠️ [Executor] Attempt ${attempt + 1} failed: ${category} - ${lastError.message}`)
        }

        // Don't retry validation errors
        if (category === 'validation') {
          break
        }

        // Don't retry if we've exhausted attempts
        if (attempt >= this.config.maxRetries) {
          break
        }

        // Wait before retry
        metrics.retryDelays.push(currentDelay)
        await this.sleep(currentDelay)

        // Increase delay for next attempt (exponential backoff)
        currentDelay = Math.min(
          currentDelay * this.config.retryMultiplier,
          this.config.maxRetryDelay
        )

        // Extra delay for rate limits
        if (category === 'rate_limit') {
          currentDelay = Math.min(currentDelay * 2, this.config.maxRetryDelay)
        }
      }
    }

    // All attempts failed
    metrics.totalDuration = Date.now() - startTime

    if (context.routingLogId) {
      this.logger.logOutcome(context.routingLogId, {
        success: false,
        duration: metrics.totalDuration,
        error: lastError?.message
      })
    }

    return {
      success: false,
      error: lastError,
      metrics
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout(context: ExecutionContext): Promise<AgentExecutionOutput> {
    return new Promise<AgentExecutionOutput>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Execution timeout after ${this.config.timeout}ms`))
      }, this.config.timeout)

      context.agent.execute(context.state)
        .then(result => {
          clearTimeout(timeoutId)
          resolve(result)
        })
        .catch(error => {
          clearTimeout(timeoutId)
          reject(error)
        })
    })
  }

  /**
   * Categorize error for retry logic
   * Uses shared error-categorizer utility
   */
  private categorizeError(error: Error): ErrorCategory {
    return categorizeErrorFn(error)
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update config
   */
  updateConfig(config: Partial<ExecutorConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current config
   */
  getConfig(): ExecutorConfig {
    return { ...this.config }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let executorInstance: AgentExecutor | null = null

/**
 * Get singleton AgentExecutor instance
 */
export function getAgentExecutor(config?: Partial<ExecutorConfig>): AgentExecutor {
  if (!executorInstance) {
    executorInstance = new AgentExecutor(config)
  }
  return executorInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetAgentExecutor(): void {
  executorInstance = null
}
