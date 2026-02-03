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
  | 'unknown'         // Unknown errors (conservative retry)

/**
 * Categorize an error based on its message content
 *
 * @param error - Error to categorize
 * @returns Error category
 */
export function categorizeError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase()

  // Rate limiting
  if (
    message.includes('rate limit') ||
    message.includes('429') ||
    message.includes('too many requests')
  ) {
    return 'rate_limit'
  }

  // Timeout
  if (message.includes('timeout') || message.includes('timed out')) {
    return 'timeout'
  }

  // Validation
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('schema')
  ) {
    return 'validation'
  }

  // Network
  if (
    message.includes('network') ||
    message.includes('econnrefused') ||
    message.includes('econnreset') ||
    message.includes('fetch') ||
    message.includes('socket')
  ) {
    return 'network'
  }

  // Agent errors
  if (message.includes('agent') || message.includes('execute')) {
    return 'agent_error'
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
  return ['rate_limit', 'timeout', 'network'].includes(category)
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
