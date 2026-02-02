/**
 * WorkflowSelector Hybrid Analysis Tests
 *
 * Tests the selectWorkflowHybrid() method that combines:
 * - BMAD (ComplexityAnalyzer)
 * - ClaudeCodeAdapter (Agent/Skill selection)
 * - SkillMatcher (Pattern detection)
 *
 * Phase 1 of hybrid system integration
 */

import { WorkflowSelector } from '../../src/orchestration/workflow-selector'
import { ClaudeCodeAdapter, type AnalysisResult } from '../../src/agents/claude-code-adapter'
import { SkillMatcher } from '../../src/orchestration/skill-matcher'
import type { Workflow } from '../../src/orchestration/types'

// Mock ClaudeCodeAdapter
jest.mock('../../src/agents/claude-code-adapter')
const MockedClaudeCodeAdapter = ClaudeCodeAdapter as jest.MockedClass<typeof ClaudeCodeAdapter>

// Mock SkillMatcher
jest.mock('../../src/orchestration/skill-matcher')
const MockedSkillMatcher = SkillMatcher as jest.MockedClass<typeof SkillMatcher>

describe('WorkflowSelector - Hybrid Analysis', () => {
  let selector: WorkflowSelector
  let mockAdapter: jest.Mocked<ClaudeCodeAdapter>
  let mockSkillMatcher: jest.Mocked<SkillMatcher>
  let workflows: Workflow[]

  beforeEach(() => {
    // Setup test workflows
    workflows = [
      {
        id: 'bug_fix_workflow',
        name: 'Bug Fix Workflow',
        description: 'Fix bugs systematically',
        trigger_condition: { keywords: ['bug', 'fix'] },
        steps: [],
        estimated_time: '30m',
        success_criteria: 'Bug fixed and verified'
      },
      {
        id: 'feature_implementation_full',
        name: 'Feature Implementation',
        description: 'Implement new features',
        trigger_condition: { keywords: ['feature', 'implement'] },
        steps: [],
        estimated_time: '2h',
        success_criteria: 'Feature implemented and tested'
      },
      {
        id: 'architecture_design',
        name: 'Architecture Design',
        description: 'Design system architecture',
        trigger_condition: { keywords: ['architecture', 'design'] },
        steps: [],
        estimated_time: '4h',
        success_criteria: 'Architecture documented'
      }
    ]

    // Create mocked instances
    mockAdapter = new MockedClaudeCodeAdapter() as jest.Mocked<ClaudeCodeAdapter>
    mockSkillMatcher = new MockedSkillMatcher(null as any, null as any) as jest.Mocked<SkillMatcher>

    // Create selector with hybrid analysis enabled
    selector = new WorkflowSelector({
      enableHybridAnalysis: true,
      claudeCodeAdapter: mockAdapter,
      skillMatcher: mockSkillMatcher,
      confidenceThreshold: 0.7
    })

    // Register workflows
    selector.registerWorkflows(workflows)
  })

  describe('import and instantiation', () => {
    it('should be importable', () => {
      expect(WorkflowSelector).toBeDefined()
      expect(typeof WorkflowSelector).toBe('function')
    })

    it('should instantiate with hybrid analysis config', () => {
      expect(selector).toBeInstanceOf(WorkflowSelector)
    })

    it('should throw error if hybrid analysis called without enabling it', async () => {
      const nonHybridSelector = new WorkflowSelector()
      nonHybridSelector.registerWorkflows(workflows)

      await expect(
        nonHybridSelector.selectWorkflowHybrid('Fix bug')
      ).rejects.toThrow('Hybrid analysis is not enabled')
    })

    it('should throw error if components not provided', async () => {
      const incompleteSelector = new WorkflowSelector({
        enableHybridAnalysis: true
        // Missing claudeCodeAdapter and skillMatcher
      })
      incompleteSelector.registerWorkflows(workflows)

      await expect(
        incompleteSelector.selectWorkflowHybrid('Fix bug')
      ).rejects.toThrow('ClaudeCodeAdapter and SkillMatcher are required')
    })
  })

  describe('selectWorkflowHybrid - basic functionality', () => {
    beforeEach(() => {
      // Setup default mocks for ClaudeCodeAdapter
      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['debugger', 'developer'],
        requiredSkills: ['debugging', 'code_writing'],
        suggestedWorkflow: 'bug_fix_workflow',
        confidence: 0.85,
        reasoning: 'Detected bug fix task'
      } as AnalysisResult)

      // Setup default mocks for SkillMatcher
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue([])
    })

    it('should perform hybrid analysis successfully', async () => {
      const result = await selector.selectWorkflowHybrid('Fix authentication bug')

      expect(result).toBeDefined()
      expect(result.workflow).toBeDefined()
      expect(result.workflow.id).toBe('bug_fix_workflow')
      expect(result.recommendedAgents).toEqual(['debugger', 'developer'])
      expect(result.identifiedSkills).toEqual(['debugging', 'code_writing'])
      expect(result.confidence).toBeGreaterThan(0)
    })

    it('should call all three analyzers', async () => {
      await selector.selectWorkflowHybrid('Add user profile feature')

      expect(mockAdapter.analyzePrompt).toHaveBeenCalledWith('Add user profile feature')
      expect(mockSkillMatcher.detectWorkflowPatterns).toHaveBeenCalledWith('Add user profile feature')
      // ComplexityAnalyzer is called internally (not mocked)
    })

    it('should return EnhancedWorkflowSelection with all fields', async () => {
      const result = await selector.selectWorkflowHybrid('Refactor database layer')

      // Base WorkflowSelection fields
      expect(result.workflow).toBeDefined()
      expect(result.confidence).toBeGreaterThan(0)
      expect(result.reasoning).toBeTruthy()
      expect(result.complexity).toBeDefined()
      expect(result.alternatives).toBeDefined()

      // Enhanced fields
      expect(result.recommendedAgents).toBeDefined()
      expect(result.identifiedSkills).toBeDefined()
      expect(result.detectedPatterns).toBeDefined()
      expect(result.agentAnalysis).toBeDefined()
      expect(result.confidenceBreakdown).toBeDefined()
      expect(result.mergeStrategy).toBeDefined()
    })
  })

  describe('workflow selection priority - SkillMatcher > BMAD', () => {
    it('should prioritize SkillMatcher pattern over BMAD recommendation', async () => {
      // SkillMatcher detects TDD pattern
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue(['tdd_workflow'])

      // ClaudeCodeAdapter suggests different workflow
      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: 'feature_implementation_full',
        confidence: 0.7,
        reasoning: 'Feature implementation'
      } as AnalysisResult)

      // Add TDD workflow
      const tddWorkflow: Workflow = {
        id: 'tdd_workflow',
        name: 'TDD Workflow',
        description: 'Test-driven development',
        trigger_condition: {},
        steps: [],
        estimated_time: '1h',
        success_criteria: 'Tests pass'
      }
      selector.registerWorkflows([...workflows, tddWorkflow])

      const result = await selector.selectWorkflowHybrid('Write tests first then implement')

      expect(result.workflow.id).toBe('tdd_workflow')
      expect(result.mergeStrategy.workflowSource).toBe('patterns')
    })

    it('should use ClaudeCodeAdapter suggestion if no patterns detected', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue([])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['architect', 'developer'],
        requiredSkills: ['architecture_decisions', 'code_writing'],
        suggestedWorkflow: 'architecture_design',
        confidence: 0.85,
        reasoning: 'Architecture design needed'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Design microservices architecture')

      expect(result.workflow.id).toBe('architecture_design')
      expect(result.mergeStrategy.workflowSource).toBe('adapter')
    })

    it('should fallback to BMAD if adapter confidence is low', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue([])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: null, // No workflow suggested
        confidence: 0.5, // Low confidence
        reasoning: 'Unclear task'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Fix the thing')

      // Should use BMAD recommendation
      expect(result.workflow).toBeDefined()
      expect(result.mergeStrategy.workflowSource).toBe('bmad')
    })
  })

  describe('agent selection priority - ClaudeCodeAdapter > BMAD', () => {
    it('should prioritize ClaudeCodeAdapter agents when confidence high', async () => {
      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['architect', 'security-specialist', 'developer'],
        requiredSkills: ['architecture_decisions', 'security'],
        suggestedWorkflow: 'architecture_design',
        confidence: 0.9,
        reasoning: 'Security architecture needed'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Design secure authentication system')

      expect(result.recommendedAgents).toEqual(['architect', 'security-specialist', 'developer'])
      expect(result.mergeStrategy.agentsSource).toBe('adapter')
    })

    it('should merge BMAD agents when adapter confidence low', async () => {
      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: null,
        confidence: 0.6, // Low confidence
        reasoning: 'Basic implementation'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Fix bug in login')

      // Should include both adapter and BMAD agents
      expect(result.recommendedAgents.length).toBeGreaterThanOrEqual(1)
      expect(result.mergeStrategy.agentsSource).toBe('bmad')
    })
  })

  describe('confidence calculation', () => {
    it('should calculate combined confidence from all sources', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue(['design_brainstorming_workflow'])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['architect'],
        requiredSkills: ['system_design'],
        suggestedWorkflow: 'architecture_design',
        confidence: 0.88,
        reasoning: 'Architecture design'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Brainstorm API design options')

      expect(result.confidenceBreakdown).toBeDefined()
      expect(result.confidenceBreakdown.bmad).toBeGreaterThan(0)
      expect(result.confidenceBreakdown.adapter).toBe(0.88)
      expect(result.confidenceBreakdown.patterns).toBe(0.9) // Has patterns
      expect(result.confidenceBreakdown.combined).toBeGreaterThan(0)
      expect(result.confidenceBreakdown.combined).toBeLessThanOrEqual(1.0)
    })

    it('should have lower confidence when no patterns detected', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue([])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: null,
        confidence: 0.6,
        reasoning: 'Basic task'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Do something')

      expect(result.confidenceBreakdown.patterns).toBe(0.0)
      expect(result.confidenceBreakdown.combined).toBeLessThan(0.7)
    })
  })

  describe('enhanced reasoning', () => {
    it('should combine reasoning from all sources', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue(['tdd_workflow'])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer', 'tester'],
        requiredSkills: ['unit_testing', 'code_writing'],
        suggestedWorkflow: null,
        confidence: 0.85,
        reasoning: 'Test-first development detected'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Write tests first for user service')

      expect(result.reasoning).toContain('Complexity')
      expect(result.reasoning).toContain('Agent Analysis')
      expect(result.reasoning).toContain('Detected Patterns')
      expect(result.reasoning).toContain('Selection Strategy')
    })
  })

  describe('alternatives', () => {
    it('should provide alternative workflows', async () => {
      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: 'feature_implementation_full',
        confidence: 0.75,
        reasoning: 'Feature implementation'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Add search feature')

      expect(result.alternatives).toBeDefined()
      expect(Array.isArray(result.alternatives)).toBe(true)
      // Alternatives should not include the selected workflow
      const alternativeIds = result.alternatives.map(alt => alt.workflowId)
      expect(alternativeIds).not.toContain(result.workflow.id)
    })
  })

  describe('edge cases', () => {
    it('should handle empty task description gracefully', async () => {
      await expect(
        selector.selectWorkflowHybrid('')
      ).rejects.toThrow()
    })

    it('should handle adapter error gracefully', async () => {
      mockAdapter.analyzePrompt = jest.fn().mockRejectedValue(new Error('Adapter failed'))

      await expect(
        selector.selectWorkflowHybrid('Fix bug')
      ).rejects.toThrow('Adapter failed')
    })

    it('should handle pattern detection returning empty array', async () => {
      mockSkillMatcher.detectWorkflowPatterns = jest.fn().mockReturnValue([])

      mockAdapter.analyzePrompt = jest.fn().mockResolvedValue({
        recommendedRoles: ['developer'],
        requiredSkills: ['code_writing'],
        suggestedWorkflow: 'bug_fix_workflow',
        confidence: 0.8,
        reasoning: 'Bug fix'
      } as AnalysisResult)

      const result = await selector.selectWorkflowHybrid('Fix bug')

      expect(result.detectedPatterns).toEqual([])
      expect(result.workflow).toBeDefined()
    })
  })
})
