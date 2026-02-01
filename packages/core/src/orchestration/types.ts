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

// ============================================================================
// BRAINSTORMING TYPES
// ============================================================================

/**
 * Brainstorming phase definition
 */
export type BrainstormingPhase = 'diverge' | 'critique' | 'converge' | 'synthesize'

/**
 * Brainstorming round
 */
export interface BrainstormingRound {
  roundNumber: number
  phase: BrainstormingPhase
  proposals: BrainstormingProposal[]
  critiques: Critique[]
  votes: BrainstormingVote[]
  synthesisPoints: SynthesisPoint[]
  duration: number
  timestamp: string
}

/**
 * Proposal in brainstorming
 */
export interface BrainstormingProposal {
  id: string
  agentId: string
  content: string
  rationale: string
  votes: BrainstormingVote[]
  critiques: Critique[]
  score: number
  timestamp: string
}

/**
 * Critique of a proposal
 */
export interface Critique {
  id: string
  proposalId: string
  agentId: string
  strength: 'strong' | 'moderate' | 'weak' | 'opposed'
  comment: string
  suggestions: string[]
  timestamp: string
}

/**
 * Synthesis point from brainstorming
 */
export interface SynthesisPoint {
  id: string
  content: string
  supportingProposals: string[]
  confidence: number
  agentId: string
  timestamp: string
}

/**
 * Vote in brainstorming
 */
export interface BrainstormingVote {
  agentId: string
  proposalId: string
  weight: number
  rationale: string
  timestamp: string
}

/**
 * Brainstorming configuration
 */
export interface BrainstormingConfig {
  maxRounds: number
  minProposalsPerRound: number
  convergenceThreshold: number
  timeoutPerRound: number
  requiredConsensus: number
  allowDissent: boolean
  phases: BrainstormingPhase[]
}

/**
 * Brainstorming result
 */
export interface BrainstormingResult {
  success: boolean
  rounds: BrainstormingRound[]
  finalProposals: BrainstormingProposal[]
  synthesisPoints: SynthesisPoint[]
  consensus: number
  dissents: string[]
  duration: number
  participants: string[]
}

/**
 * Agreement in multi-agent collaboration
 */
export interface Agreement {
  id: string
  topic: string
  content: string
  supportingAgents: string[]
  opposingAgents: string[]
  consensusLevel: number
  timestamp: string
}

// ============================================================================
// PARTY SESSION TYPES
// ============================================================================

/**
 * Party session state
 */
export interface PartyState {
  sessionId: string
  topic: string
  participants: string[]
  currentRound: number
  rounds: PartyRound[]
  agreements: Agreement[]
  conflicts: ConflictDetection[]
  status: 'active' | 'paused' | 'completed' | 'failed'
  startTime: string
  endTime?: string
}

/**
 * Party session definition
 */
export interface PartySession {
  id: string
  name: string
  description: string
  participants: string[]
  config: PartyConfig
  state: PartyState
}

/**
 * Party configuration
 */
export interface PartyConfig {
  maxRounds: number
  roundTimeout: number
  requiredConsensus: number
  allowConflicts: boolean
  moderatorAgent?: string
}

/**
 * Party round
 */
export interface PartyRound {
  roundNumber: number
  messages: PartyMessage[]
  proposals: Proposal[]
  votes: Vote[]
  agreements: Agreement[]
  conflicts: ConflictDetection[]
  duration: number
  timestamp: string
}

/**
 * Message in party session
 */
export interface PartyMessage {
  id: string
  agentId: string
  content: string
  type: 'statement' | 'question' | 'proposal' | 'vote' | 'agreement' | 'conflict'
  replyTo?: string
  timestamp: string
}

/**
 * Proposal in party session
 */
export interface Proposal {
  id: string
  agentId: string
  content: string
  rationale: string
  votes: Vote[]
  status: 'pending' | 'accepted' | 'rejected' | 'modified'
  timestamp: string
}

/**
 * Vote on proposal
 */
export interface Vote {
  agentId: string
  proposalId: string
  decision: 'approve' | 'reject' | 'abstain'
  weight: number
  rationale: string
  timestamp: string
}

/**
 * Conflict detection result
 */
export interface ConflictDetection {
  id: string
  type: 'opinion' | 'requirement' | 'priority' | 'technical'
  description: string
  involvedAgents: string[]
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
  resolution?: string
  timestamp: string
}

// ============================================================================
// HELP SYSTEM TYPES
// ============================================================================

/**
 * Help response from HelpSystem.analyzeQuery()
 */
export interface HelpResponse {
  /** Recommended workflow ID */
  recommendedWorkflow: string
  /** Confidence in recommendation (0-1) */
  confidence: number
  /** Human-readable reasoning for recommendation */
  reasoning: string
  /** Estimated time to complete */
  estimatedTime: string
  /** List of agents needed for the workflow */
  requiredAgents: string[]
  /** Alternative workflow recommendations */
  alternatives: Array<{
    workflowId: string
    confidence: number
    reasoning: string
  }>
  /** Full complexity analysis */
  complexity: ComplexityScore
}

/**
 * Troubleshoot response from HelpSystem.troubleshoot()
 */
export interface TroubleshootResponse {
  /** Primary suggested fix */
  suggestedFix: string
  /** Explanation of the issue */
  issueExplanation: string
  /** Step-by-step resolution steps */
  resolutionSteps: string[]
  /** Alternative fixes to try */
  alternatives: string[]
  /** Links to relevant documentation */
  documentationLinks: string[]
  /** Confidence in the fix (0-1) */
  confidence: number
}

/**
 * Error context for troubleshooting
 */
export interface ErrorContext {
  /** Error message text */
  errorMessage?: string
  /** Error type/class */
  errorType?: string
  /** Stack trace */
  stackTrace?: string
  /** File where error occurred */
  file?: string
  /** Agent ID if error occurred during agent execution */
  agentId?: string
  /** Workflow ID if error occurred during workflow execution */
  workflowId?: string
  /** Step ID if error occurred during step execution */
  stepId?: string
  /** Timestamp of error */
  timestamp?: string
  /** Additional metadata */
  metadata?: Record<string, any>
}

// ============================================================================
// RE-EXPORTS FROM AGENTS/TYPES
// ============================================================================

/**
 * Re-export types from agents module for convenience
 */
export type {
  AgentWithRoleSkills,
  SkillMatch,
  Role,
  Skill,
  Artifact,
  AgentResult
} from '../agents/types'
