/**
 * YoloModeManager - Automatic checkpoint bypass for trivial tasks
 *
 * BMAD Gaps Closing: YOLO Mode Implementation
 *
 * When enabled, trivial tasks (complexity < threshold) automatically bypass
 * approval checkpoints, enabling faster execution while maintaining audit trail.
 *
 * Features:
 * - Configurable complexity threshold (default: 30)
 * - Audit trail for all YOLO executions
 * - Excluded workflows list for critical paths
 * - Integration with ComplexityAnalyzer and ApprovalCheckpoint
 *
 * Usage:
 * ```typescript
 * const yoloManager = new YoloModeManager()
 * if (yoloManager.shouldEnableYolo(complexityScore)) {
 *   // Bypass checkpoints
 * }
 * ```
 */

import { LRUCache } from 'lru-cache'
import { getConfigManager } from './config/config-manager'

// ═══════════════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════════════

export interface YoloModeConfig {
  /** Complexity score threshold for YOLO mode (default: 30) */
  complexityThreshold: number
  /** Whether YOLO mode is enabled (default: true) */
  enabled: boolean
  /** Whether to record audit trail (default: true) */
  auditEnabled: boolean
  /** Workflows that should never use YOLO mode */
  excludedWorkflows: string[]
  /** Maximum audit records to keep in memory (default: 1000) */
  maxAuditRecords: number
}

export interface YoloAuditRecord {
  /** Task identifier */
  taskId: string
  /** Task description for reference */
  taskDescription?: string
  /** Complexity score that triggered YOLO */
  complexityScore: number
  /** Workflow name if applicable */
  workflowName?: string
  /** Timestamp of YOLO execution */
  timestamp: Date
  /** Checkpoints that were bypassed */
  bypassedCheckpoints: string[]
  /** Execution outcome */
  outcome: 'success' | 'failure' | 'pending'
  /** Duration in milliseconds (set when outcome changes from pending) */
  durationMs?: number
  /** Error message if failed */
  errorMessage?: string
}

export interface YoloModeStats {
  /** Total YOLO executions */
  totalExecutions: number
  /** Successful YOLO executions */
  successCount: number
  /** Failed YOLO executions */
  failureCount: number
  /** Pending YOLO executions */
  pendingCount: number
  /** Success rate as percentage */
  successRate: number
  /** Average complexity score of YOLO tasks */
  avgComplexityScore: number
  /** Average duration in milliseconds */
  avgDurationMs: number
}

// ═══════════════════════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: YoloModeConfig = {
  complexityThreshold: 30,
  enabled: true,
  auditEnabled: true,
  excludedWorkflows: [
    'security_audit',
    'production_deployment',
    'database_migration',
    'infrastructure_change'
  ],
  maxAuditRecords: 1000
}

// ═══════════════════════════════════════════════════════════════════════════
// YoloModeManager Class
// ═══════════════════════════════════════════════════════════════════════════

/**
 * YoloModeManager - Manages automatic checkpoint bypass for trivial tasks
 */
export class YoloModeManager {
  private config: YoloModeConfig
  private auditCache: LRUCache<string, YoloAuditRecord>
  private auditHistory: YoloAuditRecord[] = []

