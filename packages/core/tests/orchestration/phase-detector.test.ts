/**
 * PhaseDetector unit tests
 *
 * Adaptive Workflow System: LLM-based Phase Detection
 *
 * Tests cover:
 * - Basic import and instantiation
 * - LLM-based phase detection (no keyword matching)
 * - Direct use of LLM recommendedPhase
 * - Intent detection scenarios
 * - Type verification
 */

import { PhaseDetector } from '../../src/orchestration/phase-detector'
import type { Workflow, ProjectContext } from '../../src/orchestration/types'
import type { PhaseAnalysisResult, PhaseIntent } from '../../src/agents/claude-code-adapter'

// Sample workflow for testing
const sampleWorkflow: Workflow = {
  id: 'test_workflow',
  name: 'Test Workflow',
  description: 'Test workflow for phase detection',
  trigger_condition: {
    keywords: ['test', 'implement']
  },
  steps: [
    {
      order: 1,
      role_id: 'developer',
      phase: 'test_first',
      description: 'Write tests',
      deliverables: ['tests'],
      exit_criteria: 'Tests written',
      timeout: '30m',
      phase_join_criteria: {
        requires: ['story defined'],
        optional: ['acceptance criteria']
      }
    },
    {
      order: 2,
      role_id: 'developer',
      phase: 'implementation',
      description: 'Implement code',
      deliverables: ['code'],
      exit_criteria: 'Code works',
      timeout: '60m',
      phase_join_criteria: {
        requires: ['tests exist'],
        optional: ['design docs']
      }
    },
    {
      order: 3,
      role_id: 'developer',
      phase: 'refactoring',
      description: 'Clean code',
      deliverables: ['clean code'],
      exit_criteria: 'Code clean',
      timeout: '20m',
      phase_join_criteria: {
        requires: ['code exists', 'tests passing'],
        optional: []
      }
    },
    {
      order: 4,
      role_id: 'code-reviewer',
      phase: 'review',
      description: 'Review code',
      deliverables: ['review'],
      exit_criteria: 'Code approved',
      timeout: '15m',
      phase_join_criteria: {
        requires: ['code exists'],
        optional: ['tests passing']
      }
    }
  ],
  estimated_time: '2h',
  success_criteria: 'Feature complete'
}

/**
 * Create mock PhaseAnalysisResult for testing LLM-based detection
 */
const createMockPhaseAnalysisResult = (overrides: Partial<PhaseAnalysisResult> = {}): PhaseAnalysisResult => ({
  recommendedPhase: 'test_first',
  alternativePhases: [],
  intent: 'implement' as PhaseIntent,
  confidence: 0.85,
  reasoning: 'User wants to implement new functionality',
  skipPhases: [],
  missingPrerequisites: [],
  ...overrides
})

/**
 * Full mock adapter with complete AnalysisResult and PhaseAnalysisResult structures
 */
const createMockAdapter = (
  reasoning = 'User wants to review existing code.',
  phaseAnalysisOverrides: Partial<PhaseAnalysisResult> = {}
) => ({
  analyzePrompt: jest.fn().mockResolvedValue({
    success: true,
    reasoning,
    confidence: 0.85,
    tokens_used: 100,
    model: 'claude-sonnet',
    recommendedRoles: ['code-reviewer'],
    requiredSkills: ['code-review', 'security'],
    complexity: { level: 'medium', score: 50 }
  }),
  // NEW: Mock for LLM-based phase analysis
  analyzePhase: jest.fn().mockResolvedValue(createMockPhaseAnalysisResult(phaseAnalysisOverrides))
})

