/**
 * PhaseManager - Manages 6-phase workflow transitions
 *
 * Phases: Requirements → Design → Planning → Implementation → Testing → Deployment
 *
 * Responsibilities:
 * - Track current phase in workflow state
 * - Validate phase transitions (only allow sequential)
 * - Track phase history for audit trail
 * - Support phase rollback on validation failure
 * - Log all phase transitions
 *
 * Usage:
 * ```typescript
 * const phaseManager = new PhaseManager()
 * const newState = await phaseManager.transitionPhase(state, 'design')
 * ```
 */

import { AgentState } from '../agents/types'
import { getConfigManager } from './config/config-manager'

export type WorkflowPhase =
  | 'requirements'
  | 'design'
  | 'planning'
  | 'implementation'
  | 'testing'
  | 'deployment'

export interface PhaseTransition {
  from: WorkflowPhase | null
  to: WorkflowPhase
  timestamp: string
  success: boolean
  reason?: string
}

export interface PhaseValidation {
  isValid: boolean
  canProceed: boolean
  exitCriteriaMet: boolean
  issues: string[]
  warnings: string[]
}

export class PhaseManager {
  private phases: WorkflowPhase[] = [
    'requirements',
    'design',
    'planning',
    'implementation',
    'testing',
    'deployment'
  ]

  private phaseExitCriteria: Record<WorkflowPhase, string> = {
    requirements: 'Requirements validated and approved',
    design: 'Design validated and approved',
    planning: 'Project plan created with estimates',
    implementation: 'Code implemented and reviewed',
    testing: 'Tests passing with acceptable coverage',
    deployment: 'Deployed and health verified'
  }

  constructor() {
    // ✨ Priority 2: Load config from ConfigManager if available
    const configManager = getConfigManager()
    if (configManager.isInitialized()) {
      const phaseConfig = configManager.getPhaseManagerConfig()

      // Override phases if configured
      if (phaseConfig.phases && phaseConfig.phases.length > 0) {
        this.phases = phaseConfig.phases as WorkflowPhase[]
      }

      // Override exit criteria if configured
      if (phaseConfig.phaseExitCriteria) {
        this.phaseExitCriteria = {
          ...this.phaseExitCriteria,
          ...phaseConfig.phaseExitCriteria
        } as Record<WorkflowPhase, string>
      }
    }
  }

  /**
   * Get the index of a phase in the workflow
   */
  private getPhaseIndex(phase: WorkflowPhase): number {
    return this.phases.indexOf(phase)
  }

  /**
   * Get the next phase in the workflow
   */
  getNextPhase(currentPhase: WorkflowPhase): WorkflowPhase | null {
    const currentIndex = this.getPhaseIndex(currentPhase)
    if (currentIndex === -1 || currentIndex === this.phases.length - 1) {
      return null
    }
    return this.phases[currentIndex + 1]
  }

  /**
   * Get the previous phase in the workflow (for rollback)
   */
  getPreviousPhase(currentPhase: WorkflowPhase): WorkflowPhase | null {
    const currentIndex = this.getPhaseIndex(currentPhase)
    if (currentIndex <= 0) {
      return null
    }
    return this.phases[currentIndex - 1]
  }

  /**
   * Check if a phase is a standard (predefined) phase
   */
  isStandardPhase(phase: string): phase is WorkflowPhase {
    return this.phases.includes(phase as WorkflowPhase)
  }

  /**
   * Validate if a phase transition is allowed
   * - Standard phases: strict sequential validation
   * - Custom phases: adaptive mode (lenient validation)
   */
  validateTransition(from: WorkflowPhase | string | null, to: WorkflowPhase | string): PhaseValidation {
    const issues: string[] = []
    const warnings: string[] = []

    // Check if we're dealing with custom (non-standard) phases
    const isCustomPhase = !this.isStandardPhase(to as string)
    const isFromCustom = from !== null && !this.isStandardPhase(from as string)

    // ADAPTIVE MODE: Custom phases bypass strict validation
    if (isCustomPhase || isFromCustom) {
      warnings.push(`Adaptive mode: Custom phase '${to}' - using simplified validation`)
      return {
        isValid: true,
        canProceed: true,
        exitCriteriaMet: true,
        issues,
        warnings
      }
    }

    // STANDARD MODE: Full validation for predefined phases
    // First phase (null → requirements) is always valid
    if (from === null && to === 'requirements') {
      return {
        isValid: true,
        canProceed: true,
        exitCriteriaMet: true,
        issues,
        warnings
      }
    }

    // Check if target phase exists in standard phases
    if (!this.phases.includes(to as WorkflowPhase)) {
      issues.push(`Invalid target phase: ${to}`)
      return {
        isValid: false,
        canProceed: false,
        exitCriteriaMet: false,
        issues,
        warnings
      }
    }

    // If no current phase, must start with requirements
    if (from === null && to !== 'requirements') {
      issues.push(`Workflow must start with 'requirements' phase, not '${to}'`)
      return {
        isValid: false,
        canProceed: false,
        exitCriteriaMet: false,
        issues,
        warnings
      }
    }

    // Check if transition is sequential (only +1 allowed)
    const fromIndex = this.getPhaseIndex(from as WorkflowPhase)
    const toIndex = this.getPhaseIndex(to as WorkflowPhase)

    if (toIndex !== fromIndex + 1) {
      if (toIndex < fromIndex) {
        warnings.push(`Backward transition detected: ${from} → ${to}. Use rollback instead.`)
      } else {
        issues.push(`Cannot skip phases. Expected ${this.phases[fromIndex + 1]}, got ${to}`)
      }
      return {
        isValid: false,
        canProceed: false,
        exitCriteriaMet: false,
        issues,
        warnings
      }
    }

    return {
      isValid: true,
      canProceed: true,
      exitCriteriaMet: true,
      issues,
      warnings
    }
  }

