/**
 * UserInputManager Tests
 *
 * Tests cover:
 * - Singleton lifecycle (getInstance, reset)
 * - requestInput / submitResponse flow
 * - Cancellation
 * - Timeout
 * - Event emissions
 * - createAnswerSet helper
 */

import {
  getUserInputManager,
  resetUserInputManager,
  createAnswerSet
} from '../../src/orchestration/user-input-manager'

import {
  createSingleChoiceQuestion,
  createBooleanQuestion,
  type QuestionGroup
} from '../../src/orchestration/user-input-types'

describe('UserInputManager', () => {
  beforeEach(() => {
    resetUserInputManager()
  })

  afterEach(() => {
    resetUserInputManager()
  })

  describe('singleton', () => {
    it('should return same instance', () => {
      const a = getUserInputManager()
      const b = getUserInputManager()
      expect(a).toBe(b)
    })

    it('should return new instance after reset', () => {
      const a = getUserInputManager()
      resetUserInputManager()
      const b = getUserInputManager()
      expect(a).not.toBe(b)
    })
  })

  describe('requestInput / submitResponse', () => {
    it('should pause workflow on requestInput', () => {
      const manager = getUserInputManager()

      // Fire and forget — don't await, we just want to check isPaused
      // Catch rejection to prevent unhandled promise from afterEach cleanup
      manager.requestInput('architect', 'Architect', 'Need input', [], []).catch(() => {})

      expect(manager.isPaused()).toBe(true)
      expect(manager.getActiveRequest()).not.toBeNull()
      expect(manager.getActiveRequest()!.agentId).toBe('architect')
    })

    it('should resolve on submitResponse', async () => {
      const manager = getUserInputManager()

      // Listen for the request and auto-respond
      manager.on('inputRequested', (request) => {
        const answers = createAnswerSet('architect', { db: 'postgres' })
        manager.submitResponse(request.id, answers, false)
      })

      const response = await manager.requestInput(
        'architect', 'Architect', 'Pick database', [], []
      )

      expect(response.cancelled).toBe(false)
      expect(response.answers.answers).toHaveLength(1)
      expect(response.answers.answers[0].questionId).toBe('db')
      expect(response.answers.answers[0].value).toBe('postgres')
    })

    it('should resume workflow after response', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (request) => {
        expect(manager.isPaused()).toBe(true)
        const answers = createAnswerSet('architect', {})
        manager.submitResponse(request.id, answers, false)
      })

      await manager.requestInput('architect', 'Architect', 'ctx', [], [])

      expect(manager.isPaused()).toBe(false)
      expect(manager.getActiveRequest()).toBeNull()
    })

    it('should support multiple answers', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (request) => {
        const answers = createAnswerSet('architect', {
          frontend: 'react',
          backend: 'express',
          database: 'sqlite',
          typescript: true
        })
        manager.submitResponse(request.id, answers, false)
      })

      const response = await manager.requestInput(
        'architect', 'Architect', 'Tech stack', [], []
      )

      expect(response.answers.answers).toHaveLength(4)
    })

    it('should track request in history', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (request) => {
        const answers = createAnswerSet('test', { q1: 'a1' })
        manager.submitResponse(request.id, answers, false)
      })

      await manager.requestInput('test', 'Test', 'ctx', [], [])

      const session = manager.getSession()
      expect(session.history).toHaveLength(1)
      expect(session.history[0].status).toBe('completed')
    })
  })

  describe('cancellation', () => {
    it('should reject promise on cancelRequest', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (request) => {
        // Simulate user pressing Ctrl+C
        setTimeout(() => manager.cancelRequest(request.id), 10)
      })

      await expect(
        manager.requestInput('architect', 'Architect', 'ctx', [], [])
      ).rejects.toThrow('Request cancelled by user')

      expect(manager.isPaused()).toBe(false)
    })

    it('should emit inputCancelled event', async () => {
      const manager = getUserInputManager()
      const cancelledIds: string[] = []

      manager.on('inputCancelled', (id) => cancelledIds.push(id))

      manager.on('inputRequested', (request) => {
        setTimeout(() => manager.cancelRequest(request.id), 10)
      })

      try {
        await manager.requestInput('test', 'Test', 'ctx', [], [])
      } catch {
        // Expected rejection
      }

      expect(cancelledIds).toHaveLength(1)
    })

    it('should mark history as cancelled', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (request) => {
        setTimeout(() => manager.cancelRequest(request.id), 10)
      })

      try {
        await manager.requestInput('test', 'Test', 'ctx', [], [])
      } catch {
        // Expected
      }

      const session = manager.getSession()
      expect(session.history[0].status).toBe('cancelled')
    })
  })

  describe('timeout', () => {
    it('should reject after timeout', async () => {
      const manager = getUserInputManager()

      // Don't respond — let it timeout
      await expect(
        manager.requestInput('architect', 'Architect', 'ctx', [], [], 100)
      ).rejects.toThrow('Request timeout')

      expect(manager.isPaused()).toBe(false)
    }, 5000)

    it('should emit inputTimeout event', async () => {
      const manager = getUserInputManager()
      const timeoutIds: string[] = []

      manager.on('inputTimeout', (id) => timeoutIds.push(id))

      try {
        await manager.requestInput('test', 'Test', 'ctx', [], [], 50)
      } catch {
        // Expected
      }

      expect(timeoutIds).toHaveLength(1)
    }, 5000)

    it('should mark history as timeout', async () => {
      const manager = getUserInputManager()

      try {
        await manager.requestInput('test', 'Test', 'ctx', [], [], 50)
      } catch {
        // Expected
      }

      const session = manager.getSession()
      expect(session.history[0].status).toBe('timeout')
    }, 5000)
  })

  describe('events', () => {
    it('should emit inputRequested event with request data', async () => {
      const manager = getUserInputManager()
      const requests: any[] = []

      manager.on('inputRequested', (req) => {
        requests.push(req)
        const answers = createAnswerSet('test', {})
        manager.submitResponse(req.id, answers, false)
      })

      await manager.requestInput('agent1', 'Agent One', 'context here', [], [])

      expect(requests).toHaveLength(1)
      expect(requests[0].agentId).toBe('agent1')
      expect(requests[0].agentName).toBe('Agent One')
      expect(requests[0].context).toBe('context here')
    })

    it('should emit inputReceived event with response data', async () => {
      const manager = getUserInputManager()
      const responses: any[] = []

      manager.on('inputReceived', (resp) => responses.push(resp))

      manager.on('inputRequested', (req) => {
        const answers = createAnswerSet('test', { key: 'value' })
        manager.submitResponse(req.id, answers, false)
      })

      await manager.requestInput('test', 'Test', 'ctx', [], [])

      expect(responses).toHaveLength(1)
      expect(responses[0].cancelled).toBe(false)
    })
  })

  describe('clearAll', () => {
    it('should reject all pending promises', async () => {
      const manager = getUserInputManager()

      const promise = manager.requestInput('test', 'Test', 'ctx', [], [])

      manager.clearAll()

      await expect(promise).rejects.toThrow('Cleared by manager')
    })

    it('should reset session state', () => {
      const manager = getUserInputManager()

      // Start a request (don't await), catch to prevent unhandled rejection
      manager.requestInput('test', 'Test', 'ctx', [], []).catch(() => {})

      manager.clearAll()

      expect(manager.isPaused()).toBe(false)
      expect(manager.getActiveRequest()).toBeNull()
      expect(manager.getSession().history).toHaveLength(0)
    })
  })

  describe('question groups', () => {
    it('should pass question groups through to request', async () => {
      const manager = getUserInputManager()

      const groups: QuestionGroup[] = [{
        id: 'tech',
        title: 'Technology',
        questions: [
          createSingleChoiceQuestion('db', 'Which database?', [
            { id: 'pg', label: 'PostgreSQL' },
            { id: 'sqlite', label: 'SQLite' }
          ]),
          createBooleanQuestion('ts', 'Use TypeScript?', true)
        ]
      }]

      manager.on('inputRequested', (request) => {
        expect(request.groups).toHaveLength(1)
        expect(request.groups[0].questions).toHaveLength(2)
        expect(request.groups[0].questions[0].id).toBe('db')
        expect(request.groups[0].questions[1].id).toBe('ts')

        const answers = createAnswerSet('test', { db: 'pg', ts: true })
        manager.submitResponse(request.id, answers, false)
      })

      const response = await manager.requestInput(
        'architect', 'Architect', 'Pick tech', groups, []
      )

      expect(response.answers.answers).toHaveLength(2)
    })
  })
})

describe('createAnswerSet', () => {
  it('should create answer set from key-value pairs', () => {
    const answers = createAnswerSet('agent1', {
      frontend: 'react',
      backend: 'express',
      typescript: true,
      features: ['auth', 'api']
    })

    expect(answers.agentId).toBe('agent1')
    expect(answers.answers).toHaveLength(4)
    expect(answers.complete).toBe(true)
    expect(answers.submittedAt).toBeInstanceOf(Date)

    const frontendAnswer = answers.answers.find(a => a.questionId === 'frontend')
    expect(frontendAnswer?.value).toBe('react')

    const featuresAnswer = answers.answers.find(a => a.questionId === 'features')
    expect(featuresAnswer?.value).toEqual(['auth', 'api'])
  })

  it('should handle empty answers', () => {
    const answers = createAnswerSet('agent1', {})
    expect(answers.answers).toHaveLength(0)
    expect(answers.complete).toBe(true)
  })
})
