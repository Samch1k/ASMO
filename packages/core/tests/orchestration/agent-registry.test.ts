/**
 * AgentRegistry smoke tests
 *
 * These are basic tests to verify the AgentRegistry can be instantiated
 * and has the expected public API.
 *
 * TODO: Add comprehensive tests for:
 * - Agent registration and retrieval
 * - Role-based agent lookup
 * - Skill-based agent matching
 * - Error handling for missing agents
 * - Agent lifecycle management
 */

import { AgentRegistry } from '../../src/orchestration/agent-registry'

describe('AgentRegistry', () => {
  let agentRegistry: AgentRegistry

  beforeEach(() => {
    agentRegistry = new AgentRegistry()
  })

  describe('instantiation', () => {
    it('should create an AgentRegistry instance', () => {
      expect(agentRegistry).toBeInstanceOf(AgentRegistry)
    })

    it('should have a registerAgent method', () => {
      expect(typeof agentRegistry.registerAgent).toBe('function')
    })

    it('should have a getAgent method', () => {
      expect(typeof agentRegistry.getAgent).toBe('function')
    })

    it('should have a getAgentInstance method', () => {
      expect(typeof agentRegistry.getAgentInstance).toBe('function')
    })

    it('should have a getAllAgents method', () => {
      expect(typeof agentRegistry.getAllAgents).toBe('function')
    })

    it('should have a getAgentsByRole method', () => {
      expect(typeof agentRegistry.getAgentsByRole).toBe('function')
    })
  })

  describe('agent retrieval', () => {
    it('should throw error if getAgent called before initialization', () => {
      const newRegistry = new AgentRegistry()
      expect(() => newRegistry.getAgent('test')).toThrow('AgentRegistry not initialized')
    })

    it('should throw error if getAllAgents called before initialization', () => {
      const newRegistry = new AgentRegistry()
      expect(() => newRegistry.getAllAgents()).toThrow('AgentRegistry not initialized')
    })

    it('should return undefined for non-existent agent after initialization', async () => {
      // Provide minimal mock roles and skills for initialization
      const mockRoles: any[] = [{
        id: 'test-role',
        name: 'Test Role',
        category: 'core',
        required_skills: ['testing'],
        allowed_tools: [],
        seniority: 'mid'
      }]
      const mockSkillCatalog = new Map([['testing', { id: 'testing', name: 'Testing', category: 'qa' }]])

      await agentRegistry.autoDiscover(mockRoles, mockSkillCatalog)
      const agent = agentRegistry.getAgent('non-existent-agent')
      expect(agent).toBeUndefined()
    })

    it('should return agents array after initialization', async () => {
      const mockRoles: any[] = []
      const mockSkillCatalog = new Map()

      await agentRegistry.autoDiscover(mockRoles, mockSkillCatalog)
      const agents = agentRegistry.getAllAgents()
      expect(Array.isArray(agents)).toBe(true)
    })
  })

  // TODO: Add more comprehensive tests
  // - Test agent registration
  // - Test agent retrieval by ID
  // - Test agent retrieval by role
  // - Test skill-based matching
  // - Test error handling
})
