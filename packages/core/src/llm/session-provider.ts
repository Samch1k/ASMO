/**
 * SessionLLMProvider - Execute LLM calls via Claude Code CLI
 *
 * Uses `claude -p` command for non-interactive execution.
 * Cost: $0 (uses Claude subscription)
 *
 * This is the DEFAULT provider for ASMO.
 */

import { spawn, execSync } from 'child_process'
import type {
  ILLMProvider,
  LLMGenerateOptions,
  LLMResponse,
  ModelTier
} from './types'

// =============================================================================
// CONFIGURATION
// =============================================================================

export interface SessionProviderConfig {
  /** Timeout in milliseconds */
  timeout: number

  /** Working directory for claude CLI */
  workingDirectory: string

  /** Default model tier */
  defaultModel: ModelTier

  /** Enable verbose logging */
  verbose: boolean
}

const DEFAULT_CONFIG: SessionProviderConfig = {
  timeout: 300000, // 5 minutes
  workingDirectory: process.cwd(),
  defaultModel: 'sonnet',
  verbose: false
}

// =============================================================================
// SESSION PROVIDER
// =============================================================================

/**
 * SessionLLMProvider - Uses Claude Code CLI for LLM calls
 *
 * Executes `claude -p "prompt" --model sonnet --output-format text`
 * Uses active Claude subscription ($0 cost).
 */
export class SessionLLMProvider implements ILLMProvider {
  readonly id = 'session'
  readonly name = 'Claude Code Session'
  readonly cost = '$0'

  private config: SessionProviderConfig
  private available: boolean | null = null

  constructor(config?: Partial<SessionProviderConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Check if Claude CLI is available
   */
  isAvailable(): boolean {
    if (this.available !== null) {
      return this.available
    }

    try {
      execSync('claude --version', { stdio: 'ignore', timeout: 5000 })
      this.available = true
    } catch {
      this.available = false
    }

    return this.available
  }

  /**
   * Generate text response using Claude CLI
   */
  async generate(prompt: string, options?: LLMGenerateOptions): Promise<LLMResponse> {
    if (!this.isAvailable()) {
      throw new Error('Claude CLI not available. Install from: https://claude.ai/code')
    }

    const startTime = Date.now()
    const model = options?.model || this.config.defaultModel

    // Build CLI arguments
    const args = this.buildCliArgs(prompt, model, options)

    if (this.config.verbose) {
      console.log(`🔄 [SessionProvider] Calling claude CLI (model: ${model})`)
    }

    // Execute claude CLI
    const content = await this.execClaude(args, options?.timeout)

    const duration = Date.now() - startTime

    if (this.config.verbose) {
      console.log(`✅ [SessionProvider] Response received (${duration}ms)`)
    }

    return {
      content,
      model,
      duration,
      provider: this.id,
      stopReason: 'end_turn'
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
   * Build CLI arguments for claude command
   */
  private buildCliArgs(
    prompt: string,
    model: ModelTier,
    options?: LLMGenerateOptions
  ): string[] {
    const args: string[] = [
      '-p', prompt,
      '--model', model,
      '--output-format', 'text'
    ]

    // Add system prompt if provided
    if (options?.systemPrompt) {
      args.push('--append-system-prompt', options.systemPrompt)
    }

    return args
  }

  /**
   * Execute claude CLI command
   */
  private execClaude(args: string[], timeout?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const effectiveTimeout = timeout || this.config.timeout

      const child = spawn('claude', args, {
        cwd: this.config.workingDirectory,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe']
      })

      let stdout = ''
      let stderr = ''

      child.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      child.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      // Timeout handler
      const timeoutId = setTimeout(() => {
        child.kill('SIGTERM')
        reject(new Error(`Claude CLI timeout after ${effectiveTimeout}ms`))
      }, effectiveTimeout)

      child.on('close', (code) => {
        clearTimeout(timeoutId)

        if (code === 0) {
          resolve(stdout.trim())
        } else {
          reject(new Error(
            `Claude CLI exited with code ${code}\n` +
            `stderr: ${stderr}\n` +
            `stdout: ${stdout}`
          ))
        }
      })

      child.on('error', (err) => {
        clearTimeout(timeoutId)
        reject(new Error(`Failed to spawn Claude CLI: ${err.message}`))
      })
    })
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SessionProviderConfig>): void {
    this.config = { ...this.config, ...config }
  }
}
