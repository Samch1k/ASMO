/**
 * TaskManager - High-level task lifecycle management
 *
 * BMAD Gaps Closing: Phase 4 - Task Master
 *
 * Provides business logic layer on top of TaskPersister.
 * Handles task lifecycle, state transitions, and workflow integration.
 *
 * Features:
 * - Task lifecycle management (create → assign → start → complete)
 * - Subtask creation and tracking
 * - Workflow linkage
 * - Event emission for integrations
 * - Statistics and reporting
 */

import {
  TaskPersister,
  getTaskPersister,
  type Task,
  type TaskExecution,
  type TaskComment,
  type TaskStatus,
  type TaskPriority,
  type CreateTaskInput,
  type TaskQueryOptions
} from './task-persister'
import type { ComplexityScore } from './types'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Task lifecycle event
 */
export interface TaskEvent {
  type: 'created' | 'assigned' | 'started' | 'completed' | 'failed' | 'blocked' | 'comment'
  taskId: string
  timestamp: Date
  agentId?: string
  data?: any
}

/**
 * Task statistics
 */
export interface TaskStatistics {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  byAgent: Record<string, number>
  avgCompletionTimeMs?: number
  successRate?: number
}

/**
 * Task tree node (for hierarchical display)
 */
export interface TaskTreeNode {
  task: Task
  children: TaskTreeNode[]
  depth: number
}

// =============================================================================
// TASK MANAGER
// =============================================================================

/**
 * TaskManager - High-level task operations
 */
export class TaskManager {
  private persister: TaskPersister
  private eventListeners: Map<TaskEvent['type'], Array<(event: TaskEvent) => void>> = new Map()
  private initialized = false

  constructor(connectionString?: string) {
    this.persister = getTaskPersister(connectionString)
  }

  // ===========================================================================
  // INITIALIZATION
  // ===========================================================================

  /**
   * Initialize task manager
   */
  async initialize(): Promise<void> {
    const connected = await this.persister.isConnected()
    if (!connected) {
      console.warn('⚠️  [TaskManager] Database not connected - operating in memory-only mode')
    }
    this.initialized = true
    console.log('✅ [TaskManager] Initialized')
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  // ===========================================================================
  // TASK LIFECYCLE
  // ===========================================================================

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    const task = await this.persister.createTask(input)

    this.emitEvent({
      type: 'created',
      taskId: task.id,
      timestamp: new Date(),
      data: { title: task.title }
    })

    console.log(`📋 [TaskManager] Created task: ${task.title} (${task.id})`)
    return task
  }

  /**
   * Create task with complexity analysis
   */
  async createTaskWithComplexity(
    input: CreateTaskInput,
    complexityScore: ComplexityScore
  ): Promise<Task> {
    const enrichedInput: CreateTaskInput = {
      ...input,
      complexityScore: complexityScore.score,
      complexityLevel: complexityScore.level,
      metadata: {
        ...input.metadata,
        complexityFactors: complexityScore.factors,
        complexityReasoning: complexityScore.reasoning,
        recommendedWorkflow: complexityScore.recommendedWorkflow,
        recommendedAgents: complexityScore.recommendedAgents
      }
    }

    return this.createTask(enrichedInput)
  }

  /**
   * Assign task to an agent
   */
  async assignTask(taskId: string, agentId: string): Promise<Task> {
    const task = await this.persister.updateTask(taskId, {
      assignedAgent: agentId,
      status: 'assigned'
    })

    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // Add comment
    await this.persister.addComment(
      taskId,
      agentId,
      `Task assigned to ${agentId}`,
      'assignment'
    )

    this.emitEvent({
      type: 'assigned',
      taskId,
      timestamp: new Date(),
      agentId
    })

    console.log(`📋 [TaskManager] Assigned task ${taskId} to ${agentId}`)
    return task
  }

