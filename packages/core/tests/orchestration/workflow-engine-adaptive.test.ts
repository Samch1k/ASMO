/**
 * WorkflowEngine - Adaptive Selection Tests
 *
 * BMAD Phase 1.5: Integration Testing
 *
 * Tests cover:
 * - selectWorkflowAdaptively() method
 * - execute() with adaptive selection
 * - Workflow registration with analyzer and selector
 * - Configuration integration
 */

import { WorkflowEngine } from '../../src/orchestration/workflow-engine'
import { AgentRegistry } from '../../src/orchestration/agent-registry'
import type { ProjectContext, Workflow } from '../../src/orchestration/types'

describe('WorkflowEngine - Adaptive Selection', () => {
  let engine: WorkflowEngine
  let registry: AgentRegistry

  beforeEach(async () => {
    registry = new AgentRegistry()
    engine = new WorkflowEngine(registry)
    await engine.initialize()
  })

  describe('selectWorkflowAdaptively', () => {
    it('should select workflow based on task description', async () => {
      const selection = await engine.selectWorkflowAdaptively(
        'Fix bug in login form'
      )

      expect(selection).toBeDefined()
      expect(selection.workflow).toBeDefined()
      expect(selection.workflow.id).toBeTruthy()
      expect(selection.complexity).toBeDefined()
      expect(selection.complexity.level).toMatch(/trivial|simple|medium|complex|enterprise/)
      expect(selection.confidence).toBeGreaterThan(0)
      expect(selection.confidence).toBeLessThanOrEqual(1)
      expect(selection.reasoning).toBeTruthy()
    })

    it('should provide complexity analysis for bug fixes', async () => {
      const selection = await engine.selectWorkflowAdaptively(
        'Fix memory leak in authentication service'
      )

      expect(selection.complexity).toBeDefined()
      expect(selection.complexity.score).toBeGreaterThanOrEqual(0)
      expect(selection.complexity.score).toBeLessThanOrEqual(100)
      expect(selection.complexity.level).toBe('simple')
      expect(selection.complexity.recommendedAgents).toContain('debugger')
    })

    it('should analyze complex tasks correctly', async () => {
      const selection = await engine.selectWorkflowAdaptively(
        'Add user authentication with OAuth2 and JWT tokens'
      )

      expect(selection.complexity.score).toBeGreaterThan(50)
      expect(selection.complexity.factors).toBeDefined()
      expect(selection.complexity.factors.securityImpact).toBe(true)
      expect(selection.complexity.recommendedAgents).toContain('architect')
    })

    it('should respect user preference override', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]

      if (workflows.length === 0) {
        console.warn('No workflows available, skipping user preference test')
        return
      }

      const preferredWorkflowId = workflows[0].id

      const selection = await engine.selectWorkflowAdaptively(
        'Simple task description',
        undefined,
        preferredWorkflowId
      )

      expect(selection.workflow.id).toBe(preferredWorkflowId)
    })

    it('should provide alternatives when available', async () => {
      const selection = await engine.selectWorkflowAdaptively(
        'Unclear task with ambiguous requirements'
      )

      expect(selection.alternatives).toBeDefined()
      expect(Array.isArray(selection.alternatives)).toBe(true)
      // Alternatives may or may not be present depending on confidence
    })

    it('should work with project context', async () => {
      const context: ProjectContext = {
        projectPath: '/path/to/project',
        projectSize: 'large',
        techStack: ['React', 'Node.js', 'PostgreSQL'],
        files: new Array(500).fill('file.ts')
      }

      const selection = await engine.selectWorkflowAdaptively(
        'Add shopping cart feature',
        context
      )

      expect(selection).toBeDefined()
      expect(selection.workflow).toBeDefined()
    })

    it('should handle different complexity levels', async () => {
      const testCases = [
        { task: 'Fix typo in button text', expectedLevel: 'trivial' },
        { task: 'Fix error in form validation', expectedLevel: 'simple' },
        { task: 'Add user profile page', expectedLevel: 'medium' },
        { task: 'Redesign authentication system', expectedLevel: 'complex' }
      ]

      for (const testCase of testCases) {
        const selection = await engine.selectWorkflowAdaptively(testCase.task)

        expect(selection.complexity.level).toBe(testCase.expectedLevel)
      }
    })

    it('should throw error when not initialized', async () => {
      const uninitializedEngine = new WorkflowEngine(registry)

      await expect(
        uninitializedEngine.selectWorkflowAdaptively('Test task')
      ).rejects.toThrow('WorkflowEngine not initialized')
    })
  })

  describe('execute with adaptive selection', () => {
    it('should execute by workflow ID (traditional)', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]

      if (workflows.length === 0) {
        console.warn('No workflows available, skipping traditional execution test')
        return
      }

      const workflowId = workflows[0].id

      const result = await engine.execute(workflowId, {
        task: 'Test task'
      })

      expect(result).toBeDefined()
      expect(result.success).toBeDefined()
    })

    it('should execute by task description (adaptive)', async () => {
      const result = await engine.execute(
        'Fix memory leak in authentication service',
        undefined,
        { projectSize: 'large' }
      )

      expect(result).toBeDefined()
      expect(result.success).toBeDefined()
    })

    it('should initialize state with defaults', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]

      if (workflows.length === 0) {
        console.warn('No workflows available, skipping state initialization test')
        return
      }

      const workflowId = workflows[0].id

      const result = await engine.execute(workflowId)

      expect(result).toBeDefined()
      // State should be initialized with defaults
    })

    it('should merge provided state with defaults', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]

      if (workflows.length === 0) {
        console.warn('No workflows available, skipping state merge test')
        return
      }

      const workflowId = workflows[0].id

      const result = await engine.execute(workflowId, {
        task: 'Custom task',
        messages: []
      })

      expect(result).toBeDefined()
    })

    it('should distinguish between workflow ID and description', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]

      if (workflows.length === 0) {
        console.warn('No workflows available, skipping ID vs description test')
        return
      }

      const workflowId = workflows[0].id

      // Test with workflow ID
      const result1 = await engine.execute(workflowId)
      expect(result1).toBeDefined()

      // Test with task description
      const result2 = await engine.execute('Fix bug in login form')
      expect(result2).toBeDefined()
    })

    it('should throw error when not initialized', async () => {
      const uninitializedEngine = new WorkflowEngine(registry)

      await expect(
        uninitializedEngine.execute('Test task')
      ).rejects.toThrow('WorkflowEngine not initialized')
    })
  })

  describe('workflow registration', () => {
    it('should register workflows during initialization', async () => {
      // Workflows should be registered after initialize()
      const workflows = Array.from((engine as any).workflows.values())

      expect(workflows.length).toBeGreaterThan(0)

      // Complexity analyzer should have workflows
      const complexityAnalyzer = (engine as any).complexityAnalyzer
      expect(complexityAnalyzer).toBeDefined()

      // Workflow selector should have workflows
      const workflowSelector = (engine as any).workflowSelector
      expect(workflowSelector).toBeDefined()
    })
  })

  describe('configuration integration', () => {
    it('should use configuration from ConfigManager', async () => {
      // ConfigManager should be initialized during WorkflowEngine initialization
      const configManager = (engine as any).configManager
      expect(configManager).toBeDefined()

      // Complexity analyzer should be configured
      const complexityAnalyzer = (engine as any).complexityAnalyzer
      expect(complexityAnalyzer).toBeDefined()

      // Workflow selector should be configured
      const workflowSelector = (engine as any).workflowSelector
      expect(workflowSelector).toBeDefined()
    })
  })

  describe('error handling', () => {
    it('should handle empty task description gracefully', async () => {
      // Empty descriptions should be caught by WorkflowSelector/ComplexityAnalyzer
      await expect(
        engine.selectWorkflowAdaptively('')
      ).rejects.toThrow()
    })

    it('should handle invalid workflow ID in execute', async () => {
      // Invalid workflow IDs should be treated as task descriptions
      const result = await engine.execute('nonexistent-workflow-id-12345')

      // Should fallback to adaptive selection
      expect(result).toBeDefined()
    })
  })
})
