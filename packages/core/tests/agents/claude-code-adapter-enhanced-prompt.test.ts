/**
 * ClaudeCodeAdapter Enhanced System Prompt Tests
 *
 * Tests the enhanced generateSystemPrompt() method with:
 * - BMAD complexity analysis integration
 * - Party/Brainstorming mode configuration
 * - Backward compatibility
 *
 * Phase 3 of hybrid system integration
 */

import { ClaudeCodeAdapter, AnalysisResult } from '../../src/agents/claude-code-adapter'
import type { ComplexityScore, SessionTypeDecision, ComplexityLevel } from '../../src/orchestration/types'
import { RoleManager } from '../../src/orchestration/role-manager'
import { ConfigLoader } from '../../src/orchestration/config-loader'

// Mock dependencies
jest.mock('../../src/orchestration/role-manager')
jest.mock('../../src/orchestration/config-loader')

describe('ClaudeCodeAdapter - Enhanced System Prompt', () => {
  let adapter: ClaudeCodeAdapter
  let mockRoleManager: jest.Mocked<RoleManager>
  let mockConfigLoader: jest.Mocked<ConfigLoader>

  beforeEach(async () => {
    // Create mock instances
    mockRoleManager = {
      getRole: jest.fn((id: string) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1),
        role_type: 'core',
        description: `${id} role`,
        required_skills: ['skill1', 'skill2'],
        can_modify_code: true,
        can_deploy: false,
        can_run_tests: true,
        requires_plan: false,
        requires_approval: false,
        allowed_mcps: ['mcp1']
      }))
    } as any

    mockConfigLoader = {
      getSkillCatalog: jest.fn().mockReturnValue(new Map([
        ['code_writing', { id: 'code_writing', name: 'Code Writing', description: 'Write code', complexity: 'medium' }],
        ['unit_testing', { id: 'unit_testing', name: 'Unit Testing', description: 'Write tests', complexity: 'simple' }]
      ]))
    } as any

    adapter = new ClaudeCodeAdapter()

    // Bypass initialization by directly setting internal state
    ;(adapter as any).roleManager = mockRoleManager
    ;(adapter as any).configLoader = mockConfigLoader
    ;(adapter as any).skillsCache = new Map([
      ['code_writing', { id: 'code_writing', name: 'Code Writing', description: 'Write code', complexity: 'medium' }],
      ['unit_testing', { id: 'unit_testing', name: 'Unit Testing', description: 'Write tests', complexity: 'simple' }]
    ])
    ;(adapter as any).initialized = true
  })

  // Helper to create complexity score
  const createComplexityScore = (level: ComplexityLevel, score: number): ComplexityScore => ({
    score,
    level,
    confidence: 0.85,
    reasoning: `Task complexity is ${level}`,
    recommendedWorkflow: 'feature_implementation_full',
    recommendedAgents: ['developer', 'tester'],
    factors: {
      filesAffected: 3,
      dependencies: 2,
      riskLevel: 'medium',
      domainExpertiseRequired: false,
      estimatedLOC: 150,
      dataChanges: false,
      securityImpact: false,
      performanceImpact: false
    }
  })

  // Helper to create analysis result
  const createAnalysisResult = (): AnalysisResult => ({
    recommendedRoles: ['developer', 'tester'],
    requiredSkills: ['code_writing', 'unit_testing'],
    suggestedWorkflow: null,
    confidence: 0.8,
    reasoning: 'Feature implementation task detected'
  })

  describe('backward compatibility', () => {
    it('should work without optional parameters (original behavior)', () => {
      const analysis = createAnalysisResult()
      const prompt = adapter.generateSystemPrompt(analysis)

      expect(prompt).toBeTruthy()
      expect(prompt).toContain('Role-Based Agent System Context')
      expect(prompt).toContain('Your Assigned Roles')
      expect(prompt).toContain('Required Skills')
      expect(prompt).toContain('Analysis Reasoning')

      // Should NOT contain BMAD or Party Mode sections
      expect(prompt).not.toContain('Complexity Analysis (BMAD)')
      expect(prompt).not.toContain('Mode Active')
    })
  })

  describe('BMAD complexity integration', () => {
    it('should include complexity section when provided', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('medium', 50)

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Complexity Analysis (BMAD)')
      expect(prompt).toContain('Score**: 50/100 (medium)')
      expect(prompt).toContain('Confidence**: 85%')
    })

    it('should display complexity factors', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('complex', 75)

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Complexity Factors')
      expect(prompt).toContain('Files Affected**: 3')
      expect(prompt).toContain('Dependencies**: 2')
      expect(prompt).toContain('Risk Level**: medium')
      expect(prompt).toContain('Estimated LOC**: 150')
    })

    it('should display recommended agents from complexity', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('simple', 25)

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Recommended Agents**: developer, tester')
    })

    it('should display complexity reasoning', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('trivial', 10)

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Task complexity is trivial')
    })

    it('should handle high complexity scores', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('enterprise', 95)

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Score**: 95/100 (enterprise)')
    })
  })

  describe('party mode integration', () => {
    it('should NOT include party section for sequential mode', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'sequential',
        reasoning: 'Simple task'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).not.toContain('Mode Active')
      expect(prompt).not.toContain('Party Mode')
      expect(prompt).not.toContain('Brainstorming')
    })

    it('should include party mode section', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'party',
        maxRounds: 3,
        convergenceThreshold: 0.75,
        reasoning: 'Complex task with multiple approaches'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).toContain('Party Mode Active')
      expect(prompt).toContain('Type**: party')
      expect(prompt).toContain('Max Rounds**: 3')
      expect(prompt).toContain('Convergence Threshold**: 75%')
      expect(prompt).toContain('Complex task with multiple approaches')
    })

    it('should include brainstorming mode section', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'brainstorming',
        maxRounds: 4,
        convergenceThreshold: 0.8,
        generateADR: true,
        reasoning: 'Brainstorm keywords detected'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).toContain('Brainstorming Mode Active')
      expect(prompt).toContain('Type**: brainstorming')
      expect(prompt).toContain('Max Rounds**: 4')
      expect(prompt).toContain('Convergence Threshold**: 80%')
      expect(prompt).toContain('ADR Generation**: Yes')
      expect(prompt).toContain('Brainstorm keywords detected')
    })

    it('should include brainstorming process description', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'brainstorming',
        maxRounds: 4,
        convergenceThreshold: 0.8,
        generateADR: true,
        reasoning: 'Design exploration'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).toContain('Brainstorming Process')
      expect(prompt).toContain('Round 1**: Independent Proposals')
      expect(prompt).toContain('Round 2**: Cross Critique')
      expect(prompt).toContain('Round 3**: Synthesis & Voting')
      expect(prompt).toContain('Round 4**: Final Decision + ADR')
    })

    it('should include party mode process description', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'party',
        maxRounds: 3,
        convergenceThreshold: 0.75,
        reasoning: 'Collaborative discussion'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).toContain('Party Mode Process')
      expect(prompt).toContain('collaborate in parallel')
      expect(prompt).toContain('until consensus is reached')
    })
  })

  describe('full hybrid integration', () => {
    it('should include both complexity and session type sections', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('complex', 70)
      const sessionType: SessionTypeDecision = {
        type: 'party',
        maxRounds: 3,
        convergenceThreshold: 0.75,
        reasoning: 'Complex collaborative task'
      }

      const prompt = adapter.generateSystemPrompt(analysis, complexity, sessionType)

      // Should have all sections
      expect(prompt).toContain('Role-Based Agent System Context')
      expect(prompt).toContain('Your Assigned Roles')
      expect(prompt).toContain('Required Skills')
      expect(prompt).toContain('Analysis Reasoning')
      expect(prompt).toContain('Complexity Analysis (BMAD)')
      expect(prompt).toContain('Party Mode Active')

      // Complexity details
      expect(prompt).toContain('Score**: 70/100 (complex)')

      // Session type details
      expect(prompt).toContain('Type**: party')
      expect(prompt).toContain('Max Rounds**: 3')
    })

    it('should maintain proper section order', () => {
      const analysis = createAnalysisResult()
      const complexity = createComplexityScore('medium', 50)
      const sessionType: SessionTypeDecision = {
        type: 'brainstorming',
        maxRounds: 4,
        convergenceThreshold: 0.8,
        generateADR: true,
        reasoning: 'Design brainstorm'
      }

      const prompt = adapter.generateSystemPrompt(analysis, complexity, sessionType)

      // Check order of sections
      const rolesIndex = prompt.indexOf('Your Assigned Roles')
      const skillsIndex = prompt.indexOf('Required Skills')
      const reasoningIndex = prompt.indexOf('Analysis Reasoning')
      const complexityIndex = prompt.indexOf('Complexity Analysis (BMAD)')
      const sessionIndex = prompt.indexOf('Brainstorming Mode Active')

      expect(rolesIndex).toBeLessThan(skillsIndex)
      expect(skillsIndex).toBeLessThan(reasoningIndex)
      expect(reasoningIndex).toBeLessThan(complexityIndex)
      expect(complexityIndex).toBeLessThan(sessionIndex)
    })
  })

  describe('edge cases', () => {
    it('should handle complexity without factors', () => {
      const analysis = createAnalysisResult()
      const complexity: ComplexityScore = {
        score: 30,
        level: 'simple',
        confidence: 0.7,
        reasoning: 'Simple task',
        recommendedWorkflow: 'bug_fix_workflow',
        recommendedAgents: ['developer'],
        factors: {
          filesAffected: 0,
          dependencies: 0,
          riskLevel: 'low',
          domainExpertiseRequired: false,
          estimatedLOC: 0,
          dataChanges: false,
          securityImpact: false,
          performanceImpact: false
        }
      }

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Complexity Analysis (BMAD)')
      expect(prompt).toContain('Files Affected**: 0')
    })

    it('should handle session type without optional fields', () => {
      const analysis = createAnalysisResult()
      const sessionType: SessionTypeDecision = {
        type: 'party',
        reasoning: 'Minimal config'
      }

      const prompt = adapter.generateSystemPrompt(analysis, undefined, sessionType)

      expect(prompt).toContain('Party Mode Active')
      expect(prompt).toContain('Type**: party')
      expect(prompt).not.toContain('Max Rounds')
      expect(prompt).not.toContain('Convergence Threshold')
    })

    it('should handle empty recommended agents', () => {
      const analysis = createAnalysisResult()
      const complexity: ComplexityScore = {
        score: 20,
        level: 'trivial',
        confidence: 0.9,
        reasoning: 'Trivial task',
        recommendedWorkflow: 'quick_fix',
        recommendedAgents: [],
        factors: {
          filesAffected: 1,
          dependencies: 0,
          riskLevel: 'low',
          domainExpertiseRequired: false,
          estimatedLOC: 10,
          dataChanges: false,
          securityImpact: false,
          performanceImpact: false
        }
      }

      const prompt = adapter.generateSystemPrompt(analysis, complexity)

      expect(prompt).toContain('Recommended Agents**: ')
    })
  })
})
