import { describe, it, expect } from '@jest/globals'
import { ScrumMasterAgent } from '../../src/agents/roles/scrum-master.agent'
import { SecuritySpecialistAgent } from '../../src/agents/roles/security-specialist.agent'
import { PerformanceEngineerAgent } from '../../src/agents/roles/performance-engineer.agent'
import { DataArchitectAgent } from '../../src/agents/roles/data-architect.agent'
import { APIDesignerAgent } from '../../src/agents/roles/api-designer.agent'

/**
 * Tests for BMAD Phase 5: New Specialized Agents
 *
 * Verifies that all 5 new agents can be instantiated and have correct configurations.
 */
describe('BMAD Phase 5: New Specialized Agents', () => {
  describe('ScrumMasterAgent', () => {
    it('should instantiate successfully', () => {
      const agent = new ScrumMasterAgent()
      expect(agent).toBeDefined()
      expect(agent.role).toBe('scrum-master')
    })

    it('should have required skills', () => {
      const agent = new ScrumMasterAgent()
      const skills = agent.skills

      expect(skills).toContain('sprint_planning')
      expect(skills).toContain('backlog_management')
      expect(skills).toContain('agile_ceremonies')
    })

    it('should have LLM configured', () => {
      const agent = new ScrumMasterAgent()
      expect(agent['llm']).toBeDefined()
    })
  })

  describe('SecuritySpecialistAgent', () => {
    it('should instantiate successfully', () => {
      const agent = new SecuritySpecialistAgent()
      expect(agent).toBeDefined()
      expect(agent.role).toBe('security-specialist')
    })

    it('should have required skills', () => {
      const agent = new SecuritySpecialistAgent()
      const skills = agent.skills

      expect(skills).toContain('security_audit')
      expect(skills).toContain('vulnerability_scanning')
      expect(skills).toContain('threat_modeling')
    })

    it('should have LLM configured', () => {
      const agent = new SecuritySpecialistAgent()
      expect(agent['llm']).toBeDefined()
    })
  })

  describe('PerformanceEngineerAgent', () => {
    it('should instantiate successfully', () => {
      const agent = new PerformanceEngineerAgent()
      expect(agent).toBeDefined()
      expect(agent.role).toBe('performance-engineer')
    })

    it('should have required skills', () => {
      const agent = new PerformanceEngineerAgent()
      const skills = agent.skills

      expect(skills).toContain('performance_profiling')
      expect(skills).toContain('optimization')
      expect(skills).toContain('load_testing')
    })

    it('should have LLM configured', () => {
      const agent = new PerformanceEngineerAgent()
      expect(agent['llm']).toBeDefined()
    })
  })

  describe('DataArchitectAgent', () => {
    it('should instantiate successfully', () => {
      const agent = new DataArchitectAgent()
      expect(agent).toBeDefined()
      expect(agent.role).toBe('data-architect')
    })

    it('should have required skills', () => {
      const agent = new DataArchitectAgent()
      const skills = agent.skills

      expect(skills).toContain('database_design')
      expect(skills).toContain('schema_modeling')
      expect(skills).toContain('data_migration')
    })

    it('should have LLM configured', () => {
      const agent = new DataArchitectAgent()
      expect(agent['llm']).toBeDefined()
    })
  })

  describe('APIDesignerAgent', () => {
    it('should instantiate successfully', () => {
      const agent = new APIDesignerAgent()
      expect(agent).toBeDefined()
      expect(agent.role).toBe('api-designer')
    })

    it('should have required skills', () => {
      const agent = new APIDesignerAgent()
      const skills = agent.skills

      expect(skills).toContain('api_design')
      expect(skills).toContain('rest_api')
      expect(skills).toContain('openapi_spec')
    })

    it('should have LLM configured', () => {
      const agent = new APIDesignerAgent()
      expect(agent['llm']).toBeDefined()
    })
  })

  describe('Integration: All New Agents', () => {
    it('should instantiate all 5 new agents without errors', () => {
      const scrumMaster = new ScrumMasterAgent()
      const securitySpecialist = new SecuritySpecialistAgent()
      const performanceEngineer = new PerformanceEngineerAgent()
      const dataArchitect = new DataArchitectAgent()
      const apiDesigner = new APIDesignerAgent()

      expect(scrumMaster).toBeDefined()
      expect(securitySpecialist).toBeDefined()
      expect(performanceEngineer).toBeDefined()
      expect(dataArchitect).toBeDefined()
      expect(apiDesigner).toBeDefined()
    })

    it('should have unique role IDs', () => {
      const scrumMaster = new ScrumMasterAgent()
      const securitySpecialist = new SecuritySpecialistAgent()
      const performanceEngineer = new PerformanceEngineerAgent()
      const dataArchitect = new DataArchitectAgent()
      const apiDesigner = new APIDesignerAgent()

      const roles = [
        scrumMaster.role,
        securitySpecialist.role,
        performanceEngineer.role,
        dataArchitect.role,
        apiDesigner.role
      ]

      // Check all role IDs are unique
      const uniqueRoles = new Set(roles)
      expect(uniqueRoles.size).toBe(5)
    })

    it('should all have execute method', () => {
      const agents = [
        new ScrumMasterAgent(),
        new SecuritySpecialistAgent(),
        new PerformanceEngineerAgent(),
        new DataArchitectAgent(),
        new APIDesignerAgent()
      ]

      for (const agent of agents) {
        expect(typeof agent.execute).toBe('function')
      }
    })
  })
})
