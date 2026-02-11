/**
 * PhaseDetector - LLM-based phase detection for workflow joining
 *
 * Part of the Adaptive Workflow System
 *
 * Uses ClaudeCodeAdapter.analyzePhase() for intelligent analysis of:
 * - User intent (review, implement, refactor, test, etc.)
 * - Project context (existing code, tests, docs)
 * - Optimal workflow phase to join
 *
 * Phase detection is now fully LLM-based (no keyword matching).
 * Works within subscription - no external API calls by default.
 */

import type {
  Workflow,
  ProjectContext,
  PhaseDetectionResult,
  ArtifactAnalysis
} from './types'
import {
  ClaudeCodeAdapter,
  PhaseAnalysisResult,
  PhaseForAnalysis,
  PhaseAnalysisContext,
  WorkflowForPhaseAnalysis
} from '../agents/claude-code-adapter'
import { ContextAnalyzer, ContextAnalyzerConfig } from './context-analyzer'

/**
 * Configuration for PhaseDetector
 */
export interface PhaseDetectorConfig {
  /**
   * Minimum confidence threshold to accept LLM's phase recommendation
   * @default 0.5
   */
  minConfidence?: number

  /**
   * Fallback strategy when LLM confidence is low
   * - 'first_phase': Always fall back to first phase (safest)
   * - 'keyword': Use simple keyword matching as backup
   * - 'error': Throw error requiring explicit phase specification
   * @default 'first_phase'
   */
  fallbackStrategy?: 'first_phase' | 'keyword' | 'error'

  /**
   * Context analyzer configuration
   */
  contextConfig?: ContextAnalyzerConfig
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<PhaseDetectorConfig, 'contextConfig'>> = {
  minConfidence: 0.5,
  fallbackStrategy: 'first_phase'
}

/**
 * Internal LLM analysis result
 * Wraps PhaseAnalysisResult with additional factors
 */
interface LLMPhaseAnalysis {
  phase: string
  confidence: number
  reasoning: string
  intent: string
  factors: string[]
  alternatives: string[]
  skipPhases: string[]
  missingPrerequisites: string[]
}

/**
 * PhaseDetector - Detects optimal workflow phase through LLM analysis
 */
export class PhaseDetector {
  private llm: ClaudeCodeAdapter
  private contextAnalyzer: ContextAnalyzer
  private config: Required<Omit<PhaseDetectorConfig, 'contextConfig'>>
  private verbose: boolean

  constructor(claudeAdapter: ClaudeCodeAdapter, config?: PhaseDetectorConfig, verbose?: boolean) {
    this.llm = claudeAdapter
    this.contextAnalyzer = new ContextAnalyzer(config?.contextConfig)
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    }
    this.verbose = verbose ?? false
  }

  /**
   * Detect optimal phase to join workflow
   *
   * Uses LLM-based analysis (no keyword matching)
   *
   * @param task - User's task description
   * @param workflow - Target workflow with phases
   * @param context - Project context (optional)
   * @returns Phase detection result with reasoning
   */
  async detectPhase(
    task: string,
    workflow: Workflow,
    context?: ProjectContext
  ): Promise<PhaseDetectionResult> {
    if (this.verbose) {
      console.log('\n🔍 [PhaseDetector] Analyzing task (LLM-based)...')
      console.log(`   Task: "${task.substring(0, 80)}${task.length > 80 ? '...' : ''}"`)
      console.log(`   Workflow: ${workflow.name}`)
    }

    // 1. Analyze project context
    const artifacts = await this.contextAnalyzer.analyze(context)
    if (this.verbose) {
      console.log(`   Context: ${artifacts.summary}`)
    }

    // 2. Extract available phases (for logging)
    const phases = this.preparePhases(workflow)
    if (this.verbose) {
      console.log(`   Available phases: ${phases.map(p => p.name).join(' → ')}`)
    }

    // 3. LLM Analysis through ClaudeCodeAdapter.analyzePhase()
    const llmResult = await this.llmAnalyze({
      task,
      workflow,
      existingArtifacts: artifacts,
      projectContext: context
    })

    if (this.verbose) {
      console.log(`   LLM recommended: ${llmResult.phase} (${(llmResult.confidence * 100).toFixed(0)}%)`)
      console.log(`   Intent: ${llmResult.intent}`)
    }

    // 4. Apply confidence threshold and fallback
    const finalPhase = this.applyFallback(llmResult, phases)

    // 5. Validate phase choice against prerequisites
    const validation = this.validatePhase(finalPhase.phase, workflow, artifacts)

    // 6. Use skip phases from LLM, or calculate if not provided
    const skipPhases = llmResult.skipPhases.length > 0
      ? llmResult.skipPhases
      : this.calculateSkipped(workflow, finalPhase.phase)
    const stepIndex = this.findStepIndex(workflow, finalPhase.phase)

    if (this.verbose) {
      console.log(`   Final phase: ${finalPhase.phase}`)
      console.log(`   Skipping: ${skipPhases.join(', ') || 'none'}`)
    }

    // Combine LLM missing prerequisites with validation
    const allMissingPrerequisites = [
      ...new Set([...llmResult.missingPrerequisites, ...validation.missing])
    ]

    return {
      phase: finalPhase.phase,
      confidence: finalPhase.confidence,
      reasoning: finalPhase.reasoning,
      llmIntent: llmResult.intent,
      contextFactors: llmResult.factors,
      alternativePhases: llmResult.alternatives,
      skipPhases,
      stepIndex,
      prerequisites: validation.met,
      missingPrerequisites: allMissingPrerequisites,
      contextSummary: artifacts.summary
    }
  }