  constructor(config?: Partial<YoloModeConfig>) {
    // Try to load from ConfigManager if available
    let effectiveConfig = { ...DEFAULT_CONFIG }

    try {
      const configManager = getConfigManager()
      if (configManager.isInitialized()) {
        const orchestrationConfig = configManager.getConfig()
        if ((orchestrationConfig as any).yoloMode) {
          effectiveConfig = { ...effectiveConfig, ...(orchestrationConfig as any).yoloMode }
        }
      }
    } catch {
      // ConfigManager not available, use defaults
    }

    // Override with explicit config
    this.config = { ...effectiveConfig, ...config }

    // Initialize audit cache
    this.auditCache = new LRUCache<string, YoloAuditRecord>({
      max: this.config.maxAuditRecords,
      ttl: 24 * 60 * 60 * 1000 // 24 hours
    })

    if (this.config.enabled) {
      console.log(`🚀 [YoloModeManager] Enabled (threshold: ${this.config.complexityThreshold})`)
    } else {
      console.log('⚙️  [YoloModeManager] Disabled')
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Core Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Check if YOLO mode should be enabled for a given complexity score
   *
   * @param complexityScore - Task complexity score (0-100)
   * @param workflowName - Optional workflow name to check exclusions
   * @returns Whether YOLO mode should be enabled
   */
  shouldEnableYolo(complexityScore: number, workflowName?: string): boolean {
    // Check if YOLO mode is globally enabled
    if (!this.config.enabled) {
      return false
    }

    // Check if workflow is excluded
    if (workflowName && this.isWorkflowExcluded(workflowName)) {
      console.log(`🛑 [YoloModeManager] Workflow '${workflowName}' is excluded from YOLO mode`)
      return false
    }

    // Check complexity threshold
    const shouldYolo = complexityScore < this.config.complexityThreshold

    if (shouldYolo) {
      console.log(`🚀 [YoloModeManager] YOLO eligible: complexity ${complexityScore} < threshold ${this.config.complexityThreshold}`)
    }

    return shouldYolo
  }

  /**
   * Check if a workflow is excluded from YOLO mode
   */
  isWorkflowExcluded(workflowName: string): boolean {
    const normalizedName = workflowName.toLowerCase()
    return this.config.excludedWorkflows.some(excluded =>
      normalizedName.includes(excluded.toLowerCase())
    )
  }

  /**
   * Record a YOLO execution for audit purposes
   */
  recordYoloExecution(record: Omit<YoloAuditRecord, 'timestamp'>): YoloAuditRecord {
    const fullRecord: YoloAuditRecord = {
      ...record,
      timestamp: new Date()
    }

    if (this.config.auditEnabled) {
      // Store in cache for quick lookup
      this.auditCache.set(record.taskId, fullRecord)

      // Store in history (with size limit)
      this.auditHistory.push(fullRecord)
      if (this.auditHistory.length > this.config.maxAuditRecords) {
        this.auditHistory.shift() // Remove oldest
      }

      console.log(`📝 [YoloModeManager] Recorded YOLO execution: ${record.taskId} (complexity: ${record.complexityScore})`)
    }

    return fullRecord
  }

  /**
   * Update the outcome of a YOLO execution
   */
  updateOutcome(
    taskId: string,
    outcome: 'success' | 'failure',
    durationMs?: number,
    errorMessage?: string
  ): void {
    const record = this.auditCache.get(taskId)
    if (record) {
      record.outcome = outcome
      record.durationMs = durationMs
      record.errorMessage = errorMessage

      // Update in history too
      const historyRecord = this.auditHistory.find(r => r.taskId === taskId)
      if (historyRecord) {
        historyRecord.outcome = outcome
        historyRecord.durationMs = durationMs
        historyRecord.errorMessage = errorMessage
      }

      const emoji = outcome === 'success' ? '✅' : '❌'
      console.log(`${emoji} [YoloModeManager] Updated outcome: ${taskId} -> ${outcome}`)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Query Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get audit history
   *
   * @param limit - Maximum number of records to return
   * @param filter - Optional filter criteria
   */
  getAuditHistory(
    limit?: number,
    filter?: { outcome?: 'success' | 'failure' | 'pending'; workflowName?: string }
  ): YoloAuditRecord[] {
    let records = [...this.auditHistory]

    // Apply filters
    if (filter?.outcome) {
      records = records.filter(r => r.outcome === filter.outcome)
    }
    if (filter?.workflowName) {
      records = records.filter(r => r.workflowName === filter.workflowName)
    }

    // Sort by timestamp descending (most recent first)
    records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Apply limit
    if (limit && limit > 0) {
      records = records.slice(0, limit)
    }

    return records
  }

  /**
   * Get a specific audit record by task ID
   */
  getAuditRecord(taskId: string): YoloAuditRecord | undefined {
    return this.auditCache.get(taskId)
  }

  /**
   * Get YOLO mode statistics
   */
  getStats(): YoloModeStats {
    const records = this.auditHistory
    const total = records.length

    if (total === 0) {
      return {
        totalExecutions: 0,
        successCount: 0,
        failureCount: 0,
        pendingCount: 0,
        successRate: 0,
        avgComplexityScore: 0,
        avgDurationMs: 0
      }
    }

    const successCount = records.filter(r => r.outcome === 'success').length
    const failureCount = records.filter(r => r.outcome === 'failure').length
    const pendingCount = records.filter(r => r.outcome === 'pending').length

    const completedRecords = records.filter(r => r.durationMs !== undefined)
    const avgDurationMs = completedRecords.length > 0
      ? completedRecords.reduce((sum, r) => sum + (r.durationMs || 0), 0) / completedRecords.length
      : 0

    const avgComplexityScore = records.reduce((sum, r) => sum + r.complexityScore, 0) / total

    return {
      totalExecutions: total,
      successCount,
      failureCount,
      pendingCount,
      successRate: total > 0 ? (successCount / (successCount + failureCount)) * 100 : 0,
      avgComplexityScore: Math.round(avgComplexityScore * 100) / 100,
      avgDurationMs: Math.round(avgDurationMs)
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Configuration Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get current configuration
   */
  getConfig(): YoloModeConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<YoloModeConfig>): void {
    this.config = { ...this.config, ...config }

    if (config.enabled !== undefined) {
      console.log(`⚙️  [YoloModeManager] ${config.enabled ? 'Enabled' : 'Disabled'}`)
    }
    if (config.complexityThreshold !== undefined) {
      console.log(`⚙️  [YoloModeManager] Threshold updated: ${config.complexityThreshold}`)
    }
  }

  /**
   * Add a workflow to the exclusion list
   */
  addExcludedWorkflow(workflowName: string): void {
    if (!this.config.excludedWorkflows.includes(workflowName)) {
      this.config.excludedWorkflows.push(workflowName)
      console.log(`🛑 [YoloModeManager] Added excluded workflow: ${workflowName}`)
    }
  }

  /**
   * Remove a workflow from the exclusion list
   */
  removeExcludedWorkflow(workflowName: string): void {
    const index = this.config.excludedWorkflows.indexOf(workflowName)
    if (index !== -1) {
      this.config.excludedWorkflows.splice(index, 1)
      console.log(`✅ [YoloModeManager] Removed excluded workflow: ${workflowName}`)
    }
  }

  /**
   * Clear audit history
   */
  clearAuditHistory(): void {
    this.auditHistory = []
    this.auditCache.clear()
    console.log('🗑️  [YoloModeManager] Audit history cleared')
  }

  /**
   * Check if YOLO mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * Get complexity threshold
   */
  getThreshold(): number {
    return this.config.complexityThreshold
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Format Methods
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Format stats for display
   */
  formatStats(): string {
    const stats = this.getStats()

    return `
🚀 YOLO Mode Statistics
═══════════════════════════════════════
Status:           ${this.config.enabled ? '✅ Enabled' : '❌ Disabled'}
Threshold:        ${this.config.complexityThreshold}
Excluded:         ${this.config.excludedWorkflows.length} workflows

📊 Execution Summary:
  Total:          ${stats.totalExecutions}
  Success:        ${stats.successCount} (${stats.successRate.toFixed(1)}%)
  Failure:        ${stats.failureCount}
  Pending:        ${stats.pendingCount}

📈 Averages:
  Complexity:     ${stats.avgComplexityScore}
  Duration:       ${stats.avgDurationMs}ms
═══════════════════════════════════════
    `.trim()
  }

  /**
   * Format audit history for display
   */
  formatAuditHistory(limit: number = 10): string {
    const records = this.getAuditHistory(limit)

    if (records.length === 0) {
      return '📋 No YOLO audit records'
    }

    const lines = [
      '📋 YOLO Audit History (recent first)',
      '═══════════════════════════════════════'
    ]

    for (const record of records) {
      const emoji = record.outcome === 'success' ? '✅' :
                    record.outcome === 'failure' ? '❌' : '⏳'
      const duration = record.durationMs ? `${record.durationMs}ms` : 'pending'
      lines.push(`${emoji} ${record.taskId} | complexity: ${record.complexityScore} | ${duration}`)
    }

    lines.push('═══════════════════════════════════════')

    return lines.join('\n')
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Singleton Instance
// ═══════════════════════════════════════════════════════════════════════════

let yoloModeManagerInstance: YoloModeManager | null = null

/**
 * Get or create the singleton YoloModeManager instance
 */
export function getYoloModeManager(config?: Partial<YoloModeConfig>): YoloModeManager {
  if (!yoloModeManagerInstance) {
    yoloModeManagerInstance = new YoloModeManager(config)
  }
  return yoloModeManagerInstance
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetYoloModeManager(): void {
  yoloModeManagerInstance = null
}
