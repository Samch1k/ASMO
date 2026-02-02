/**
 * LLMProviderFactory - Factory for creating and managing LLM providers
 *
 * Provides unified access to different LLM providers:
 * - session: Claude CLI ($0, uses subscription) - DEFAULT
 * - anthropic: Anthropic API (pay-per-use)
 *
 * Usage:
 * ```typescript
 * // Auto-select best available provider (prefers session)
 * const provider = getLLMProvider()
 *
 * // Force specific provider
 * const sessionProvider = getLLMProvider('session')
 * const apiProvider = getLLMProvider('anthropic')
 * ```
 */

import { SessionLLMProvider } from './session-provider'
import { AnthropicLLMProvider } from './anthropic-provider'
import type { ILLMProvider, ProviderPreference, ProviderInfo } from './types'

// =============================================================================
// FACTORY
// =============================================================================

/**
 * LLMProviderFactory - Manages LLM provider instances
 */
export class LLMProviderFactory {
  private sessionProvider: SessionLLMProvider
  private anthropicProvider: AnthropicLLMProvider
  private defaultPreference: ProviderPreference

  constructor(defaultPreference: ProviderPreference = 'auto') {
    this.sessionProvider = new SessionLLMProvider()
    this.anthropicProvider = new AnthropicLLMProvider()
    this.defaultPreference = defaultPreference
  }

  /**
   * Get LLM provider by preference
   *
   * @param preference - Provider to use: 'session', 'anthropic', or 'auto'
   * @returns LLM provider instance
   * @throws Error if requested provider is not available
   */
  getProvider(preference?: ProviderPreference): ILLMProvider {
    const pref = preference || this.defaultPreference

    switch (pref) {
      case 'session':
        if (!this.sessionProvider.isAvailable()) {
          throw new Error(
            'Claude CLI not available.\n' +
            'Install from: https://claude.ai/code\n' +
            'Or set ANTHROPIC_API_KEY to use API instead.'
          )
        }
        return this.sessionProvider

      case 'anthropic':
        if (!this.anthropicProvider.isAvailable()) {
          throw new Error(
            'ANTHROPIC_API_KEY not set.\n' +
            'Set the environment variable or install Claude CLI for $0 usage.'
          )
        }
        return this.anthropicProvider

      case 'auto':
      default:
        return this.getAutoProvider()
    }
  }

  /**
   * Auto-select best available provider
   *
   * Priority:
   * 1. Session (Claude CLI) - $0, uses subscription
   * 2. Anthropic API - pay-per-use
   */
  private getAutoProvider(): ILLMProvider {
    // Prefer session (free)
    if (this.sessionProvider.isAvailable()) {
      return this.sessionProvider
    }

    // Fallback to API
    if (this.anthropicProvider.isAvailable()) {
      console.warn(
        '⚠️  [LLMProvider] Using Anthropic API (pay-per-use).\n' +
        '    Install Claude CLI for $0 usage: https://claude.ai/code'
      )
      return this.anthropicProvider
    }

    // No provider available
    throw new Error(
      'No LLM provider available.\n\n' +
      'Options:\n' +
      '1. Install Claude CLI (recommended, $0): https://claude.ai/code\n' +
      '2. Set ANTHROPIC_API_KEY environment variable (pay-per-use)\n'
    )
  }

  /**
   * Get information about all providers
   */
  getAvailableProviders(): ProviderInfo[] {
    return [
      {
        id: this.sessionProvider.id,
        name: this.sessionProvider.name,
        available: this.sessionProvider.isAvailable(),
        cost: this.sessionProvider.cost
      },
      {
        id: this.anthropicProvider.id,
        name: this.anthropicProvider.name,
        available: this.anthropicProvider.isAvailable(),
        cost: this.anthropicProvider.cost
      }
    ]
  }

  /**
   * Check if any provider is available
   */
  hasAvailableProvider(): boolean {
    return this.sessionProvider.isAvailable() || this.anthropicProvider.isAvailable()
  }

  /**
   * Get the session provider directly
   */
  getSessionProvider(): SessionLLMProvider {
    return this.sessionProvider
  }

  /**
   * Get the anthropic provider directly
   */
  getAnthropicProvider(): AnthropicLLMProvider {
    return this.anthropicProvider
  }

  /**
   * Set default preference
   */
  setDefaultPreference(preference: ProviderPreference): void {
    this.defaultPreference = preference
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let factoryInstance: LLMProviderFactory | null = null

/**
 * Get the singleton factory instance
 */
export function getLLMProviderFactory(): LLMProviderFactory {
  if (!factoryInstance) {
    factoryInstance = new LLMProviderFactory()
  }
  return factoryInstance
}

/**
 * Get an LLM provider
 *
 * @param preference - Provider preference: 'session', 'anthropic', or 'auto'
 * @returns LLM provider instance
 *
 * @example
 * ```typescript
 * // Auto-select (prefers session)
 * const provider = getLLMProvider()
 * const response = await provider.generate('Hello!')
 *
 * // Force API
 * const apiProvider = getLLMProvider('anthropic')
 * ```
 */
export function getLLMProvider(preference?: ProviderPreference): ILLMProvider {
  return getLLMProviderFactory().getProvider(preference)
}

/**
 * Reset factory singleton (for testing)
 */
export function resetLLMProviderFactory(): void {
  factoryInstance = null
}

/**
 * Check available providers and print status
 */
export function printProviderStatus(): void {
  const factory = getLLMProviderFactory()
  const providers = factory.getAvailableProviders()

  console.log('\n📡 LLM Provider Status')
  console.log('═'.repeat(40))

  for (const p of providers) {
    const status = p.available ? '✅' : '❌'
    const costBadge = p.cost === '$0' ? '🆓' : '💰'
    console.log(`${status} ${p.name} (${p.id}) ${costBadge} ${p.cost}`)
  }

  console.log('═'.repeat(40))

  if (!factory.hasAvailableProvider()) {
    console.log('⚠️  No provider available!')
    console.log('   Install Claude CLI: https://claude.ai/code')
    console.log('   Or set ANTHROPIC_API_KEY')
  }

  console.log('')
}
