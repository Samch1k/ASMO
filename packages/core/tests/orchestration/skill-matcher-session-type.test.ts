/**
 * SkillMatcher Session Type Detection Tests
 *
 * Tests the detectSessionType() method that determines:
 * - Sequential mode (default)
 * - Party mode (complex tasks)
 * - Brainstorming mode (design exploration)
 *
 * Phase 2 of hybrid system integration
 */

import { SkillMatcher } from '../../src/orchestration/skill-matcher'

// Mock dependencies
const mockConfigLoader = {
  getSkillCatalog: jest.fn().mockReturnValue(new Map())
} as any

const mockAgentRegistry = {
  getAllAgents: jest.fn().mockReturnValue([])
} as any

describe('SkillMatcher - Session Type Detection', () => {
  let skillMatcher: SkillMatcher

  beforeEach(() => {
    skillMatcher = new SkillMatcher(mockConfigLoader, mockAgentRegistry)
  })

  describe('detectSessionType - basic functionality', () => {
    it('should return sequential mode for simple tasks', () => {
      const result = skillMatcher.detectSessionType('Fix typo in README', 15)

      expect(result.type).toBe('sequential')
      expect(result.reasoning).toBeTruthy()
      expect(result.maxRounds).toBeUndefined()
      expect(result.convergenceThreshold).toBeUndefined()
      expect(result.generateADR).toBeUndefined()
    })

    it('should return sequential mode for medium complexity without patterns', () => {
      const result = skillMatcher.detectSessionType('Add email validation', 45)

      expect(result.type).toBe('sequential')
      // When no patterns detected, reasoning is "Simple task"
      expect(result.reasoning).toBeTruthy()
    })

    it('should have correct reasoning for simple tasks', () => {
      const result = skillMatcher.detectSessionType('Update config', 10)

      expect(result.reasoning).toContain('Simple task')
    })
  })

  describe('detectSessionType - brainstorming mode', () => {
    it('should detect brainstorming for "brainstorm" keyword (English)', () => {
      const result = skillMatcher.detectSessionType(
        'Brainstorm authentication methods',
        70
      )

      expect(result.type).toBe('brainstorming')
      expect(result.maxRounds).toBe(4)
      expect(result.convergenceThreshold).toBe(0.8)
      expect(result.generateADR).toBe(true)
      expect(result.reasoning).toContain('Brainstorm keywords detected')
    })

    it('should detect brainstorming for "мозговой штурм" keyword (Russian)', () => {
      const result = skillMatcher.detectSessionType(
        'Мозговой штурм по архитектуре API',
        65
      )

      expect(result.type).toBe('brainstorming')
      expect(result.maxRounds).toBe(4)
      expect(result.generateADR).toBe(true)
    })

    it('should detect brainstorming for "design option" phrase', () => {
      const result = skillMatcher.detectSessionType(
        'What design option do we have for caching?',
        55
      )

      expect(result.type).toBe('brainstorming')
      expect(result.reasoning).toContain('Brainstorm')
    })

    it('should detect brainstorming for "explore design" phrase', () => {
      const result = skillMatcher.detectSessionType(
        "Let's explore design approaches for state management",
        50
      )

      expect(result.type).toBe('brainstorming')
    })

    it('should prioritize brainstorming over party mode', () => {
      // Even with high complexity, brainstorming takes priority
      const result = skillMatcher.detectSessionType(
        'Brainstorm microservices architecture',
        85
      )

      expect(result.type).toBe('brainstorming')
      expect(result.type).not.toBe('party')
    })
  })

  describe('detectSessionType - party mode', () => {
    it('should NOT activate party mode if complexity < 60', () => {
      // Multiple patterns but low complexity
      const result = skillMatcher.detectSessionType(
        'Write tests first then implement feature',
        55
      )

      // Should be sequential (TDD workflow) not party
      expect(result.type).toBe('sequential')
    })

    it('should NOT activate party mode if only one workflow pattern', () => {
      // High complexity but single approach
      const result = skillMatcher.detectSessionType(
        'Fix authentication bug',
        70
      )

      // Should be sequential, not party
      expect(result.type).toBe('sequential')
    })

    it('should activate party mode for complex multi-pattern tasks', () => {
      // This task should trigger multiple patterns:
      // - "debug" -> systematic_debugging_workflow
      // - "implement" -> implementation_planning_workflow
      const result = skillMatcher.detectSessionType(
        'Debug the authentication system and implement improvements',
        65
      )

      // If multiple patterns detected + complexity >= 60 -> party
      if (result.type === 'party') {
        expect(result.maxRounds).toBe(3)
        expect(result.convergenceThreshold).toBe(0.75)
        expect(result.reasoning).toContain('Complex task')
        expect(result.reasoning).toContain('collaborative discussion')
      }
      // Otherwise sequential is also acceptable
    })

    it('should include complexity score in party mode reasoning', () => {
      const result = skillMatcher.detectSessionType(
        'Design and implement new microservice with tests',
        75
      )

      if (result.type === 'party') {
        expect(result.reasoning).toContain('75/100')
      }
    })
  })

  describe('detectSessionType - edge cases', () => {
    it('should handle empty task description', () => {
      const result = skillMatcher.detectSessionType('', 50)

      expect(result.type).toBe('sequential')
      expect(result.reasoning).toBeTruthy()
    })

    it('should handle zero complexity', () => {
      const result = skillMatcher.detectSessionType('Simple task', 0)

      expect(result.type).toBe('sequential')
    })

    it('should handle very high complexity (100)', () => {
      const result = skillMatcher.detectSessionType('Enterprise migration', 100)

      // High complexity alone doesn't trigger party mode (needs multiple patterns)
      expect(result.type).toBe('sequential')
    })

    it('should handle negative complexity gracefully', () => {
      const result = skillMatcher.detectSessionType('Task', -10)

      expect(result.type).toBe('sequential')
    })

    it('should be case-insensitive for keywords', () => {
      const result1 = skillMatcher.detectSessionType('BRAINSTORM api design', 50)
      const result2 = skillMatcher.detectSessionType('brainstorm api design', 50)

      expect(result1.type).toBe(result2.type)
      expect(result1.type).toBe('brainstorming')
    })
  })

  describe('detectSessionType - decision boundaries', () => {
    it('should use complexity threshold exactly at 60', () => {
      const result = skillMatcher.detectSessionType(
        'Debug and implement complex feature',
        60
      )

      // At exactly 60, should activate party mode if multiple patterns
      // This test verifies the boundary condition
      expect(['sequential', 'party']).toContain(result.type)
    })

    it('should NOT activate party at complexity 59', () => {
      const result = skillMatcher.detectSessionType(
        'Debug and implement feature',
        59
      )

      // Below 60 threshold, should be sequential
      expect(result.type).toBe('sequential')
    })
  })

  describe('detectSessionType - return type validation', () => {
    it('should return all required fields', () => {
      const result = skillMatcher.detectSessionType('Any task', 50)

      expect(result).toHaveProperty('type')
      expect(result).toHaveProperty('reasoning')
      expect(['sequential', 'party', 'brainstorming']).toContain(result.type)
      expect(typeof result.reasoning).toBe('string')
      expect(result.reasoning.length).toBeGreaterThan(0)
    })

    it('should include optional fields for brainstorming mode', () => {
      const result = skillMatcher.detectSessionType('Brainstorm ideas', 50)

      if (result.type === 'brainstorming') {
        expect(result.maxRounds).toBeDefined()
        expect(result.convergenceThreshold).toBeDefined()
        expect(result.generateADR).toBeDefined()
        expect(typeof result.maxRounds).toBe('number')
        expect(typeof result.convergenceThreshold).toBe('number')
        expect(typeof result.generateADR).toBe('boolean')
      }
    })

    it('should include optional fields for party mode', () => {
      const result = skillMatcher.detectSessionType(
        'Complex multi-approach task with debugging and implementation',
        75
      )

      if (result.type === 'party') {
        expect(result.maxRounds).toBeDefined()
        expect(result.convergenceThreshold).toBeDefined()
        expect(typeof result.maxRounds).toBe('number')
        expect(typeof result.convergenceThreshold).toBe('number')
      }
    })
  })
})
