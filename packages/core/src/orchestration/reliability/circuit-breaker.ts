/**
 * CircuitBreaker - Fault tolerance for agent execution
 *
 * Implements the Circuit Breaker pattern to prevent cascading failures.
 * States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
 */

// =============================================================================
// TYPES
// =============================================================================

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number
  /** Time in ms before attempting recovery */
  recoveryTimeout: number
  /** Number of successful calls to close circuit */
  successThreshold: number
  /** Time window for counting failures (ms) */
  failureWindow: number
  /** Optional name for logging */
  name?: string
}

export interface CircuitBreakerStats {
  state: CircuitState
  failures: number
  successes: number
  lastFailure?: Date
  lastSuccess?: Date
  lastStateChange: Date
  totalCalls: number
  totalFailures: number
  totalSuccesses: number
}

export interface CircuitBreakerEvent {
  type: 'state_change' | 'failure' | 'success' | 'rejected'
  state: CircuitState
  previousState?: CircuitState
  timestamp: Date
  error?: Error
}

// =============================================================================
// DEFAULT CONFIG
// =============================================================================

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 30000,  // 30 seconds
  successThreshold: 2,
  failureWindow: 60000,    // 1 minute
  name: 'default'
}

// =============================================================================
// CIRCUIT BREAKER
// =============================================================================

/**
 * CircuitBreaker - Prevents cascading failures
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig
  private state: CircuitState = 'CLOSED'
  private failures: number = 0
  private successes: number = 0
  private lastFailureTime?: Date
  private lastSuccessTime?: Date
  private lastStateChange: Date = new Date()
  private totalCalls: number = 0
  private totalFailures: number = 0
  private totalSuccesses: number = 0
  private eventListeners: Array<(event: CircuitBreakerEvent) => void> = []

  constructor(config?: Partial<CircuitBreakerConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalCalls++

    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (this.shouldAttemptRecovery()) {
        this.transitionTo('HALF_OPEN')
      } else {
        this.emitEvent({
          type: 'rejected',
          state: this.state,
          timestamp: new Date()
        })
        throw new CircuitOpenError(
          `Circuit breaker "${this.config.name}" is OPEN. Request rejected.`
        )
      }
    }

    try {
      const result = await fn()
      this.recordSuccess()
      return result
    } catch (error) {
      this.recordFailure(error instanceof Error ? error : new Error(String(error)))
      throw error
    }
  }

  /**
   * Record a successful call
   */
  private recordSuccess(): void {
    this.successes++
    this.totalSuccesses++
    this.lastSuccessTime = new Date()
    this.failures = 0  // Reset failure count on success

    this.emitEvent({
      type: 'success',
      state: this.state,
      timestamp: new Date()
    })

    // If in half-open state, check if we should close
    if (this.state === 'HALF_OPEN' && this.successes >= this.config.successThreshold) {
      this.transitionTo('CLOSED')
    }
  }

  /**
   * Record a failed call
   */
  private recordFailure(error: Error): void {
    this.failures++
    this.totalFailures++
    this.lastFailureTime = new Date()
    this.successes = 0  // Reset success count on failure

    this.emitEvent({
      type: 'failure',
      state: this.state,
      timestamp: new Date(),
      error
    })

    // Clean up old failures outside the window
    this.cleanupOldFailures()

    // Check if we should open the circuit
    if (this.state === 'CLOSED' && this.failures >= this.config.failureThreshold) {
      this.transitionTo('OPEN')
    }

    // If in half-open state, any failure opens the circuit
    if (this.state === 'HALF_OPEN') {
      this.transitionTo('OPEN')
    }
  }

  /**
   * Check if we should attempt recovery
   */
  private shouldAttemptRecovery(): boolean {
    if (!this.lastFailureTime) return true

    const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime()
    return timeSinceLastFailure >= this.config.recoveryTimeout
  }

  /**
   * Clean up failures outside the window
   */
  private cleanupOldFailures(): void {
    if (this.lastFailureTime) {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime.getTime()
      if (timeSinceLastFailure > this.config.failureWindow) {
        this.failures = 1  // Reset to just current failure
      }
    }
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const previousState = this.state
    this.state = newState
    this.lastStateChange = new Date()

    // Reset counters on state change
    if (newState === 'CLOSED') {
      this.failures = 0
      this.successes = 0
    } else if (newState === 'HALF_OPEN') {
      this.successes = 0
    }

    console.log(
      `⚡ [CircuitBreaker:${this.config.name}] State: ${previousState} → ${newState}`
    )

    this.emitEvent({
      type: 'state_change',
      state: newState,
      previousState,
      timestamp: new Date()
    })
  }

  /**
   * Manually open the circuit
   */
  forceOpen(): void {
    this.transitionTo('OPEN')
  }

  /**
   * Manually close the circuit
   */
  forceClose(): void {
    this.transitionTo('CLOSED')
  }

  /**
   * Reset the circuit breaker (including all counters)
   */
  reset(): void {
    this.state = 'CLOSED'
    this.failures = 0
    this.successes = 0
    this.lastFailureTime = undefined
    this.lastSuccessTime = undefined
    this.lastStateChange = new Date()
    // Also reset totals
    this.totalCalls = 0
    this.totalFailures = 0
    this.totalSuccesses = 0
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailure: this.lastFailureTime,
      lastSuccess: this.lastSuccessTime,
      lastStateChange: this.lastStateChange,
      totalCalls: this.totalCalls,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses
    }
  }

  /**
   * Subscribe to events
   */
  on(listener: (event: CircuitBreakerEvent) => void): void {
    this.eventListeners.push(listener)
  }

  /**
   * Unsubscribe from events
   */
  off(listener: (event: CircuitBreakerEvent) => void): void {
    const index = this.eventListeners.indexOf(listener)
    if (index > -1) {
      this.eventListeners.splice(index, 1)
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: CircuitBreakerEvent): void {
    for (const listener of this.eventListeners) {
      try {
        listener(event)
      } catch (error) {
        console.error('[CircuitBreaker] Event listener error:', error)
      }
    }
  }
}

// =============================================================================
// ERRORS
// =============================================================================

/**
 * Error thrown when circuit is open
 */
export class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CircuitOpenError'
  }
}

// =============================================================================
// CIRCUIT BREAKER MANAGER
// =============================================================================

/**
 * Manages multiple circuit breakers
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map()
  private defaultConfig: Partial<CircuitBreakerConfig>

  constructor(defaultConfig?: Partial<CircuitBreakerConfig>) {
    this.defaultConfig = defaultConfig || {}
  }

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker({
          ...this.defaultConfig,
          ...config,
          name
        })
      )
    }
    return this.breakers.get(name)!
  }

  /**
   * Get all breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers)
  }

  /**
   * Get statistics for all breakers
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {}
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats()
    }
    return stats
  }

  /**
   * Reset all breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset()
    }
  }

  /**
   * Clear all breakers
   */
  clear(): void {
    this.breakers.clear()
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let managerInstance: CircuitBreakerManager | null = null

/**
 * Get singleton CircuitBreakerManager instance
 */
export function getCircuitBreakerManager(
  config?: Partial<CircuitBreakerConfig>
): CircuitBreakerManager {
  if (!managerInstance) {
    managerInstance = new CircuitBreakerManager(config)
  }
  return managerInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetCircuitBreakerManager(): void {
  managerInstance = null
}
