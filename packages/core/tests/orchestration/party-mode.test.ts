/**
 * Tests for PartyModeManager
 *
 * Covers parallel agent execution, timeout handling, merge strategies,
 * conflict detection, and error handling.
 */

import {
  PartyModeManager,
  getPartyModeManager,
  resetPartyModeManager,
  type PartyAgent
} from '../../src/orchestration/party-mode-manager'
import type { AgentState } from '../../src/agents/types'

describe('PartyModeManager', () => {
  let manager: PartyModeManager

  beforeEach(() => {
    resetPartyModeManager()
    manager = getPartyModeManager({
      enabled: true,
      maxParallelAgents: 3,
      coordinationStrategy: 'merge',
      timeout: 5000
    })
  })

  afterEach(() => {
    resetPartyModeManager()
  })

  describe('Configuration', () => {
    it('should create manager with default config', () => {
      resetPartyModeManager()
      const defaultManager = getPartyModeManager()

      const config = defaultManager.getConfig()
      expect(config.enabled).toBe(true)
      expect(config.maxParallelAgents).toBe(5)
      expect(config.coordinationStrategy).toBe('merge')
      expect(config.timeout).toBe(30000)
    })

    it('should create manager with custom config', () => {
      const config = manager.getConfig()
      expect(config.enabled).toBe(true)
      expect(config.maxParallelAgents).toBe(3)
      expect(config.coordinationStrategy).toBe('merge')
      expect(config.timeout).toBe(5000)
    })

    it('should validate config on creation', () => {
      expect(() => {
        new PartyModeManager({
          enabled: true,
          maxParallelAgents: 0,
          coordinationStrategy: 'merge',
          timeout: 5000
        })
      }).toThrow('maxParallelAgents must be at least 1')
    })

    it('should enable/disable party mode', () => {
      expect(manager.isEnabled()).toBe(true)
      manager.disable()
      expect(manager.isEnabled()).toBe(false)
      manager.enable()
      expect(manager.isEnabled()).toBe(true)
    })
  })

  describe('executeParallel', () => {
    it('should execute multiple agents in parallel', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A', output: 'Output A' }),
        createMockAgent('agent-2', { result: 'B', output: 'Output B' }),
        createMockAgent('agent-3', { result: 'C', output: 'Output C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      expect(result.agentResults.size).toBe(3)
      expect(result.metadata.successfulAgents).toBe(3)
      expect(result.metadata.failedAgents).toBe(0)
    })

    it('should handle agent failures gracefully', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A' }),
        createMockAgent('agent-2', null, new Error('Agent failed')),
        createMockAgent('agent-3', { result: 'C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      expect(result.agentResults.size).toBe(2)
      expect(result.conflicts.some(c => c.includes('agent-2') && c.includes('Agent failed'))).toBe(true)
    })

    it('should enforce max parallel agents limit', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { result: 'A' }),
        createMockAgent('agent-2', { result: 'B' }),
        createMockAgent('agent-3', { result: 'C' }),
        createMockAgent('agent-4', { result: 'D' })
      ]

      await expect(
        manager.executeParallel(mockAgents, 'test task', {} as AgentState)
      ).rejects.toThrow('Too many agents')
    })

    it('should timeout slow agents', async () => {
      const slowAgent = createMockAgent('slow-agent', { result: 'A' }, undefined, 10000)
      const fastAgent = createMockAgent('fast-agent', { result: 'B' }, undefined, 100)

      const result = await manager.executeParallel(
        [slowAgent, fastAgent],
        'test task',
        {} as AgentState
      )

      // Slow agent should timeout, fast agent should succeed
      expect(result.agentResults.size).toBe(1) // Only fast agent
      expect(result.agentResults.has('fast-agent')).toBe(true)
      expect(result.conflicts.some(c => c.includes('slow-agent') && c.includes('timed out'))).toBe(true)
    }, 15000) // 15 second timeout for this test
  })

  describe('Merge Strategies', () => {
    it('should merge results with "merge" strategy', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { output: 'A', artifacts: ['file1.ts'] }),
        createMockAgent('agent-2', { output: 'B', artifacts: ['file2.ts'] })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      expect(result.mergedResult.contributors).toEqual(['agent-1', 'agent-2'])
      expect(result.mergedResult.artifacts).toContain('file1.ts')
      expect(result.mergedResult.artifacts).toContain('file2.ts')
    })

    it('should use "vote" strategy when configured', async () => {
      resetPartyModeManager()
      const voteManager = getPartyModeManager({
        coordinationStrategy: 'vote'
      })

      const mockAgents = [
        createMockAgent('agent-1', { output: 'A' }),
        createMockAgent('agent-2', { output: 'A' }),
        createMockAgent('agent-3', { output: 'B' })
      ]

      const result = await voteManager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      expect(result.mergedResult.output).toBe('A')
      expect(result.mergedResult.votingStats.winnerVotes).toBe(2)
    })

    it('should require consensus with "consensus" strategy', async () => {
      resetPartyModeManager()
      const consensusManager = getPartyModeManager({
        coordinationStrategy: 'consensus'
      })

      const mockAgents = [
        createMockAgent('agent-1', { output: 'A' }),
        createMockAgent('agent-2', { output: 'B' })
      ]

      await expect(
        consensusManager.executeParallel(mockAgents, 'test task', {} as AgentState)
      ).rejects.toThrow('No consensus reached')
    })
  })

  describe('Conflict Detection', () => {
    it('should detect conflicts between different outputs', async () => {
      const mockAgents = [
        createMockAgent('agent-1', { recommendation: 'approach-A' }),
        createMockAgent('agent-2', { recommendation: 'approach-B' }),
        createMockAgent('agent-3', { recommendation: 'approach-C' })
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      expect(result.conflicts.length).toBeGreaterThan(0)
    })

    it('should not report conflicts for identical outputs', async () => {
      const sameOutput = { recommendation: 'same-approach' }
      const mockAgents = [
        createMockAgent('agent-1', sameOutput),
        createMockAgent('agent-2', sameOutput)
      ]

      const result = await manager.executeParallel(
        mockAgents,
        'test task',
        {} as AgentState
      )

      const realConflicts = result.conflicts.filter(c =>
        c.includes('Conflict between')
      )
      expect(realConflicts).toHaveLength(0)
    })
  })
})

// Helper function
function createMockAgent(
  id: string,
  result: any,
  error?: Error,
  delay: number = 0
): PartyAgent {
  return {
    id,
    name: `Mock ${id}`,
    execute: jest.fn(async () => {
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay))
      }
      if (error) {
        throw error
      }
      return result
    })
  }
}
