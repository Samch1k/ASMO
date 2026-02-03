/**
 * SingletonFactory - Thread-safe singleton pattern implementation
 *
 * Solves race condition problem in async singleton initialization:
 * - Multiple concurrent calls to get() will share the same initialization promise
 * - No double-instantiation possible
 * - Supports both sync and async factory functions
 *
 * Usage:
 * ```typescript
 * const orchestratorFactory = new SingletonFactory(() => new DynamicOrchestrator())
 * const instance = await orchestratorFactory.get()
 * ```
 */
export class SingletonFactory<T> {
  private instance: T | null = null
  private initPromise: Promise<T> | null = null

  /**
   * Create a new singleton factory
   * @param factory - Function that creates the singleton instance (can be sync or async)
   */
  constructor(private factory: () => T | Promise<T>) {}

  /**
   * Get the singleton instance (async)
   * Thread-safe: concurrent calls share the same initialization promise
   */
  async get(): Promise<T> {
    // Fast path: already initialized
    if (this.instance) {
      return this.instance
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise
    }

    // Start initialization (only one thread will reach here)
    this.initPromise = Promise.resolve(this.factory()).then(instance => {
      this.instance = instance
      this.initPromise = null
      return instance
    })

    return this.initPromise
  }

  /**
   * Get the singleton instance synchronously (if already initialized)
   * Returns null if not yet initialized - use get() for guaranteed access
   */
  getSync(): T | null {
    return this.instance
  }

  /**
   * Check if singleton is initialized
   */
  isInitialized(): boolean {
    return this.instance !== null
  }

  /**
   * Reset the singleton (useful for testing)
   * Warning: Does not dispose the instance, just clears the reference
   */
  reset(): void {
    this.instance = null
    this.initPromise = null
  }

  /**
   * Reset with cleanup function (for proper resource disposal)
   * @param cleanup - Optional cleanup function to call before reset
   */
  async resetWithCleanup(cleanup?: (instance: T) => void | Promise<void>): Promise<void> {
    if (this.instance && cleanup) {
      await cleanup(this.instance)
    }
    this.reset()
  }
}

/**
 * Create a simple singleton wrapper for existing getInstance/reset pattern
 * Provides backward compatibility while adding thread-safety
 *
 * Usage:
 * ```typescript
 * const { get, getSync, reset } = createSingleton(() => new MyClass())
 * export const getInstance = get
 * export const resetInstance = reset
 * ```
 */
export function createSingleton<T>(factory: () => T | Promise<T>): {
  get: () => Promise<T>
  getSync: () => T | null
  reset: () => void
  isInitialized: () => boolean
} {
  const singleton = new SingletonFactory(factory)
  return {
    get: () => singleton.get(),
    getSync: () => singleton.getSync(),
    reset: () => singleton.reset(),
    isInitialized: () => singleton.isInitialized()
  }
}
