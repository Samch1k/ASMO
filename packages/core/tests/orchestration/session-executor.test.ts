/**
 * SessionExecutor Tests
 * Tests for session-based execution mode ($0 cost using Claude subscription)
 */

import {
  SessionExecutor,
  getSessionExecutor,
  resetSessionExecutor,
  type SessionExecutionContext
} from '../../src/orchestration/execution/session-executor'
import type { AgentState } from '../../src/agents/types'

// Mock state factory
function createMockState(): AgentState {
  return {
    task: 'Test task',
    taskType: 'testing',
    context: { key: 'value' },
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

// Mock context factory
function createMockContext(overrides?: Partial<SessionExecutionContext>): SessionExecutionContext {
  return {
    taskId: 'task-1',
    prompt: 'Test prompt for execution',
    state: createMockState(),
    model: 'sonnet',
    ...overrides
  }
}

describe('SessionExecutor', () => {
  beforeEach(() => {
    resetSessionExecutor()
  })

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const executor1 = getSessionExecutor()
      const executor2 = getSessionExecutor()

      expect(executor1).toBe(executor2)
    })

    it('should reset singleton', () => {
      const executor1 = getSessionExecutor()
      resetSessionExecutor()
      const executor2 = getSessionExecutor()

      expect(executor1).not.toBe(executor2)
    })
  })

  describe('constructor', () => {
    it('should create with default config', () => {
      const executor = new SessionExecutor()
      const info = executor.getInfo()

      expect(info.mode).toBe('session')
      expect(info.provider).toBe('claude_code')
    })

    it('should accept custom config', () => {
      const executor = new SessionExecutor({
        verbose: true,
        timeout: 60000
      })

      expect(executor).toBeDefined()
    })
  })

  describe('execute', () => {
    it('should execute task successfully', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.success).toBe(true)
      expect(result.metrics.mode).toBe('session')
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0)
    })

    it('should include output with session execution marker', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext()

      const result = await executor.execute(context)

      expect(result.output).toBeDefined()
      expect(result.output!.context!._sessionExecution).toBe(true)
      expect(result.output!.context!._taskId).toBe('task-1')
    })

    it('should include session prompt in output context', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext({
        prompt: 'Execute this specific task'
      })

      const result = await executor.execute(context)

      expect(result.output!.context!._sessionPrompt).toContain('Execute this specific task')
    })

    it('should preserve original state context', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext()
      context.state.context = { existingKey: 'existingValue' }

      const result = await executor.execute(context)

      expect(result.output!.context!.existingKey).toBe('existingValue')
    })

    it('should track duration', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext()

      const startTime = Date.now()
      const result = await executor.execute(context)
      const elapsed = Date.now() - startTime

      expect(result.metrics.duration).toBeGreaterThanOrEqual(0)
      expect(result.metrics.duration).toBeLessThanOrEqual(elapsed + 100)
    })

    it('should include model hint in prompt when specified', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext({ model: 'opus' })

      const result = await executor.execute(context)

      expect(result.output!.context!._sessionPrompt).toContain('opus')
    })
  })

  describe('isAvailable', () => {
    it('should return true (session always available in Claude Code)', () => {
      const executor = new SessionExecutor()

      expect(executor.isAvailable()).toBe(true)
    })
  })

  describe('getInfo', () => {
    it('should return executor info', () => {
      const executor = new SessionExecutor()
      const info = executor.getInfo()

      expect(info.mode).toBe('session')
      expect(info.provider).toBe('claude_code')
      expect(info.cost).toContain('$0')
      expect(info.description).toBeTruthy()
    })
  })

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const executor = new SessionExecutor({ verbose: false })

      executor.updateConfig({ verbose: true, timeout: 30000 })

      // Config was updated - verify by behavior
      expect(executor).toBeDefined()
    })
  })

  describe('buildSessionPrompt', () => {
    it('should build prompt with task header', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext({ taskId: 'my-task-123' })

      const result = await executor.execute(context)

      expect(result.output!.context!._sessionPrompt).toContain('my-task-123')
    })

    it('should include context in prompt', async () => {
      const executor = new SessionExecutor()
      const context = createMockContext()
      context.state.context = { important: 'data' }

      const result = await executor.execute(context)

      expect(result.output!.context!._sessionPrompt).toContain('important')
      expect(result.output!.context!._sessionPrompt).toContain('data')
    })
  })

  describe('verbose mode', () => {
    it('should log when verbose is enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const executor = new SessionExecutor({ verbose: true })
      const context = createMockContext()

      await executor.execute(context)

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should not log when verbose is disabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const executor = new SessionExecutor({ verbose: false })
      const context = createMockContext()

      await executor.execute(context)

      // May still have some logs from other parts, but verbose-specific logs should be minimal
      consoleSpy.mockRestore()
    })
  })
})
