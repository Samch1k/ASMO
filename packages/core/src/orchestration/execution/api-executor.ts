/**
 * APIExecutor - Executes tasks via direct Anthropic API calls
 *
 * Production execution mode using Anthropic API.
 * Best for automation, CI/CD, and non-interactive workflows.
 */

import type { AgentState } from '../../agents/types'
import type { ModelTier } from '../routing-logger'
import type { AgentExecutionOutput } from '../agent-executor'
import { getYamlConfigLoader } from '../config/yaml-config-loader'

// =============================================================================
// TYPES
// =============================================================================

export interface APIExecutorConfig {
  /** Anthropic API key (or env var name) */
  apiKey?: string
  /** API base URL */
  baseUrl: string
  /** Enable verbose logging */
  verbose: boolean
  /** Default timeout in ms */
  timeout: number
  /** Maximum retries */
  maxRetries: number
}

export interface APIExecutionContext {
  taskId: string
  prompt: string
  state: AgentState
  model: ModelTier
  systemPrompt?: string
}

export interface APIExecutionResult {
  success: boolean
  output?: AgentExecutionOutput
  rawResponse?: string
  error?: string
  metrics: {
    duration: number
    mode: 'api'
    model: string
    inputTokens?: number
    outputTokens?: number
    estimatedCost?: number
  }
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: APIExecutorConfig = {
  baseUrl: 'https://api.anthropic.com',
  verbose: false,
  timeout: 120000,
  maxRetries: 3
}

// =============================================================================
// API EXECUTOR
// =============================================================================

/**
 * APIExecutor - Direct Anthropic API execution
 *
 * This executor makes direct API calls to Anthropic,
 * suitable for production and automated workflows.
 */
export class APIExecutor {
  private config: APIExecutorConfig
  private yamlConfig = getYamlConfigLoader()

