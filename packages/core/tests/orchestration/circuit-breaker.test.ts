/**
 * Circuit Breaker Tests
 * Tests for CircuitBreaker fault tolerance pattern implementation
 */

// Uses Jest globals (describe, it, expect, beforeEach, jest)

import {
  CircuitBreaker,
  CircuitBreakerManager,
  CircuitOpenError,
  getCircuitBreakerManager
} from '../../src/orchestration/reliability'

describe('CircuitBreaker', () => {
  let breaker: CircuitBreaker

  beforeEach(() => {
    jest.useFakeTimers()
    breaker = new CircuitBreaker({
      failureThreshold: 3,
      recoveryTimeout: 5000,
      successThreshold: 2,
      failureWindow: 60000
    })
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('initial state', () => {
    it('should start in CLOSED state', () => {
      expect(breaker.getState()).toBe('CLOSED')
    })

    it('should have zero failure count initially', () => {
      const stats = breaker.getStats()
      expect(stats.failures).toBe(0)
      expect(stats.successes).toBe(0)
    })

    it('should allow requests in CLOSED state', async () => {
      const result = await breaker.execute(async () => 'success')
      expect(result).toBe('success')
    })
  })

  describe('failure handling', () => {
    it('should count failures', async () => {
      const failingFn = async () => {
        throw new Error('Test error')
      }

      await expect(breaker.execute(failingFn)).rejects.toThrow('Test error')
      expect(breaker.getStats().failures).toBe(1)
    })

    it('should open circuit after threshold failures', async () => {
      const failingFn = async () => {
        throw new Error('Test error')
      }

      // Fail 3 times (threshold)
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }

      expect(breaker.getState()).toBe('OPEN')
    })

    it('should reject requests when OPEN', async () => {
      // Force open the circuit
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }

      expect(breaker.getState()).toBe('OPEN')

      // Should throw CircuitOpenError
      await expect(
        breaker.execute(async () => 'should not run')
      ).rejects.toThrow(CircuitOpenError)
    })
  })

  describe('recovery', () => {
    it('should transition to HALF_OPEN after recovery timeout', async () => {
      // Open the circuit
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }
      expect(breaker.getState()).toBe('OPEN')

      // Advance time past recovery timeout
      jest.advanceTimersByTime(5001)

      // Next call should transition to HALF_OPEN
      const result = await breaker.execute(async () => 'success')
      expect(result).toBe('success')
      expect(breaker.getState()).toBe('HALF_OPEN')
    })

    it('should close circuit after success threshold in HALF_OPEN', async () => {
      // Open the circuit
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }

      // Advance time past recovery timeout
      jest.advanceTimersByTime(5001)

      // 2 successes (threshold) should close the circuit
      await breaker.execute(async () => 'success1')
      await breaker.execute(async () => 'success2')

      expect(breaker.getState()).toBe('CLOSED')
    })

    it('should re-open circuit on failure in HALF_OPEN', async () => {
      // Open the circuit
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }

      // Advance time past recovery timeout
      jest.advanceTimersByTime(5001)

      // First success transitions to HALF_OPEN
      await breaker.execute(async () => 'success')
      expect(breaker.getState()).toBe('HALF_OPEN')

      // Failure should re-open
      await expect(breaker.execute(failingFn)).rejects.toThrow()
      expect(breaker.getState()).toBe('OPEN')
    })
  })

  describe('success handling', () => {
    it('should count successes', async () => {
      await breaker.execute(async () => 'success')
      expect(breaker.getStats().successes).toBe(1)
    })

    it('should reset failure count on success in CLOSED state', async () => {
      // Add some failures (but not enough to open)
      const failingFn = async () => {
        throw new Error('Test error')
      }
      await expect(breaker.execute(failingFn)).rejects.toThrow()
      await expect(breaker.execute(failingFn)).rejects.toThrow()

      expect(breaker.getStats().failures).toBe(2)

      // Success should reset
      await breaker.execute(async () => 'success')
      expect(breaker.getStats().failures).toBe(0)
    })
  })

  describe('events', () => {
    it('should emit state_change event', async () => {
      const handler = jest.fn()
      breaker.on(handler)

      // Open the circuit
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }

      // Should have emitted state_change to OPEN
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state_change',
          state: 'OPEN'
        })
      )
    })

    it('should emit failure event', async () => {
      const handler = jest.fn()
      breaker.on(handler)

      const failingFn = async () => {
        throw new Error('Test error')
      }
      await expect(breaker.execute(failingFn)).rejects.toThrow()

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'failure'
        })
      )
    })

    it('should emit success event', async () => {
      const handler = jest.fn()
      breaker.on(handler)

      await breaker.execute(async () => 'success')

      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'success'
        })
      )
    })

    it('should allow unsubscribing from events', async () => {
      const handler = jest.fn()
      breaker.on(handler)

      await breaker.execute(async () => 'first')
      expect(handler).toHaveBeenCalledTimes(1)

      breaker.off(handler)

      await breaker.execute(async () => 'second')
      expect(handler).toHaveBeenCalledTimes(1) // No new calls
    })
  })

  describe('statistics', () => {
    it('should track total calls', async () => {
      await breaker.execute(async () => 'success')
      await breaker.execute(async () => 'success')

      const stats = breaker.getStats()
      expect(stats.totalCalls).toBe(2)
    })

    it('should track success rate', async () => {
      const failingFn = async () => {
        throw new Error('Test error')
      }

      await breaker.execute(async () => 'success')
      await expect(breaker.execute(failingFn)).rejects.toThrow()

      const stats = breaker.getStats()
      const successRate = stats.totalCalls > 0 ? stats.totalSuccesses / stats.totalCalls : 0
      expect(successRate).toBe(0.5)
    })
  })

  describe('reset', () => {
    it('should reset to initial state', async () => {
      // Add some state
      const failingFn = async () => {
        throw new Error('Test error')
      }
      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(failingFn)).rejects.toThrow()
      }
      expect(breaker.getState()).toBe('OPEN')

      // Reset
      breaker.reset()

      expect(breaker.getState()).toBe('CLOSED')
      expect(breaker.getStats().failures).toBe(0)
      expect(breaker.getStats().successes).toBe(0)
      expect(breaker.getStats().totalCalls).toBe(0)
    })
  })
})

