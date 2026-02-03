/**
 * DynamicOrchestrator - Native TypeScript agent orchestration
 *
 * Replaces LangGraph-based orchestrator with native implementation.
 * Provides intelligent task routing, agent execution, and workflow coordination.
 *
 * Features:
 * - Model routing (Opus/Sonnet/Haiku based on complexity)
 * - Agent selection based on skills and task type
 * - Retry with exponential backoff
 * - Execution metrics and logging
 * - Workflow integration
 */

import type { BaseAgent } from '../agents/base-agent'
import type { AgentState, Artifact } from '../agents/types'
import type { SelectAgentOptions } from './agent-registry'
import { TaskRouter, getTaskRouter, type TaskContext, type RoutingResult } from './task-router'
import { AgentExecutor, getAgentExecutor, type ExecutorConfig, type AgentExecutionOutput } from './agent-executor'
import { getRoutingLogger, type ModelTier } from './routing-logger'
import type { ComplexityLevel } from './task-persister'
import { getInputValidator } from './reliability'

// =============================================================================
// TYPES
// =============================================================================

export interface OrchestratorConfig {
  /** Enable verbose logging */
  verbose: boolean
  /** Maximum concurrent agent executions */
  maxConcurrency: number
  /** Agent executor configuration */
  executor?: Partial<ExecutorConfig>
  /** Task router configuration */
  router?: Parameters<typeof TaskRouter['prototype']['updateConfig']>[0]
}

export interface OrchestrationTask {
  id: string
  description: string
  taskType?: string
  complexity?: {
    score: number
    level: ComplexityLevel
  }
  requiredSkills?: string[]
  preferredAgent?: string
  preferredModel?: ModelTier
  context?: Record<string, unknown>
  parentTaskId?: string
}

export interface OrchestrationResult {
  taskId: string
  success: boolean
  result?: AgentExecutionOutput
  artifacts?: Artifact[]
  routing: RoutingResult
  metrics: {
    totalDuration: number
    attempts: number
    model: ModelTier
    agent?: string
  }
  error?: string
}

export interface AgentRegistryLike {
  /** Unified agent selection method (preferred) */
  selectAgent?: (options: SelectAgentOptions) => BaseAgent | undefined
  /** Legacy methods for backward compatibility */
  getAgent?: (agentId: string) => { agentId: string; execute?: Function } | undefined
  getAgentsBySkill?: (skill: string) => { agentId: string }[]
  getAllAgents?: () => { agentId: string }[]
  getAgentInstance?: (agentId: string) => BaseAgent | undefined
  getAgentsBySkillInstances?: (skill: string) => BaseAgent[]
  getAllAgentInstances?: () => BaseAgent[]
}

// =============================================================================
// DYNAMIC ORCHESTRATOR
// =============================================================================

/**
 * DynamicOrchestrator - Main orchestration engine
 */
export class DynamicOrchestrator {
  private config: OrchestratorConfig
  private router: TaskRouter
  private executor: AgentExecutor
  private registry: AgentRegistryLike | null = null
  private logger = getRoutingLogger()
  private runningTasks: Map<string, Promise<OrchestrationResult>> = new Map()

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = {
      verbose: false,
      maxConcurrency: 5,
      ...config
    }

    this.router = getTaskRouter(config?.router)
    this.executor = getAgentExecutor(config?.executor)

