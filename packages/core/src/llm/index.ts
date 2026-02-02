/**
 * LLM Module - Unified LLM provider interface
 *
 * Provides abstraction over different LLM providers:
 * - SessionLLMProvider: Claude CLI ($0, uses subscription)
 * - AnthropicLLMProvider: Anthropic API (pay-per-use)
 *
 * Usage:
 * ```typescript
 * import { getLLMProvider } from '@asmo/core'
 *
 * // Auto-select best provider (prefers session/$0)
 * const provider = getLLMProvider()
 *
 * // Generate text
 * const response = await provider.generate('Explain TypeScript generics', {
 *   model: 'sonnet',
 *   temperature: 0.7
 * })
 *
 * // Generate JSON
 * const data = await provider.generateJSON<MyType>('Return user data as JSON')
 * ```
 */

// Types
export type {
  MessageRole,
  Message,
  UserMessage,
  AssistantMessage,
  SystemMessage,
  // ModelTier is re-exported from routing-logger, not duplicated here
  LLMGenerateOptions,
  LLMResponse,
  ILLMProvider,
  ProviderPreference,
  ProviderInfo
} from './types'

// Re-export ModelTier from types (which gets it from routing-logger)
export type { ModelTier } from './types'

export {
  createUserMessage,
  createAssistantMessage,
  createSystemMessage,
  ANTHROPIC_MODELS
} from './types'

// Providers
export { SessionLLMProvider, type SessionProviderConfig } from './session-provider'
export { AnthropicLLMProvider, type AnthropicProviderConfig } from './anthropic-provider'

// Factory
export {
  LLMProviderFactory,
  getLLMProviderFactory,
  getLLMProvider,
  resetLLMProviderFactory,
  printProviderStatus
} from './provider-factory'
