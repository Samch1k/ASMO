/**
 * Tests for TaskRouter
 */

// Uses Jest globals (describe, it, expect, beforeEach)
import {
  TaskRouter,
  getTaskRouter,
  resetTaskRouter,
  type TaskContext
} from '../../src/orchestration/task-router'
import { resetRoutingLogger } from '../../src/orchestration/routing-logger'

describe('TaskRouter', () => {
  beforeEach(() => {
    resetTaskRouter()
    resetRoutingLogger()
  })

  describe('Singleton', () => {
    it('should return the same instance', () => {
      const instance1 = getTaskRouter()
      const instance2 = getTaskRouter()
      expect(instance1).toBe(instance2)
    })

    it('should create new instance after reset', () => {
      const instance1 = getTaskRouter()
      resetTaskRouter()
      const instance2 = getTaskRouter()
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('Model Selection by Complexity Score', () => {
    it('should select haiku for low complexity (0-30)', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'test-1',
        description: 'Simple task',
        complexity: { score: 20, level: 'simple' }
      }

      const result = router.route(task)
      expect(result.model).toBe('haiku')
    })

    it('should select sonnet for medium complexity (31-70)', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'test-2',
        description: 'Medium task',
        complexity: { score: 50, level: 'medium' }
      }

      const result = router.route(task)
      expect(result.model).toBe('sonnet')
    })

    it('should select opus for high complexity (71-100)', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'test-3',
        description: 'Complex task',
        complexity: { score: 85, level: 'enterprise' }
      }

      const result = router.route(task)
      expect(result.model).toBe('opus')
    })

    it('should select haiku at threshold boundary (30)', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'boundary-1',
        description: 'Boundary task',
        complexity: { score: 30, level: 'simple' }
      }

      const result = router.route(task)
      expect(result.model).toBe('haiku')
    })

    it('should select sonnet just above haiku threshold (31)', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'boundary-2',
        description: 'Boundary task',
        complexity: { score: 31, level: 'medium' }
      }

      const result = router.route(task)
      expect(result.model).toBe('sonnet')
    })
  })

  describe('Model Selection by Task Type Override', () => {
    it('should use task type override for quick_fix', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'override-1',
        description: 'Quick fix task',
        taskType: 'quick_fix'
      }

      const result = router.route(task)
      expect(result.model).toBe('haiku')
    })

    it('should use task type override for architecture_design', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'override-2',
        description: 'Architecture task',
        taskType: 'architecture_design'
      }

      const result = router.route(task)
      expect(result.model).toBe('opus')
    })

    it('should use task type override for security_audit', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'override-3',
        description: 'Security audit task',
        taskType: 'security_audit'
      }

      const result = router.route(task)
      expect(result.model).toBe('opus')
    })

    it('should prioritize task type over complexity', () => {
      const router = new TaskRouter()

      // Low complexity but security audit task type
      const task: TaskContext = {
        id: 'priority-1',
        description: 'Security task',
        taskType: 'security_audit',
        complexity: { score: 10, level: 'trivial' }
      }

      const result = router.route(task)
      expect(result.model).toBe('opus') // Task type wins
    })
  })

  describe('Model Selection by Complexity Level', () => {
    it('should map trivial level to haiku', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'level-1',
        description: 'Trivial task',
        complexity: { score: 0, level: 'trivial' }
      }

      const result = router.route(task)
      expect(result.model).toBe('haiku')
    })

    it('should map enterprise level to opus', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'level-2',
        description: 'Enterprise task',
        complexity: { score: 100, level: 'enterprise' }
      }

      const result = router.route(task)
      expect(result.model).toBe('opus')
    })
  })

  describe('Model Selection by Keywords', () => {
    it('should infer opus from architect keywords', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'keyword-1',
        description: 'Design the system architecture for scalability'
      }

      const result = router.route(task)
      expect(result.model).toBe('opus')
    })

    it('should infer haiku from simple keywords', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'keyword-2',
        description: 'Fix a simple typo in the documentation'
      }

      const result = router.route(task)
      expect(result.model).toBe('haiku')
    })

    it('should default to sonnet without keywords', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'keyword-3',
        description: 'Process the data and generate report'
      }

      const result = router.route(task)
      expect(result.model).toBe('sonnet')
    })
  })

  describe('Agent Selection', () => {
    it('should respect preferred agent', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'agent-1',
        description: 'Test task',
        preferredAgent: 'my-agent'
      }

      const result = router.route(task)
      expect(result.agent).toBe('my-agent')
    })

    it('should select agent by required skills', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'agent-2',
        description: 'Security review task',
        requiredSkills: ['security']
      }

      const result = router.route(task)
      expect(result.agent).toBeDefined()
    })
  })

  describe('Routing Result', () => {
    it('should include rationale', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'result-1',
        description: 'Test task',
        complexity: { score: 50, level: 'medium' }
      }

      const result = router.route(task)
      expect(result.rationale).toBeDefined()
      expect(result.rationale.length).toBeGreaterThan(0)
    })

    it('should include alternatives', () => {
      const router = new TaskRouter()

      const task: TaskContext = {
        id: 'result-2',
        description: 'Test task'
      }

      const result = router.route(task)
      expect(result.alternatives).toBeDefined()
      expect(Array.isArray(result.alternatives)).toBe(true)
    })
  })

  describe('Configuration', () => {
    it('should use custom thresholds', () => {
      const router = new TaskRouter({
        complexityThresholds: {
          haiku: 20,  // Lower threshold
          sonnet: 60  // Lower threshold
        }
      })

      // Score 25 should now be sonnet (not haiku)
      const task: TaskContext = {
        id: 'config-1',
        description: 'Test task',
        complexity: { score: 25, level: 'simple' }
      }

      const result = router.route(task)
      expect(result.model).toBe('sonnet')
    })

    it('should allow updating config', () => {
      const router = new TaskRouter()

      router.updateConfig({
        defaultModel: 'opus'
      })

      const config = router.getConfig()
      expect(config.defaultModel).toBe('opus')
    })
  })
})
