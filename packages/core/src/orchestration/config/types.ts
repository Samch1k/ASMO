/**
 * Orchestration Configuration Types
 *
 * Centralized type definitions for all orchestration component configurations.
 * These types ensure type safety when loading and using configuration values.
 *
 * Pattern: Mirrors TeamManager/ChecklistManager configuration approach
 */

/**
 * WorkflowEngine configuration
 */
export interface WorkflowEngineConfig {
  /** Maximum number of agents to execute in parallel */
  max_parallel_agents: number
  /** Default timeout for workflow step execution (e.g., '30m', '1h') */
  default_timeout: string
  /** Whether to continue workflow execution when a step fails */
  continue_on_partial_failure: boolean
  /** Whether to log all workflow steps to console */
  log_all_steps: boolean
  /** Strategy for merging agent states in parallel execution */
  state_merge_strategy: 'namespace_isolation' | 'shallow_merge' | 'deep_merge'
}

/**
 * IterationManager configuration (retry logic)
 */
export interface IterationManagerConfig {
  /** Maximum number of retry attempts for failed operations */
  maxRetries: number
  /** Initial delay before first retry (in milliseconds) */
  initialDelayMs: number
  /** Exponential backoff multiplier (e.g., 2 = delay doubles each retry) */
  backoffMultiplier: number
  /** Maximum delay between retries (in milliseconds) */
  maxDelayMs: number
  /** Error patterns that should trigger a retry */
  retryableErrors: string[]
  /** Error patterns that should fail immediately without retry */
  fatalErrors: string[]
}

/**
 * ApprovalCheckpoint configuration
 */
export interface ApprovalCheckpointConfig {
  /** Whether to automatically approve all checkpoints */
  autoApprove: boolean
  /** Timeout for human approval (in milliseconds) */
  timeoutMs: number
  /** Default approver identifier */
  approver: 'human' | 'automated'
  /** Whether to skip all approval checkpoints */
  skipCheckpoints: boolean
  /** Workflow phases that require approval checkpoints */
  checkpointPhases: string[]
}

/**
 * PhaseManager configuration
 */
export interface PhaseManagerConfig {
  /** Ordered list of workflow phases */
  phases: string[]
  /** Exit criteria description for each phase */
  phaseExitCriteria: Record<string, string>
}

/**
 * MetricsCollector configuration
 */
export interface MetricsCollectorConfig {
  /** Thresholds for identifying performance bottlenecks */
  bottleneckThresholds: {
    /** Multiplier for step-level bottleneck detection (e.g., 2.0 = 2x average duration) */
    stepDurationMultiplier: number
    /** Multiplier for phase-level bottleneck detection (e.g., 1.5 = 1.5x average duration) */
    phaseDurationMultiplier: number
  }
}

/**
 * LearningLoop configuration (LLM and analysis)
 */
export interface LearningLoopConfig {
  /** LLM configuration */
  llm: {
    /** Claude model to use for analysis */
    modelName: string
    /** Temperature for LLM responses (0-2, lower = more consistent) */
    temperature: number
    /** Maximum tokens for LLM responses */
    maxTokens: number
  }
  /** Database configuration */
  database: {
    /** Maximum number of concurrent database connections */
    maxPoolConnections: number
  }
  /** Thresholds for workflow analysis */
  analysisThresholds: {
    /** Minimum success rate to consider workflow healthy (0-1) */
    minSuccessRate: number
    /** Multiplier for identifying bottlenecks (e.g., 2.0 = 2x average) */
    bottleneckMultiplier: number
    /** Minimum number of historical runs required for analysis */
    minHistoricalRuns: number
    /** Percentage change required to be considered significant (0-1) */
    significantChangePercentage: number
  }
}

/**
 * MetricsOptimizer configuration
 */
export interface MetricsOptimizerConfig {
  /** Minimum number of historical workflow runs before optimization */
  minHistoricalRuns: number
  /** Safety threshold for auto-applying parallelization (0-1) */
  parallelizationSafetyThreshold: number
  /** Optimization-specific settings */
  optimization: {
    /** Penalty applied when steps are in different phases */
    phasePenalty: number
    /** Penalty applied when steps have deliverable dependencies */
    deliverableDependencyPenalty: number
    /** Bonus applied for steps with high success rates */
    highSuccessBonus: number
    /** Minimum artifacts threshold for productivity */
    minArtifactsThreshold: number
    /** Score penalty for low artifact production */
    lowArtifactsScore: number
    /** Minimum confidence threshold */
    minConfidenceThreshold: number
    /** Score penalty for low confidence */
    lowConfidenceScore: number
    /** Default timeout in milliseconds */
    defaultTimeoutMs: number
    /** Confidence level for timeout recommendations */
    timeoutConfidence: number
  }
}

/**
 * Master orchestration configuration
 *
 * Combines all component configurations into a single unified config.
 * This is the root configuration object used by ConfigManager.
 */
export interface OrchestrationConfig {
  /** WorkflowEngine settings */
  workflowEngine: WorkflowEngineConfig
  /** IterationManager retry settings */
  iterationManager: IterationManagerConfig
  /** ApprovalCheckpoint settings */
  approvalCheckpoint: ApprovalCheckpointConfig
  /** PhaseManager phase definitions */
  phaseManager: PhaseManagerConfig
  /** MetricsCollector bottleneck thresholds */
  metricsCollector: MetricsCollectorConfig
  /** LearningLoop LLM and analysis settings */
  learningLoop: LearningLoopConfig
  /** MetricsOptimizer optimization settings */
  metricsOptimizer: MetricsOptimizerConfig
}
