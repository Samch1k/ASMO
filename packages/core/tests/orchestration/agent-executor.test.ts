/**
 * AgentExecutor Tests
 * Tests for agent execution with retry, timeout, and circuit breaker
 */

import {
  AgentExecutor,
  getAgentExecutor,
  resetAgentExecutor,
  type ExecutionContext
} from '../../src/orchestration/agent-executor'
import { resetCircuitBreakerManager, getCircuitBreakerManager } from '../../src/orchestration/reliability'
import type { BaseAgent } from '../../src/agents/base-agent'
import type { AgentState } from '../../src/agents/types'

// Mock agent factory
function createMockAgent(behavior: {
  shouldSucceed?: boolean
  failCount?: number
  result?: Partial<AgentState>
  errorMessage?: string
}): BaseAgent {
  let callCount = 0
  const failCount = behavior.failCount ?? 0

  return {
    agentId: 'test-agent',
    skills: ['test'],
    execute: jest.fn(async (_state: AgentState): Promise<Partial<AgentState>> => {
      callCount++

      // Fail for first N calls
      if (callCount <= failCount) {
        throw new Error(behavior.errorMessage || 'Test error')
      }

      // Check explicit success flag
      if (behavior.shouldSucceed === false) {
        throw new Error(behavior.errorMessage || 'Agent failed')
      }

      return behavior.result || { context: { completed: true } }
    })
  } as unknown as BaseAgent
}

// Mock agent state
function createMockState(): AgentState {
  return {
    task: 'Test task',
    taskType: 'testing',
    context: {},
    messages: [],
    agentResults: [],
    currentAgent: 'test-agent',
    mcpData: {},
    nextAction: 'continue',
    requiresApproval: false,
    artifacts: [],
    deliverables: []
  }
}