  /**
   * Transition to the next phase
   * Validates transition and updates state
   * Supports both standard and custom phases (adaptive mode)
   */
  async transitionPhase(
    state: AgentState,
    nextPhase: WorkflowPhase | string
  ): Promise<AgentState> {
    const currentPhase = (state.metadata?.currentPhase as WorkflowPhase | string) || null
    const phaseHistory = (state.metadata?.phaseHistory as PhaseTransition[]) || []

    const isCustomPhase = !this.isStandardPhase(nextPhase)

    if (isCustomPhase) {
      console.log(`\n🔄 Phase Transition (Adaptive): ${currentPhase || 'START'} → ${nextPhase}`)
    } else {
      console.log(`\n🔄 Phase Transition: ${currentPhase || 'START'} → ${nextPhase}`)
    }

    // Validate transition
    const validation = this.validateTransition(currentPhase, nextPhase)

    if (!validation.isValid) {
      console.error(`❌ Invalid phase transition: ${currentPhase} → ${nextPhase}`)
      validation.issues.forEach(issue => console.error(`   - ${issue}`))

      throw new Error(
        `Invalid phase transition: ${currentPhase} → ${nextPhase}\n${validation.issues.join('\n')}`
      )
    }

    // Log warnings
    validation.warnings.forEach(warning => console.warn(`⚠️  ${warning}`))

    // Record transition
    const transition: PhaseTransition = {
      from: currentPhase as WorkflowPhase,
      to: nextPhase as WorkflowPhase,
      timestamp: new Date().toISOString(),
      success: true
    }

    // Update state
    const updatedState: AgentState = {
      ...state,
      metadata: {
        ...state.metadata,
        currentPhase: nextPhase,
        phaseHistory: [...phaseHistory, transition],
        phaseStartTime: new Date().toISOString(),
        adaptiveMode: isCustomPhase  // Mark if using adaptive mode
      }
    }

    // Log exit criteria (standard phases) or adaptive message (custom phases)
    if (isCustomPhase) {
      console.log(`✅ Adaptive phase transition: ${currentPhase || 'START'} → ${nextPhase}`)
      console.log(`   Mode: Simplified validation (custom workflow phase)`)
    } else {
      console.log(`✅ Phase transition successful: ${currentPhase || 'START'} → ${nextPhase}`)
      console.log(`   Exit Criteria: ${this.phaseExitCriteria[nextPhase as WorkflowPhase]}`)
    }

    return updatedState
  }

  /**
   * Rollback to the previous phase
   * Used when validation fails or issues are discovered
   */
  async rollbackPhase(
    state: AgentState,
    reason: string
  ): Promise<AgentState> {
    const currentPhase = state.metadata?.currentPhase as WorkflowPhase
    const phaseHistory = (state.metadata?.phaseHistory as PhaseTransition[]) || []

    if (!currentPhase) {
      throw new Error('Cannot rollback: No current phase set')
    }

    const previousPhase = this.getPreviousPhase(currentPhase)

    if (!previousPhase) {
      throw new Error(`Cannot rollback from ${currentPhase}: Already at first phase`)
    }

    console.log(`\n⏪ Phase Rollback: ${currentPhase} → ${previousPhase}`)
    console.log(`   Reason: ${reason}`)

    // Record failed transition
    const transition: PhaseTransition = {
      from: currentPhase,
      to: previousPhase,
      timestamp: new Date().toISOString(),
      success: false,
      reason
    }

    // Update state
    const updatedState: AgentState = {
      ...state,
      metadata: {
        ...state.metadata,
        currentPhase: previousPhase,
        phaseHistory: [...phaseHistory, transition],
        phaseStartTime: new Date().toISOString(),
        rollbackReason: reason
      }
    }

    console.log(`✅ Rolled back to ${previousPhase} phase`)

    return updatedState
  }