describe('CircuitBreakerManager', () => {
  let manager: CircuitBreakerManager

  beforeEach(() => {
    // Create fresh instance
    manager = new CircuitBreakerManager()
  })

  it('should create and cache circuit breakers by name', () => {
    const breaker1 = manager.get('api-calls')
    const breaker2 = manager.get('api-calls')

    expect(breaker1).toBe(breaker2)
  })

  it('should create different breakers for different names', () => {
    const breaker1 = manager.get('api-calls')
    const breaker2 = manager.get('database')

    expect(breaker1).not.toBe(breaker2)
  })

  it('should get all stats', () => {
    manager.get('breaker-1')
    manager.get('breaker-2')

    const allStats = manager.getAllStats()

    expect(allStats['breaker-1']).toBeDefined()
    expect(allStats['breaker-2']).toBeDefined()
  })

  it('should reset specific breaker directly', async () => {
    const breaker = manager.get('test-breaker')
    await breaker.execute(async () => 'success')

    expect(breaker.getStats().totalCalls).toBe(1)

    breaker.reset()

    expect(breaker.getStats().totalCalls).toBe(0)
  })

  it('should reset all breakers', async () => {
    const breaker1 = manager.get('breaker-1')
    const breaker2 = manager.get('breaker-2')

    await breaker1.execute(async () => 'success')
    await breaker2.execute(async () => 'success')

    manager.resetAll()

    expect(breaker1.getStats().totalCalls).toBe(0)
    expect(breaker2.getStats().totalCalls).toBe(0)
  })
})

describe('getCircuitBreakerManager (singleton)', () => {
  it('should return the same instance', () => {
    const instance1 = getCircuitBreakerManager()
    const instance2 = getCircuitBreakerManager()

    expect(instance1).toBe(instance2)
  })
})

describe('CircuitOpenError', () => {
  it('should be instanceof Error', () => {
    const error = new CircuitOpenError('test')
    expect(error).toBeInstanceOf(Error)
  })

  it('should have correct message', () => {
    const error = new CircuitOpenError('api-service')
    expect(error.message).toContain('api-service')
  })
})
