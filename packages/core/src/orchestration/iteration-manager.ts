/**
 * IterationManager - Retry logic with exponential backoff for agent execution
 *
 * Day 9: Iteration & Retry Logic
 *
 * Features:
 * - Configurable retry attempts (default: 3)
 * - Exponential backoff (1s, 2s, 4s, 8s, ...)
 * - Failure categorization (retryable vs fatal)
 * - Iteration history tracking
 * - Error recovery strategies
 *
 * Usage:
 * ```typescript
 * const iterationManager = new IterationManager()
 * const result = await iterationManager.executeWithRetry(agent, state)
 * ```
 */

import { AgentState } from '../agents/types'
import { BaseAgent } from '../agents/base-agent'
import { getConfigManager } from './config/config-manager'

export interface RetryConfig {
  maxRetries?: number
  initialDelayMs?: number
  backoffMultiplier?: number
  maxDelayMs?: number
  retryableErrors?: string[]
  fatalErrors?: string[]
}

export interface IterationAttempt {
  attemptNumber: number
  timestamp: string
  agentId: string
  success: boolean
  duration: number
  error?: {
    type: string
    message: string
    isRetryable: boolean
  }
  backoffDelay?: number
}

export interface IterationResult {
  success: boolean
  attempts: IterationAttempt[]
  totalAttempts: number
  totalDuration: number
  finalOutput?: Partial<AgentState>
  finalError?: Error
}

export enum ErrorCategory {
  RETRYABLE = 'retryable',
  FATAL = 'fatal',
  UNKNOWN = 'unknown'
}

export interface ErrorClassification {
  category: ErrorCategory
  reason: string
  suggestedAction: string
}

/**
 * IterationManager - Handles retry logic with exponential backoff
 */
export class IterationManager {
  private config: Required<RetryConfig>
  private history: Map<string, IterationResult[]> = new Map()

  // Default retryable error patterns
  private defaultRetryableErrors = [
    'timeout',
    'ETIMEDOUT',
    'ECONNREFUSED',
    'ECONNRESET',
    'EPIPE',
    'rate_limit',
    'rate limit',
    'too many requests',
    'service unavailable',
    'temporarily unavailable',
    'ENOTFOUND',
    'network error',
    'fetch failed',
    'socket hang up'
  ]

  // Default fatal error patterns
  private defaultFatalErrors = [
    'invalid input',
    'validation failed',
    'unauthorized',
    'forbidden',
    'not found',
    'security violation',
    'authentication failed',
    'permission denied',
    'business rule',
    'constraint violation',
    'duplicate key',
    'invalid state'
  ]

  constructor(config: RetryConfig = {}) {
    // ✨ Priority 2: Try to load config from ConfigManager if not explicitly provided
    const configManager = getConfigManager()
    let effectiveConfig = config

    // If no explicit config provided and ConfigManager is initialized, use ConfigManager config
    if (Object.keys(config).length === 0 && configManager.isInitialized()) {
      effectiveConfig = configManager.getIterationManagerConfig()
    }

    this.config = {
      maxRetries: effectiveConfig.maxRetries ?? 3,
      initialDelayMs: effectiveConfig.initialDelayMs ?? 1000, // 1 second
      backoffMultiplier: effectiveConfig.backoffMultiplier ?? 2, // Exponential: 1s, 2s, 4s, 8s
      maxDelayMs: effectiveConfig.maxDelayMs ?? 60000, // Max 1 minute delay
      retryableErrors: effectiveConfig.retryableErrors ?? this.defaultRetryableErrors,
      fatalErrors: effectiveConfig.fatalErrors ?? this.defaultFatalErrors
    }

    console.log(`✨ IterationManager: Retry logic enabled (max ${this.config.maxRetries} retries)`)
  }

