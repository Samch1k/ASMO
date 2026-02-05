/**
 * Default Orchestration Configuration
 *
 * These values match current hardcoded defaults for 100% backward compatibility.
 * Any value not specified in a user config file will fall back to these defaults.
 *
 * Pattern: Mirrors existing hardcoded values from Priority 1 analysis
 */

import type { OrchestrationConfig } from './types'

/**
 * Database and Persistence Defaults
 * Used by TaskPersister, MetricsPersister, and LearningLoop
 */
export const PERSISTENCE_DEFAULTS = {
  database: {
    poolSize: 10,
    idleTimeoutMs: 30000,
    connectionTimeoutMs: 2000,
    cacheTtlMs: 5 * 60 * 1000, // 5 minutes
    shortCacheTtlMs: 60 * 1000, // 1 minute
    taskCacheMax: 500,
    taskListCacheMax: 100
  },
  learning: {
    bottleneckMultiplier: 2,
    phaseBottleneckMultiplier: 1.5,
    failureRateThreshold: 0.2,
    successRateThreshold: 0.95,
    confidenceThreshold: 0.9,
    minHistoricalRuns: 3
  },
  paths: {
    metricsDb: '.asmo/metrics.db'
  }
} as const

export const DEFAULT_ORCHESTRATION_CONFIG: OrchestrationConfig = {
  /**
   * WorkflowEngine Configuration
   * Source: .cursor/lib/orchestration/workflow-engine.ts (lines 76-82)
   */
  workflowEngine: {
    max_parallel_agents: 5,
    default_timeout: '30m',
    continue_on_partial_failure: false,
    log_all_steps: true,
    state_merge_strategy: 'namespace_isolation'
  },

  /**
   * IterationManager Configuration (Retry Logic)
   * Source: .cursor/lib/orchestration/iteration-manager.ts (lines 75-116)
   */
  iterationManager: {
    maxRetries: 3,
    initialDelayMs: 1000, // 1 second
    backoffMultiplier: 2, // Exponential: 2x each retry
    maxDelayMs: 60000, // 1 minute

    // Retryable error patterns (transient errors that should be retried)
    retryableErrors: [
      'timeout',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ECONNRESET',
      'EPIPE',
      'rate_limit',
      'rate limit',
      'too many requests',
      'service unavailable',
      'temporarily unavailable',
      'ENOTFOUND',
      'network error',
      'fetch failed',
      'socket hang up'
    ],

    // Fatal error patterns (should fail immediately without retry)
    fatalErrors: [
      'invalid input',
      'validation failed',
      'unauthorized',
      'forbidden',
      'not found',
      'security violation',
      'authentication failed',
      'permission denied',
      'business rule',
      'constraint violation',
      'duplicate key',
      'invalid state'
    ]
  },

  /**
   * ApprovalCheckpoint Configuration
   * Source: .cursor/lib/orchestration/approval-checkpoint.ts (lines 62-74)
   */
  approvalCheckpoint: {
    autoApprove: false,
    timeoutMs: 300000, // 5 minutes
    approver: 'human',
    skipCheckpoints: false,
    checkpointPhases: ['requirements', 'design', 'testing']
  },

  /**
   * PhaseManager Configuration
   * Source: .cursor/lib/orchestration/phase-manager.ts (lines 47-63)
   */
  phaseManager: {
    phases: [
      'requirements',
      'design',
      'planning',
      'implementation',
      'testing',
      'deployment'
    ],
    phaseExitCriteria: {
      requirements: 'Requirements validated and approved',
      design: 'Design validated and approved',
      planning: 'Project plan created with estimates',
      implementation: 'Code implemented and reviewed',
      testing: 'Tests passing with acceptable coverage',
      deployment: 'Deployed and health verified'
    }
  },

  /**
   * MetricsCollector Configuration
   * Source: .cursor/lib/orchestration/metrics-collector.ts (lines 157, 183)
   */
  metricsCollector: {
    bottleneckThresholds: {
      stepDurationMultiplier: 2.0, // 2x average duration = bottleneck
      phaseDurationMultiplier: 1.5 // 1.5x average duration = bottleneck
    }
  },

  /**
   * LearningLoop Configuration
   * Source: .cursor/lib/orchestration/learning-loop.ts (lines 59-63, 72, various)
   */
  learningLoop: {
    llm: {
      modelName: 'claude-sonnet-4-20250514',
      temperature: 0.2, // Low for consistent analysis
      maxTokens: 4096
    },
    database: {
      maxPoolConnections: 5
    },
    analysisThresholds: {
      minSuccessRate: 0.7, // 70% success rate minimum
      bottleneckMultiplier: 2.0, // 2x average = bottleneck
      minHistoricalRuns: 3, // Need at least 3 runs for analysis
      significantChangePercentage: 0.15 // 15% change is significant
    }
  },

  /**
   * MetricsOptimizer Configuration
   * Source: .cursor/lib/orchestration/metrics-optimizer.ts (lines 57-58, various)
   */
  metricsOptimizer: {
    minHistoricalRuns: 3,
    parallelizationSafetyThreshold: 0.7, // 70% safety score for auto-apply

    optimization: {
      // Safety score adjustments
      phasePenalty: 0.3, // Reduce score by 30% if different phases
      deliverableDependencyPenalty: 0.4, // Reduce score by 40% if dependencies
      highSuccessBonus: 0.1, // Increase score by 10% for high success rate

      // Artifact and confidence thresholds
      minArtifactsThreshold: 1.0, // Minimum artifacts per step
      lowArtifactsScore: 0.3, // Score penalty for low artifacts
      minConfidenceThreshold: 0.5, // Minimum confidence score
      lowConfidenceScore: 0.4, // Score penalty for low confidence

      // Timeout settings
      defaultTimeoutMs: 30000, // 30 seconds default
      timeoutConfidence: 0.8 // 80% confidence for timeout recommendations
    }
  },

  /**
   * ComplexityAnalyzer Configuration (BMAD Phase 1.5)
   * Source: complexity-analyzer.ts DEFAULT_CONFIG
   */
  complexityAnalyzer: {
    maxTokens: 2000,
    thresholds: {
      trivial: 20,
      simple: 40,
      medium: 60,
      complex: 80,
      enterprise: 100
    }
  },

  /**
   * WorkflowSelector Configuration (BMAD Phase 1.5)
   * Source: workflow-selector.ts DEFAULT_CONFIG
   */
  workflowSelector: {
    autoSelect: true,
    confidenceThreshold: 0.7,
    maxAlternatives: 2
  },

  /**
   * Adversarial Review Configuration (BMAD Integration)
   */
  adversarialReview: {
    enabled: true,
    minIssuesRequired: 1,
    maxRetries: 3,
    blockingSeverities: ['critical', 'major']
  },

  /**
   * Elicitation Configuration (BMAD Integration)
   */
  elicitation: {
    enabled: true,
    defaultTechniques: ['first-principles', 'pre-mortem'],
    applyToWorkflows: ['create-prd', 'create-architecture'],
    maxInsightsPerTechnique: 10
  },

  /**
   * Context Cascade Configuration (BMAD Integration)
   */
  contextCascade: {
    enabled: true,
    outputDir: '_asmo-output',
    autoLoad: true
  },

  /**
   * Document Sharding Configuration (BMAD Integration)
   */
  documentSharding: {
    enabled: true,
    maxTokensPerFile: 10000,
    splitLevel: 2,
    minTokensPerSection: 500
  },

  /**
   * TEA Module Configuration (BMAD Integration)
   */
  tea: {
    enabled: false, // Opt-in
    qualityGateThreshold: 80,
    coverageTargets: {
      unit: 80,
      integration: 70,
      e2e: 50
    }
  }
}
