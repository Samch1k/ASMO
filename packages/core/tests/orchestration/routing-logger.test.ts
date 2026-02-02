/**
 * RoutingLogger Tests
 * Tests for routing decision logging and statistics
 */

import {
  RoutingLogger,
  getRoutingLogger,
  resetRoutingLogger
} from '../../src/orchestration/routing-logger'

describe('RoutingLogger', () => {
  beforeEach(() => {
    resetRoutingLogger()
  })

  describe('singleton', () => {
    it('should return singleton instance', () => {
      const logger1 = getRoutingLogger()
      const logger2 = getRoutingLogger()

      expect(logger1).toBe(logger2)
    })

    it('should reset singleton', () => {
      const logger1 = getRoutingLogger()
      resetRoutingLogger()
      const logger2 = getRoutingLogger()

      expect(logger1).not.toBe(logger2)
    })
  })

  describe('logDecision', () => {
    it('should log routing decision', () => {
      const logger = new RoutingLogger()

      const logId = logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task',
        selectedModel: 'sonnet',
        rationale: 'Medium complexity task',
        timestamp: new Date()
      })

      expect(logId).toBeDefined()
      expect(typeof logId).toBe('string')
    })

    it('should return unique log id', () => {
      const logger = new RoutingLogger()

      const logId1 = logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task 1',
        selectedModel: 'sonnet',
        rationale: 'Test',
        timestamp: new Date()
      })

      const logId2 = logger.logDecision({
        taskId: 'task-2',
        taskDescription: 'Test task 2',
        selectedModel: 'opus',
        rationale: 'Test',
        timestamp: new Date()
      })

      expect(logId1).not.toBe(logId2)
    })

    it('should increment decision count', () => {
      const logger = new RoutingLogger()

      const statsBefore = logger.getStats()
      const initialCount = statsBefore.totalDecisions

      logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task',
        selectedModel: 'sonnet',
        rationale: 'Test',
        timestamp: new Date()
      })

      const statsAfter = logger.getStats()
      expect(statsAfter.totalDecisions).toBe(initialCount + 1)
    })
  })

  describe('logOutcome', () => {
    it('should update log with outcome', () => {
      const logger = new RoutingLogger()

      const logId = logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task',
        selectedModel: 'sonnet',
        rationale: 'Test',
        timestamp: new Date()
      })

      logger.logOutcome(logId, {
        success: true,
        duration: 1000
      })

      const stats = logger.getStats()
      expect(stats.successRate).toBeGreaterThan(0)
    })

    it('should calculate duration', () => {
      const logger = new RoutingLogger()

      const logId = logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task',
        selectedModel: 'sonnet',
        rationale: 'Test',
        timestamp: new Date()
      })

      logger.logOutcome(logId, {
        success: true,
        duration: 500
      })

      const stats = logger.getStats()
      expect(stats.avgDuration).toBeGreaterThan(0)
    })

    it('should track failures', () => {
      const logger = new RoutingLogger()

      const logId = logger.logDecision({
        taskId: 'task-1',
        taskDescription: 'Test task',
        selectedModel: 'sonnet',
        rationale: 'Test',
        timestamp: new Date()
      })

      logger.logOutcome(logId, {
        success: false,
        duration: 1000,
        error: 'Test error'
      })

      const stats = logger.getStats()
      // With one failed decision, success rate should be 0
      expect(stats.successRate).toBe(0)
    })
  })

  describe('getStats', () => {
    it('should count decisions by model', () => {
      const logger = new RoutingLogger()

      logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      logger.logDecision({ taskId: 't3', taskDescription: 'Task 3', selectedModel: 'opus', rationale: 'Test', timestamp: new Date() })

      const stats = logger.getStats()
      expect(stats.byModel.sonnet).toBe(2)
      expect(stats.byModel.opus).toBe(1)
    })

    it('should calculate success rate', () => {
      const logger = new RoutingLogger()

      const logId1 = logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      const logId2 = logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })

      logger.logOutcome(logId1, { success: true, duration: 100 })
      logger.logOutcome(logId2, { success: false, duration: 100 })

      const stats = logger.getStats()
      expect(stats.successRate).toBe(0.5)
    })

    it('should track average duration', () => {
      const logger = new RoutingLogger()

      const logId1 = logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      const logId2 = logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })

      logger.logOutcome(logId1, { success: true, duration: 100 })
      logger.logOutcome(logId2, { success: true, duration: 300 })

      const stats = logger.getStats()
      expect(stats.avgDuration).toBe(200)
    })

    it('should return zero stats when empty', () => {
      const logger = new RoutingLogger()
      const stats = logger.getStats()

      expect(stats.totalDecisions).toBe(0)
      expect(stats.successRate).toBe(0)
      expect(stats.avgDuration).toBe(0)
    })
  })

  describe('getRecentEntries', () => {
    it('should return recent entries', () => {
      const logger = new RoutingLogger()

      logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test 1', timestamp: new Date() })
      logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'opus', rationale: 'Test 2', timestamp: new Date() })

      const recent = logger.getRecentEntries(10)

      expect(Array.isArray(recent)).toBe(true)
      expect(recent.length).toBe(2)
    })

    it('should limit results', () => {
      const logger = new RoutingLogger()

      for (let i = 0; i < 20; i++) {
        logger.logDecision({ taskId: `t${i}`, taskDescription: `Task ${i}`, selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      }

      const recent = logger.getRecentEntries(5)

      expect(recent.length).toBe(5)
    })

    it('should return most recent entries', () => {
      const logger = new RoutingLogger()

      logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'First', timestamp: new Date() })
      logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'opus', rationale: 'Second', timestamp: new Date() })

      const recent = logger.getRecentEntries(10)

      // getRecentEntries returns the last N entries (most recent at end)
      expect(recent[1].decision.taskId).toBe('t2')
      expect(recent[0].decision.taskId).toBe('t1')
    })
  })

  describe('clear', () => {
    it('should clear all data', () => {
      const logger = new RoutingLogger()

      logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'opus', rationale: 'Test', timestamp: new Date() })

      logger.clear()

      const stats = logger.getStats()
      expect(stats.totalDecisions).toBe(0)
    })
  })

  describe('getEntriesByModel', () => {
    it('should filter entries by model', () => {
      const logger = new RoutingLogger()

      logger.logDecision({ taskId: 't1', taskDescription: 'Task 1', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })
      logger.logDecision({ taskId: 't2', taskDescription: 'Task 2', selectedModel: 'opus', rationale: 'Test', timestamp: new Date() })
      logger.logDecision({ taskId: 't3', taskDescription: 'Task 3', selectedModel: 'sonnet', rationale: 'Test', timestamp: new Date() })

      const sonnetEntries = logger.getEntriesByModel('sonnet')
      const opusEntries = logger.getEntriesByModel('opus')

      expect(sonnetEntries.length).toBe(2)
      expect(opusEntries.length).toBe(1)
    })
  })
})
