/**
 * SessionLLMProvider - Execute LLM calls via Claude Code CLI
 *
 * Uses `claude -p` command for non-interactive execution.
 * Cost: $0 (uses Claude subscription)
 *
 * This is the DEFAULT provider for ASMO.
 */

import { spawn, execSync } from 'child_process'
import { existsSync } from 'fs'
import { homedir } from 'os'
import path from 'path'
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
   * Check if we're running inside Claude Code (nested CLI call would hang)
   */
  isInsideClaudeCode(): boolean {
    return !!(process.env.CLAUDE_CODE || process.env.CLAUDE_SESSION)
  }

  /**
   * Check if Claude CLI is available
   */
  isAvailable(): boolean {
    if (this.available !== null) {
      return this.available
    }

    // Nested claude -p inside Claude Code hangs — not available
    if (this.isInsideClaudeCode()) {
      this.available = false
      return false
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
    if (this.isInsideClaudeCode()) {
      throw new Error(
        'Session mode unavailable inside Claude Code (nested claude -p would hang). ' +
        'Use --use-api or --no-llm instead.'
      )
    }
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

      // On Windows, ensure CLAUDE_CODE_GIT_BASH_PATH is available
      // (setx sets env for future shells, not the current process)
      const spawnEnv = { ...process.env }
      if (process.platform === 'win32' && !spawnEnv.CLAUDE_CODE_GIT_BASH_PATH) {
        const candidates = [
          path.join('C:', 'Program Files', 'Git', 'bin', 'bash.exe'),
          path.join(homedir(), 'AppData', 'Local', 'Programs', 'Git', 'bin', 'bash.exe'),
          path.join('C:', 'Program Files (x86)', 'Git', 'bin', 'bash.exe'),
        ]
        for (const candidate of candidates) {
          if (existsSync(candidate)) {
            spawnEnv.CLAUDE_CODE_GIT_BASH_PATH = candidate
            break
          }
        }
      }

      const child = spawn('claude', args, {
        cwd: this.config.workingDirectory,
        // Use resolved spawnEnv so Windows can inject CLAUDE_CODE_GIT_BASH_PATH when available
        env: spawnEnv,
        // Ignore stdin – claude -p doesn't need interactive input
        stdio: ['ignore', 'pipe', 'pipe']
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