  /**
   * Prepare phases from workflow for LLM analysis
   */
  private preparePhases(workflow: Workflow): PhaseForAnalysis[] {
    return workflow.steps.map(step => ({
      name: step.phase,
      description: step.description || `Phase ${step.order}: ${step.phase}`,
      order: step.order,
      prerequisites: step.phase_join_criteria?.prerequisites ||
                     step.phase_join_criteria?.requires || [],
      skipIf: step.phase_join_criteria?.skip_if || []
    }))
  }

  /**
   * Perform LLM analysis through ClaudeCodeAdapter.analyzePhase()
   *
   * This is the core method - delegates all logic to LLM (no keyword parsing!)
   */
  private async llmAnalyze(input: {
    task: string
    workflow: Workflow
    existingArtifacts: ArtifactAnalysis
    projectContext?: ProjectContext
  }): Promise<LLMPhaseAnalysis> {
    // Prepare phases for LLM
    const phases = this.preparePhases(input.workflow)

    // Build context for LLM
    const context: PhaseAnalysisContext = {
      hasImplementation: input.existingArtifacts.hasImplementation,
      hasTests: input.existingArtifacts.hasTests,
      hasDocs: input.existingArtifacts.hasDocs,
      files: input.existingArtifacts.files.map(f => f.path),
      recentChanges: input.existingArtifacts.recentChanges
    }

    // Build workflow info for LLM
    const workflowInfo: WorkflowForPhaseAnalysis = {
      name: input.workflow.name,
      description: input.workflow.description,
      phases
    }

    // Call specialized analyzePhase method on ClaudeCodeAdapter
    const result: PhaseAnalysisResult = await this.llm.analyzePhase(
      input.task,
      workflowInfo,
      context
    )

    // Build factors from context and result
    const factors = this.buildFactors(result, input.existingArtifacts)

    // Direct use of LLM result (no keyword parsing!)
    return {
      phase: result.recommendedPhase,
      confidence: result.confidence,
      reasoning: result.reasoning,
      intent: result.intent,
      factors,
      alternatives: result.alternativePhases,
      skipPhases: result.skipPhases,
      missingPrerequisites: result.missingPrerequisites
    }
  }

  /**
   * Build context factors from LLM result and artifacts
   */
  private buildFactors(result: PhaseAnalysisResult, artifacts: ArtifactAnalysis): string[] {
    const factors: string[] = []

    // Intent factor
    factors.push(`Intent: ${result.intent}`)

    // Artifact factors
    if (artifacts.hasImplementation) factors.push('Has existing implementation')
    if (artifacts.hasTests) factors.push('Has existing tests')
    if (artifacts.hasDocs) factors.push('Has documentation')

    // Missing prerequisites (if any)
    if (result.missingPrerequisites.length > 0) {
      factors.push(`Missing: ${result.missingPrerequisites.join(', ')}`)
    }

    // Confidence
    factors.push(`Confidence: ${(result.confidence * 100).toFixed(0)}%`)

    return factors
  }

