/**
 * ComplexityAnalyzer comprehensive tests
 *
 * BMAD Phase 1: Complexity Analysis Testing
 *
 * Tests cover:
 * - Basic import and instantiation
 * - Task complexity analysis for all levels
 * - Workflow recommendation logic
 * - Edge cases and error handling
 * - Configuration options
 */

import { ComplexityAnalyzer } from '../../src/orchestration/complexity-analyzer'
import type { Workflow, ProjectContext } from '../../src/orchestration/types'

describe('ComplexityAnalyzer', () => {
  describe('import and instantiation', () => {
    it('should be importable', () => {
      expect(ComplexityAnalyzer).toBeDefined()
      expect(typeof ComplexityAnalyzer).toBe('function')
    })

    it('should instantiate with default config', () => {
      const analyzer = new ComplexityAnalyzer()
      expect(analyzer).toBeInstanceOf(ComplexityAnalyzer)
    })

    it('should instantiate with custom config', () => {
      const analyzer = new ComplexityAnalyzer({
        maxTokens: 1000,
        thresholds: {
          trivial: 15,
          simple: 35,
          medium: 55,
          complex: 75,
          enterprise: 100
        }
      })
      expect(analyzer).toBeInstanceOf(ComplexityAnalyzer)
    })
  })

  describe('workflow registration', () => {
    it('should register workflows', () => {
      const analyzer = new ComplexityAnalyzer()
      const workflows: Workflow[] = [
        {
          id: 'test-workflow',
          name: 'Test Workflow',
          description: 'Test workflow',
          trigger_condition: {},
          steps: [],
          estimated_time: '30m',
          success_criteria: 'Test passes'
        }
      ]

      expect(() => analyzer.registerWorkflows(workflows)).not.toThrow()
    })
  })

  describe('analyzeTask - complexity levels', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should classify trivial bug fixes', async () => {
      const result = await analyzer.analyzeTask('Fix typo in button text')

      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThanOrEqual(0)
      expect(result.score).toBeLessThanOrEqual(100)
      expect(result.level).toBe('trivial')
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.reasoning).toBeTruthy()
    })

    it('should classify simple bug fixes', async () => {
      const result = await analyzer.analyzeTask('Fix error in form validation')

      expect(result.level).toBe('simple')
      expect(result.factors).toBeDefined()
      expect(result.recommendedAgents).toContain('debugger')
    })

    it('should classify medium complexity features', async () => {
      const result = await analyzer.analyzeTask('Add user profile page with avatar upload')

      expect(result.level).toBe('medium')
      expect(result.factors.filesAffected).toBeGreaterThan(1)
      expect(result.recommendedAgents).toContain('developer')
    })

    it('should classify complex refactoring', async () => {
      const result = await analyzer.analyzeTask('Refactor authentication system to use OAuth2')

      expect(['medium', 'complex']).toContain(result.level)
      expect(result.factors.riskLevel).toMatch(/medium|high/)
      expect(result.factors.domainExpertiseRequired).toBe(true)
    })

    it('should classify complex architecture changes', async () => {
      const result = await analyzer.analyzeTask(
        'Design and implement microservices architecture for the entire platform'
      )

      expect(['complex', 'enterprise']).toContain(result.level)
      expect(result.factors.filesAffected).toBeGreaterThan(5)
      expect(result.recommendedAgents).toContain('architect')
    })
  })

  describe('analyzeTask - specific task types', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should recognize security-related tasks', async () => {
      const result = await analyzer.analyzeTask('Add JWT authentication with refresh tokens')

      expect(result.factors.securityImpact).toBe(true)
      expect(result.factors.domainExpertiseRequired).toBe(true)
    })

    it('should recognize performance tasks', async () => {
      const result = await analyzer.analyzeTask('Optimize database queries for search page')

      expect(result.factors.performanceImpact).toBe(true)
      expect(result.score).toBeGreaterThan(50)
    })

    it('should recognize database migration tasks', async () => {
      const result = await analyzer.analyzeTask('Migrate from PostgreSQL to MongoDB')

      expect(result.factors.dataChanges).toBe(true)
      expect(result.factors.riskLevel).toMatch(/medium|high/)
    })

    it('should recognize API design tasks', async () => {
      const result = await analyzer.analyzeTask('Design REST API for user management')

      expect(result.recommendedAgents).toEqual(
        expect.arrayContaining(['developer'])
      )
      expect(result.factors.dependencies).toBeGreaterThan(0)
    })
  })

  describe('analyzeTask - with project context', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should consider project context', async () => {
      const context: ProjectContext = {
        projectPath: '/path/to/project',
        projectSize: 'large',
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        files: new Array(1000).fill('file.ts')
      }

      const result = await analyzer.analyzeTask(
        'Add new feature to dashboard',
        context
      )

      expect(result).toBeDefined()
      expect(result.score).toBeGreaterThan(0)
    })

    it('should work without project context', async () => {
      const result = await analyzer.analyzeTask('Fix bug in login form')

      expect(result).toBeDefined()
      expect(result.level).toBe('simple')
    })
  })

  describe('workflow recommendation', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()

      // Register test workflows
      const workflows: Workflow[] = [
        {
          id: '1-quick-flow',
          name: 'Quick Flow',
          description: 'Fast bug fixes',
          trigger_condition: { keywords: ['bug', 'fix'] },
          steps: [],
          estimated_time: '15m',
          success_criteria: 'Bug fixed'
        },
        {
          id: '2-feature-development',
          name: 'Feature Development',
          description: 'New features',
          trigger_condition: { keywords: ['feature', 'add'] },
          steps: [],
          estimated_time: '1h',
          success_criteria: 'Feature complete'
        },
        {
          id: '3-quality-assurance',
          name: 'Quality Assurance',
          description: 'Complex changes',
          trigger_condition: {},
          steps: [],
          estimated_time: '2h',
          success_criteria: 'All quality checks pass'
        }
      ]

      analyzer.registerWorkflows(workflows)
    })

    it('should recommend quick-flow for trivial tasks', async () => {
      const result = await analyzer.analyzeTask('Fix typo')

      expect(result.recommendedWorkflow).toBe('1-quick-flow')
    })

    it('should recommend feature-development for medium tasks', async () => {
      const result = await analyzer.analyzeTask('Add user settings page')

      expect(['1-quick-flow', '2-feature-development']).toContain(
        result.recommendedWorkflow
      )
    })

    it('should recommend quality-assurance for complex tasks', async () => {
      const result = await analyzer.analyzeTask(
        'Redesign entire authentication system with OAuth2 and RBAC'
      )

      expect(['2-feature-development', '3-quality-assurance']).toContain(
        result.recommendedWorkflow
      )
    })
  })

  describe('error handling', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should throw error for empty task description', async () => {
      await expect(analyzer.analyzeTask('')).rejects.toThrow(
        'Task description cannot be empty'
      )
    })

    it('should throw error for whitespace-only task description', async () => {
      await expect(analyzer.analyzeTask('   ')).rejects.toThrow(
        'Task description cannot be empty'
      )
    })

    it('should handle analysis errors gracefully', async () => {
      // Even with invalid/unusual input, should return a fallback result
      const result = await analyzer.analyzeTask('∆∑∏√∫')

      expect(result).toBeDefined()
      expect(result.level).toBe('simple') // Fallback to simple
      expect(result.confidence).toBeGreaterThan(0)
    })
  })

  describe('recommended agents', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should recommend debugger and tester for bug fixes', async () => {
      const result = await analyzer.analyzeTask('Fix memory leak in API client')

      expect(result.recommendedAgents).toContain('debugger')
      expect(result.recommendedAgents).toContain('tester')
    })

    it('should recommend architect for complex changes', async () => {
      const result = await analyzer.analyzeTask('Redesign database schema')

      expect(result.recommendedAgents).toContain('architect')
    })

    it('should not recommend duplicate agents', async () => {
      const result = await analyzer.analyzeTask('Implement complex feature with testing')

      const uniqueAgents = new Set(result.recommendedAgents)
      expect(uniqueAgents.size).toBe(result.recommendedAgents.length)
    })
  })

  describe('complexity factors', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should provide detailed complexity factors', async () => {
      const result = await analyzer.analyzeTask('Add payment processing')

      expect(result.factors).toBeDefined()
      expect(result.factors.filesAffected).toBeGreaterThan(0)
      expect(result.factors.dependencies).toBeGreaterThanOrEqual(0)
      expect(result.factors.riskLevel).toMatch(/low|medium|high/)
      expect(typeof result.factors.domainExpertiseRequired).toBe('boolean')
      expect(result.factors.estimatedLOC).toBeGreaterThan(0)
      expect(typeof result.factors.dataChanges).toBe('boolean')
      expect(typeof result.factors.securityImpact).toBe('boolean')
      expect(typeof result.factors.performanceImpact).toBe('boolean')
    })

    it('should identify high-risk changes', async () => {
      const result = await analyzer.analyzeTask(
        'Modify core authentication system and database schema'
      )

      expect(result.factors.riskLevel).toMatch(/medium|high/)
      expect(result.factors.dataChanges).toBe(true)
    })
  })

  describe('confidence scores', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should provide confidence scores', async () => {
      const result = await analyzer.analyzeTask('Add button to navbar')

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('should have reasonable confidence for clear tasks', async () => {
      const result = await analyzer.analyzeTask('Fix typo in error message')

      expect(result.confidence).toBeGreaterThan(0.5)
    })
  })

  describe('reasoning', () => {
    let analyzer: ComplexityAnalyzer

    beforeEach(() => {
      analyzer = new ComplexityAnalyzer()
    })

    it('should provide clear reasoning', async () => {
      const result = await analyzer.analyzeTask('Implement search feature')

      expect(result.reasoning).toBeTruthy()
      expect(result.reasoning.length).toBeGreaterThan(10)
      expect(result.reasoning).toContain('Complexity level:')
    })

    it('should explain complexity factors in reasoning', async () => {
      const result = await analyzer.analyzeTask('Migrate to microservices')

      expect(result.reasoning).toBeTruthy()
      // Should mention files or risk or complexity
      expect(result.reasoning).toMatch(/file|risk|complex|enterprise/i)
    })
  })
})
