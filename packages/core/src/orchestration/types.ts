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

/**
 * Enhanced workflow selection result from hybrid analysis
 * Combines BMAD (complexity) + ClaudeCodeAdapter (agents/skills) + SkillMatcher (patterns)
 */
export interface EnhancedWorkflowSelection extends WorkflowSelection {
  /** Agent recommendations from ClaudeCodeAdapter */
  recommendedAgents: string[]

  /** Skills identified by ClaudeCodeAdapter */
  identifiedSkills: string[]

  /** Workflow patterns detected by SkillMatcher */
  detectedPatterns: string[]

  /** Analysis result from ClaudeCodeAdapter */
  agentAnalysis: {
    recommendedRoles: string[]
    requiredSkills: string[]
    suggestedWorkflow: string | null
    confidence: number
    reasoning: string
  }

  /** Confidence breakdown by source */
  confidenceBreakdown: {
    bmad: number           // From ComplexityAnalyzer
    adapter: number        // From ClaudeCodeAdapter
    patterns: number       // From SkillMatcher
    combined: number       // Final combined confidence
  }

  /** Merge strategy used */
  mergeStrategy: {
    workflowSource: 'bmad' | 'adapter' | 'patterns'
    agentsSource: 'adapter' | 'bmad'
    reasoning: string
  }
}

// ============================================================================
// BRAINSTORMING TYPES
// ============================================================================

/**
 * Session type for multi-agent collaboration
 * Determines execution mode: sequential, party, or brainstorming
 */
export type SessionType = 'sequential' | 'party' | 'brainstorming'

/**
 * Session type decision result from SkillMatcher.detectSessionType()
 * Used to determine which execution mode to use
 */
export interface SessionTypeDecision {
  /** Type of session: sequential, party, or brainstorming */
  type: SessionType

  /** Maximum number of rounds (for party/brainstorming modes) */
  maxRounds?: number

  /** Convergence threshold (0.0-1.0, for party/brainstorming modes) */
  convergenceThreshold?: number

  /** Whether to generate ADR (for brainstorming mode) */
  generateADR?: boolean

  /** Reasoning for the decision */
  reasoning: string
}

/**
 * Brainstorming phase definition
 */
export type BrainstormingPhase = 'independent_proposals' | 'cross_critique' | 'synthesis' | 'decision'

/**
 * Brainstorming round
 */
export interface BrainstormingRound {
  roundNumber: number
  phase: BrainstormingPhase | string
  startTime: Date
  endTime?: Date
  durationMs?: number
  proposals?: Map<string, BrainstormingProposal[]>
  critiques?: Map<string, Critique[]>
  synthesisPoints?: SynthesisPoint[]
  participationRate: number
  convergenceScore: number
  finalDecision?: Agreement
  adrPath?: string
}

/**
 * Proposal in brainstorming
 */
export interface BrainstormingProposal {
  id: string
  agentId: string
  title: string
  description: string
  approach: string
  pros: string[]
  cons: string[]
  confidenceScore: number
  createdAt: Date
}

/**
 * Critique of a proposal
 */
export interface Critique {
  id: string
  fromAgent: string
  toAgent: string
  toProposalId: string
  score: number
  endorsement: 'strong' | 'moderate' | 'weak' | 'opposed'
  pros: string[]
  cons: string[]
  suggestions: string[]
  blockers?: string[]
  createdAt: Date
}

/**
 * Synthesis point from brainstorming
 */
export interface SynthesisPoint {
  id: string
  topic: string
  synthesizedApproach: string
  contributingProposals: string[]
  contributingAgents: string[]
  votes: BrainstormingVote[]
  consensusLevel: 'unanimous' | 'majority' | 'split' | 'contested'
  finalScore: number
  createdAt: Date
}

/**
 * Vote in brainstorming
 */
export interface BrainstormingVote {
  voter: string
  synthesisPointId: string
  score: number
  reasoning: string
  conditions?: string[]
  timestamp: Date
}

/**
 * Brainstorming configuration
 */
export interface BrainstormingConfig {
  topic: string
  convergenceThreshold: number
  maxRoundDurationMs: number
  generateADR: boolean
  requireUnanimity: boolean
  minParticipation: number
  context?: string
  constraints?: string[]
  adrOutputPath?: string
}

/**
 * Brainstorming result
 */
export interface BrainstormingResult {
  sessionId: string
  topic: string
  participants: string[]
  rounds: BrainstormingRound[]
  finalDecision: Agreement
  generatedADR?: string
  adrPath?: string
  totalDurationMs: number
  convergenceHistory: number[]
  success: boolean
  completionReason: 'consensus' | 'max_rounds' | 'timeout' | 'manual'
}

/**
 * Agreement in multi-agent collaboration
 */
export interface Agreement {
  topic: string
  decision: string
  supportingAgents: string[]
  confidence: number
  reasoning: string
  alternatives: string[]
  timestamp: Date
}

// ============================================================================
// PARTY SESSION TYPES
// ============================================================================

/**
 * Shared context for party session
 */
export interface PartySharedContext {
  decisions: Record<string, unknown>
  artifacts: unknown[]
  votes: unknown[]
  openQuestions: unknown[]
  proposals: Proposal[]
}

/**
 * Party session state - extends AgentState with party-specific fields
 */
export interface PartyState {
  partyId: string
  activeAgents: Set<string>
  sharedContext: PartySharedContext
  messages: PartyMessage[]
  agreements: Agreement[]
  conflictLog: ConflictDetection[]
  currentRound: number
  convergenceScore: number
  // Base AgentState fields
  task: string
  taskType: string
  context: Record<string, unknown>
  currentAgent: string
  agentResults: unknown[]
  mcpData: Record<string, unknown>
  nextAction: string
  requiresApproval: boolean
}

/**
 * Party session definition
 */
export interface PartySession {
  id: string
  name: string
  description: string
  agents: string[]
  facilitator?: string
  state: PartyState
  rounds: PartyRound[]
  status: 'initializing' | 'active' | 'converged' | 'completed'
  createdAt: Date
  updatedAt: Date
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
  phase: string
  agentOutputs: Map<string, unknown>
  messages: PartyMessage[]
  agreements: Agreement[]
  conflicts: ConflictDetection[]
  summary: string
  convergenceScore: number
  duration: number
}

/**
 * Message in party session
 */
export interface PartyMessage {
  from: string
  to: string | 'all'
  content: string
  type: 'statement' | 'question' | 'proposal' | 'vote' | 'response' | 'agreement' | 'conflict'
  timestamp: Date
}

/**
 * Proposal in party session
 */
export interface Proposal {
  id: string
  proposer: string
  title: string
  description: string
  votes: Vote[]
  status: 'pending' | 'accepted' | 'rejected' | 'modified'
  createdAt: Date
}

/**
 * Vote on proposal
 */
export interface Vote {
  voter: string
  choice: 'approve' | 'reject' | 'abstain' | string
  confidence: number
  reasoning?: string
  timestamp: Date
}

/**
 * Conflict detection result
 */
export interface ConflictDetection {
  id: string
  type: 'opinion' | 'requirement' | 'priority' | 'technical'
  description: string
  involvedAgents: string[]
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  resolvable: boolean
  resolution?: string
  timestamp: Date
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
