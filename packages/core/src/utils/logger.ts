/**
 * ASMO Logger Utility
 *
 * Provides structured logging with configurable levels.
 * Replaces raw console.log calls throughout the codebase.
 *
 * Features:
 * - Log levels (DEBUG, INFO, WARN, ERROR)
 * - Component tagging for easy filtering
 * - Optional structured metadata
 * - Environment-based level configuration
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  SILENT = 4
}

export interface LogEntry {
  level: LogLevel
  component: string
  message: string
  timestamp: Date
  metadata?: Record<string, unknown>
}

type LogHandler = (entry: LogEntry) => void

/**
 * Get log level from environment variable
 */
function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.ASMO_LOG_LEVEL?.toUpperCase()
  switch (envLevel) {
    case 'DEBUG':
      return LogLevel.DEBUG
    case 'INFO':
      return LogLevel.INFO
    case 'WARN':
      return LogLevel.WARN
    case 'ERROR':
      return LogLevel.ERROR
    case 'SILENT':
      return LogLevel.SILENT
    default:
      return LogLevel.INFO
  }
}

/**
 * Format log level for display
 */
export function formatLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG'
    case LogLevel.INFO:
      return 'INFO'
    case LogLevel.WARN:
      return 'WARN'
    case LogLevel.ERROR:
      return 'ERROR'
    default:
      return 'UNKNOWN'
  }
}

/**
 * Get emoji prefix for log level
 */
function getLevelEmoji(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return '🔍'
    case LogLevel.INFO:
      return '✅'
    case LogLevel.WARN:
      return '⚠️'
    case LogLevel.ERROR:
      return '❌'
    default:
      return ''
  }
}

/**
 * Logger class for component-based logging
 */
class Logger {
  private minLevel: LogLevel
  private handlers: LogHandler[] = []

  constructor() {
    this.minLevel = getLogLevelFromEnv()
    // Default handler writes to console
    this.handlers.push(this.defaultHandler.bind(this))
  }

  /**
   * Set minimum log level
   */
  setLevel(level: LogLevel): void {
    this.minLevel = level
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.minLevel
  }

  /**
   * Add custom log handler
   */
  addHandler(handler: LogHandler): void {
    this.handlers.push(handler)
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clearHandlers(): void {
    this.handlers = []
  }

  /**
   * Reset to default handler
   */
  resetHandlers(): void {
    this.handlers = [this.defaultHandler.bind(this)]
  }

  /**
   * Default console handler
   */
  private defaultHandler(entry: LogEntry): void {
    const emoji = getLevelEmoji(entry.level)
    const prefix = `${emoji} [${entry.component}]`

    switch (entry.level) {
      case LogLevel.DEBUG:
        if (entry.metadata) {
          console.debug(prefix, entry.message, entry.metadata)
        } else {
          console.debug(prefix, entry.message)
        }
        break
      case LogLevel.INFO:
        if (entry.metadata) {
          console.log(prefix, entry.message, entry.metadata)
        } else {
          console.log(prefix, entry.message)
        }
        break
      case LogLevel.WARN:
        if (entry.metadata) {
          console.warn(prefix, entry.message, entry.metadata)
        } else {
          console.warn(prefix, entry.message)
        }
        break
      case LogLevel.ERROR:
        if (entry.metadata) {
          console.error(prefix, entry.message, entry.metadata)
        } else {
          console.error(prefix, entry.message)
        }
        break
    }
  }

  /**
   * Log a message at the specified level
   */
  private log(
    level: LogLevel,
    component: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (level < this.minLevel) return

    const entry: LogEntry = {
      level,
      component,
      message,
      timestamp: new Date(),
      metadata
    }

    for (const handler of this.handlers) {
      try {
        handler(entry)
      } catch {
        // Ignore handler errors
      }
    }
  }

  /**
   * Log a debug message
   */
  debug(component: string, message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, component, message, metadata)
  }

  /**
   * Log an info message
   */
  info(component: string, message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, component, message, metadata)
  }

  /**
   * Log a warning message
   */
  warn(component: string, message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, component, message, metadata)
  }

  /**
   * Log an error message
   */
  error(component: string, message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, component, message, metadata)
  }

  /**
   * Create a child logger with a fixed component name
   */
  child(component: string): ComponentLogger {
    return new ComponentLogger(this, component)
  }
}

/**
 * Component-specific logger that pre-fills the component name
 */
class ComponentLogger {
  constructor(
    private parent: Logger,
    private component: string
  ) {}

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.parent.debug(this.component, message, metadata)
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.parent.info(this.component, message, metadata)
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.parent.warn(this.component, message, metadata)
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.parent.error(this.component, message, metadata)
  }
}

// Singleton instance
const logger = new Logger()

// Export singleton and types
export { logger, Logger, ComponentLogger }

// Convenience exports for direct usage
export const debug = (component: string, message: string, metadata?: Record<string, unknown>) =>
  logger.debug(component, message, metadata)

export const info = (component: string, message: string, metadata?: Record<string, unknown>) =>
  logger.info(component, message, metadata)

export const warn = (component: string, message: string, metadata?: Record<string, unknown>) =>
  logger.warn(component, message, metadata)

export const error = (component: string, message: string, metadata?: Record<string, unknown>) =>
  logger.error(component, message, metadata)
