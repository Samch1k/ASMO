/**
 * Tests for DynamicOrchestrator
 */

// Uses Jest globals (describe, it, expect, beforeEach, afterEach, jest)
import {
  DynamicOrchestrator,
  getDynamicOrchestrator,
  resetDynamicOrchestrator,
  type OrchestrationTask
} from '../../src/orchestration/dynamic-orchestrator'
import { resetTaskRouter } from '../../src/orchestration/task-router'
import { resetRoutingLogger } from '../../src/orchestration/routing-logger'
import { resetAgentExecutor } from '../../src/orchestration/agent-executor'

describe('DynamicOrchestrator', () => {
  beforeEach(() => {
    // Reset all singletons before each test
    resetDynamicOrchestrator()
    resetTaskRouter()
    resetRoutingLogger()
    resetAgentExecutor()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getDynamicOrchestrator()
      const instance2 = getDynamicOrchestrator()
      expect(instance1).toBe(instance2)
    })

    it('should create new instance after reset', () => {
      const instance1 = getDynamicOrchestrator()
      resetDynamicOrchestrator()
      const instance2 = getDynamicOrchestrator()
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const orchestrator = new DynamicOrchestrator()
      const stats = orchestrator.getStats()

      expect(stats.config.verbose).toBe(false)
      expect(stats.config.maxConcurrency).toBe(5)
    })

    it('should accept custom configuration', () => {
      const orchestrator = new DynamicOrchestrator({
        verbose: true,
        maxConcurrency: 10
      })
      const stats = orchestrator.getStats()

      expect(stats.config.verbose).toBe(true)
      expect(stats.config.maxConcurrency).toBe(10)
    })

    it('should update configuration', () => {
      const orchestrator = new DynamicOrchestrator()
      orchestrator.updateConfig({ verbose: true })

      const stats = orchestrator.getStats()
      expect(stats.config.verbose).toBe(true)
    })
  })

  describe('Routing Preview', () => {
    it('should preview routing without executing', () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'test-task-1',
        description: 'Fix a simple typo in the README',
        taskType: 'documentation'
      }

      const routing = orchestrator.previewRouting(task)

      expect(routing).toBeDefined()
      expect(routing.model).toBeDefined()
      expect(routing.rationale).toBeDefined()
    })

    it('should route simple tasks to haiku', () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'simple-task',
        description: 'Fix a simple typo',
        complexity: { score: 10, level: 'trivial' }
      }

      const routing = orchestrator.previewRouting(task)
      expect(routing.model).toBe('haiku')
    })

    it('should route complex tasks to opus', () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'complex-task',
        description: 'Design enterprise architecture',
        complexity: { score: 90, level: 'enterprise' }
      }

      const routing = orchestrator.previewRouting(task)
      expect(routing.model).toBe('opus')
    })

    it('should route medium tasks to sonnet', () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'medium-task',
        description: 'Implement a new feature',
        complexity: { score: 50, level: 'medium' }
      }

      const routing = orchestrator.previewRouting(task)
      expect(routing.model).toBe('sonnet')
    })
  })

  describe('Task Execution', () => {
    it('should fail gracefully without agent registry', async () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'test-task',
        description: 'Test task without registry'
      }

      const result = await orchestrator.executeTask(task)

      expect(result.success).toBe(false)
      expect(result.error).toContain('No agent available')
    })

    it('should include routing information in result', async () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'test-task',
        description: 'Test task'
      }

      const result = await orchestrator.executeTask(task)

      expect(result.routing).toBeDefined()
      expect(result.routing.model).toBeDefined()
      expect(result.routing.rationale).toBeDefined()
    })

    it('should include metrics in result', async () => {
      const orchestrator = new DynamicOrchestrator()

      const task: OrchestrationTask = {
        id: 'test-task',
        description: 'Test task'
      }

      const result = await orchestrator.executeTask(task)

      expect(result.metrics).toBeDefined()
      expect(result.metrics.totalDuration).toBeGreaterThanOrEqual(0)
      expect(result.metrics.attempts).toBe(0) // No attempts since no agent
    })
  })

  describe('Statistics', () => {
    it('should track routing statistics', () => {
      const orchestrator = new DynamicOrchestrator()

      // Preview some routes to generate stats
      orchestrator.previewRouting({ id: '1', description: 'Simple fix' })
      orchestrator.previewRouting({ id: '2', description: 'Another task' })

      const stats = orchestrator.getStats()

      expect(stats.routing.totalDecisions).toBeGreaterThanOrEqual(0)
      expect(stats.runningTasks).toBe(0)
    })
  })

  describe('Task Cancellation', () => {
    it('should return false for non-existent task', () => {
      const orchestrator = new DynamicOrchestrator()

      const cancelled = orchestrator.cancelTask('non-existent')
      expect(cancelled).toBe(false)
    })
  })
})