describe('AgentExecutor', () => {
  beforeEach(() => {
    resetAgentExecutor()
    resetCircuitBreakerManager()
  })

  describe('constructor and singleton', () => {
    it('should create with default config', () => {
      const executor = new AgentExecutor()
      const config = executor.getConfig()

      expect(config.maxRetries).toBe(3)
      expect(config.initialRetryDelay).toBe(1000)
      expect(config.timeout).toBe(120000)
    })

    it('should accept custom config', () => {
      const executor = new AgentExecutor({
        maxRetries: 5,
        timeout: 60000
      })
      const config = executor.getConfig()

      expect(config.maxRetries).toBe(5)
      expect(config.timeout).toBe(60000)
    })

    it('should return singleton instance', () => {
      const executor1 = getAgentExecutor()
      const executor2 = getAgentExecutor()

      expect(executor1).toBe(executor2)
    })

    it('should reset singleton', () => {
      const executor1 = getAgentExecutor()
      resetAgentExecutor()
      const executor2 = getAgentExecutor()

      expect(executor1).not.toBe(executor2)
    })
  })

  describe('execute - success cases', () => {
    it('should execute agent successfully', async () => {
      const executor = new AgentExecutor({ maxRetries: 0 })
      const agent = createMockAgent({ shouldSucceed: true, result: { context: { done: true } } })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.success).toBe(true)
      expect(result.result).toEqual({ context: { done: true } })
      expect(result.metrics.attempts).toBe(1)
      expect(agent.execute).toHaveBeenCalledWith(state)
    })

    it('should track execution duration', async () => {
      const executor = new AgentExecutor({ maxRetries: 0 })
      const agent = createMockAgent({ shouldSucceed: true })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.metrics.totalDuration).toBeGreaterThanOrEqual(0)
    })
  })

  describe('execute - retry logic', () => {
    it('should retry on transient errors', async () => {
      const executor = new AgentExecutor({
        maxRetries: 3,
        initialRetryDelay: 1, // Very short for testing
        retryMultiplier: 1
      })
      const agent = createMockAgent({ failCount: 2, result: { context: { recovered: true } } })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.success).toBe(true)
      expect(result.metrics.attempts).toBe(3)
      expect(agent.execute).toHaveBeenCalledTimes(3)
    })

    it('should not retry on validation errors', async () => {
      const executor = new AgentExecutor({
        maxRetries: 3,
        initialRetryDelay: 1
      })
      const agent = createMockAgent({
        shouldSucceed: false,
        errorMessage: 'Validation failed: invalid input'
      })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.success).toBe(false)
      expect(result.metrics.attempts).toBe(1) // No retries
      expect(agent.execute).toHaveBeenCalledTimes(1)
    })

    it('should use exponential backoff', async () => {
      const executor = new AgentExecutor({
        maxRetries: 2,
        initialRetryDelay: 10,
        retryMultiplier: 2,
        maxRetryDelay: 1000
      })
      const agent = createMockAgent({ shouldSucceed: false, errorMessage: 'Network error' })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      // Should have delays: 10, 20
      expect(result.metrics.retryDelays).toEqual([10, 20])
    }, 10000)

    it('should cap retry delay at maxRetryDelay', async () => {
      const executor = new AgentExecutor({
        maxRetries: 3,
        initialRetryDelay: 100,
        retryMultiplier: 10,
        maxRetryDelay: 200
      })
      const agent = createMockAgent({ shouldSucceed: false, errorMessage: 'Error' })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      // All delays should be <= maxRetryDelay
      result.metrics.retryDelays.forEach(delay => {
        expect(delay).toBeLessThanOrEqual(200)
      })
    }, 10000)
  })

  describe('execute - circuit breaker', () => {
    it('should check circuit breaker before execution', async () => {
      const executor = new AgentExecutor({ maxRetries: 0 })
      const agent = createMockAgent({ shouldSucceed: true })
      const state = createMockState()

      // Open the circuit breaker
      const breaker = getCircuitBreakerManager().get('agent-execution')
      breaker.forceOpen()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('Circuit breaker open')
      expect(agent.execute).not.toHaveBeenCalled()
    })

    it('should allow execution when circuit is closed', async () => {
      const executor = new AgentExecutor({ maxRetries: 0 })
      const agent = createMockAgent({ shouldSucceed: true })
      const state = createMockState()

      // Ensure circuit is closed
      const breaker = getCircuitBreakerManager().get('agent-execution')
      expect(breaker.getState()).toBe('CLOSED')

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.success).toBe(true)
      expect(agent.execute).toHaveBeenCalled()
    })
  })

  describe('error categorization', () => {
    const testCases = [
      { errorMessage: 'rate limit exceeded', expectedCategory: 'rate_limit' },
      { errorMessage: '429 too many requests', expectedCategory: 'rate_limit' },
      { errorMessage: 'execution timeout', expectedCategory: 'timeout' },
      { errorMessage: 'operation timed out', expectedCategory: 'timeout' },
      { errorMessage: 'validation error', expectedCategory: 'validation' },
      { errorMessage: 'invalid input', expectedCategory: 'validation' },
      { errorMessage: 'network error', expectedCategory: 'network' },
      { errorMessage: 'ECONNREFUSED', expectedCategory: 'network' },
      { errorMessage: 'agent failed', expectedCategory: 'agent_error' },
      { errorMessage: 'random error', expectedCategory: 'unknown' }
    ]

    testCases.forEach(({ errorMessage }) => {
      it(`should handle error: "${errorMessage}"`, async () => {
        const executor = new AgentExecutor({ maxRetries: 0 })
        const agent = createMockAgent({ shouldSucceed: false, errorMessage })
        const state = createMockState()

        const context: ExecutionContext = {
          taskId: 'task-1',
          agent,
          state
        }

        const result = await executor.execute(context)

        expect(result.success).toBe(false)
        expect(result.error?.message).toBe(errorMessage)
      })
    })
  })

  describe('metrics tracking', () => {
    it('should track attempt count on success', async () => {
      const executor = new AgentExecutor({ maxRetries: 0 })
      const agent = createMockAgent({ shouldSucceed: true })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.metrics.attempts).toBe(1)
    })

    it('should track attempt count on failure', async () => {
      const executor = new AgentExecutor({
        maxRetries: 2,
        initialRetryDelay: 1
      })
      const agent = createMockAgent({ shouldSucceed: false, errorMessage: 'Error' })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.metrics.attempts).toBe(3) // 1 initial + 2 retries
    })

    it('should track retry delays', async () => {
      const executor = new AgentExecutor({
        maxRetries: 2,
        initialRetryDelay: 5,
        retryMultiplier: 2
      })
      const agent = createMockAgent({ shouldSucceed: false, errorMessage: 'Error' })
      const state = createMockState()

      const context: ExecutionContext = {
        taskId: 'task-1',
        agent,
        state
      }

      const result = await executor.execute(context)

      expect(result.metrics.retryDelays.length).toBe(2)
      expect(result.metrics.retryDelays[0]).toBe(5)
      expect(result.metrics.retryDelays[1]).toBe(10)
    })
  })

  describe('config management', () => {
    it('should update config', () => {
      const executor = new AgentExecutor()
      executor.updateConfig({ maxRetries: 10 })

      expect(executor.getConfig().maxRetries).toBe(10)
    })

    it('should preserve other config when updating', () => {
      const executor = new AgentExecutor({ timeout: 5000 })
      executor.updateConfig({ maxRetries: 10 })

      const config = executor.getConfig()
      expect(config.maxRetries).toBe(10)
      expect(config.timeout).toBe(5000)
    })
  })
})
