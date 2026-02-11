/**
 * PartyModeManager - Parallel Multi-PartyAgent Collaboration System
 *
 * Enables multiple agents to work on the same task simultaneously,
 * with configurable coordination strategies for merging results.
 *
 * Features:
 * - Parallel agent execution with Promise.allSettled
 * - Timeout protection per agent
 * - Three coordination strategies: merge, vote, consensus
 * - Conflict detection between agent outputs
 * - Graceful error handling
 *
 * @module orchestration/party-mode-manager
 */

import type { AgentState } from '../agents/types'

/**
 * Minimal agent interface for Party Mode
 * Any agent with an execute method can participate
 */
export interface PartyAgent {
  id: string
  name?: string
  execute(params: { task: string; context: AgentState; partyMode?: boolean }): Promise<any>
}

/**
 * Configuration for Party Mode execution
 */
export interface PartyModeConfig {
  /** Enable/disable party mode */
  enabled: boolean
  /** Maximum number of agents to run in parallel */
  maxParallelAgents: number
  /** Strategy for coordinating agent results */
  coordinationStrategy: 'merge' | 'vote' | 'consensus'
  /** Timeout per agent in milliseconds */
  timeout: number
}

/**
 * Result from parallel agent execution
 */
export interface PartyModeResult {
  /** Individual results from each agent */
  agentResults: Map<string, any>
  /** Merged/coordinated final result */
  mergedResult: any
  /** Total execution duration in milliseconds */
  duration: number
  /** Detected conflicts or errors */
  conflicts: string[]
  /** Execution metadata */
  metadata: {
    agentCount: number
    successfulAgents: number
    failedAgents: number
    strategy: string
    timestamp: number
  }
}

/**
 * PartyModeManager - Orchestrates parallel multi-agent execution
 *
 * @example
 * ```typescript
 * const manager = new PartyModeManager({
 *   enabled: true,
 *   maxParallelAgents: 5,
 *   coordinationStrategy: 'merge',
 *   timeout: 30000
 * })
 *
 * const result = await manager.executeParallel(
 *   [architect, developer, tester],
 *   'Design authentication system',
 *   workflowState
 * )
 * ```
 */
export class PartyModeManager {
  constructor(private config: PartyModeConfig) {
    this.validateConfig()
  }

  /**
   * Validate configuration
   */
  private validateConfig(): void {
    if (this.config.maxParallelAgents < 1) {
      throw new Error('maxParallelAgents must be at least 1')
    }
    if (this.config.timeout < 1000) {
      throw new Error('timeout must be at least 1000ms')
    }
    const validStrategies: Array<'merge' | 'vote' | 'consensus'> = [
      'merge',
      'vote',
      'consensus'
    ]
    if (!validStrategies.includes(this.config.coordinationStrategy)) {
      throw new Error(
        `Invalid coordinationStrategy: ${this.config.coordinationStrategy}. ` +
          `Must be one of: ${validStrategies.join(', ')}`
      )
    }
  }