  /**
   * Apply fallback strategy if confidence is too low
   */
  private applyFallback(
    llmResult: LLMPhaseAnalysis,
    availablePhases: PhaseForAnalysis[]
  ): { phase: string; confidence: number; reasoning: string } {
    // Validate that recommended phase exists in workflow
    const phaseExists = availablePhases.some(p => p.name === llmResult.phase)

    if (!phaseExists && availablePhases.length > 0) {
      // LLM returned invalid phase - use first phase with warning
      console.warn(`   ⚠️  LLM recommended invalid phase "${llmResult.phase}", using first phase`)
      return {
        phase: availablePhases[0].name,
        confidence: 0.5,
        reasoning: `Invalid phase "${llmResult.phase}" from LLM. Falling back to first phase. Original: ${llmResult.reasoning}`
      }
    }

    if (llmResult.confidence >= this.config.minConfidence) {
      return {
        phase: llmResult.phase,
        confidence: llmResult.confidence,
        reasoning: llmResult.reasoning
      }
    }

    // Confidence too low - apply fallback
    switch (this.config.fallbackStrategy) {
      case 'first_phase':
        return {
          phase: availablePhases[0]?.name || llmResult.phase,
          confidence: 0.5,
          reasoning: `Low confidence (${(llmResult.confidence * 100).toFixed(0)}%). Falling back to first phase. Original: ${llmResult.reasoning}`
        }

      case 'keyword':
        // With LLM-based detection, keyword fallback just accepts LLM result
        return {
          phase: llmResult.phase,
          confidence: Math.max(llmResult.confidence, 0.4),
          reasoning: `Low confidence fallback accepted. ${llmResult.reasoning}`
        }

      case 'error':
        throw new Error(
          `Phase detection confidence (${(llmResult.confidence * 100).toFixed(0)}%) below threshold. ` +
          `Please specify phase explicitly. Suggested: ${llmResult.phase}`
        )

      default:
        return {
          phase: availablePhases[0]?.name || llmResult.phase,
          confidence: 0.5,
          reasoning: llmResult.reasoning
        }
    }
  }

  /**
   * Validate phase choice against prerequisites
   */
  private validatePhase(
    phase: string,
    workflow: Workflow,
    artifacts: ArtifactAnalysis
  ): { met: string[]; missing: string[] } {
    const step = workflow.steps.find(s => s.phase === phase)
    if (!step?.phase_join_criteria) {
      return { met: [], missing: [] }
    }

    const met: string[] = []
    const missing: string[] = []

    // Get requirements from both legacy and enhanced formats
    const requirements = step.phase_join_criteria.requires ||
                        step.phase_join_criteria.prerequisites || []

    for (const req of requirements) {
      const reqLower = req.toLowerCase()

      // Check if requirement is met based on artifacts
      if (reqLower.includes('implementation') || reqLower.includes('code')) {
        if (artifacts.hasImplementation) {
          met.push(req)
        } else {
          missing.push(req)
        }
      } else if (reqLower.includes('test')) {
        if (artifacts.hasTests) {
          met.push(req)
        } else {
          missing.push(req)
        }
      } else if (reqLower.includes('doc')) {
        if (artifacts.hasDocs) {
          met.push(req)
        } else {
          missing.push(req)
        }
      } else {
        // Unknown requirement - assume met for now
        met.push(req)
      }
    }

    return { met, missing }
  }

  /**
   * Calculate which phases will be skipped
   */
  private calculateSkipped(workflow: Workflow, targetPhase: string): string[] {
    const targetIndex = workflow.steps.findIndex(s => s.phase === targetPhase)
    if (targetIndex <= 0) return []

    return workflow.steps
      .slice(0, targetIndex)
      .map(s => s.phase)
  }

  /**
   * Find step index for target phase
   */
  private findStepIndex(workflow: Workflow, phase: string): number {
    const index = workflow.steps.findIndex(s => s.phase === phase)
    return index >= 0 ? index : 0
  }
}