  /**
   * Execute agent with retry logic
   * Main entry point for agent execution with automatic retries
   */
  async executeWithRetry(
    agent: BaseAgent,
    state: AgentState,
    maxRetries?: number
  ): Promise<IterationResult> {
    const retries = maxRetries ?? this.config.maxRetries
    const attempts: IterationAttempt[] = []
    const startTime = Date.now()

    let lastError: Error | null = null
    let finalOutput: Partial<AgentState> | undefined

    console.log(`\n🔄 Executing ${agent.constructor.name} with retry logic (max ${retries} retries)`)

    for (let attempt = 0; attempt <= retries; attempt++) {
      const attemptStart = Date.now()
      const attemptNumber = attempt + 1

      try {
        console.log(`   Attempt ${attemptNumber}/${retries + 1}...`)

        // Execute agent
        const output = await agent.execute(state)

        // Success!
        const duration = Date.now() - attemptStart
        console.log(`   ✅ Success in ${(duration / 1000).toFixed(2)}s`)

        attempts.push({
          attemptNumber,
          timestamp: new Date().toISOString(),
          agentId: agent.constructor.name,
          success: true,
          duration
        })

        finalOutput = output

        const totalDuration = Date.now() - startTime
        const result: IterationResult = {
          success: true,
          attempts,
          totalAttempts: attemptNumber,
          totalDuration,
          finalOutput
        }

        // Store in history
        this.recordIteration(agent.constructor.name, result)

        return result

      } catch (error: any) {
        lastError = error
        const duration = Date.now() - attemptStart

        // Classify error
        const classification = this.classifyError(error)

        console.error(`   ❌ Attempt ${attemptNumber} failed: ${error.message}`)
        console.error(`   Error Category: ${classification.category}`)

        // Record attempt
        attempts.push({
          attemptNumber,
          timestamp: new Date().toISOString(),
          agentId: agent.constructor.name,
          success: false,
          duration,
          error: {
            type: error.name || 'Error',
            message: error.message,
            isRetryable: classification.category === ErrorCategory.RETRYABLE
          }
        })

        // Check if error is retryable
        if (classification.category === ErrorCategory.FATAL) {
          console.error(`   🛑 Fatal error - cannot retry: ${classification.reason}`)
          break
        }

        // Check if we've exhausted retries
        if (attempt >= retries) {
          console.error(`   🛑 Max retries (${retries}) exhausted`)
          break
        }

        // Calculate backoff delay
        const backoffDelay = this.calculateBackoffDelay(attempt)
        attempts[attempts.length - 1].backoffDelay = backoffDelay

        console.log(`   ⏳ Retrying in ${(backoffDelay / 1000).toFixed(1)}s...`)
        console.log(`   Suggested Action: ${classification.suggestedAction}`)

        // Wait before retry
        await this.sleep(backoffDelay)
      }
    }

    // All retries exhausted or fatal error
    const totalDuration = Date.now() - startTime

    const result: IterationResult = {
      success: false,
      attempts,
      totalAttempts: attempts.length,
      totalDuration,
      finalError: lastError || new Error('Unknown error')
    }

    // Store in history
    this.recordIteration(agent.constructor.name, result)

    console.error(`\n❌ ${agent.constructor.name} failed after ${attempts.length} attempt(s)`)

    return result
  }

  /**
   * Classify error as retryable or fatal
   */
  classifyError(error: Error): ErrorClassification {
    const errorMessage = error.message.toLowerCase()
    const errorName = error.name.toLowerCase()
    const errorString = `${errorName} ${errorMessage}`

    // Check fatal errors first (higher priority)
    for (const fatalPattern of this.config.fatalErrors) {
      if (errorString.includes(fatalPattern.toLowerCase())) {
        return {
          category: ErrorCategory.FATAL,
          reason: `Matches fatal pattern: "${fatalPattern}"`,
          suggestedAction: 'Fix underlying issue - retry will not help'
        }
      }
    }

    // Check retryable errors
    for (const retryablePattern of this.config.retryableErrors) {
      if (errorString.includes(retryablePattern.toLowerCase())) {
        return {
          category: ErrorCategory.RETRYABLE,
          reason: `Matches retryable pattern: "${retryablePattern}"`,
          suggestedAction: 'Retry with exponential backoff'
        }
      }
    }

    // Unknown error - treat as retryable by default (conservative approach)
    return {
      category: ErrorCategory.RETRYABLE,
      reason: 'Unknown error type - assuming transient',
      suggestedAction: 'Retry with exponential backoff (default behavior)'
    }
  }