  /**
   * Execute multiple agents in parallel
   *
   * @param agents - Array of agents to execute
   * @param task - Task description
   * @param context - Workflow state context
   * @returns Promise resolving to PartyModeResult
   *
   * @throws Error if agent count exceeds maxParallelAgents
   */
  async executeParallel(
    agents: PartyAgent[],
    task: string,
    context: AgentState
  ): Promise<PartyModeResult> {
    // Validation
    if (!this.config.enabled) {
      throw new Error('Party mode is disabled')
    }

    if (agents.length === 0) {
      throw new Error('At least one agent is required')
    }

    if (agents.length > this.config.maxParallelAgents) {
      throw new Error(
        `Too many agents: ${agents.length} exceeds max ${this.config.maxParallelAgents}`
      )
    }

    console.log(
      `🎉 [Party Mode] Executing ${agents.length} agents in parallel...`
    )
    console.log(
      `   Strategy: ${this.config.coordinationStrategy} | Timeout: ${this.config.timeout}ms`
    )

    const startTime = Date.now()

    // Execute all agents in parallel using Promise.allSettled
    // This ensures we wait for all agents, even if some fail
    const promises = agents.map((agent) =>
      this.executePartyAgentWithTimeout(agent, task, context)
    )
    const results = await Promise.allSettled(promises)

    // Collect successful results and errors
    const agentResults = new Map<string, any>()
    const errors: string[] = []
    let successfulAgents = 0
    let failedAgents = 0

    results.forEach((result, index) => {
      const agent = agents[index]
      if (result.status === 'fulfilled') {
        agentResults.set(agent.id, result.value)
        successfulAgents++
        console.log(`   ✅ ${agent.id}: Success`)
      } else {
        errors.push(`${agent.id}: ${result.reason}`)
        failedAgents++
        console.warn(`   ❌ ${agent.id}: ${result.reason}`)
      }
    })

    // Check if we have enough successful results
    if (successfulAgents === 0) {
      throw new Error('All agents failed. Cannot proceed.')
    }

    // Merge results based on coordination strategy
    let mergedResult: any
    try {
      mergedResult = await this.mergeResults(
        agentResults,
        this.config.coordinationStrategy
      )
    } catch (error) {
      throw new Error(
        `Failed to merge results with strategy "${this.config.coordinationStrategy}": ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }

    // Detect conflicts between agent outputs
    const conflicts = this.detectConflicts(agentResults)

    const duration = Date.now() - startTime

    console.log(
      `🎉 [Party Mode] Complete in ${duration}ms | Success: ${successfulAgents}/${agents.length}`
    )
    if (conflicts.length > 0) {
      console.warn(`   ⚠️  Detected ${conflicts.length} conflicts`)
    }

    return {
      agentResults,
      mergedResult,
      duration,
      conflicts: [...conflicts, ...errors],
      metadata: {
        agentCount: agents.length,
        successfulAgents,
        failedAgents,
        strategy: this.config.coordinationStrategy,
        timestamp: Date.now()
      }
    }
  }

  /**
   * Execute single agent with timeout protection
   */
  private async executePartyAgentWithTimeout(
    agent: PartyAgent,
    task: string,
    context: AgentState
  ): Promise<any> {
    return Promise.race([
      // PartyAgent execution
      this.executePartyAgent(agent, task, context),
      // Timeout
      this.createTimeout(this.config.timeout, agent.id)
    ])
  }

  /**
   * Execute single agent
   */
  private async executePartyAgent(
    agent: PartyAgent,
    task: string,
    context: AgentState
  ): Promise<any> {
    try {
      // Call agent's execute method
      const result = await (agent as any).execute({
        task,
        context,
        partyMode: true
      })
      return result
    } catch (error) {
      throw new Error(
        `PartyAgent execution failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    }
  }

  /**
   * Create timeout promise that rejects after specified milliseconds
   */
  private createTimeout(ms: number, agentId: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`PartyAgent ${agentId} timed out after ${ms}ms`))
      }, ms)
    })
  }

  /**
   * Merge results from multiple agents based on coordination strategy
   */
  private async mergeResults(
    results: Map<string, any>,
    strategy: 'merge' | 'vote' | 'consensus'
  ): Promise<any> {
    switch (strategy) {
      case 'merge':
        return this.mergeStrategy(results)
      case 'vote':
        return this.voteStrategy(results)
      case 'consensus':
        return this.consensusStrategy(results)
      default:
        throw new Error(`Unknown strategy: ${strategy}`)
    }
  }

  /**
   * Merge strategy: Combine all agent results into a single output
   *
   * This strategy collects outputs from all agents and creates
   * a unified result containing contributions from each agent.
   */
  private mergeStrategy(results: Map<string, any>): any {
    const merged: any = {
      contributors: Array.from(results.keys()),
      outputs: {},
      artifacts: [],
      recommendations: [],
      metadata: {
        strategy: 'merge',
        agentCount: results.size
      }
    }

    // Collect outputs from each agent
    for (const [agentId, result] of results) {
      // Store individual output
      merged.outputs[agentId] = result.output || result

      // Merge artifacts if present
      if (result.artifacts && Array.isArray(result.artifacts)) {
        merged.artifacts.push(...result.artifacts)
      }

      // Merge recommendations if present
      if (result.recommendations && Array.isArray(result.recommendations)) {
        merged.recommendations.push(...result.recommendations)
      }

      // Preserve other fields
      for (const [key, value] of Object.entries(result)) {
        if (
          key !== 'output' &&
          key !== 'artifacts' &&
          key !== 'recommendations'
        ) {
          if (!merged[key]) {
            merged[key] = []
          }
          if (Array.isArray(merged[key])) {
            merged[key].push({ agent: agentId, value })
          }
        }
      }
    }

    return merged
  }

  /**
   * Vote strategy: Select result with majority support
   *
   * PartyAgents "vote" by producing outputs. The output that appears
   * most frequently is selected as the winner.
   */
  private voteStrategy(results: Map<string, any>): any {
    // Count occurrences of each unique output
    const votes = new Map<string, number>()
    const outputMap = new Map<string, any>()
    const votersByOutput = new Map<string, string[]>()

    for (const [agentId, result] of results) {
      // Normalize output for comparison
      const output = result.output || result
      const key = JSON.stringify(output)

      // Count votes
      votes.set(key, (votes.get(key) || 0) + 1)

      // Store original result
      if (!outputMap.has(key)) {
        outputMap.set(key, result)
      }

      // Track which agents voted for this output
      if (!votersByOutput.has(key)) {
        votersByOutput.set(key, [])
      }
      votersByOutput.get(key)!.push(agentId)
    }

    // Find majority winner
    let maxVotes = 0
    let winnerKey = ''

    for (const [key, count] of votes) {
      if (count > maxVotes) {
        maxVotes = count
        winnerKey = key
      }
    }

    const winnerResult = outputMap.get(winnerKey)!
    const winnerVoters = votersByOutput.get(winnerKey)!

    return {
      ...winnerResult,
      votingStats: {
        totalVotes: results.size,
        winnerVotes: maxVotes,
        winnerPercentage: Math.round((maxVotes / results.size) * 100),
        alternatives: votes.size - 1,
        voters: winnerVoters,
        allVotes: Array.from(votes.entries()).map(([key, count]) => ({
          output: JSON.parse(key),
          votes: count,
          percentage: Math.round((count / results.size) * 100),
          voters: votersByOutput.get(key)
        }))
      }
    }
  }

  /**
   * Consensus strategy: Require all agents to agree
   *
   * All agents must produce identical outputs. If there's any
   * disagreement, the merge fails.
   */
  private consensusStrategy(results: Map<string, any>): any {
    const outputs = Array.from(results.values()).map(
      (r) => JSON.stringify(r.output || r)
    )
    const firstOutput = outputs[0]

    // Check if all outputs are identical
    const hasConsensus = outputs.every((output) => output === firstOutput)

    if (!hasConsensus) {
      // Show differences for debugging
      const uniqueOutputs = new Set(outputs)
      throw new Error(
        `No consensus reached among agents. Found ${uniqueOutputs.size} different outputs.`
      )
    }

    const firstResult = results.values().next().value

    return {
      ...firstResult,
      consensus: true,
      agreementLevel: 100,
      participants: Array.from(results.keys())
    }
  }

  /**
   * Detect conflicts between agent outputs
   *
   * Compares outputs from different agents to identify disagreements.
   * Returns array of conflict descriptions.
   */
  private detectConflicts(results: Map<string, any>): string[] {
    const conflicts: string[] = []
    const outputs = Array.from(results.entries())

    // Compare each pair of agent outputs
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const [agent1, result1] = outputs[i]
        const [agent2, result2] = outputs[j]

        const conflict = this.findConflict(agent1, result1, agent2, result2)
        if (conflict) {
          conflicts.push(conflict)
        }
      }
    }

    return conflicts
  }

  /**
   * Find specific conflict between two agent results
   */
  private findConflict(
    agent1: string,
    result1: any,
    agent2: string,
    result2: any
  ): string | null {
    const output1 = result1.output || result1
    const output2 = result2.output || result2

    // Simple JSON comparison
    const json1 = JSON.stringify(output1)
    const json2 = JSON.stringify(output2)

    if (json1 !== json2) {
      // Try to identify specific field conflicts
      const fields1 = this.extractFields(output1)
      const fields2 = this.extractFields(output2)

      const conflictingFields: string[] = []
      for (const field of fields1) {
        if (fields2.includes(field)) {
          const val1 = this.getFieldValue(output1, field)
          const val2 = this.getFieldValue(output2, field)
          if (JSON.stringify(val1) !== JSON.stringify(val2)) {
            conflictingFields.push(field)
          }
        }
      }

      if (conflictingFields.length > 0) {
        return `Conflict between ${agent1} and ${agent2}: different values for [${conflictingFields.join(', ')}]`
      }

      return `Conflict between ${agent1} and ${agent2}: different outputs`
    }

    return null
  }

  /**
   * Extract field names from object
   */
  private extractFields(obj: any): string[] {
    if (typeof obj !== 'object' || obj === null) {
      return []
    }
    return Object.keys(obj)
  }

  /**
   * Get field value from object
   */
  private getFieldValue(obj: any, field: string): any {
    return obj[field]
  }

  /**
   * Get current configuration
   */
  getConfig(): PartyModeConfig {
    return { ...this.config }
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<PartyModeConfig>): void {
    this.config = { ...this.config, ...updates }
    this.validateConfig()
  }

  /**
   * Enable party mode
   */
  enable(): void {
    this.config.enabled = true
  }

  /**
   * Disable party mode
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * Check if party mode is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled
  }
}

/**
 * Singleton instance
 */
let partyModeManagerInstance: PartyModeManager | null = null

/**
 * Get or create PartyModeManager singleton
 *
 * @param config - Optional configuration (only used on first call)
 * @returns PartyModeManager instance
 */
export function getPartyModeManager(
  config?: Partial<PartyModeConfig>
): PartyModeManager {
  if (!partyModeManagerInstance) {
    const defaultConfig: PartyModeConfig = {
      enabled: true,
      maxParallelAgents: 5,
      coordinationStrategy: 'merge',
      timeout: 30000
    }

    partyModeManagerInstance = new PartyModeManager({
      ...defaultConfig,
      ...config
    })
  }
  return partyModeManagerInstance
}

/**
 * Reset PartyModeManager singleton (useful for testing)
 */
export function resetPartyModeManager(): void {
  partyModeManagerInstance = null
}
