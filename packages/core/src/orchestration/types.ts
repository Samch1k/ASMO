/**
 * Orchestration Types
 *
 * Centralized type definitions for workflow orchestration system
 *
 * Phase 1: Basic workflow types (existing)
 * Phase 2: Team structure types (NEW)
 */

import type { AgentState } from '../agents/types'

/**
 * Workflow step definition
 */
export interface WorkflowStep {
  order: number
  role_id: string
  phase: string
  description?: string
  parallel_with?: string[]
  deliverables: string[]
  exit_criteria: string
  timeout?: string
  requires_approval?: boolean
}

/**
 * Workflow definition
 */
export interface Workflow {
  id: string
  name: string
  description: string
  trigger_condition: {
    keywords?: string[]
    task_types?: string[]
    required_skills?: string[]
  }
  steps: WorkflowStep[]
  estimated_time: string
  success_criteria: string
  team?: string  // NEW: Optional team reference
  metadata?: {
    phase?: string
    phase_name?: string
    source_file?: string
    generated_from_team?: boolean
    team_id?: string
    [key: string]: any
  }
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
  version: string
  description: string
  workflows: Workflow[]
  global_settings: {
    max_parallel_agents: number
    default_timeout: string
    continue_on_partial_failure: boolean
    log_all_steps: boolean
    state_merge_strategy: string
  }
}

/**
 * Step execution result
 */
export interface StepResult {
  step: WorkflowStep
  agentId: string
  success: boolean
  duration: number
  output: Partial<AgentState>
  error?: string
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  workflow: Workflow
  success: boolean
  duration: number
  steps: StepResult[]
  finalState: AgentState
  error?: string
}

// ============================================================================
// PHASE 2: TEAM STRUCTURE TYPES (NEW)
// ============================================================================

/**
 * Agent configuration within a team
 */
export interface TeamAgent {
  role_id: string
  phase: string
  focus?: string
  parallel_with?: string[]
}

/**
 * Team definition - groups agents for reusable workflows
 */
export interface Team {
  id: string
  name: string
  description: string
  agents: TeamAgent[]
  default_parallel?: string[]
  approval_required?: boolean
  estimated_duration?: string
  metadata?: Record<string, any>
}

/**
 * Team configuration file structure
 */
export interface TeamConfig {
  teams: Team[]
}

/**
 * Team metrics for analytics
 */
export interface TeamMetrics {
  totalAgents: number
  parallelCapable: boolean
  estimatedDuration: string
}

/**
 * Team validation result
 */
export interface TeamValidation {
  valid: boolean
  errors: string[]
}

// ============================================================================
// PRIORITY 2: CONFIGURATION TYPES (NEW)
// ============================================================================

/**
 * Re-export configuration types from config module
 * Makes config types available through central types.ts
 */
export type {
  OrchestrationConfig,
  WorkflowEngineConfig,
  IterationManagerConfig,
  ApprovalCheckpointConfig,
  PhaseManagerConfig,
  MetricsCollectorConfig,
  LearningLoopConfig,
  MetricsOptimizerConfig
} from './config/types'

// ============================================================================
// BMAD PHASE 1: COMPLEXITY ANALYSIS TYPES (NEW)
// ============================================================================

/**
 * Complexity level classification
 */
export type ComplexityLevel = 'trivial' | 'simple' | 'medium' | 'complex' | 'enterprise'

/**
 * Factors that contribute to task complexity
 */
export interface ComplexityFactors {
  filesAffected: number
  dependencies: number
  riskLevel: 'low' | 'medium' | 'high'
  domainExpertiseRequired: boolean
  estimatedLOC: number
  dataChanges: boolean
  securityImpact: boolean
  performanceImpact: boolean
}

/**
 * Project context for complexity analysis
 */
export interface ProjectContext {
  projectPath?: string
  files?: string[]
  recentChanges?: string[]
  existingWorkflows?: string[]
  techStack?: string[]
  projectSize?: 'small' | 'medium' | 'large' | 'enterprise'
}

/**
 * Complexity analysis result
 */
export interface ComplexityScore {
  score: number  // 0-100
  level: ComplexityLevel
  confidence: number  // 0.0-1.0
  reasoning: string
  recommendedWorkflow: string
  recommendedAgents: string[]
  factors: ComplexityFactors
  alternatives?: Array<{
    workflowId: string
    confidence: number
    reasoning: string
  }>
}

/**
 * Workflow selection result
 */
export interface WorkflowSelection {
  workflow: Workflow
  confidence: number
  reasoning: string
  complexity: ComplexityScore
  alternatives: Array<{
    workflowId: string
    confidence: number
    reasoning: string
  }>
}
