/**
 * ASMO Error Handling Utilities
 *
 * Provides unified error handling across the codebase.
 * Includes custom error classes and helper functions.
 *
 * Features:
 * - Custom error classes with error codes
 * - Database error handling
 * - Error wrapping and chaining
 * - Safe error message extraction
 */

import { logger } from './logger'

/**
 * Error codes for ASMO errors
 */
export enum AsmoErrorCode {
  // Database errors (1xxx)
  DATABASE_CONNECTION_FAILED = 'ASMO_1001',
  DATABASE_QUERY_FAILED = 'ASMO_1002',
  DATABASE_WRITE_FAILED = 'ASMO_1003',
  DATABASE_NOT_CONFIGURED = 'ASMO_1004',

  // Workflow errors (2xxx)
  WORKFLOW_NOT_FOUND = 'ASMO_2001',
  WORKFLOW_EXECUTION_FAILED = 'ASMO_2002',
  WORKFLOW_TIMEOUT = 'ASMO_2003',
  WORKFLOW_CANCELLED = 'ASMO_2004',

  // Agent errors (3xxx)
  AGENT_NOT_FOUND = 'ASMO_3001',
  AGENT_EXECUTION_FAILED = 'ASMO_3002',
  AGENT_TIMEOUT = 'ASMO_3003',
  AGENT_INVALID_OUTPUT = 'ASMO_3004',

  // Configuration errors (4xxx)
  CONFIG_INVALID = 'ASMO_4001',
  CONFIG_MISSING = 'ASMO_4002',
  CONFIG_PARSE_ERROR = 'ASMO_4003',

  // LLM errors (5xxx)
  LLM_REQUEST_FAILED = 'ASMO_5001',
  LLM_RATE_LIMITED = 'ASMO_5002',
  LLM_INVALID_RESPONSE = 'ASMO_5003',

  // General errors (9xxx)
  UNKNOWN_ERROR = 'ASMO_9999'
}

/**
 * Base ASMO error class
 */
export class AsmoError extends Error {
  public readonly code: AsmoErrorCode
  public readonly cause?: Error
  public readonly context?: Record<string, unknown>
  public readonly timestamp: Date

  constructor(
    message: string,
    code: AsmoErrorCode = AsmoErrorCode.UNKNOWN_ERROR,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message)
    this.name = 'AsmoError'
    this.code = code
    this.cause = options?.cause
    this.context = options?.context
    this.timestamp = new Date()

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AsmoError)
    }
  }

  /**
   * Get a formatted error message including code and context
   */
  toFormattedString(): string {
    let result = `[${this.code}] ${this.message}`

    if (this.context) {
      result += `\nContext: ${JSON.stringify(this.context, null, 2)}`
    }

    if (this.cause) {
      result += `\nCaused by: ${this.cause.message}`
    }

    return result
  }

  /**
   * Convert to JSON for logging/serialization
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      cause: this.cause?.message,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    }
  }
}

/**
 * Database-specific error
 */
export class DatabaseError extends AsmoError {
  constructor(
    message: string,
    code: AsmoErrorCode = AsmoErrorCode.DATABASE_QUERY_FAILED,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, options)
    this.name = 'DatabaseError'
  }
}

/**
 * Workflow-specific error
 */
export class WorkflowError extends AsmoError {
  constructor(
    message: string,
    code: AsmoErrorCode = AsmoErrorCode.WORKFLOW_EXECUTION_FAILED,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, options)
    this.name = 'WorkflowError'
  }
}

/**
 * Agent-specific error
 */
export class AgentError extends AsmoError {
  constructor(
    message: string,
    code: AsmoErrorCode = AsmoErrorCode.AGENT_EXECUTION_FAILED,
    options?: {
      cause?: Error
      context?: Record<string, unknown>
    }
  ) {
    super(message, code, options)
    this.name = 'AgentError'
  }
}

/**
 * Safely extract error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

/**
 * Safely extract error stack from unknown error type
 */
export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack
  }
  return undefined
}

/**
 * Wrap an unknown error in an AsmoError
 */
export function wrapError(
  error: unknown,
  message: string,
  code: AsmoErrorCode = AsmoErrorCode.UNKNOWN_ERROR,
  context?: Record<string, unknown>
): AsmoError {
  const cause = error instanceof Error ? error : new Error(getErrorMessage(error))
  return new AsmoError(message, code, { cause, context })
}

/**
 * Handle database errors with unified logging
 */
export function handleDbError(
  error: unknown,
  component: string,
  operation: string,
  context?: Record<string, unknown>
): void {
  const errorMessage = getErrorMessage(error)

  logger.error(component, `Database operation failed: ${operation}`, {
    error: errorMessage,
    ...context
  })
}

/**
 * Handle errors with optional rethrow
 */
export function handleError(
  error: unknown,
  component: string,
  operation: string,
  options?: {
    rethrow?: boolean
    context?: Record<string, unknown>
    code?: AsmoErrorCode
  }
): AsmoError {
  const errorMessage = getErrorMessage(error)
  const code = options?.code || AsmoErrorCode.UNKNOWN_ERROR

  logger.error(component, `${operation} failed: ${errorMessage}`, {
    code,
    ...options?.context
  })

  const wrappedError = wrapError(error, `${operation} failed`, code, options?.context)

  if (options?.rethrow) {
    throw wrappedError
  }

  return wrappedError
}

/**
 * Check if an error is retryable based on common patterns
 */
export function isRetryableError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()

  const retryablePatterns = [
    'timeout',
    'etimedout',
    'econnrefused',
    'econnreset',
    'epipe',
    'rate_limit',
    'rate limit',
    'too many requests',
    'service unavailable',
    'temporarily unavailable',
    'enotfound',
    'network error',
    'fetch failed',
    'socket hang up'
  ]

  return retryablePatterns.some(pattern => message.includes(pattern))
}

/**
 * Check if an error is fatal (should not be retried)
 */
export function isFatalError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase()

  const fatalPatterns = [
    'invalid input',
    'validation failed',
    'unauthorized',
    'forbidden',
    'not found',
    'security violation',
    'authentication failed',
    'permission denied',
    'business rule',
    'constraint violation',
    'duplicate key',
    'invalid state'
  ]

  return fatalPatterns.some(pattern => message.includes(pattern))
}
