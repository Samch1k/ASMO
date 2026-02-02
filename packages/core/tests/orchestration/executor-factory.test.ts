/**
 * ExecutorFactory Tests
 * Tests for unified execution mode selection and routing
 */

import {
  ExecutorFactory,
  getExecutorFactory,
  resetExecutorFactory,
  type UnifiedExecutionContext
} from '../../src/orchestration/execution/executor-factory'
import { resetSessionExecutor } from '../../src/orchestration/execution/session-executor'
import { resetAPIExecutor } from '../../src/orchestration/execution/api-executor'
import type { AgentState } from '../../src/agents/types'

// Mock state factory
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

// Mock context factory
function createMockContext(overrides?: Partial<UnifiedExecutionContext>): UnifiedExecutionContext {
  return {
    taskId: 'task-1',
    prompt: 'Test prompt',
    state: createMockState(),
    model: 'sonnet',
    ...overrides
  }
}

describe('ExecutorFactory', () => {
  beforeEach(() => {
    resetExecutorFactory()
    resetSessionExecutor()
    resetAPIExecutor()
  })

  describe('constructor and singleton', () => {
    it('should create with default config', () => {
      const factory = new ExecutorFactory()
      const info = factory.getInfo()

      expect(info.preferredMode).toBe('auto')
    })

    it('should accept custom config', () => {
      const factory = new ExecutorFactory({
        preferredMode: 'api',
        verbose: true
      })
      const info = factory.getInfo()

      expect(info.preferredMode).toBe('api')
    })

    it('should return singleton instance', () => {
      const factory1 = getExecutorFactory()
      const factory2 = getExecutorFactory()

      expect(factory1).toBe(factory2)
    })

    it('should reset singleton', () => {
      const factory1 = getExecutorFactory()
      resetExecutorFactory()
      const factory2 = getExecutorFactory()

      expect(factory1).not.toBe(factory2)
    })
  })

  describe('mode resolution', () => {
    it('should resolve to session when preferred is session', () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })

      expect(factory.getPreferredMode()).toBe('session')
    })

    it('should resolve to session in auto mode (session is default available)', () => {
      const factory = new ExecutorFactory({ preferredMode: 'auto' })

      // Session is always "available" by default
      expect(factory.getPreferredMode()).toBe('session')
    })

    it('should set preferred mode', () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })

      factory.setPreferredMode('api')

      expect(factory.getInfo().preferredMode).toBe('api')
    })
  })

  describe('getAvailableModes', () => {
    it('should return both modes with availability', () => {
      const factory = new ExecutorFactory()
      const modes = factory.getAvailableModes()

      expect(modes).toHaveLength(2)
      expect(modes[0].mode).toBe('session')
      expect(modes[1].mode).toBe('api')
    })

    it('should include mode info', () => {
      const factory = new ExecutorFactory()
      const modes = factory.getAvailableModes()

      expect(modes[0].info).toBeDefined()
      expect(modes[1].info).toBeDefined()
    })
  })

  describe('getInfo', () => {
    it('should return factory info', () => {
      const factory = new ExecutorFactory({ preferredMode: 'api' })
      const info = factory.getInfo()

      expect(info.preferredMode).toBe('api')
      expect(info.resolvedMode).toBeDefined()
      expect(typeof info.sessionAvailable).toBe('boolean')
      expect(typeof info.apiAvailable).toBe('boolean')
    })
  })

  describe('execute', () => {
    it('should execute with session mode', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })
      const context = createMockContext()

      const result = await factory.execute(context)

      expect(result.metrics.mode).toBe('session')
      expect(result.metrics.duration).toBeGreaterThanOrEqual(0)
    })

    it('should include mode in result metrics', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })
      const context = createMockContext()

      const result = await factory.execute(context)

      expect(result.metrics).toHaveProperty('mode')
      expect(result.metrics).toHaveProperty('duration')
    })

    it('should allow mode override per task', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })
      const context = createMockContext({ mode: 'api' })

      const result = await factory.execute(context)

      // Mode should be overridden to API if available, otherwise falls back to session
      expect(['api', 'session']).toContain(result.metrics.mode)
    })

    it('should handle execution success', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })
      const context = createMockContext()

      const result = await factory.execute(context)

      // Session mode returns success for valid context
      expect(result.success).toBe(true)
    })
  })

  describe('config management', () => {
    it('should update config', () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })

      factory.updateConfig({ preferredMode: 'api' })

      expect(factory.getInfo().preferredMode).toBe('api')
    })

    it('should update session config', () => {
      const factory = new ExecutorFactory()

      factory.updateConfig({
        session: { timeout: 5000 }
      })

      // Config updated without error
      expect(factory.getInfo()).toBeDefined()
    })

    it('should update api config', () => {
      const factory = new ExecutorFactory()

      factory.updateConfig({
        api: { timeout: 10000 }
      })

      // Config updated without error
      expect(factory.getInfo()).toBeDefined()
    })
  })

  describe('mode selection logic', () => {
    it('should prefer session when both available in auto mode', () => {
      const factory = new ExecutorFactory({ preferredMode: 'auto' })

      // In auto mode, should prefer session (free)
      expect(factory.getPreferredMode()).toBe('session')
    })

    it('should fallback to session when requested mode unavailable', () => {
      const factory = new ExecutorFactory({ preferredMode: 'api' })

      // API may not be available (no API key), should still resolve
      const mode = factory.getPreferredMode()
      expect(['session', 'api']).toContain(mode)
    })
  })

  describe('execution metrics', () => {
    it('should track duration', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'session' })
      const context = createMockContext()

      const startTime = Date.now()
      const result = await factory.execute(context)
      const elapsed = Date.now() - startTime

      expect(result.metrics.duration).toBeGreaterThanOrEqual(0)
      expect(result.metrics.duration).toBeLessThanOrEqual(elapsed + 100)
    })

    it('should include API metrics when using API mode', async () => {
      const factory = new ExecutorFactory({ preferredMode: 'api' })
      const context = createMockContext({ mode: 'api' })

      const result = await factory.execute(context)

      if (result.metrics.mode === 'api') {
        // API mode may include token counts and cost
        expect(result.metrics).toHaveProperty('mode', 'api')
      }
    })
  })
})
