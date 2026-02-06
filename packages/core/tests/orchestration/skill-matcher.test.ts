/**
 * SkillMatcher tests
 *
 * Tests workflow pattern detection, skill dependencies,
 * conflict checking, recommendations, and session type detection.
 */

import * as fs from 'fs'

// Mock fs for loadSkillDependencies
jest.mock('fs', () => {
  const actual = jest.requireActual('fs')
  return {
    ...actual,
    existsSync: jest.fn().mockReturnValue(false),
    readFileSync: jest.fn()
  }
})

// Mock getLLMProvider
jest.mock('../../src/llm/provider-factory', () => ({
  getLLMProvider: jest.fn().mockReturnValue({
    id: 'mock',
    name: 'Mock',
    cost: '$0',
    isAvailable: jest.fn().mockReturnValue(true),
    generate: jest.fn().mockResolvedValue({
      content: '[]',
      model: 'mock',
      duration: 1,
      provider: 'mock'
    }),
    generateJSON: jest.fn().mockResolvedValue({})
  })
}))

import { SkillMatcher } from '../../src/orchestration/skill-matcher'

// Minimal mock objects for constructor
const mockConfigLoader = {
  getAllSkillIds: jest.fn().mockReturnValue([]),
  getSkillMetadata: jest.fn(),
  loadSkill: jest.fn(),
  preloadSkills: jest.fn()
} as any

const mockAgentRegistry = {
  getAgentsBySkill: jest.fn().mockReturnValue([])
} as any

function createMatcher(deps?: Record<string, any>): SkillMatcher {
  // Setup deps file mock if provided
  if (deps) {
    ;(fs.existsSync as jest.Mock).mockImplementation((p: string) =>
      p.includes('skill-dependencies.json')
    )
    ;(fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ dependencies: deps })
    )
  } else {
    ;(fs.existsSync as jest.Mock).mockReturnValue(false)
  }

  return new SkillMatcher(mockConfigLoader, mockAgentRegistry)
}

describe('SkillMatcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // =========================================================================
  // Instantiation
  // =========================================================================

  describe('instantiation', () => {
    it('should be importable and constructable', () => {
      const matcher = createMatcher()
      expect(matcher).toBeDefined()
      expect(typeof matcher.detectWorkflowPatterns).toBe('function')
    })
  })

  // =========================================================================
  // detectWorkflowPatterns
  // =========================================================================

  describe('detectWorkflowPatterns', () => {
    it('should detect TDD workflow (EN)', () => {
      expect(createMatcher().detectWorkflowPatterns('Write tests first, then implement')).toContain('tdd_workflow')
    })

    it('should detect TDD workflow (RU)', () => {
      expect(createMatcher().detectWorkflowPatterns('Напиши тест сначала')).toContain('tdd_workflow')
    })

    it('should detect systematic debugging', () => {
      expect(createMatcher().detectWorkflowPatterns('Debug this failing test')).toContain('systematic_debugging_workflow')
    })

    it('should detect design brainstorming', () => {
      expect(createMatcher().detectWorkflowPatterns('Brainstorm design options for the API')).toContain('design_brainstorming_workflow')
    })

    it('should detect implementation planning', () => {
      expect(createMatcher().detectWorkflowPatterns('Create an implementation plan for the feature')).toContain('implementation_planning_workflow')
    })

    it('should detect multiple patterns at once', () => {
      const patterns = createMatcher().detectWorkflowPatterns('Debug and fix this bug, then plan refactoring step by step')
      expect(patterns).toContain('systematic_debugging_workflow')
      expect(patterns).toContain('implementation_planning_workflow')
    })

    it('should return empty array for unrecognized tasks', () => {
      expect(createMatcher().detectWorkflowPatterns('Drink coffee')).toHaveLength(0)
    })
  })

  // =========================================================================
  // loadSkillDependencies
  // =========================================================================

  describe('loadSkillDependencies', () => {
    it('should load from skill-dependencies.json when available', () => {
      const matcher = createMatcher({
        skill_a: { requires: ['skill_b'], recommended: [], conflicts_with: [] }
      })

      const deps = matcher.getSkillDependencies()
      expect(deps.size).toBe(1)
      expect(deps.get('skill_a')?.requires).toEqual(['skill_b'])
    })

    it('should return empty map when file is missing', () => {
      const matcher = createMatcher()
      expect(matcher.getSkillDependencies().size).toBe(0)
    })
  })

  // =========================================================================
  // checkSkillConflicts
  // =========================================================================

  describe('checkSkillConflicts', () => {
    it('should detect conflicts between skills', () => {
      const matcher = createMatcher({
        react: { requires: [], recommended: [], conflicts_with: ['vue'] },
        vue: { requires: [], recommended: [], conflicts_with: ['react'] }
      })

      const conflicts = matcher.checkSkillConflicts(['react', 'vue'])
      expect(conflicts.length).toBeGreaterThan(0)
      expect(conflicts.some(c => c.includes('react') && c.includes('vue'))).toBe(true)
    })

    it('should return empty array when no conflicts', () => {
      const matcher = createMatcher({
        react: { requires: [], recommended: [], conflicts_with: [] },
        testing: { requires: [], recommended: [], conflicts_with: [] }
      })

      expect(matcher.checkSkillConflicts(['react', 'testing'])).toHaveLength(0)
    })
  })

  // =========================================================================
  // getRecommendedSkills
  // =========================================================================

  describe('getRecommendedSkills', () => {
    it('should return recommended skills not already included', () => {
      const matcher = createMatcher({
        typescript: { requires: [], recommended: ['testing', 'linting'], conflicts_with: [] }
      })

      const recommended = matcher.getRecommendedSkills(['typescript'])
      expect(recommended).toContain('testing')
      expect(recommended).toContain('linting')
    })

    it('should not recommend already-included skills', () => {
      const matcher = createMatcher({
        typescript: { requires: [], recommended: ['testing'], conflicts_with: [] }
      })

      const recommended = matcher.getRecommendedSkills(['typescript', 'testing'])
      expect(recommended).not.toContain('testing')
    })

    it('should return empty array for unknown skills', () => {
      const matcher = createMatcher()
      expect(matcher.getRecommendedSkills(['unknown_skill'])).toHaveLength(0)
    })
  })

  // =========================================================================
  // checkSkillDependencies
  // =========================================================================

  describe('checkSkillDependencies', () => {
    it('should return requires from extended deps', () => {
      const matcher = createMatcher({
        react: { requires: ['javascript'], recommended: [], conflicts_with: [] }
      })

      expect(matcher.checkSkillDependencies('react')).toEqual(['javascript'])
    })

    it('should return empty for unknown skill', () => {
      const matcher = createMatcher()
      expect(matcher.checkSkillDependencies('nonexistent')).toHaveLength(0)
    })
  })

  // =========================================================================
  // detectSessionType
  // =========================================================================

  describe('detectSessionType', () => {
    it('should return brainstorming for brainstorm keywords', () => {
      const result = createMatcher().detectSessionType('Brainstorm design options', 50)
      expect(result.type).toBe('brainstorming')
      expect(result.maxRounds).toBe(4)
      expect(result.generateADR).toBe(true)
    })

    it('should return party for complex tasks with multiple patterns', () => {
      const result = createMatcher().detectSessionType(
        'Debug this bug and plan step by step refactoring',
        70
      )
      expect(result.type).toBe('party')
      expect(result.maxRounds).toBe(3)
    })

    it('should return sequential for simple tasks', () => {
      const result = createMatcher().detectSessionType('Update README', 20)
      expect(result.type).toBe('sequential')
    })
  })
})
