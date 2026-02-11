/**
 * ArchitectAgent - User Input Integration Tests
 *
 * Tests cover:
 * - needsUserInput() detection logic
 * - buildQuestionGroups() structure
 * - askUser() integration (mocked)
 */

import { ArchitectAgent } from '../../src/agents/roles/architect.agent'
import {
  getUserInputManager,
  resetUserInputManager,
  createAnswerSet
} from '../../src/orchestration/user-input-manager'

describe('ArchitectAgent - User Input', () => {
  let agent: ArchitectAgent

  beforeEach(() => {
    agent = new ArchitectAgent()
    resetUserInputManager()
  })

  afterEach(() => {
    resetUserInputManager()
  })

  describe('needsUserInput', () => {
    // Access private method via bracket notation
    const needsInput = (a: ArchitectAgent, task: string): boolean => {
      return (a as any).needsUserInput(task)
    }

    describe('creation tasks (should need input)', () => {
      it('should detect Russian creation verbs', () => {
        expect(needsInput(agent, 'создать сервис бронирования')).toBe(true)
        expect(needsInput(agent, 'создай приложение для учета')).toBe(true)
        expect(needsInput(agent, 'сделать сервис уведомлений')).toBe(true)
        expect(needsInput(agent, 'разработать систему аутентификации')).toBe(true)
        expect(needsInput(agent, 'построить микросервис')).toBe(true)
        expect(needsInput(agent, 'реализовать API для платежей')).toBe(true)
      })

      it('should detect English creation verbs', () => {
        expect(needsInput(agent, 'create a booking service')).toBe(true)
        expect(needsInput(agent, 'build a new web application')).toBe(true)
        expect(needsInput(agent, 'develop a payment system')).toBe(true)
        expect(needsInput(agent, 'implement user management')).toBe(true)
      })

      it('should detect "new project/service" patterns', () => {
        expect(needsInput(agent, 'новый сервис для заказов')).toBe(true)
        expect(needsInput(agent, 'новое приложение для трекинга')).toBe(true)
        expect(needsInput(agent, 'new service for booking')).toBe(true)
        expect(needsInput(agent, 'new app for task management')).toBe(true)
        expect(needsInput(agent, 'new project: e-commerce platform')).toBe(true)
      })
    })

    describe('non-creation tasks (should NOT need input)', () => {
      it('should skip for bug fixes', () => {
        expect(needsInput(agent, 'fix login bug')).toBe(false)
        expect(needsInput(agent, 'исправить ошибку в форме')).toBe(false)
        expect(needsInput(agent, 'починить API endpoint')).toBe(false)
        expect(needsInput(agent, 'debug memory leak')).toBe(false)
        expect(needsInput(agent, 'repair broken tests')).toBe(false)
      })

      it('should skip for refactoring', () => {
        expect(needsInput(agent, 'refactor auth module')).toBe(false)
        expect(needsInput(agent, 'cleanup legacy code')).toBe(false)
        expect(needsInput(agent, 'рефакторинг базы данных')).toBe(false)
      })

      it('should skip for optimization', () => {
        expect(needsInput(agent, 'optimize database queries')).toBe(false)
        expect(needsInput(agent, 'оптимизировать производительность')).toBe(false)
        expect(needsInput(agent, 'improve performance of API')).toBe(false)
      })

      it('should skip for updates', () => {
        expect(needsInput(agent, 'update dependencies')).toBe(false)
        expect(needsInput(agent, 'обновить пакеты')).toBe(false)
        expect(needsInput(agent, 'upgrade React to v19')).toBe(false)
      })

      it('should skip for generic analysis tasks', () => {
        expect(needsInput(agent, 'review system architecture')).toBe(false)
        expect(needsInput(agent, 'analyze performance bottlenecks')).toBe(false)
      })
    })
  })

  describe('buildQuestionGroups', () => {
    const buildGroups = (a: ArchitectAgent, task: string) => {
      return (a as any).buildQuestionGroups(task)
    }

    it('should return 4 groups', () => {
      const groups = buildGroups(agent, 'create booking service')
      expect(groups).toHaveLength(4)
    })

    it('should have scale group', () => {
      const groups = buildGroups(agent, 'create app')
      const scale = groups.find((g: any) => g.id === 'scale')
      expect(scale).toBeDefined()
      expect(scale.title).toBe('Application Scale')
      expect(scale.questions).toHaveLength(2)

      // app-type question
      const appType = scale.questions.find((q: any) => q.id === 'app-type')
      expect(appType).toBeDefined()
      expect(appType.type).toBe('single_choice')
      expect(appType.options.length).toBeGreaterThanOrEqual(3)

      // scope question
      const scope = scale.questions.find((q: any) => q.id === 'scope')
      expect(scope).toBeDefined()
    })

    it('should have tech-stack group', () => {
      const groups = buildGroups(agent, 'create app')
      const tech = groups.find((g: any) => g.id === 'tech-stack')
      expect(tech).toBeDefined()
      expect(tech.questions).toHaveLength(4) // frontend, backend, database, typescript

      const questionIds = tech.questions.map((q: any) => q.id)
      expect(questionIds).toContain('frontend')
      expect(questionIds).toContain('backend')
      expect(questionIds).toContain('database')
      expect(questionIds).toContain('typescript')
    })

    it('should have features group', () => {
      const groups = buildGroups(agent, 'create app')
      const features = groups.find((g: any) => g.id === 'features')
      expect(features).toBeDefined()

      const featureQ = features.questions.find((q: any) => q.id === 'features')
      expect(featureQ).toBeDefined()
      expect(featureQ.type).toBe('multiple_choice')

      const authQ = features.questions.find((q: any) => q.id === 'auth-type')
      expect(authQ).toBeDefined()
      expect(authQ.type).toBe('single_choice')
    })

    it('should have preferences group', () => {
      const groups = buildGroups(agent, 'create app')
      const prefs = groups.find((g: any) => g.id === 'preferences')
      expect(prefs).toBeDefined()

      const lang = prefs.questions.find((q: any) => q.id === 'ui-language')
      expect(lang).toBeDefined()
    })
  })

  describe('askUser integration (via UserInputManager)', () => {
    it('should emit inputRequested when askUser is called', async () => {
      const manager = getUserInputManager()
      const requests: any[] = []

      manager.on('inputRequested', (req) => {
        requests.push(req)
        // Auto-respond
        const answers = createAnswerSet('architect', {
          'app-type': 'fullstack',
          'scope': 'mvp',
          'frontend': 'react',
          'backend': 'express',
          'database': 'sqlite',
          'typescript': true,
          'features': ['auth', 'api'],
          'auth-type': 'simple',
          'ui-language': 'en'
        })
        manager.submitResponse(req.id, answers, false)
      })

      // Call askUser via protected method (accessed through bracket notation)
      const groups = (agent as any).buildQuestionGroups('create booking')
      const response = await (agent as any).askUser(
        'Architecture design for booking service',
        groups
      )

      expect(requests).toHaveLength(1)
      expect(requests[0].agentId).toBe('architect')
      expect(requests[0].groups).toHaveLength(4)
      expect(response.cancelled).toBe(false)
      expect(response.answers.answers).toHaveLength(9)
    })

    it('should throw when user cancels', async () => {
      const manager = getUserInputManager()

      manager.on('inputRequested', (req) => {
        setTimeout(() => manager.cancelRequest(req.id), 10)
      })

      const groups = (agent as any).buildQuestionGroups('create app')

      await expect(
        (agent as any).askUser('Need input', groups)
      ).rejects.toThrow('Request cancelled by user')
    })
  })
})
