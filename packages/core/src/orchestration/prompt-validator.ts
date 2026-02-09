/**
 * PromptValidator - Validate and sanitize user prompts
 *
 * Ensures prompts meet basic quality and safety requirements before LLM processing:
 * - Not empty or whitespace-only
 * - Within reasonable length limits
 * - Properly sanitized for UTF-8
 * - Special characters handled appropriately
 */

export interface PromptValidationResult {
  /** Whether the prompt is valid */
  valid: boolean
  /** Sanitized prompt (if valid) */
  sanitized?: string
  /** Validation error message (if invalid) */
  error?: string
  /** Warning messages (prompt is valid but has issues) */
  warnings?: string[]
}

export interface PromptValidatorConfig {
  /**
   * Maximum prompt length in characters
   * @default 10000
   */
  maxLength?: number

  /**
   * Minimum prompt length in characters
   * @default 3
   */
  minLength?: number

  /**
   * Whether to allow emoji and special Unicode
   * @default true
   */
  allowUnicode?: boolean

  /**
   * Whether to trim whitespace
   * @default true
   */
  trimWhitespace?: boolean
}

const DEFAULT_CONFIG: Required<PromptValidatorConfig> = {
  maxLength: 10000,
  minLength: 3,
  allowUnicode: true,
  trimWhitespace: true
}

/**
 * PromptValidator - Validate and sanitize user input prompts
 */
export class PromptValidator {
  private config: Required<PromptValidatorConfig>

  constructor(config?: PromptValidatorConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Validate and sanitize a prompt
   *
   * @param prompt - User's input prompt
   * @returns Validation result with sanitized prompt or error
   */
  validate(prompt: string): PromptValidationResult {
    const warnings: string[] = []

    // Check 1: Empty or null check
    if (!prompt) {
      return {
        valid: false,
        error: 'Prompt cannot be empty or null'
      }
    }

    // Check 2: Trim whitespace if enabled
    let sanitized = this.config.trimWhitespace ? prompt.trim() : prompt

    // Check 3: Whitespace-only check
    if (sanitized.length === 0) {
      return {
        valid: false,
        error: 'Prompt cannot be empty or whitespace-only'
      }
    }

    // Check 4: Minimum length
    if (sanitized.length < this.config.minLength) {
      return {
        valid: false,
        error: `Prompt too short. Minimum ${this.config.minLength} characters required (got ${sanitized.length})`
      }
    }

    // Check 5: Maximum length
    if (sanitized.length > this.config.maxLength) {
      return {
        valid: false,
        error: `Prompt too long. Maximum ${this.config.maxLength} characters allowed (got ${sanitized.length})`
      }
    }

    // Check 6: UTF-8 validation and sanitization
    try {
      // Attempt to encode/decode to validate UTF-8
      const buffer = Buffer.from(sanitized, 'utf8')
      const decoded = buffer.toString('utf8')
      
      // If decoded differs, there were invalid UTF-8 sequences
      if (decoded !== sanitized) {
        sanitized = decoded
        warnings.push('Prompt contained invalid UTF-8 sequences (automatically fixed)')
      }
    } catch (error) {
      return {
        valid: false,
        error: `Invalid UTF-8 encoding: ${error instanceof Error ? error.message : String(error)}`
      }
    }

    // Check 7: Unicode restrictions (if disabled)
    if (!this.config.allowUnicode) {
      // Check for non-ASCII characters
      const hasNonAscii = /[^\x00-\x7F]/.test(sanitized)
      if (hasNonAscii) {
        return {
          valid: false,
          error: 'Prompt contains non-ASCII characters (Unicode disabled)'
        }
      }
    }

    // Check 8: Suspicious patterns (security)
    // eslint-disable-next-line no-control-regex
    const suspiciousPatterns = [
      { pattern: /\x00/, message: 'null bytes detected' },
      { pattern: /[\x01-\x08\x0B-\x0C\x0E-\x1F]/, message: 'control characters detected' }
    ]

    for (const { pattern, message } of suspiciousPatterns) {
      if (pattern.test(sanitized)) {
        warnings.push(`Warning: ${message}`)
        // Remove suspicious characters
        sanitized = sanitized.replace(pattern, '')
      }
    }

    // Check 9: Excessive whitespace
    const excessiveWhitespace = /\s{5,}/.test(sanitized)
    if (excessiveWhitespace) {
      warnings.push('Prompt contains excessive whitespace (normalized)')
      // Normalize multiple spaces to single space
      sanitized = sanitized.replace(/\s+/g, ' ')
    }

    // Check 10: Line breaks normalization
    if (sanitized.includes('\r')) {
      sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      warnings.push('Line breaks normalized to LF')
    }

    // All checks passed
    return {
      valid: true,
      sanitized,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  }

  /**
   * Validate prompt and throw error if invalid
   *
   * @param prompt - User's input prompt
   * @returns Sanitized prompt
   * @throws Error if validation fails
   */
  validateOrThrow(prompt: string): string {
    const result = this.validate(prompt)
    
    if (!result.valid) {
      throw new Error(`Prompt validation failed: ${result.error}`)
    }
    
    // Log warnings if any
    if (result.warnings && result.warnings.length > 0) {
      console.warn('[PromptValidator] Warnings:', result.warnings.join('; '))
    }
    
    return result.sanitized!
  }
}