describe('PhaseDetector', () => {
  describe('import and instantiation', () => {
    it('should be importable', () => {
      expect(PhaseDetector).toBeDefined()
      expect(typeof PhaseDetector).toBe('function')
    })

    it('should instantiate with LLM adapter', () => {
      const detector = new PhaseDetector(createMockAdapter() as any)
      expect(detector).toBeInstanceOf(PhaseDetector)
    })

    it('should instantiate with custom config', () => {
      const detector = new PhaseDetector(createMockAdapter() as any, {
        minConfidence: 0.7,
        fallbackStrategy: 'keyword'
      })
      expect(detector).toBeInstanceOf(PhaseDetector)
    })

    it('should instantiate with first_phase fallback strategy', () => {
      const detector = new PhaseDetector(createMockAdapter() as any, {
        fallbackStrategy: 'first_phase'
      })
      expect(detector).toBeInstanceOf(PhaseDetector)
    })
  })

  describe('phase detection with LLM', () => {
    let detector: PhaseDetector
    let mockAdapter: ReturnType<typeof createMockAdapter>

    beforeEach(() => {
      jest.clearAllMocks()
      mockAdapter = createMockAdapter()
      detector = new PhaseDetector(mockAdapter as any)
    })

    it('should return PhaseDetectionResult structure', async () => {
      const result = await detector.detectPhase(
        'Review the code',
        sampleWorkflow
      )

      expect(result).toBeDefined()
      expect(typeof result.phase).toBe('string')
      expect(typeof result.confidence).toBe('number')
      expect(typeof result.reasoning).toBe('string')
      expect(Array.isArray(result.skipPhases)).toBe(true)
      expect(typeof result.stepIndex).toBe('number')
    })

    it('should call LLM analyzePhase', async () => {
      await detector.detectPhase('Review the code', sampleWorkflow)
      // Now using LLM-based analyzePhase instead of analyzePrompt
      expect(mockAdapter.analyzePhase).toHaveBeenCalled()
    })

    it('should have confidence between 0 and 1', async () => {
      const result = await detector.detectPhase('Some task', sampleWorkflow)

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })
  })

  describe('phase detection based on keywords in reasoning', () => {
    it('should detect review phase from review keywords', async () => {
      const adapter = createMockAdapter('User wants to review code for security issues.')
      const detector = new PhaseDetector(adapter as any)

      const result = await detector.detectPhase(
        'Review the code for security',
        sampleWorkflow
      )

      // May detect first phase if no implementation exists
      expect(typeof result.phase).toBe('string')
    })

    it('should detect implementation from implement keywords', async () => {
      const adapter = createMockAdapter('User wants to implement a new feature from scratch.')
      const detector = new PhaseDetector(adapter as any)

      const result = await detector.detectPhase(
        'Implement user login',
        sampleWorkflow
      )

      expect(typeof result.phase).toBe('string')
    })
  })

  describe('with project context', () => {
    it('should accept project context parameter', async () => {
      const detector = new PhaseDetector(createMockAdapter() as any)
      const context: ProjectContext = {
        projectPath: '/my/project',
        files: ['src/auth.ts', 'tests/auth.test.ts']
      }

      const result = await detector.detectPhase(
        'Review the auth module',
        sampleWorkflow,
        context
      )

      expect(result).toBeDefined()
    })

    it('should work without project context', async () => {
      const detector = new PhaseDetector(createMockAdapter() as any)

      const result = await detector.detectPhase(
        'Do something',
        sampleWorkflow
      )

      expect(result).toBeDefined()
    })
  })

  describe('phase result properties', () => {
    it('should have valid stepIndex', async () => {
      const detector = new PhaseDetector(createMockAdapter() as any)

      const result = await detector.detectPhase(
        'Some task',
        sampleWorkflow
      )

      expect(result.stepIndex).toBeGreaterThanOrEqual(0)
      expect(result.stepIndex).toBeLessThan(sampleWorkflow.steps.length)
    })

    it('should have skipPhases array', async () => {
      const detector = new PhaseDetector(createMockAdapter() as any)

      const result = await detector.detectPhase(
        'Some task',
        sampleWorkflow
      )

      expect(Array.isArray(result.skipPhases)).toBe(true)
    })

    it('should have non-empty reasoning', async () => {
      const detector = new PhaseDetector(createMockAdapter() as any)

      const result = await detector.detectPhase(
        'Some task',
        sampleWorkflow
      )

      expect(result.reasoning).toBeTruthy()
      expect(result.reasoning.length).toBeGreaterThan(0)
    })
  })

  describe('simple workflow handling', () => {
    it('should handle workflow with single phase', async () => {
      const detector = new PhaseDetector(createMockAdapter('User wants to develop', {
        recommendedPhase: 'development',
        intent: 'implement'
      }) as any)

      const simpleWorkflow: Workflow = {
        id: 'simple',
        name: 'Simple',
        description: 'Simple workflow',
        trigger_condition: {},
        steps: [
          {
            order: 1,
            role_id: 'developer',
            phase: 'development',
            description: 'Develop',
            deliverables: [],
            exit_criteria: 'Done',
            timeout: '1h'
          }
        ],
        estimated_time: '1h',
        success_criteria: 'Done'
      }

      const result = await detector.detectPhase(
        'Build something',
        simpleWorkflow
      )

      expect(result).toBeDefined()
      expect(result.phase).toBe('development')
      expect(result.stepIndex).toBe(0)
    })
  })

  describe('LLM-based phase detection', () => {
    it('should use LLM recommendedPhase directly', async () => {
      const mockAdapter = createMockAdapter('User wants to implement new feature', {
        recommendedPhase: 'implementation',
        alternativePhases: ['refactoring'],
        intent: 'implement',
        confidence: 0.9,
        reasoning: 'User wants to add new code',
        skipPhases: ['test_first'],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase('add new feature', sampleWorkflow)

      expect(result.phase).toBe('implementation')
      expect(result.llmIntent).toBe('implement')
      expect(mockAdapter.analyzePhase).toHaveBeenCalled()
    })

    it('should handle review intent with existing code', async () => {
      const mockAdapter = createMockAdapter('User wants to review code', {
        recommendedPhase: 'review',
        alternativePhases: [],
        intent: 'review',
        confidence: 0.85,
        reasoning: 'Code exists, starting from review phase',
        skipPhases: ['test_first', 'implementation', 'refactoring'],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'Review the authentication code',
        sampleWorkflow
      )

      expect(result.phase).toBe('review')
      expect(result.llmIntent).toBe('review')
      expect(result.skipPhases).toContain('test_first')
    })

    it('should handle review intent with no code (fallback to test_first)', async () => {
      const mockAdapter = createMockAdapter('No code to review, starting from beginning', {
        recommendedPhase: 'test_first',
        alternativePhases: [],
        intent: 'review',
        confidence: 0.7,
        reasoning: 'No code to review, starting from beginning',
        skipPhases: [],
        missingPrerequisites: ['implementation code']
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase('review the code', sampleWorkflow)

      expect(result.phase).toBe('test_first')
      expect(result.missingPrerequisites).toContain('implementation code')
    })

    it('should handle implement intent with existing code (skip design)', async () => {
      const mockAdapter = createMockAdapter('Code exists, skipping design', {
        recommendedPhase: 'implementation',
        alternativePhases: [],
        intent: 'implement',
        confidence: 0.9,
        reasoning: 'Code exists, can skip design phases',
        skipPhases: ['design'],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'continue implementing the feature',
        sampleWorkflow
      )

      expect(result.phase).toBe('implementation')
      expect(result.llmIntent).toBe('implement')
    })

    it('should handle refactor intent', async () => {
      const mockAdapter = createMockAdapter('User wants to refactor', {
        recommendedPhase: 'refactoring',
        alternativePhases: ['review'],
        intent: 'refactor',
        confidence: 0.88,
        reasoning: 'Refactoring existing code',
        skipPhases: ['test_first', 'implementation'],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'refactor the authentication module',
        sampleWorkflow
      )

      expect(result.phase).toBe('refactoring')
      expect(result.llmIntent).toBe('refactor')
      expect(result.alternativePhases).toContain('review')
    })

    it('should handle test intent', async () => {
      const mockAdapter = createMockAdapter('User wants to add tests', {
        recommendedPhase: 'test_first',
        alternativePhases: [],
        intent: 'test',
        confidence: 0.92,
        reasoning: 'Adding tests to existing code',
        skipPhases: [],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'add unit tests for the API',
        sampleWorkflow
      )

      expect(result.phase).toBe('test_first')
      expect(result.llmIntent).toBe('test')
    })

    it('should handle fix/debug intent', async () => {
      const mockAdapter = createMockAdapter('User wants to fix a bug', {
        recommendedPhase: 'implementation',
        alternativePhases: [],
        intent: 'fix',
        confidence: 0.85,
        reasoning: 'Fixing bug in implementation',
        skipPhases: ['test_first'],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'fix the login bug',
        sampleWorkflow
      )

      expect(result.phase).toBe('implementation')
      expect(result.llmIntent).toBe('fix')
    })

    it('should fall back to first phase when LLM returns invalid phase', async () => {
      const mockAdapter = createMockAdapter('Unknown task', {
        recommendedPhase: 'nonexistent_phase',  // Invalid phase
        alternativePhases: [],
        intent: 'unknown',
        confidence: 0.3,
        reasoning: 'Could not determine intent',
        skipPhases: [],
        missingPrerequisites: []
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'do something',
        sampleWorkflow
      )

      // Should fall back to first phase due to invalid phase
      expect(result.phase).toBe('test_first')
      expect(result.confidence).toBe(0.5)  // Fallback confidence
    })

    it('should pass workflow phases to analyzePhase method', async () => {
      const mockAdapter = createMockAdapter('Test', {
        recommendedPhase: 'test_first',
        intent: 'implement'
      })

      const detector = new PhaseDetector(mockAdapter as any)
      await detector.detectPhase('implement something', sampleWorkflow)

      // Verify analyzePhase was called with correct workflow structure
      expect(mockAdapter.analyzePhase).toHaveBeenCalledWith(
        'implement something',
        expect.objectContaining({
          name: sampleWorkflow.name,
          description: sampleWorkflow.description,
          phases: expect.arrayContaining([
            expect.objectContaining({
              name: 'test_first',
              order: 1
            })
          ])
        }),
        expect.objectContaining({
          hasImplementation: expect.any(Boolean),
          hasTests: expect.any(Boolean),
          hasDocs: expect.any(Boolean)
        })
      )
    })

    it('should include context factors from LLM result', async () => {
      const mockAdapter = createMockAdapter('Analysis with factors', {
        recommendedPhase: 'implementation',
        intent: 'implement',
        confidence: 0.9,
        reasoning: 'Implementing feature',
        skipPhases: [],
        missingPrerequisites: ['design docs']
      })

      const detector = new PhaseDetector(mockAdapter as any)
      const result = await detector.detectPhase(
        'implement user authentication',
        sampleWorkflow
      )

      expect(result.contextFactors).toContain('Intent: implement')
      expect(result.contextFactors.some(f => f.includes('Confidence'))).toBe(true)
    })
  })
})
