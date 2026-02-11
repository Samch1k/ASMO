/**
 * Artifact Pipeline Tests
 *
 * Tests that artifacts flow correctly between agents:
 * - mergeStepResult consolidates artifacts into state.artifacts
 * - mergeParallelResults preserves artifacts from parallel agents
 * - BaseAgent helpers: getArtifacts, getArtifactsByType, getArtifactsByAgent
 */

import { WorkflowEngine } from '../../src/orchestration/workflow-engine'
import { AgentRegistry } from '../../src/orchestration/agent-registry'
import type { AgentState, Artifact, AgentResult } from '../../src/agents/types'

describe('Artifact Pipeline', () => {
  let engine: WorkflowEngine

  beforeEach(async () => {
    const registry = new AgentRegistry()
    engine = new WorkflowEngine(registry)
    await engine.initialize()
  })

  describe('mergeStepResult', () => {
    const mergeStep = (e: WorkflowEngine, state: AgentState, result: any) => {
      return (e as any).mergeStepResult(state, result)
    }

    const baseState: AgentState = {
      messages: [],
      task: 'test',
      taskType: 'feature',
      context: {},
      currentAgent: '',
      agentResults: [],
      mcpData: {},
      nextAction: '',
      requiresApproval: false,
      artifacts: []
    }

    it('should consolidate artifacts from agentResults into state.artifacts', () => {
      const codeArtifact: Artifact = {
        type: 'code',
        content: 'const x = 1',
        metadata: { createdBy: 'developer', language: 'typescript' }
      }

      const testArtifact: Artifact = {
        type: 'test',
        content: 'test("x")',
        metadata: { createdBy: 'developer', testFramework: 'jest' }
      }

      const agentResult: AgentResult = {
        agentId: 'developer',
        status: 'success',
        output: {},
        artifacts: [codeArtifact, testArtifact],
        confidence: 0.9,
        timestamp: new Date()
      }

      const result = mergeStep(engine, baseState, {
        success: true,
        agentId: 'developer',
        output: {
          agentResults: [agentResult],
          context: { implementation: 'code here' }
        }
      })

      expect(result.artifacts).toHaveLength(2)
      expect(result.artifacts[0].type).toBe('code')
      expect(result.artifacts[1].type).toBe('test')
      expect(result.context.implementation).toBe('code here')
    })

    it('should accumulate artifacts across multiple steps', () => {
      const adrArtifact: Artifact = {
        type: 'adr',
        content: '# ADR',
        metadata: { createdBy: 'architect' }
      }

      const codeArtifact: Artifact = {
        type: 'code',
        content: 'impl',
        metadata: { createdBy: 'developer' }
      }

      // Step 1: Architect
      const stateAfterArchitect = mergeStep(engine, baseState, {
        success: true,
        agentId: 'architect',
        output: {
          agentResults: [{
            agentId: 'architect',
            status: 'success',
            output: {},
            artifacts: [adrArtifact],
            confidence: 0.9,
            timestamp: new Date()
          }],
          context: { architectureDecision: 'decision' }
        }
      })

      expect(stateAfterArchitect.artifacts).toHaveLength(1)
      expect(stateAfterArchitect.artifacts[0].type).toBe('adr')

      // Step 2: Developer
      const stateAfterDeveloper = mergeStep(engine, stateAfterArchitect, {
        success: true,
        agentId: 'developer',
        output: {
          agentResults: [{
            agentId: 'developer',
            status: 'success',
            output: {},
            artifacts: [codeArtifact],
            confidence: 0.9,
            timestamp: new Date()
          }],
          context: { implementation: 'code' }
        }
      })

      // Should have BOTH artifacts
      expect(stateAfterDeveloper.artifacts).toHaveLength(2)
      expect(stateAfterDeveloper.artifacts[0].type).toBe('adr')
      expect(stateAfterDeveloper.artifacts[1].type).toBe('code')
      expect(stateAfterDeveloper.context.architectureDecision).toBe('decision')
      expect(stateAfterDeveloper.context.implementation).toBe('code')
    })

    it('should handle agents with no artifacts', () => {
      const result = mergeStep(engine, baseState, {
        success: true,
        agentId: 'reviewer',
        output: {
          agentResults: [{
            agentId: 'reviewer',
            status: 'success',
            output: { review: 'looks good' },
            artifacts: [],
            confidence: 0.9,
            timestamp: new Date()
          }],
          context: { review: 'approved' }
        }
      })

      expect(result.artifacts).toHaveLength(0)
    })
  })

  describe('mergeParallelResults', () => {
    const mergeParallel = (e: WorkflowEngine, state: AgentState, outputs: any[], results: any[]) => {
      return (e as any).mergeParallelResults(state, outputs, results)
    }

    const baseState: AgentState = {
      messages: [],
      task: 'test',
      taskType: 'feature',
      context: {},
      currentAgent: '',
      agentResults: [],
      mcpData: {},
      nextAction: '',
      requiresApproval: false,
      artifacts: []
    }

    it('should preserve artifacts from parallel agents', () => {
      const backendCode: Artifact = {
        type: 'code',
        content: 'backend code',
        metadata: { createdBy: 'developer', layer: 'backend' }
      }

      const frontendCode: Artifact = {
        type: 'code',
        content: 'frontend code',
        metadata: { createdBy: 'ui-developer', layer: 'frontend' }
      }

      const outputs = [
        {
          _agentId: 'developer',
          _phase: 'implementation',
          agentResults: [{
            agentId: 'developer',
            status: 'success',
            output: {},
            artifacts: [backendCode],
            confidence: 0.9,
            timestamp: new Date()
          }],
          context: { implementation: 'backend' }
        },
        {
          _agentId: 'ui-developer',
          _phase: 'implementation',
          agentResults: [{
            agentId: 'ui-developer',
            status: 'success',
            output: {},
            artifacts: [frontendCode],
            confidence: 0.9,
            timestamp: new Date()
          }],
          context: { frontendCode: 'react components' }
        }
      ]

      const results = [
        { success: true, agentId: 'developer', output: outputs[0] },
        { success: true, agentId: 'ui-developer', output: outputs[1] }
      ]

      const merged = mergeParallel(engine, baseState, outputs, results)

      // Both artifacts should be preserved (not discarded!)
      expect(merged.artifacts.length).toBeGreaterThanOrEqual(2)
      expect(merged.agentResults).toHaveLength(2)

      // Context from both agents should be merged
      expect(merged.context.implementation).toBe('backend')
      expect(merged.context.frontendCode).toBe('react components')
    })

    it('should accumulate with existing state artifacts', () => {
      const existingArtifact: Artifact = {
        type: 'adr',
        content: 'architecture',
        metadata: { createdBy: 'architect' }
      }

      const stateWithArtifacts = {
        ...baseState,
        artifacts: [existingArtifact]
      }

      const newCode: Artifact = {
        type: 'code',
        content: 'new code',
        metadata: { createdBy: 'developer' }
      }

      const outputs = [{
        _agentId: 'developer',
        _phase: 'impl',
        agentResults: [{
          agentId: 'developer',
          status: 'success',
          output: {},
          artifacts: [newCode],
          confidence: 0.9,
          timestamp: new Date()
        }],
        context: {}
      }]

      const results = [{ success: true, agentId: 'developer', output: outputs[0] }]

      const merged = mergeParallel(engine, stateWithArtifacts, outputs, results)

      // Should have existing + new artifacts
      expect(merged.artifacts.length).toBeGreaterThanOrEqual(2)
      const types = merged.artifacts.map((a: Artifact) => a.type)
      expect(types).toContain('adr')
      expect(types).toContain('code')
    })
  })

  describe('BaseAgent artifact helpers', () => {
    // Use a concrete agent to test the protected methods
    it('should find artifacts by type via getArtifactsByType', async () => {
      // Import ArchitectAgent to test protected methods
      const { ArchitectAgent } = await import('../../src/agents/roles/architect.agent')
      const agent = new ArchitectAgent()

      const state: AgentState = {
        messages: [],
        task: 'test',
        taskType: 'feature',
        context: {},
        currentAgent: '',
        agentResults: [],
        mcpData: {},
        nextAction: '',
        requiresApproval: false,
        artifacts: [
          { type: 'adr', content: 'adr1', metadata: { createdBy: 'architect' } },
          { type: 'code', content: 'code1', metadata: { createdBy: 'developer' } },
          { type: 'code', content: 'code2', metadata: { createdBy: 'ui-developer' } },
          { type: 'test', content: 'test1', metadata: { createdBy: 'developer' } }
        ]
      }

      const codeArtifacts = (agent as any).getArtifactsByType(state, 'code')
      expect(codeArtifacts).toHaveLength(2)

      const adrArtifacts = (agent as any).getArtifactsByType(state, 'adr')
      expect(adrArtifacts).toHaveLength(1)

      const testArtifacts = (agent as any).getArtifactsByType(state, 'test')
      expect(testArtifacts).toHaveLength(1)
    })

    it('should find artifacts by agent via getArtifactsByAgent', async () => {
      const { ArchitectAgent } = await import('../../src/agents/roles/architect.agent')
      const agent = new ArchitectAgent()

      const state: AgentState = {
        messages: [],
        task: 'test',
        taskType: 'feature',
        context: {},
        currentAgent: '',
        agentResults: [],
        mcpData: {},
        nextAction: '',
        requiresApproval: false,
        artifacts: [
          { type: 'adr', content: 'adr', metadata: { createdBy: 'architect' } },
          { type: 'code', content: 'backend', metadata: { createdBy: 'developer' } },
          { type: 'code', content: 'frontend', metadata: { createdBy: 'ui-developer' } }
        ]
      }

      const architectArtifacts = (agent as any).getArtifactsByAgent(state, 'architect')
      expect(architectArtifacts).toHaveLength(1)
      expect(architectArtifacts[0].type).toBe('adr')

      const developerArtifacts = (agent as any).getArtifactsByAgent(state, 'developer')
      expect(developerArtifacts).toHaveLength(1)
      expect(developerArtifacts[0].content).toBe('backend')
    })

    it('should fallback to agentResults when state.artifacts is empty', async () => {
      const { ArchitectAgent } = await import('../../src/agents/roles/architect.agent')
      const agent = new ArchitectAgent()

      const state: AgentState = {
        messages: [],
        task: 'test',
        taskType: 'feature',
        context: {},
        currentAgent: '',
        agentResults: [{
          agentId: 'developer',
          status: 'success',
          output: {},
          artifacts: [
            { type: 'code', content: 'code', metadata: { createdBy: 'developer' } }
          ],
          confidence: 0.9,
          timestamp: new Date()
        }],
        mcpData: {},
        nextAction: '',
        requiresApproval: false,
        artifacts: []  // Empty!
      }

      const allArtifacts = (agent as any).getArtifacts(state)
      expect(allArtifacts).toHaveLength(1)
      expect(allArtifacts[0].type).toBe('code')
    })
  })
})