  /**
   * Calculate backoff delay using exponential strategy
   */
  private calculateBackoffDelay(attemptNumber: number): number {
    const delay = this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attemptNumber)
    return Math.min(delay, this.config.maxDelayMs)
  }

  /**
   * Sleep for specified milliseconds
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Record iteration in history
   */
  private recordIteration(agentId: string, result: IterationResult): void {
    if (!this.history.has(agentId)) {
      this.history.set(agentId, [])
    }
    this.history.get(agentId)!.push(result)
  }

  /**
   * Get iteration history for an agent
   */
  getHistory(agentId: string): IterationResult[] {
    return this.history.get(agentId) || []
  }

  /**
   * Get all iteration history
   */
  getAllHistory(): Map<string, IterationResult[]> {
    return new Map(this.history)
  }

  /**
   * Get statistics for an agent
   */
  getAgentStatistics(agentId: string): {
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    averageAttempts: number
    totalRetries: number
    successRate: number
  } {
    const history = this.getHistory(agentId)

    if (history.length === 0) {
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        averageAttempts: 0,
        totalRetries: 0,
        successRate: 0
      }
    }

    const successful = history.filter(h => h.success).length
    const failed = history.length - successful
    const totalAttempts = history.reduce((sum, h) => sum + h.totalAttempts, 0)
    const totalRetries = totalAttempts - history.length // Total attempts minus initial attempts

    return {
      totalExecutions: history.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      averageAttempts: totalAttempts / history.length,
      totalRetries,
      successRate: (successful / history.length) * 100
    }
  }

  /**
   * Get global statistics across all agents
   */
  getGlobalStatistics(): {
    totalAgents: number
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    totalRetries: number
    averageRetriesPerExecution: number
    overallSuccessRate: number
  } {
    const allHistory = Array.from(this.history.values()).flat()

    if (allHistory.length === 0) {
      return {
        totalAgents: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalRetries: 0,
        averageRetriesPerExecution: 0,
        overallSuccessRate: 0
      }
    }

    const successful = allHistory.filter(h => h.success).length
    const failed = allHistory.length - successful
    const totalAttempts = allHistory.reduce((sum, h) => sum + h.totalAttempts, 0)
    const totalRetries = totalAttempts - allHistory.length

    return {
      totalAgents: this.history.size,
      totalExecutions: allHistory.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      totalRetries,
      averageRetriesPerExecution: totalRetries / allHistory.length,
      overallSuccessRate: (successful / allHistory.length) * 100
    }
  }

  /**
   * Clear history for an agent
   */
  clearHistory(agentId: string): void {
    this.history.delete(agentId)
  }

  /**
   * Clear all history
   */
  clearAllHistory(): void {
    this.history.clear()
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      retryableErrors: config.retryableErrors ?? this.config.retryableErrors,
      fatalErrors: config.fatalErrors ?? this.config.fatalErrors
    }

    console.log(`⚙️  IterationManager config updated: max retries = ${this.config.maxRetries}`)
  }

  /**
   * Check if an error type is retryable
   */
  isRetryable(error: Error): boolean {
    const classification = this.classifyError(error)
    return classification.category === ErrorCategory.RETRYABLE
  }

  /**
   * Format iteration result for display
   */
  formatIterationResult(result: IterationResult): string {
    const lines: string[] = [
      '\n📊 Iteration Result:',
      '─'.repeat(80),
      `Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`,
      `Total Attempts: ${result.totalAttempts}`,
      `Total Duration: ${(result.totalDuration / 1000).toFixed(2)}s`
    ]

    lines.push('\nAttempts:')
    result.attempts.forEach(attempt => {
      const status = attempt.success ? '✅' : '❌'
      const duration = (attempt.duration / 1000).toFixed(2)
      lines.push(`  ${attempt.attemptNumber}. ${status} ${duration}s`)

      if (attempt.error) {
        lines.push(`     Error: ${attempt.error.message}`)
        lines.push(`     Retryable: ${attempt.error.isRetryable ? 'Yes' : 'No'}`)
      }

      if (attempt.backoffDelay) {
        lines.push(`     Backoff: ${(attempt.backoffDelay / 1000).toFixed(1)}s`)
      }
    })

    if (!result.success && result.finalError) {
      lines.push(`\nFinal Error: ${result.finalError.message}`)
    }

    lines.push('─'.repeat(80))

    return lines.join('\n')
  }

  /**
   * Format agent statistics for display
   */
  formatAgentStatistics(agentId: string): string {
    const stats = this.getAgentStatistics(agentId)

    if (stats.totalExecutions === 0) {
      return `\n📊 ${agentId}: No execution history`
    }

    const lines: string[] = [
      `\n📊 ${agentId} Statistics:`,
      '─'.repeat(80),
      `Total Executions: ${stats.totalExecutions}`,
      `Successful: ${stats.successfulExecutions} (${stats.successRate.toFixed(1)}%)`,
      `Failed: ${stats.failedExecutions}`,
      `Average Attempts: ${stats.averageAttempts.toFixed(2)}`,
      `Total Retries: ${stats.totalRetries}`,
      '─'.repeat(80)
    ]

    return lines.join('\n')
  }

  /**
   * Format global statistics for display
   */
  formatGlobalStatistics(): string {
    const stats = this.getGlobalStatistics()

    if (stats.totalExecutions === 0) {
      return '\n📊 Global Statistics: No execution history'
    }

    const lines: string[] = [
      '\n📊 Global Statistics:',
      '═'.repeat(80),
      `Total Agents: ${stats.totalAgents}`,
      `Total Executions: ${stats.totalExecutions}`,
      `Successful: ${stats.successfulExecutions} (${stats.overallSuccessRate.toFixed(1)}%)`,
      `Failed: ${stats.failedExecutions}`,
      `Total Retries: ${stats.totalRetries}`,
      `Average Retries per Execution: ${stats.averageRetriesPerExecution.toFixed(2)}`,
      '═'.repeat(80)
    ]

    return lines.join('\n')
  }

  /**
   * Retry with custom error handler
   * Allows caller to provide custom logic for error handling
   */
  async executeWithCustomHandler(
    agent: BaseAgent,
    state: AgentState,
    errorHandler: (error: Error, attempt: number) => Promise<{ retry: boolean; newState?: AgentState }>,
    maxRetries?: number
  ): Promise<IterationResult> {
    const retries = maxRetries ?? this.config.maxRetries
    const attempts: IterationAttempt[] = []
    const startTime = Date.now()

    let lastError: Error | null = null
    let finalOutput: Partial<AgentState> | undefined
    let currentState = state

    for (let attempt = 0; attempt <= retries; attempt++) {
      const attemptStart = Date.now()
      const attemptNumber = attempt + 1

      try {
        const output = await agent.execute(currentState)

        const duration = Date.now() - attemptStart
        attempts.push({
          attemptNumber,
          timestamp: new Date().toISOString(),
          agentId: agent.constructor.name,
          success: true,
          duration
        })

        finalOutput = output

        const totalDuration = Date.now() - startTime
        const result: IterationResult = {
          success: true,
          attempts,
          totalAttempts: attemptNumber,
          totalDuration,
          finalOutput
        }

        this.recordIteration(agent.constructor.name, result)
        return result

      } catch (error: any) {
        lastError = error
        const duration = Date.now() - attemptStart

        // Call custom error handler
        const handlerResult = await errorHandler(error, attempt)

        attempts.push({
          attemptNumber,
          timestamp: new Date().toISOString(),
          agentId: agent.constructor.name,
          success: false,
          duration,
          error: {
            type: error.name || 'Error',
            message: error.message,
            isRetryable: handlerResult.retry
          }
        })

        // Check if we should retry
        if (!handlerResult.retry || attempt >= retries) {
          break
        }

        // Update state if provided
        if (handlerResult.newState) {
          currentState = handlerResult.newState
        }

        // Backoff
        const backoffDelay = this.calculateBackoffDelay(attempt)
        attempts[attempts.length - 1].backoffDelay = backoffDelay
        await this.sleep(backoffDelay)
      }
    }

    const totalDuration = Date.now() - startTime
    const result: IterationResult = {
      success: false,
      attempts,
      totalAttempts: attempts.length,
      totalDuration,
      finalError: lastError || new Error('Unknown error')
    }

    this.recordIteration(agent.constructor.name, result)
    return result
  }
}

/**
 * Singleton instance for convenience
 */
export const iterationManager = new IterationManager()
