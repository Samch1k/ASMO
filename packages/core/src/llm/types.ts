/**
 * LLM Types - Core types for LLM providers
 *
 * Replaces @langchain/core/messages with our own types.
 * Provides unified interface for multiple LLM providers.
 */

// =============================================================================
// MESSAGE TYPES (replacement for @langchain/core/messages)
// =============================================================================

/**
 * Message role in conversation
 */
export type MessageRole = 'user' | 'assistant' | 'system'

/**
 * Base message interface
 */
export interface Message {
  role: MessageRole
  content: string
}

/**
 * User message (human input)
 */
export interface UserMessage extends Message {
  role: 'user'
}

/**
 * Assistant message (LLM response)
 */
export interface AssistantMessage extends Message {
  role: 'assistant'
}

/**
 * System message (instructions)
 */
export interface SystemMessage extends Message {
  role: 'system'
}

// =============================================================================
// MESSAGE FACTORIES
// =============================================================================

/**
 * Create a user message
 */
export function createUserMessage(content: string): UserMessage {
  return { role: 'user', content }
}

/**
 * Create an assistant message
 */
export function createAssistantMessage(content: string): AssistantMessage {
  return { role: 'assistant', content }
}

/**
 * Create a system message
 */
export function createSystemMessage(content: string): SystemMessage {
  return { role: 'system', content }
}

// =============================================================================
// MODEL TYPES
// =============================================================================

// Re-export ModelTier from routing-logger to avoid duplication
// ModelTier is defined there as: 'opus' | 'sonnet' | 'haiku'
export type { ModelTier } from '../orchestration/routing-logger'

/**
 * Model mapping for Anthropic models
 */
import type { ModelTier } from '../orchestration/routing-logger'

export const ANTHROPIC_MODELS: Record<ModelTier, string> = {
  opus: 'claude-opus-4-20250514',
  sonnet: 'claude-sonnet-4-20250514',
  haiku: 'claude-3-5-haiku-20241022'
}

// =============================================================================
// LLM PROVIDER TYPES
// =============================================================================

/**
 * Options for LLM generation
 */
export interface LLMGenerateOptions {
  /** Model tier: opus, sonnet, haiku */
  model?: ModelTier

  /** Temperature (0.0-1.0). Lower = more deterministic */
  temperature?: number

  /** Maximum tokens in response */
  maxTokens?: number

  /** System prompt (instructions for the model) */
  systemPrompt?: string

  /** Timeout in milliseconds */
  timeout?: number

  /** Conversation history for context */
  messages?: Message[]

  /** Stop sequences */
  stopSequences?: string[]
}

/**
 * Response from LLM generation
 */
export interface LLMResponse {
  /** Generated text content */
  content: string

  /** Model that was used */
  model: string

  /** Token usage statistics (API only) */
  usage?: {
    inputTokens: number
    outputTokens: number
  }

  /** Execution duration in milliseconds */
  duration: number

  /** Provider that handled the request */
  provider: string

  /** Stop reason */
  stopReason?: 'end_turn' | 'max_tokens' | 'stop_sequence'
}

/**
 * LLM Provider interface
 *
 * All LLM providers (Session, Anthropic, OpenAI, etc.) implement this interface.
 */
export interface ILLMProvider {
  /** Unique provider identifier */
  readonly id: string

  /** Human-readable provider name */
  readonly name: string

  /** Cost indicator: '$0' for subscription, 'pay-per-use' for API */
  readonly cost: string

  /**
   * Check if provider is available
   * - Session: checks if claude CLI is installed
   * - Anthropic: checks if API key is set
   */
  isAvailable(): boolean

  /**
   * Generate text response
   *
   * @param prompt - User prompt
   * @param options - Generation options
   * @returns LLM response with content and metadata
   */
  generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse>

  /**
   * Generate structured JSON response
   *
   * @param prompt - User prompt (should request JSON output)
   * @param options - Generation options
   * @returns Parsed JSON object
   */
  generateJSON<T = unknown>(prompt: string, options?: LLMGenerateOptions): Promise<T>
}

// =============================================================================
// PROVIDER CONFIGURATION
// =============================================================================

/**
 * Provider preference for factory
 */
export type ProviderPreference = 'session' | 'anthropic' | 'auto'

/**
 * Provider info for status display
 */
export interface ProviderInfo {
  id: string
  name: string
  available: boolean
  cost: string
}