  /**
   * Start working on a task
   * @param taskId - Task ID to start
   * @param agentId - Optional agent to assign before starting (if not already assigned)
   */
  async startTask(taskId: string, agentId?: string): Promise<{ task: Task; execution: TaskExecution }> {
    let task = await this.persister.getTask(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // If agentId provided and task not assigned, assign it first
    if (agentId && !task.assignedAgent) {
      task = await this.assignTask(taskId, agentId)
    }

    if (!task.assignedAgent) {
      throw new Error('Cannot start unassigned task')
    }

    // Update status
    const updatedTask = await this.persister.updateTask(taskId, { status: 'in_progress' })
    if (!updatedTask) {
      throw new Error(`Failed to update task: ${taskId}`)
    }

    // Create execution record
    const execution = await this.persister.startExecution(taskId, task.assignedAgent)

    // Add comment
    await this.persister.addComment(
      taskId,
      task.assignedAgent,
      'Task execution started',
      'status_change',
      execution.id
    )

    this.emitEvent({
      type: 'started',
      taskId,
      timestamp: new Date(),
      agentId: task.assignedAgent
    })

    console.log(`▶️  [TaskManager] Started task ${taskId}`)
    return { task: updatedTask, execution }
  }

  /**
   * Complete a task successfully
   */
  async completeTask(taskId: string, output?: any): Promise<Task> {
    const task = await this.persister.getTask(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // Complete latest execution
    const execution = await this.persister.getLatestExecution(taskId)
    if (execution && execution.status === 'running') {
      await this.persister.completeExecution(execution.id, output, 'completed')
    }

    // Update status
    const updatedTask = await this.persister.updateTask(taskId, { status: 'completed' })
    if (!updatedTask) {
      throw new Error(`Failed to update task: ${taskId}`)
    }

    // Add comment
    await this.persister.addComment(
      taskId,
      task.assignedAgent || 'system',
      'Task completed successfully',
      'status_change',
      execution?.id
    )

    this.emitEvent({
      type: 'completed',
      taskId,
      timestamp: new Date(),
      agentId: task.assignedAgent,
      data: { output }
    })

    console.log(`✅ [TaskManager] Completed task ${taskId}`)
    return updatedTask
  }

  /**
   * Mark a task as failed
   */
  async failTask(taskId: string, reason: string, errorStack?: string): Promise<Task> {
    const task = await this.persister.getTask(taskId)
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // Fail latest execution
    const execution = await this.persister.getLatestExecution(taskId)
    if (execution && execution.status === 'running') {
      await this.persister.completeExecution(execution.id, null, 'failed', reason, errorStack)
    }

    // Update status
    const updatedTask = await this.persister.updateTask(taskId, { status: 'failed' })
    if (!updatedTask) {
      throw new Error(`Failed to update task: ${taskId}`)
    }

    // Add comment
    await this.persister.addComment(
      taskId,
      task.assignedAgent || 'system',
      `Task failed: ${reason}`,
      'status_change',
      execution?.id
    )

    this.emitEvent({
      type: 'failed',
      taskId,
      timestamp: new Date(),
      agentId: task.assignedAgent,
      data: { reason }
    })

    console.log(`❌ [TaskManager] Task ${taskId} failed: ${reason}`)
    return updatedTask
  }

  /**
   * Block a task
   */
  async blockTask(taskId: string, reason: string): Promise<Task> {
    const task = await this.persister.updateTask(taskId, { status: 'blocked' })
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    await this.persister.addComment(
      taskId,
      task.assignedAgent || 'system',
      `Task blocked: ${reason}`,
      'blocker'
    )

    this.emitEvent({
      type: 'blocked',
      taskId,
      timestamp: new Date(),
      data: { reason }
    })

    console.log(`🚫 [TaskManager] Task ${taskId} blocked: ${reason}`)
    return task
  }

  /**
   * Unblock a task
   */
  async unblockTask(taskId: string, resolution: string): Promise<Task> {
    const task = await this.persister.updateTask(taskId, { status: 'in_progress' })
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    await this.persister.addComment(
      taskId,
      task.assignedAgent || 'system',
      `Blocker resolved: ${resolution}`,
      'resolution'
    )

    console.log(`✅ [TaskManager] Task ${taskId} unblocked: ${resolution}`)
    return task
  }

  /**
   * Cancel a task
   */
  async cancelTask(taskId: string, reason: string): Promise<Task> {
    const task = await this.persister.updateTask(taskId, { status: 'cancelled' })
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    // Cancel any running execution
    const execution = await this.persister.getLatestExecution(taskId)
    if (execution && execution.status === 'running') {
      await this.persister.completeExecution(execution.id, null, 'cancelled', reason)
    }

    await this.persister.addComment(
      taskId,
      'system',
      `Task cancelled: ${reason}`,
      'status_change'
    )

    console.log(`🚫 [TaskManager] Task ${taskId} cancelled: ${reason}`)
    return task
  }

  // ===========================================================================
  // SUBTASKS
  // ===========================================================================

  /**
   * Create subtasks for a parent task
   */
  async createSubtasks(parentId: string, subtasks: CreateTaskInput[]): Promise<Task[]> {
    const parent = await this.persister.getTask(parentId)
    if (!parent) {
      throw new Error(`Parent task not found: ${parentId}`)
    }

    const created: Task[] = []
    for (const subtask of subtasks) {
      const task = await this.createTask({
        ...subtask,
        parentTaskId: parentId,
        workflowId: subtask.workflowId || parent.workflowId,
        workflowName: subtask.workflowName || parent.workflowName
      })
      created.push(task)
    }

    // Add comment to parent
    await this.persister.addComment(
      parentId,
      'system',
      `Created ${created.length} subtasks`,
      'system'
    )

    console.log(`📋 [TaskManager] Created ${created.length} subtasks for ${parentId}`)
    return created
  }

  /**
   * Get task tree (hierarchical structure)
   */
  async getTaskTree(rootTaskId: string): Promise<TaskTreeNode> {
    const root = await this.persister.getTask(rootTaskId)
    if (!root) {
      throw new Error(`Task not found: ${rootTaskId}`)
    }

    return this.buildTaskTree(root, 0)
  }

  private async buildTaskTree(task: Task, depth: number): Promise<TaskTreeNode> {
    const subtasks = await this.persister.getSubtasks(task.id)
    const children = await Promise.all(
      subtasks.map(st => this.buildTaskTree(st, depth + 1))
    )

    return { task, children, depth }
  }

  // ===========================================================================
  // WORKFLOW INTEGRATION
  // ===========================================================================

  /**
   * Link task to a workflow
   */
  async linkToWorkflow(taskId: string, workflowId: string, workflowName?: string): Promise<Task> {
    const task = await this.persister.updateTask(taskId, { workflowId, workflowName })
    if (!task) {
      throw new Error(`Task not found: ${taskId}`)
    }

    await this.persister.addComment(
      taskId,
      'system',
      `Linked to workflow: ${workflowName || workflowId}`,
      'system'
    )

    console.log(`🔗 [TaskManager] Linked task ${taskId} to workflow ${workflowId}`)
    return task
  }

  /**
   * Create task from workflow execution
   */
  async createFromWorkflow(
    workflowId: string,
    workflowName: string,
    title: string,
    description?: string,
    complexity?: ComplexityScore
  ): Promise<Task> {
    const input: CreateTaskInput = {
      title,
      description,
      workflowId,
      workflowName,
      complexityScore: complexity?.score,
      complexityLevel: complexity?.level,
      metadata: complexity ? {
        complexityFactors: complexity.factors,
        recommendedWorkflow: complexity.recommendedWorkflow
      } : undefined
    }

    return this.createTask(input)
  }

  // ===========================================================================
  // QUERIES
  // ===========================================================================

  /**
   * Get task by ID
   */
  async getTask(taskId: string): Promise<Task | null> {
    return this.persister.getTask(taskId)
  }

  /**
   * Query tasks
   */
  async queryTasks(options?: TaskQueryOptions): Promise<Task[]> {
    return this.persister.queryTasks(options)
  }

  /**
   * Get active tasks
   */
  async getActiveTasks(): Promise<Task[]> {
    return this.persister.getActiveTasks()
  }

  /**
   * Get tasks by agent
   */
  async getTasksByAgent(agentId: string): Promise<Task[]> {
    return this.persister.getByAgent(agentId)
  }

  /**
   * Get tasks by workflow
   */
  async getTasksByWorkflow(workflowId: string): Promise<Task[]> {
    return this.persister.getByWorkflow(workflowId)
  }

  /**
   * Get task comments
   */
  async getTaskComments(taskId: string): Promise<TaskComment[]> {
    return this.persister.getComments(taskId)
  }

  /**
   * Get task executions
   */
  async getTaskExecutions(taskId: string): Promise<TaskExecution[]> {
    return this.persister.getExecutions(taskId)
  }

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  /**
   * Add comment to task
   */
  async addComment(
    taskId: string,
    authorAgent: string,
    content: string,
    type?: 'note' | 'review' | 'blocker' | 'resolution'
  ): Promise<TaskComment> {
    const comment = await this.persister.addComment(taskId, authorAgent, content, type || 'note')

    this.emitEvent({
      type: 'comment',
      taskId,
      timestamp: new Date(),
      agentId: authorAgent,
      data: { content }
    })

    return comment
  }

  // ===========================================================================
  // STATISTICS
  // ===========================================================================

  /**
   * Get task statistics
   */
  async getStatistics(): Promise<TaskStatistics> {
    const tasks = await this.persister.queryTasks({ limit: 10000 })

    const byStatus: Record<TaskStatus, number> = {
      created: 0,
      assigned: 0,
      in_progress: 0,
      blocked: 0,
      review: 0,
      completed: 0,
      failed: 0,
      cancelled: 0
    }

    const byPriority: Record<TaskPriority, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    }

    const byAgent: Record<string, number> = {}

    let totalCompletionTime = 0
    let completedCount = 0
    let failedCount = 0

    for (const task of tasks) {
      byStatus[task.status]++
      byPriority[task.priority]++

      if (task.assignedAgent) {
        byAgent[task.assignedAgent] = (byAgent[task.assignedAgent] || 0) + 1
      }

      if (task.status === 'completed' && task.startedAt && task.completedAt) {
        totalCompletionTime += task.completedAt.getTime() - task.startedAt.getTime()
        completedCount++
      }

      if (task.status === 'failed') {
        failedCount++
      }
    }

    const terminalCount = completedCount + failedCount

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      byAgent,
      avgCompletionTimeMs: completedCount > 0 ? totalCompletionTime / completedCount : undefined,
      successRate: terminalCount > 0 ? completedCount / terminalCount : undefined
    }
  }

  // ===========================================================================
  // EVENTS
  // ===========================================================================

  /**
   * Subscribe to task events
   */
  on(eventType: TaskEvent['type'], listener: (event: TaskEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType)!.push(listener)
  }

  /**
   * Unsubscribe from task events
   */
  off(eventType: TaskEvent['type'], listener: (event: TaskEvent) => void): void {
    const listeners = this.eventListeners.get(eventType)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emitEvent(event: TaskEvent): void {
    const listeners = this.eventListeners.get(event.type) || []
    for (const listener of listeners) {
      try {
        listener(event)
      } catch (error) {
        console.error(`[TaskManager] Event listener error:`, error)
      }
    }
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  /**
   * Close connections
   */
  async close(): Promise<void> {
    await this.persister.close()
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let managerInstance: TaskManager | null = null

/**
 * Get singleton TaskManager instance
 */
export function getTaskManager(connectionString?: string): TaskManager {
  if (!managerInstance) {
    managerInstance = new TaskManager(connectionString)
  }
  return managerInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetTaskManager(): void {
  managerInstance = null
}
