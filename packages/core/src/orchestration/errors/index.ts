/**
 * Error handling utilities
 */
export {
  type ErrorCategory,
  categorizeError,
  isRetryable,
  getRetryDelayMultiplier,
  analyzeError
} from './error-categorizer'
