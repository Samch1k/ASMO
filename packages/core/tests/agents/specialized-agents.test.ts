import {
  ScrumMasterAgent,
  SecuritySpecialistAgent,
  PerformanceEngineerAgent,
  DataArchitectAgent,
  APIDesignerAgent
} from '../../src'

/**
 * Tests for BMAD Phase 5: New Specialized Agents
 *
 * Verifies that all 5 new agents can be imported and instantiated.
 */
describe('BMAD Phase 5: New Specialized Agents', () => {
  describe('imports', () => {
    it('should import ScrumMasterAgent', () => {
      expect(ScrumMasterAgent).toBeDefined()
      expect(typeof ScrumMasterAgent).toBe('function')
    })

    it('should import SecuritySpecialistAgent', () => {
      expect(SecuritySpecialistAgent).toBeDefined()
      expect(typeof SecuritySpecialistAgent).toBe('function')
    })

    it('should import PerformanceEngineerAgent', () => {
      expect(PerformanceEngineerAgent).toBeDefined()
      expect(typeof PerformanceEngineerAgent).toBe('function')
    })

    it('should import DataArchitectAgent', () => {
      expect(DataArchitectAgent).toBeDefined()
      expect(typeof DataArchitectAgent).toBe('function')
    })

    it('should import APIDesignerAgent', () => {
      expect(APIDesignerAgent).toBeDefined()
      expect(typeof APIDesignerAgent).toBe('function')
    })
  })

  describe('instantiation', () => {
    it('should instantiate ScrumMasterAgent', () => {
      const agent = new ScrumMasterAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate SecuritySpecialistAgent', () => {
      const agent = new SecuritySpecialistAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate PerformanceEngineerAgent', () => {
      const agent = new PerformanceEngineerAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate DataArchitectAgent', () => {
      const agent = new DataArchitectAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate APIDesignerAgent', () => {
      const agent = new APIDesignerAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate all 5 agents without errors', () => {
      const agents = [
        new ScrumMasterAgent(),
        new SecuritySpecialistAgent(),
        new PerformanceEngineerAgent(),
        new DataArchitectAgent(),
        new APIDesignerAgent()
      ]

      expect(agents.length).toBe(5)
      agents.forEach(agent => {
        expect(agent).toBeDefined()
        expect(typeof agent.execute).toBe('function')
      })
    })
  })
})