  /**
   * Check if phase exit criteria are met
   * This should be called before transitioning to the next phase
   * Custom phases use adaptive mode (always allowed to exit)
   */
  canExitPhase(state: AgentState, phase: WorkflowPhase | string): PhaseValidation {
    const issues: string[] = []
    const warnings: string[] = []

    // ADAPTIVE MODE: Custom phases can always exit
    if (!this.isStandardPhase(phase)) {
      return {
        isValid: true,
        canProceed: true,
        exitCriteriaMet: true,
        issues,
        warnings: [`Adaptive mode: Custom phase '${phase}' - exit criteria bypassed`]
      }
    }

    // STANDARD MODE: Check phase-specific exit criteria
    switch (phase) {
      case 'requirements':
        // Check if requirements are validated
        const requirementsValidated = state.metadata?.requirements_validated === true
        if (!requirementsValidated) {
          issues.push('Requirements validation not completed or failed')
        }
        break

      case 'design':
        // Check if design is validated
        const designValidated = state.metadata?.design_validated === true
        if (!designValidated) {
          issues.push('Design validation not completed or failed')
        }
        break

      case 'planning':
        // Check if project plan exists
        const projectPlan = state.context?.projectPlan
        if (!projectPlan) {
          issues.push('Project plan not created')
        }
        break

      case 'implementation':
        // Check if code review is approved
        const codeReviewApproved = state.metadata?.code_review_approved === true
        if (!codeReviewApproved) {
          issues.push('Code review not completed or failed')
        }
        break

      case 'testing':
        // Check if tests are passing
        const testsPassing = state.metadata?.tests_passing === true
        if (!testsPassing) {
          issues.push('Tests not passing')
        }
        break

      case 'deployment':
        // Check if deployment health is verified
        const deploymentHealthy = state.metadata?.deployment_healthy === true
        if (!deploymentHealthy) {
          warnings.push('Deployment health not yet verified')
        }
        break
    }

    return {
      isValid: issues.length === 0,
      canProceed: issues.length === 0,
      exitCriteriaMet: issues.length === 0,
      issues,
      warnings
    }
  }

  /**
   * Get phase progress summary
   * Handles both standard and custom phases (adaptive mode)
   */
  getPhaseProgress(state: AgentState): {
    currentPhase: WorkflowPhase | string | null
    completedPhases: (WorkflowPhase | string)[]
    remainingPhases: WorkflowPhase[]
    percentComplete: number
    estimatedPhasesRemaining: number
    adaptiveMode: boolean
  } {
    const currentPhase = (state.metadata?.currentPhase as WorkflowPhase | string) || null
    const phaseHistory = (state.metadata?.phaseHistory as PhaseTransition[]) || []

    if (!currentPhase) {
      return {
        currentPhase: null,
        completedPhases: [],
        remainingPhases: this.phases,
        percentComplete: 0,
        estimatedPhasesRemaining: this.phases.length,
        adaptiveMode: false
      }
    }

    // Check if using custom phases (adaptive mode)
    const isCustomPhase = !this.isStandardPhase(currentPhase)

    if (isCustomPhase) {
      // Adaptive mode: calculate progress from phase history
      const completedPhases = phaseHistory
        .filter(t => t.success)
        .map(t => t.to)
      const totalCustomPhases = completedPhases.length + 1  // +1 for current
      const percentComplete = Math.round((completedPhases.length / Math.max(totalCustomPhases, 1)) * 100)

      return {
        currentPhase,
        completedPhases,
        remainingPhases: [],  // Unknown for custom phases
        percentComplete,
        estimatedPhasesRemaining: 0,  // Unknown for custom phases
        adaptiveMode: true
      }
    }

    // Standard mode: use predefined phases
    const currentIndex = this.getPhaseIndex(currentPhase as WorkflowPhase)
    const completedPhases = this.phases.slice(0, currentIndex)
    const remainingPhases = this.phases.slice(currentIndex + 1)
    const percentComplete = Math.round((currentIndex / this.phases.length) * 100)

    return {
      currentPhase,
      completedPhases,
      remainingPhases,
      percentComplete,
      estimatedPhasesRemaining: remainingPhases.length,
      adaptiveMode: false
    }
  }

  /**
   * Get phase transition history
   */
  getPhaseHistory(state: AgentState): PhaseTransition[] {
    return (state.metadata?.phaseHistory as PhaseTransition[]) || []
  }

  /**
   * Get exit criteria for a phase
   */
  getExitCriteria(phase: WorkflowPhase): string {
    return this.phaseExitCriteria[phase]
  }

  /**
   * Get all phases in order
   */
  getAllPhases(): WorkflowPhase[] {
    return [...this.phases]
  }

  /**
   * Initialize state with phase tracking
   */
  initializePhaseTracking(state: AgentState): AgentState {
    return {
      ...state,
      metadata: {
        ...state.metadata,
        currentPhase: null,
        phaseHistory: [],
        phaseStartTime: new Date().toISOString()
      }
    }
  }

  /**
   * Check if workflow is complete
   */
  isWorkflowComplete(state: AgentState): boolean {
    const currentPhase = state.metadata?.currentPhase as WorkflowPhase
    return currentPhase === 'deployment'
  }

  /**
   * Get phase duration (time spent in current phase)
   */
  getCurrentPhaseDuration(state: AgentState): number | null {
    const phaseStartTime = state.metadata?.phaseStartTime as string
    if (!phaseStartTime) {
      return null
    }

    const start = new Date(phaseStartTime)
    const now = new Date()
    return now.getTime() - start.getTime()
  }

  /**
   * Format phase duration for display
   */
  formatPhaseDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }
}

/**
 * Singleton instance for convenience
 */
export const phaseManager = new PhaseManager()
