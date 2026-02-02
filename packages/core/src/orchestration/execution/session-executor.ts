/**
 * SessionExecutor - Executes tasks using Claude Code session
 *
 * $0 API cost execution mode using Claude subscription.
 * Best for development, testing, and interactive workflows.
 *
 * NOTE: This executor prepares context for session-based execution.
 * For direct LLM calls, use the llm/SessionLLMProvider instead.
 */

import type { AgentState } from '../../agents/types'
import type { ModelTier } from '../routing-logger'
import type { AgentExecutionOutput } from '../agent-executor'

// =============================================================================
// TYPES
// =============================================================================

export interface SessionExecutorConfig {
  /** Enable verbose logging */
  verbose: boolean
  /** Timeout in ms */
  timeout: number
  /** Whether to show interactive progress */
  interactive: boolean
}

export interface SessionExecutionContext {
  taskId: string
  prompt: string
  state: AgentState
  model?: ModelTier
}

export interface SessionExecutionResult {
  success: boolean
  output?: AgentExecutionOutput
  rawResponse?: string
  error?: string
  metrics: {
    duration: number
    mode: 'session'
  }
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: SessionExecutorConfig = {
  verbose: false,
  timeout: 120000,
  interactive: true
}

// =============================================================================
// SESSION EXECUTOR
// =============================================================================

/**
 * SessionExecutor - Uses Claude Code session for execution
 *
 * This executor runs within the Claude Code environment,
 * using the active Claude subscription ($0 API cost).
 */
export class SessionExecutor {
  private config: SessionExecutorConfig

  constructor(config?: Partial<SessionExecutorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute a task in session mode
   *
   * In session mode, the task is executed within the current
   * Claude Code conversation context.
   */
  async execute(context: SessionExecutionContext): Promise<SessionExecutionResult> {
    const startTime = Date.now()

    if (this.config.verbose) {
      console.log(`🔄 [SessionExecutor] Starting task: ${context.taskId}`)
      console.log(`   Mode: Session (Claude subscription)`)
    }

    try {
      // In session mode, we return the prompt and context
      // for the Claude Code instance to process
      const output = await this.processInSession(context)

      const duration = Date.now() - startTime

      if (this.config.verbose) {
        console.log(`✅ [SessionExecutor] Task completed in ${duration}ms`)
      }

      return {
        success: true,
        output,
        metrics: {
          duration,
          mode: 'session'
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (this.config.verbose) {
        console.log(`❌ [SessionExecutor] Task failed: ${errorMessage}`)
      }

      return {
        success: false,
        error: errorMessage,
        metrics: {
          duration,
          mode: 'session'
        }
      }
    }
  }

  /**
   * Process task within the session
   *
   * This method prepares the execution context for the
   * Claude Code session to process. For actual LLM calls,
   * use the llm/SessionLLMProvider.
   */
  private async processInSession(
    context: SessionExecutionContext
  ): Promise<AgentExecutionOutput> {
    // Build the session prompt
    const sessionPrompt = this.buildSessionPrompt(context)

    // Return context prepared for session processing
    // The actual LLM call should be made via llm/SessionLLMProvider
    return {
      task: context.state.task,
      messages: context.state.messages,
      // Mark as needing session processing
      context: {
        ...context.state.context,
        _sessionExecution: true,
        _sessionPrompt: sessionPrompt,
        _taskId: context.taskId
      }
    }
  }

  /**
   * Build prompt for session execution
   */
  private buildSessionPrompt(context: SessionExecutionContext): string {
    const parts: string[] = []

    // Add task header
    parts.push(`## Task: ${context.taskId}`)
    parts.push('')

    // Add the main prompt
    parts.push(context.prompt)
    parts.push('')

    // Add context if available
    if (Object.keys(context.state.context).length > 0) {
      parts.push('## Context')
      parts.push('```json')
      parts.push(JSON.stringify(context.state.context, null, 2))
      parts.push('```')
      parts.push('')
    }

    // Add model hint if specified
    if (context.model) {
      parts.push(`*Using model tier: ${context.model}*`)
    }

    return parts.join('\n')
  }

  /**
   * Check if session mode is available
   */
  isAvailable(): boolean {
    // Session mode is available when running within Claude Code
    // For actual CLI check, use llm/SessionLLMProvider.isAvailable()
    return true
  }

  /**
   * Get executor info
   */
  getInfo(): {
    mode: 'session'
    provider: string
    cost: string
    description: string
  } {
    return {
      mode: 'session',
      provider: 'claude_code',
      cost: '$0 (uses subscription)',
      description: 'Executes within Claude Code session using active subscription'
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SessionExecutorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let executorInstance: SessionExecutor | null = null

/**
 * Get singleton SessionExecutor instance
 */
export function getSessionExecutor(config?: Partial<SessionExecutorConfig>): SessionExecutor {
  if (!executorInstance) {
    executorInstance = new SessionExecutor(config)
  }
  return executorInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetSessionExecutor(): void {
  executorInstance = null
}
