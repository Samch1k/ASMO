/**
 * Tests for DevOpsAgent
 */

// Mock MCP bridge
jest.mock('../../src/agents/mcp/mcp-bridge', () => ({
  mcpBridge: {
    callMCP: jest.fn().mockResolvedValue({
      success: true,
      data: { status: 'healthy' }
    })
  }
}))

import { DevOpsAgent } from '../../src/agents/roles/devops.agent'
import { mcpBridge } from '../../src/agents/mcp/mcp-bridge'
import type { AgentState } from '../../src/agents/types'

function makeState(overrides: Partial<AgentState> = {}): AgentState {
  return {
    task: 'Deploy frontend to production',
    taskType: 'deployment',
    context: {},
    messages: [],
    currentAgent: 'devops',
    agentResults: [],
    mcpData: {},
    nextAction: '',
    requiresApproval: false,
    ...overrides
  }
}

describe('DevOpsAgent', () => {
  let agent: DevOpsAgent

  beforeEach(() => {
    jest.clearAllMocks()
    agent = new DevOpsAgent()
  })

  // =========================================================================
  // Instantiation
  // =========================================================================

  describe('instantiation', () => {
    it('should create with correct agentId', () => {
      const info = agent.getInfo()
      expect(info.id).toBe('devops')
    })

    it('should have deployment-related capabilities', () => {
      const info = agent.getInfo()
      expect(info.capabilities).toContain('deployment')
      expect(info.capabilities).toContain('ci_cd')
      expect(info.capabilities).toContain('infrastructure')
    })
  })

  // =========================================================================
  // execute
  // =========================================================================

  describe('execute', () => {
    it('should return context fields on success', async () => {
      const state = makeState()
      const result = await agent.execute(state)

      expect(result.context).toBeDefined()
      expect(result.context!.deploymentPlan).toBeDefined()
      expect(result.context!.rollbackStrategy).toBeDefined()
      expect(result.context!.healthChecks).toBeDefined()
      expect(result.context!.infraStatus).toBeDefined()
    })

    it('should set nextAction to END', async () => {
      const result = await agent.execute(makeState())
      expect(result.nextAction).toBe('END')
    })

    it('should append agent results', async () => {
      const state = makeState()
      const result = await agent.execute(state)

      expect(result.agentResults).toBeDefined()
      expect(result.agentResults!.length).toBeGreaterThan(0)

      const lastResult = result.agentResults![result.agentResults!.length - 1]
      expect(lastResult.agentId).toBe('devops')
      expect(lastResult.status).toBe('success')
    })

    it('should create artifacts', async () => {
      const result = await agent.execute(makeState())

      const lastResult = result.agentResults![result.agentResults!.length - 1]
      expect(lastResult.artifacts).toBeDefined()
      expect(lastResult.artifacts!.length).toBeGreaterThanOrEqual(2)
    })
  })

  // =========================================================================
  // MCP failures
  // =========================================================================

  describe('MCP failures', () => {
    it('should handle MCP failure gracefully', async () => {
      ;(mcpBridge.callMCP as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Service unavailable'
      })

      const result = await agent.execute(makeState())

      // Should still succeed (MCP failures return null, not throw)
      expect(result.nextAction).toBe('END')
      expect(result.context?.infraStatus?.vercel).toBe('unavailable')
    })
  })

  // =========================================================================
  // LLM failures
  // =========================================================================

  describe('error handling', () => {
    it('should still complete when MCP calls throw', async () => {
      // BaseAgent.requestMCP catches errors and returns null
      // so DevOpsAgent treats it as unavailable and continues
      ;(mcpBridge.callMCP as jest.Mock).mockRejectedValue(new Error('Connection refused'))

      const result = await agent.execute(makeState())

      // Agent should still complete (MCP errors are non-fatal)
      expect(result.nextAction).toBe('END')
      expect(result.context?.infraStatus?.vercel).toBe('unavailable')
    })
  })

  // =========================================================================
  // compileReport (indirect via execute)
  // =========================================================================

  describe('report content', () => {
    it('should contain expected sections', async () => {
      const result = await agent.execute(makeState({ task: 'Deploy v2.0' }))

      const report = result.context?.deploymentPlan as string
      expect(report).toBeDefined()
      expect(report).toContain('Deployment Report')
      expect(report).toContain('Infrastructure Status')
      expect(report).toContain('Rollback Strategy')
      expect(report).toContain('Health Checks')
    })

    it('should contain infrastructure status table', async () => {
      const result = await agent.execute(makeState())

      const report = result.context?.deploymentPlan as string
      expect(report).toContain('Vercel')
      expect(report).toContain('Render')
    })
  })
})
