/**
 * AnthropicLLMProvider - Execute LLM calls via Anthropic API
 *
 * Uses @anthropic-ai/sdk for direct API calls.
 * Cost: pay-per-use (requires ANTHROPIC_API_KEY)
 *
 * Use this provider when:
 * - Running in environments without Claude CLI
 * - Need detailed token usage metrics
 * - Specific agents require API access
 */

import Anthropic from '@anthropic-ai/sdk'
import type {
  ILLMProvider,
  LLMGenerateOptions,
  LLMResponse,
  ModelTier,
  Message
} from './types'
import { ANTHROPIC_MODELS } from './types'

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface AnthropicProviderConfig {
  /** API key (defaults to ANTHROPIC_API_KEY env var) */
  apiKey?: string

  /** Default model tier */
  defaultModel: ModelTier

  /** Default max tokens */
  defaultMaxTokens: number

  /** Default temperature */
  defaultTemperature?: number

  /** Enable verbose logging */
  verbose: boolean
}

const DEFAULT_CONFIG: AnthropicProviderConfig = {
  defaultModel: 'sonnet',
  defaultMaxTokens: 4096,
  defaultTemperature: undefined, // Use model default
  verbose: false
}

// =============================================================================
// ANTHROPIC PROVIDER
// =============================================================================

/**
 * AnthropicLLMProvider - Uses Anthropic SDK for LLM calls
 *
 * Requires ANTHROPIC_API_KEY environment variable.
 * Provides detailed usage metrics.
 */
export class AnthropicLLMProvider implements ILLMProvider {
  readonly id = 'anthropic'
  readonly name = 'Anthropic API'
  readonly cost = 'pay-per-use'

  private config: AnthropicProviderConfig
  private client: Anthropic | null = null

  constructor(config?: Partial<AnthropicProviderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }

    // Initialize client if API key is available
    const apiKey = this.config.apiKey || process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      this.client = new Anthropic({ apiKey })
    }
  }

  /**
   * Check if API key is configured
   */
  isAvailable(): boolean {
    return this.client !== null
  }

  /**
   * Generate text response using Anthropic API
   */
  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse> {
    if (!this.client) {
      throw new Error('ANTHROPIC_API_KEY not set')
    }

    const startTime = Date.now()
    const modelTier = options?.model || this.config.defaultModel
    const modelName = ANTHROPIC_MODELS[modelTier]

    if (this.config.verbose) {
      console.log(`🔄 [AnthropicProvider] Calling API (model: ${modelName})`)
    }

    // Build messages array
    const messages = this.buildMessages(prompt, options?.messages)

    // Call API
    const response = await this.client.messages.create({
      model: modelName,
      max_tokens: options?.maxTokens || this.config.defaultMaxTokens,
      temperature: options?.temperature ?? this.config.defaultTemperature,
      system: options?.systemPrompt,
      messages,
      stop_sequences: options?.stopSequences
    })

    // Extract text content
    const textBlock = response.content.find(block => block.type === 'text')
    const content = textBlock?.type === 'text' ? textBlock.text : ''

    const duration = Date.now() - startTime

    if (this.config.verbose) {
      console.log(`✅ [AnthropicProvider] Response received (${duration}ms, ${response.usage.output_tokens} tokens)`)
    }

    return {
      content,
      model: modelName,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      },
      duration,
      provider: this.id,
      stopReason: this.mapStopReason(response.stop_reason)
    }
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T = unknown>(
    prompt: string,
    options?: LLMGenerateOptions
  ): Promise<T> {
    // Add JSON instruction to prompt
    const jsonPrompt = `${prompt}

IMPORTANT: Respond with valid JSON only. No markdown, no code blocks, no explanation.`

    const response = await this.generate(jsonPrompt, options)

    try {
      // Try to extract JSON from response
      const jsonMatch = response.content.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Try parsing entire response
      return JSON.parse(response.content.trim())
    } catch (error) {
      throw new Error(
        `Failed to parse JSON from LLM response: ${error}\n` +
        `Response was: ${response.content.slice(0, 200)}...`
      )
    }
  }

  /**
   * Build messages array for API call
   */
  private buildMessages(
    prompt: string,
    history?: Message[]
  ): Anthropic.MessageParam[] {
    const messages: Anthropic.MessageParam[] = []

    // Add history (excluding system messages - they go in 'system' param)
    if (history) {
      for (const msg of history) {
        if (msg.role !== 'system') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      }
    }

    // Add current prompt
    messages.push({
      role: 'user',
      content: prompt
    })

    return messages
  }

  /**
   * Map Anthropic stop reason to our type
   */
  private mapStopReason(
    reason: string | null
  ): 'end_turn' | 'max_tokens' | 'stop_sequence' {
    switch (reason) {
      case 'end_turn':
        return 'end_turn'
      case 'max_tokens':
        return 'max_tokens'
      case 'stop_sequence':
        return 'stop_sequence'
      default:
        return 'end_turn'
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AnthropicProviderConfig>): void {
    this.config = { ...this.config, ...config }

    // Reinitialize client if API key changed
    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey })
    }
  }
}
