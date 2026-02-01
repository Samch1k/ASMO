import {
  AnalystAgent,
  TechWriterAgent,
  TestArchitectAgent,
  AdversarialReviewerAgent
} from '../../src'

/**
 * Tests for BMAD Integration: New Agents
 */
describe('BMAD Integration: New Agents', () => {
  describe('imports', () => {
    it('should import AnalystAgent', () => {
      expect(AnalystAgent).toBeDefined()
      expect(typeof AnalystAgent).toBe('function')
    })

    it('should import TechWriterAgent', () => {
      expect(TechWriterAgent).toBeDefined()
      expect(typeof TechWriterAgent).toBe('function')
    })

    it('should import TestArchitectAgent', () => {
      expect(TestArchitectAgent).toBeDefined()
      expect(typeof TestArchitectAgent).toBe('function')
    })

    it('should import AdversarialReviewerAgent', () => {
      expect(AdversarialReviewerAgent).toBeDefined()
      expect(typeof AdversarialReviewerAgent).toBe('function')
    })
  })

  describe('instantiation', () => {
    it('should instantiate AnalystAgent', () => {
      const agent = new AnalystAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate TechWriterAgent', () => {
      const agent = new TechWriterAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate TestArchitectAgent', () => {
      const agent = new TestArchitectAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate AdversarialReviewerAgent', () => {
      const agent = new AdversarialReviewerAgent()
      expect(agent).toBeDefined()
      expect(typeof agent.execute).toBe('function')
    })

    it('should instantiate all 4 BMAD agents without errors', () => {
      const agents = [
        new AnalystAgent(),
        new TechWriterAgent(),
        new TestArchitectAgent(),
        new AdversarialReviewerAgent()
      ]

      expect(agents.length).toBe(4)
      agents.forEach(agent => {
        expect(agent).toBeDefined()
        expect(typeof agent.execute).toBe('function')
      })
    })
  })

  describe('agent metadata', () => {
    it('AnalystAgent should have correct capabilities', () => {
      const agent = new AnalystAgent()
      const info = agent.getInfo()
      expect(info.id).toBe('analyst')
      expect(info.capabilities).toContain('analysis')
      expect(info.capabilities).toContain('research')
      expect(info.capabilities).toContain('brainstorming')
    })

    it('TechWriterAgent should have correct capabilities', () => {
      const agent = new TechWriterAgent()
      const info = agent.getInfo()
      expect(info.id).toBe('tech-writer')
      expect(info.capabilities).toContain('documentation')
      expect(info.capabilities).toContain('technical_writing')
      expect(info.capabilities).toContain('api_documentation')
    })

    it('TestArchitectAgent should have correct capabilities', () => {
      const agent = new TestArchitectAgent()
      const info = agent.getInfo()
      expect(info.id).toBe('test-architect')
      expect(info.capabilities).toContain('test_strategy')
      expect(info.capabilities).toContain('risk_based_testing')
      expect(info.capabilities).toContain('quality_gates')
    })

    it('AdversarialReviewerAgent should have correct capabilities', () => {
      const agent = new AdversarialReviewerAgent()
      const info = agent.getInfo()
      expect(info.id).toBe('adversarial-reviewer')
      expect(info.capabilities).toContain('adversarial_review')
      expect(info.capabilities).toContain('code_review')
      expect(info.capabilities).toContain('security_review')
    })
  })
})
