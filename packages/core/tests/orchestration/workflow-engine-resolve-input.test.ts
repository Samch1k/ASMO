/**
 * WorkflowEngine - resolveInput() Method Tests
 *
 * Tests cover 2 resolution strategies:
 * 1. Workflow ID resolution (direct specification)
 * 2. Natural language resolution (via WorkflowSelector)
 */

import { WorkflowEngine } from '../../src/orchestration/workflow-engine'
import { AgentRegistry } from '../../src/orchestration/agent-registry'
import type { ProjectContext, Workflow } from '../../src/orchestration/types'

describe('WorkflowEngine - resolveInput()', () => {
  let engine: WorkflowEngine
  let registry: AgentRegistry

  beforeEach(async () => {
    registry = new AgentRegistry()
    engine = new WorkflowEngine(registry)
    await engine.initialize()
  })

  describe('Workflow ID Resolution (Strategy 1)', () => {
    it('should resolve valid workflow ID directly', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]
      
      if (workflows.length === 0) {
        console.warn('No workflows available, skipping workflow ID resolution test')
        return
      }

      const workflowId = workflows[0].id

      const result = await (engine as any).resolveInput(
        workflowId,
        undefined,
        undefined
      )

      expect(result.workflow.id).toBe(workflowId)
      expect(result.state.task).toBe(workflowId)
    })

    it('should fallback to natural language for non-existent workflow ID', async () => {
      // Non-existent workflow IDs are NOT recognized as workflow IDs
      // They fall back to natural language via WorkflowSelector
      const result = await (engine as any).resolveInput(
        'non-existent-workflow-id-12345',
        undefined,
        undefined
      )

      // Should resolve via natural language, NOT throw error
      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
      expect(result.state.task).toBe('non-existent-workflow-id-12345')
    })

    it('should merge initialState with workflow ID resolution', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]
      
      if (workflows.length === 0) {
        console.warn('No workflows available, skipping state merge test')
        return
      }

      const workflowId = workflows[0].id

      const result = await (engine as any).resolveInput(
        workflowId,
        {
          task: 'Custom task description',
          messages: [],
          context: { projectPath: '/test' }
        },
        undefined
      )

      expect(result.workflow.id).toBe(workflowId)
      expect(result.state.task).toBe('Custom task description')  // User override
      expect(result.state.context).toEqual({ projectPath: '/test' })
    })

    it('should use workflow ID as fallback task if not provided', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]
      
      if (workflows.length === 0) {
        console.warn('No workflows available, skipping fallback task test')
        return
      }

      const workflowId = workflows[0].id

      const result = await (engine as any).resolveInput(
        workflowId,
        undefined,
        undefined
      )

      expect(result.state.task).toBe(workflowId)
    })
  })

  describe('Natural Language Resolution (Strategy 3)', () => {
    it('should resolve natural language via WorkflowSelector', async () => {
      const result = await (engine as any).resolveInput(
        'Fix bug in login form validation',
        undefined,
        undefined
      )

      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
      expect(result.workflow.id).toBeTruthy()
      expect(result.state.task).toBe('Fix bug in login form validation')
    })

    it('should use WorkflowSelector for unknown input', async () => {
      const result = await (engine as any).resolveInput(
        'Design a new dashboard for user analytics',
        undefined,
        undefined
      )

      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
    })

    it('should pass project context to WorkflowSelector', async () => {
      const context: ProjectContext = {
        projectSize: 'large',
        techStack: ['React', 'Node.js'],
        projectPath: '/test/project',
        files: new Array(1000).fill('file.ts')
      }

      const result = await (engine as any).resolveInput(
        'Implement real-time notifications',
        undefined,
        context
      )

      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
    })

    it('should merge initialState with natural language resolution', async () => {
      const result = await (engine as any).resolveInput(
        'Add payment gateway integration',
        {
          messages: [],
          taskType: 'feature',
          context: { securityLevel: 'high' }
        },
        undefined
      )

      expect(result.state.taskType).toBe('feature')
      expect(result.state.context).toEqual({ securityLevel: 'high' })
    })

    it('should handle complex task descriptions', async () => {
      const result = await (engine as any).resolveInput(
        'Refactor authentication service to use OAuth2 with JWT tokens and refresh token rotation',
        undefined,
        undefined
      )

      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
      expect(result.state.task).toContain('OAuth2')
    })

    it('should handle empty task description via WorkflowSelector error', async () => {
      // WorkflowSelector should handle the empty string and throw
      await expect(
        (engine as any).resolveInput('', undefined, undefined)
      ).rejects.toThrow()
    })
  })

  describe('buildState() Helper Method', () => {
    it('should build state with defaults when initialState is undefined', () => {
      const state = (engine as any).buildState(undefined, 'Test task')

      expect(state.task).toBe('Test task')
      expect(state.messages).toEqual([])
      expect(state.taskType).toBe('feature')
      expect(state.context).toEqual({})
      expect(state.currentAgent).toBe('')
      expect(state.agentResults).toEqual([])
      expect(state.mcpData).toEqual({})
      expect(state.nextAction).toBe('')
      expect(state.requiresApproval).toBe(false)
    })

    it('should override task when provided in initialState', () => {
      const state = (engine as any).buildState(
        { task: 'Custom task from user' },
        'Fallback task'
      )

      expect(state.task).toBe('Custom task from user')
    })

    it('should merge initialState with defaults', () => {
      const state = (engine as any).buildState(
        {
          messages: [],
          taskType: 'bug',
          context: { priority: 'high' }
        },
        'Fix critical bug'
      )

      expect(state.task).toBe('Fix critical bug')
      expect(state.taskType).toBe('bug')
      expect(state.context).toEqual({ priority: 'high' })
      expect(state.messages).toEqual([])
    })

    it('should preserve all optional fields from initialState', () => {
      const state = (engine as any).buildState(
        {
          messages: [],
          task: 'Test',
          currentAgent: 'architect',
          nextAction: 'plan',
          requiresApproval: true
        },
        'Fallback'
      )

      expect(state.currentAgent).toBe('architect')
      expect(state.nextAction).toBe('plan')
      expect(state.requiresApproval).toBe(true)
    })
  })

  describe('isWorkflowId() Helper Method', () => {
    it('should return true for valid workflow IDs', () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]
      
      if (workflows.length === 0) {
        console.warn('No workflows available, skipping valid ID test')
        return
      }

      const workflowId = workflows[0].id
      const isValid = (engine as any).isWorkflowId(workflowId)

      expect(isValid).toBe(true)
    })

    it('should return false for non-existent workflow IDs', () => {
      const isValid = (engine as any).isWorkflowId('non-existent-id-12345')

      expect(isValid).toBe(false)
    })

    it('should return false for empty string', () => {
      const isValid = (engine as any).isWorkflowId('')

      expect(isValid).toBe(false)
    })

    it('should return false for natural language', () => {
      const isValid = (engine as any).isWorkflowId('Fix bug in login form')

      expect(isValid).toBe(false)
    })
  })

  describe('Resolution Priority Order', () => {
    it('should try workflow ID before natural language', async () => {
      const workflows = Array.from((engine as any).workflows.values()) as Workflow[]
      
      if (workflows.length === 0) {
        console.warn('No workflows available, skipping priority order test')
        return
      }

      const workflowId = workflows[0].id

      const result = await (engine as any).resolveInput(
        workflowId,  // Valid workflow ID
        undefined,
        undefined
      )

      // Should resolve as workflow ID, NOT natural language
      expect(result.workflow.id).toBe(workflowId)
    })

    it('should fallback to natural language when no workflow ID matches', async () => {
      const result = await (engine as any).resolveInput(
        'Some random task description that is not a workflow ID',
        undefined,
        undefined
      )

      // Should resolve via WorkflowSelector
      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
      expect(result.state.task).toBe('Some random task description that is not a workflow ID')
    })
  })
})