    if (this.config.verbose) {
      this.logger.setVerbose(true)
    }
  }

  /**
   * Set agent registry
   */
  setRegistry(registry: AgentRegistryLike): void {
    this.registry = registry
  }

  /**
   * Execute a single task
   */
  async executeTask(
    task: OrchestrationTask,
    agent?: BaseAgent
  ): Promise<OrchestrationResult> {
    const startTime = Date.now()

    // 0. Validate task input
    const validator = getInputValidator()
    const validationResult = validator.validateTaskInput({
      id: task.id,
      description: task.description,
      taskType: task.taskType,
      complexity: task.complexity
    })

    if (!validationResult.success) {
      return {
        taskId: task.id,
        success: false,
        routing: {
          model: 'sonnet' as ModelTier,
          rationale: 'Validation failed'
        },
        error: validationResult.errorMessage || 'Invalid task input',
        metrics: {
          totalDuration: Date.now() - startTime,
          attempts: 0,
          model: 'sonnet' as ModelTier
        }
      }
    }

    if (this.config.verbose) {
      console.log(`\n🎯 [Orchestrator] Starting task: ${task.description.slice(0, 60)}...`)
    }

    // 1. Route the task
    const taskContext: TaskContext = {
      id: task.id,
      description: task.description,
      taskType: task.taskType,
      complexity: task.complexity,
      requiredSkills: task.requiredSkills,
      preferredAgent: task.preferredAgent
    }

    const routing = this.router.route(taskContext)

    // Override model if preferred
    const selectedModel = task.preferredModel || routing.model

    if (this.config.verbose) {
      console.log(`   📊 Routing: ${routing.rationale}`)
      console.log(`   🤖 Model: ${selectedModel}`)
      if (routing.agent) {
        console.log(`   👤 Agent: ${routing.agent}`)
      }
    }

    // 2. Get or resolve agent
    const resolvedAgent = agent || this.resolveAgent(routing.agent, task.requiredSkills)

    if (!resolvedAgent) {
      return {
        taskId: task.id,
        success: false,
        routing,
        metrics: {
          totalDuration: Date.now() - startTime,
          attempts: 0,
          model: selectedModel,
          agent: routing.agent
        },
        error: `No agent available for task. Suggested: ${routing.agent || 'any'}`
      }
    }

    // Get agent ID (BaseAgent uses agentId, not name)
    const agentName = this.getAgentId(resolvedAgent) || routing.agent

    // 3. Prepare agent state
    const state: AgentState = {
      task: task.description,
      taskType: (task.taskType as AgentState['taskType']) || 'feature',
      context: task.context || {},
      messages: [],
      currentAgent: agentName || 'unknown',
      agentResults: [],
      mcpData: {},
      nextAction: '',
      requiresApproval: false,
      artifacts: [],
      deliverables: []
    }

    // 4. Log routing decision
    const routingLogId = this.logger.logDecision({
      taskId: task.id,
      taskDescription: task.description,
      selectedModel,
      selectedAgent: agentName,
      rationale: routing.rationale,
      complexity: task.complexity?.score,
      timestamp: new Date()
    })

    // 5. Execute with retry
    const executionResult = await this.executor.execute({
      taskId: task.id,
      agent: resolvedAgent,
      state,
      model: selectedModel,
      routingLogId
    })

    // 6. Build result
    const totalDuration = Date.now() - startTime

    if (this.config.verbose) {
      const status = executionResult.success ? '✅' : '❌'
      console.log(`${status} [Orchestrator] Task completed in ${totalDuration}ms`)
    }

    return {
      taskId: task.id,
      success: executionResult.success,
      result: executionResult.result,
      artifacts: executionResult.result?.artifacts,
      routing,
      metrics: {
        totalDuration,
        attempts: executionResult.metrics.attempts,
        model: selectedModel,
        agent: agentName
      },
      error: executionResult.error?.message
    }
  }

  /**
   * Execute multiple tasks concurrently
   */
  async executeTasks(
    tasks: OrchestrationTask[],
    agents?: Map<string, BaseAgent>
  ): Promise<OrchestrationResult[]> {
    const results: OrchestrationResult[] = []
    const queue = [...tasks]

    while (queue.length > 0 || this.runningTasks.size > 0) {
      // Start new tasks up to concurrency limit
      while (queue.length > 0 && this.runningTasks.size < this.config.maxConcurrency) {
        const task = queue.shift()!
        const agent = agents?.get(task.id) || agents?.get(task.preferredAgent || '')

        const promise = this.executeTask(task, agent)
        this.runningTasks.set(task.id, promise)

        // Handle completion
        promise.then(result => {
          this.runningTasks.delete(task.id)
          results.push(result)
        })
      }

      // Wait for at least one task to complete
      if (this.runningTasks.size > 0) {
        await Promise.race(this.runningTasks.values())
      }
    }

    return results
  }

  /**
   * Execute a workflow (sequence of tasks)
   */
  async executeWorkflow(
    workflowId: string,
    tasks: OrchestrationTask[],
    agents?: Map<string, BaseAgent>
  ): Promise<{
    workflowId: string
    success: boolean
    results: OrchestrationResult[]
    totalDuration: number
  }> {
    const startTime = Date.now()

    if (this.config.verbose) {
      console.log(`\n🔄 [Orchestrator] Starting workflow: ${workflowId}`)
      console.log(`   📋 Tasks: ${tasks.length}`)
    }

    const results: OrchestrationResult[] = []
    let workflowSuccess = true

    // Execute tasks sequentially (workflow maintains order)
    for (const task of tasks) {
      const agent = agents?.get(task.id) || agents?.get(task.preferredAgent || '')
      const result = await this.executeTask(task, agent)
      results.push(result)

      if (!result.success) {
        workflowSuccess = false
        if (this.config.verbose) {
          console.log(`⚠️ [Orchestrator] Workflow task failed: ${task.id}`)
        }
        // Continue with remaining tasks unless critical
        // Could add stop-on-failure config here
      }
    }

    const totalDuration = Date.now() - startTime

    if (this.config.verbose) {
      const status = workflowSuccess ? '✅' : '⚠️'
      console.log(`${status} [Orchestrator] Workflow completed in ${totalDuration}ms`)
      console.log(`   Success: ${results.filter(r => r.success).length}/${results.length}`)
    }

    return {
      workflowId,
      success: workflowSuccess,
      results,
      totalDuration
    }
  }

  /**
   * Get routing for a task without executing
   */
  previewRouting(task: OrchestrationTask): RoutingResult {
    return this.router.route({
      id: task.id,
      description: task.description,
      taskType: task.taskType,
      complexity: task.complexity,
      requiredSkills: task.requiredSkills,
      preferredAgent: task.preferredAgent
    })
  }

  /**
   * Get orchestrator statistics
   */
  getStats(): {
    routing: {
      totalDecisions: number
      byModel: Record<ModelTier, number>
      successRate: number
      avgDuration: number
    }
    config: OrchestratorConfig
    runningTasks: number
  } {
    return {
      routing: this.logger.getStats(),
      config: this.config,
      runningTasks: this.runningTasks.size
    }
  }

  /**
   * Cancel a running task
   */
  cancelTask(taskId: string): boolean {
    // Note: True cancellation requires AbortController support in executor
    // For now, just remove from tracking
    if (this.runningTasks.has(taskId)) {
      this.runningTasks.delete(taskId)
      return true
    }
    return false
  }

  // ===========================================================================
  // PRIVATE METHODS
  // ===========================================================================

  /**
   * Resolve agent from registry using unified selectAgent method
   */
  private resolveAgent(
    agentId?: string,
    requiredSkills?: string[]
  ): BaseAgent | undefined {
    if (!this.registry) {
      return undefined
    }

    // Use unified selectAgent if available (AgentRegistry)
    if (this.registry.selectAgent) {
      return this.registry.selectAgent({
        agentId,
        skills: requiredSkills,
        sortByConfidence: true
      })
    }

    // Fallback for legacy registries without selectAgent
    if (agentId) {
      const instance = this.registry.getAgentInstance?.(agentId)
      if (instance) return instance
    }

    const allInstances = this.registry.getAllAgentInstances?.()
    return allInstances?.[0]
  }

  /**
   * Get agent ID from BaseAgent (uses agentId property)
   * Returns constructor name as fallback to ensure non-null return
   */
  private getAgentId(agent: BaseAgent): string {
    // BaseAgent has agentId as protected, but we can access via getMetadata
    const metadata = (agent as any).getMetadata?.()
    const id = metadata?.id || (agent as any).agentId || agent.constructor.name
    return id || 'UnknownAgent'
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<OrchestratorConfig>): void {
    this.config = { ...this.config, ...config }

    if (config.verbose !== undefined) {
      this.logger.setVerbose(config.verbose)
    }
    if (config.executor) {
      this.executor.updateConfig(config.executor)
    }
    if (config.router) {
      this.router.updateConfig(config.router)
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let orchestratorInstance: DynamicOrchestrator | null = null

/**
 * Get singleton DynamicOrchestrator instance
 */
export function getDynamicOrchestrator(config?: Partial<OrchestratorConfig>): DynamicOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new DynamicOrchestrator(config)
  }
  return orchestratorInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetDynamicOrchestrator(): void {
  orchestratorInstance = null
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Execute a single task using the default orchestrator
 */
export async function orchestrateTask(
  task: OrchestrationTask,
  agent?: BaseAgent
): Promise<OrchestrationResult> {
  return getDynamicOrchestrator().executeTask(task, agent)
}

/**
 * Execute multiple tasks using the default orchestrator
 */
export async function orchestrateTasks(
  tasks: OrchestrationTask[],
  agents?: Map<string, BaseAgent>
): Promise<OrchestrationResult[]> {
  return getDynamicOrchestrator().executeTasks(tasks, agents)
}