  constructor(config?: Partial<APIExecutorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute a task via API
   */
  async execute(context: APIExecutionContext): Promise<APIExecutionResult> {
    const startTime = Date.now()

    if (this.config.verbose) {
      console.log(`🔄 [APIExecutor] Starting task: ${context.taskId}`)
      console.log(`   Mode: API (Anthropic)`)
      console.log(`   Model: ${context.model}`)
    }

    try {
      // Get model configuration
      const modelConfig = this.yamlConfig.getModel(context.model)
      if (!modelConfig) {
        throw new Error(`Unknown model tier: ${context.model}`)
      }

      // Build API request
      const request = this.buildAPIRequest(context, modelConfig.model_id)

      // Make API call
      const response = await this.callAPI(request)

      const duration = Date.now() - startTime

      // Parse response
      const output = this.parseResponse(response, context.state)

      // Calculate cost
      const inputTokens = response.usage?.input_tokens || 0
      const outputTokens = response.usage?.output_tokens || 0
      const cost = this.yamlConfig.estimateCost(context.model, inputTokens, outputTokens)

      if (this.config.verbose) {
        console.log(`✅ [APIExecutor] Task completed in ${duration}ms`)
        console.log(`   Tokens: ${inputTokens} in / ${outputTokens} out`)
        console.log(`   Cost: $${cost.total.toFixed(4)}`)
      }

      return {
        success: true,
        output,
        rawResponse: JSON.stringify(response),
        metrics: {
          duration,
          mode: 'api',
          model: modelConfig.model_id,
          inputTokens,
          outputTokens,
          estimatedCost: cost.total
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (this.config.verbose) {
        console.log(`❌ [APIExecutor] Task failed: ${errorMessage}`)
      }

      return {
        success: false,
        error: errorMessage,
        metrics: {
          duration,
          mode: 'api',
          model: context.model
        }
      }
    }
  }

  /**
   * Build API request body
   */
  private buildAPIRequest(
    context: APIExecutionContext,
    modelId: string
  ): AnthropicRequest {
    const modelConfig = this.yamlConfig.getModel(context.model)

    const messages: AnthropicMessage[] = []

    // Add conversation history
    // BaseMessage from LangChain has getType() method, not role property
    for (const msg of context.state.messages) {
      const msgAny = msg as any
      const role = msgAny.role || msgAny._getType?.() || 'user'
      const content = msgAny.content || msgAny.text || ''

      if (role === 'user' || role === 'human' || role === 'assistant' || role === 'ai') {
        messages.push({
          role: role === 'human' ? 'user' : role === 'ai' ? 'assistant' : role as 'user' | 'assistant',
          content: typeof content === 'string' ? content : JSON.stringify(content)
        })
      }
    }

    // Add current task as user message
    messages.push({
      role: 'user',
      content: context.prompt
    })

    return {
      model: modelId,
      max_tokens: modelConfig?.characteristics.max_output || 4096,
      messages,
      system: context.systemPrompt,
      temperature: modelConfig?.config.temperature,
      top_p: modelConfig?.config.top_p
    }
  }

  /**
   * Make API call to Anthropic
   */
  private async callAPI(request: AnthropicRequest): Promise<AnthropicResponse> {
    const apiKey = this.getAPIKey()

    if (!apiKey) {
      throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY environment variable.')
    }

    const response = await fetch(`${this.config.baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`API error ${response.status}: ${errorBody}`)
    }

    return response.json() as Promise<AnthropicResponse>
  }

  /**
   * Parse API response into AgentExecutionOutput
   */
  private parseResponse(
    response: AnthropicResponse,
    originalState: AgentState
  ): AgentExecutionOutput {
    // Extract text content from response
    const textContent = response.content
      .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
      .map(c => c.text)
      .join('\n')

    // Note: We store the response in context rather than trying to
    // create a BaseMessage, since BaseMessage is a LangChain class
    return {
      task: originalState.task,
      messages: originalState.messages, // Keep original messages
      context: {
        ...originalState.context,
        _apiExecution: true,
        _responseId: response.id,
        _stopReason: response.stop_reason,
        _lastResponse: textContent
      }
    }
  }

  /**
   * Get API key from config or environment
   */
  private getAPIKey(): string | undefined {
    if (this.config.apiKey) {
      // Check if it's an env var name
      if (this.config.apiKey.startsWith('$')) {
        return process.env[this.config.apiKey.slice(1)]
      }
      return this.config.apiKey
    }

    return process.env.ANTHROPIC_API_KEY
  }

  /**
   * Check if API mode is available
   */
  isAvailable(): boolean {
    return !!this.getAPIKey()
  }

  /**
   * Get executor info
   */
  getInfo(): {
    mode: 'api'
    provider: string
    cost: string
    description: string
    available: boolean
  } {
    return {
      mode: 'api',
      provider: 'anthropic',
      cost: 'Pay per token',
      description: 'Direct Anthropic API calls for production use',
      available: this.isAvailable()
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<APIExecutorConfig>): void {
    this.config = { ...this.config, ...config }
  }
}

// =============================================================================
// ANTHROPIC API TYPES
// =============================================================================

interface AnthropicMessage {
  role: 'user' | 'assistant'
  content: string
}

interface AnthropicRequest {
  model: string
  max_tokens: number
  messages: AnthropicMessage[]
  system?: string
  temperature?: number
  top_p?: number
}

interface AnthropicResponse {
  id: string
  type: 'message'
  role: 'assistant'
  content: Array<{ type: 'text'; text: string } | { type: 'tool_use'; id: string; name: string; input: unknown }>
  model: string
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence' | 'tool_use'
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let executorInstance: APIExecutor | null = null

/**
 * Get singleton APIExecutor instance
 */
export function getAPIExecutor(config?: Partial<APIExecutorConfig>): APIExecutor {
  if (!executorInstance) {
    executorInstance = new APIExecutor(config)
  }
  return executorInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetAPIExecutor(): void {
  executorInstance = null
}
