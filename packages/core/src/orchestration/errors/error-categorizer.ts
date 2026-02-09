/**
 * Error Categorizer - Unified error classification for retry logic
 *
 * Extracted from AgentExecutor to provide consistent error categorization
 * across all executors and orchestration components.
 */

/**
 * Error categories for classification and retry decisions
 */
export type ErrorCategory =
  | 'rate_limit'      // API rate limiting (retryable with backoff)
  | 'timeout'         // Execution timeout (retryable)
  | 'validation'      // Input/output validation (not retryable)
  | 'agent_error'     // Agent internal error (may be retryable)
  | 'network'         // Network issues (retryable)
  | 'api_error'       // HTTP 4xx/5xx API errors
  | 'unknown'         // Unknown errors (conservative retry)

/**
 * Error classification patterns using regex for robust matching
 */
const ERROR_PATTERNS: Array<{ pattern: RegExp; category: ErrorCategory }> = [
  // Rate limiting
  { pattern: /\brate[_\s-]?limit/i, category: 'rate_limit' },
  { pattern: /\b429\b/, category: 'rate_limit' },
  { pattern: /too many requests/i, category: 'rate_limit' },
  { pattern: /throttl/i, category: 'rate_limit' },

  // Timeout
  { pattern: /\btimeout\b/i, category: 'timeout' },
  { pattern: /\btimed?\s*out\b/i, category: 'timeout' },
  { pattern: /\bdeadline\s*exceeded\b/i, category: 'timeout' },

  // Validation
  { pattern: /\bvalidation\b/i, category: 'validation' },
  { pattern: /\binvalid\b/i, category: 'validation' },
  { pattern: /\bschema\b/i, category: 'validation' },

  // Network
  { pattern: /\bnetwork\b/i, category: 'network' },
  { pattern: /\bECONN(?:REFUSED|RESET|ABORTED)\b/i, category: 'network' },
  { pattern: /\bfetch\s*(?:error|fail)/i, category: 'network' },
  { pattern: /\bsocket\b/i, category: 'network' },
  { pattern: /\bEPIPE\b/i, category: 'network' },
  { pattern: /\bENOTFOUND\b/i, category: 'network' },

  // Agent errors
  { pattern: /\bagent\b.*\b(?:error|fail)/i, category: 'agent_error' },
  { pattern: /\bexecut(?:e|ion)\b.*\b(?:error|fail)/i, category: 'agent_error' },
]

/**
 * Extract HTTP status code from error object or message
 */
function extractHttpStatus(error: Error): number | null {
  // Check common error properties for status codes
  const errAny = error as any
  const status = errAny.statusCode || errAny.status || errAny.code

  if (typeof status === 'number' && status >= 100 && status <= 599) {
    return status
  }

  // Try to extract from message (e.g., "HTTP 503", "status 404", "Error 500")
  const match = error.message.match(/\b(?:HTTP|status|Error)\s*(\d{3})\b/i)
  if (match) {
    return parseInt(match[1])
  }

  return null
}

/**
 * Categorize an error based on its message content and HTTP status
 *
 * @param error - Error to categorize
 * @returns Error category
 */
export function categorizeError(error: Error): ErrorCategory {
  // Check HTTP status code first
  const httpStatus = extractHttpStatus(error)
  if (httpStatus !== null) {
    if (httpStatus === 429) return 'rate_limit'
    if (httpStatus === 408) return 'timeout'
    if (httpStatus >= 400 && httpStatus < 500) return 'api_error'
    if (httpStatus >= 500) return 'api_error'
  }

  // Match against regex patterns
  const message = error.message
  for (const { pattern, category } of ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return category
    }
  }

  return 'unknown'
}

/**
 * Determine if an error category is retryable
 *
 * @param category - Error category
 * @returns true if the error is worth retrying
 */
export function isRetryable(category: ErrorCategory): boolean {
  return ['rate_limit', 'timeout', 'network', 'api_error'].includes(category)
}

/**
 * Get recommended retry delay multiplier for error category
 *
 * @param category - Error category
 * @returns Delay multiplier (1 = normal, 2+ = longer)
 */
export function getRetryDelayMultiplier(category: ErrorCategory): number {
  switch (category) {
    case 'rate_limit':
      return 3 // Longer delay for rate limits
    case 'network':
      return 2 // Medium delay for network issues
    case 'api_error':
      return 2 // Medium delay for API errors (server may recover)
    case 'timeout':
      return 1.5 // Slightly longer for timeouts
    default:
      return 1
  }
}

/**
 * Categorize error and provide retry recommendation
 *
 * @param error - Error to analyze
 * @returns Object with category, retryable flag, and delay multiplier
 */
export function analyzeError(error: Error): {
  category: ErrorCategory
  retryable: boolean
  delayMultiplier: number
} {
  const category = categorizeError(error)
  return {
    category,
    retryable: isRetryable(category),
    delayMultiplier: getRetryDelayMultiplier(category)
  }
}
