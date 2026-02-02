/**
 * RoutingLogger - Logging for agent/model routing decisions
 *
 * Provides structured logging for:
 * - Model selection (Opus/Sonnet/Haiku)
 * - Agent selection based on task
 * - Routing rationale and metrics
 */

export type ModelTier = 'opus' | 'sonnet' | 'haiku'

export interface RoutingDecision {
  taskId: string
  taskDescription: string
  selectedModel: ModelTier
  selectedAgent?: string
  rationale: string
  complexity?: number
  timestamp: Date
  metrics?: {
    estimatedTokens?: number
    estimatedCost?: number
    expectedLatency?: string
  }
}

export interface RoutingLogEntry {
  id: string
  decision: RoutingDecision
  outcome?: {
    success: boolean
    actualTokens?: number
    actualCost?: number
    duration?: number
    error?: string
  }
}

/**
 * RoutingLogger - Centralized logging for routing decisions
 */
export class RoutingLogger {
  private entries: RoutingLogEntry[] = []
  private maxEntries: number = 1000
  private verbose: boolean = false

  constructor(options?: { maxEntries?: number; verbose?: boolean }) {
    this.maxEntries = options?.maxEntries ?? 1000
    this.verbose = options?.verbose ?? false
  }

  /**
   * Log a routing decision
   */
  logDecision(decision: RoutingDecision): string {
    const id = this.generateId()
    const entry: RoutingLogEntry = {
      id,
      decision: {
        ...decision,
        timestamp: decision.timestamp || new Date()
      }
    }

    this.entries.push(entry)
    this.pruneOldEntries()

    if (this.verbose) {
      console.log(`🔀 [Router] Task: ${decision.taskDescription.slice(0, 50)}...`)
      console.log(`   Model: ${this.getModelEmoji(decision.selectedModel)} ${decision.selectedModel}`)
      if (decision.selectedAgent) {
        console.log(`   Agent: ${decision.selectedAgent}`)
      }
      console.log(`   Rationale: ${decision.rationale}`)
    }

    return id
  }

  /**
   * Update entry with outcome
   */
  logOutcome(
    entryId: string,
    outcome: RoutingLogEntry['outcome']
  ): void {
    const entry = this.entries.find(e => e.id === entryId)
    if (entry) {
      entry.outcome = outcome

      if (this.verbose) {
        const status = outcome?.success ? '✅' : '❌'
        console.log(`${status} [Router] Completed: ${entryId}`)
        if (outcome?.duration) {
          console.log(`   Duration: ${outcome.duration}ms`)
        }
        if (outcome?.error) {
          console.log(`   Error: ${outcome.error}`)
        }
      }
    }
  }

  /**
   * Get routing statistics
   */
  getStats(): {
    totalDecisions: number
    byModel: Record<ModelTier, number>
    successRate: number
    avgDuration: number
  } {
    const byModel: Record<ModelTier, number> = { opus: 0, sonnet: 0, haiku: 0 }
    let successCount = 0
    let totalDuration = 0
    let completedCount = 0

    for (const entry of this.entries) {
      byModel[entry.decision.selectedModel]++

      if (entry.outcome) {
        if (entry.outcome.success) successCount++
        if (entry.outcome.duration) {
          totalDuration += entry.outcome.duration
          completedCount++
        }
      }
    }

    return {
      totalDecisions: this.entries.length,
      byModel,
      successRate: this.entries.length > 0 ? successCount / this.entries.length : 0,
      avgDuration: completedCount > 0 ? totalDuration / completedCount : 0
    }
  }

  /**
   * Get recent entries
   */
  getRecentEntries(limit: number = 10): RoutingLogEntry[] {
    return this.entries.slice(-limit)
  }

  /**
   * Get entries by model
   */
  getEntriesByModel(model: ModelTier): RoutingLogEntry[] {
    return this.entries.filter(e => e.decision.selectedModel === model)
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = []
  }

  /**
   * Set verbose mode
   */
  setVerbose(verbose: boolean): void {
    this.verbose = verbose
  }

  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================

  private generateId(): string {
    return `route_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  }

  private pruneOldEntries(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries)
    }
  }

  private getModelEmoji(model: ModelTier): string {
    const emojis: Record<ModelTier, string> = {
      opus: '🎭',    // Complex/creative
      sonnet: '⚖️',  // Balanced
      haiku: '⚡'    // Fast/simple
    }
    return emojis[model]
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let loggerInstance: RoutingLogger | null = null

/**
 * Get singleton RoutingLogger instance
 */
export function getRoutingLogger(options?: { maxEntries?: number; verbose?: boolean }): RoutingLogger {
  if (!loggerInstance) {
    loggerInstance = new RoutingLogger(options)
  }
  return loggerInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetRoutingLogger(): void {
  loggerInstance = null
}
