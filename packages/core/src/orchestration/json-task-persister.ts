/**
 * JsonTaskPersister - Persist tasks to JSON file
 *
 * Lightweight alternative to PostgreSQL TaskPersister.
 * Stores tasks in .asmo/tasks.json file.
 *
 * Features:
 * - No external dependencies (no database server)
 * - Human-readable storage
 * - Same interface as TaskPersister
 * - Automatic file creation
 */

import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

import type {
  Task,
  TaskStatus,
  TaskPriority,
  ComplexityLevel,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryOptions,
  TaskExecution,
  TaskComment,
  CommentType
} from './task-persister'

// Re-export types for convenience
export type {
  Task,
  TaskStatus,
  TaskPriority,
  ComplexityLevel,
  CreateTaskInput,
  UpdateTaskInput,
  TaskQueryOptions,
  TaskExecution,
  TaskComment,
  CommentType
}

// =============================================================================
// STORAGE TYPES
// =============================================================================

interface TaskStorage {
  version: number
  tasks: Record<string, StoredTask>
  executions: Record<number, TaskExecution>
  comments: Record<number, TaskComment>
  nextExecutionId: number
  nextCommentId: number
}

interface StoredTask extends Omit<Task, 'createdAt' | 'updatedAt' | 'startedAt' | 'completedAt'> {
  createdAt: string
  updatedAt: string
  startedAt?: string
  completedAt?: string
}

// =============================================================================
// JSON TASK PERSISTER
// =============================================================================

/**
 * JsonTaskPersister - File-based task persistence
 */
export class JsonTaskPersister {
  private storagePath: string
  private storage: TaskStorage

  constructor(storagePath?: string) {
    // Default to .asmo/tasks.json in current directory
    this.storagePath = storagePath || path.join(process.cwd(), '.asmo', 'tasks.json')
    this.storage = this.loadStorage()
    console.log(`✅ [JsonTaskPersister] Initialized (${this.storagePath})`)
  }

  // ===========================================================================
  // STORAGE OPERATIONS
  // ===========================================================================

  private loadStorage(): TaskStorage {
    try {
      if (fs.existsSync(this.storagePath)) {
        const data = fs.readFileSync(this.storagePath, 'utf-8')
        return JSON.parse(data)
      }
    } catch (error) {
      console.warn('⚠️  [JsonTaskPersister] Failed to load storage, starting fresh:', error)
    }

    // Return empty storage
    return {
      version: 1,
      tasks: {},
      executions: {},
      comments: {},
      nextExecutionId: 1,
      nextCommentId: 1
    }
  }

  private saveStorage(): void {
    try {
      const dir = path.dirname(this.storagePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(this.storage, null, 2), 'utf-8')
    } catch (error) {
      console.error('❌ [JsonTaskPersister] Failed to save storage:', error)
      throw error
    }
  }

  private storedToTask(stored: StoredTask): Task {
    return {
      ...stored,
      createdAt: new Date(stored.createdAt),
      updatedAt: new Date(stored.updatedAt),
      startedAt: stored.startedAt ? new Date(stored.startedAt) : undefined,
      completedAt: stored.completedAt ? new Date(stored.completedAt) : undefined
    }
  }

  private taskToStored(task: Task): StoredTask {
    return {
      ...task,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
      startedAt: task.startedAt?.toISOString(),
      completedAt: task.completedAt?.toISOString()
    }
  }

  // ===========================================================================
  // CONNECTION (compatibility with TaskPersister interface)
  // ===========================================================================

  async isConnected(): Promise<boolean> {
    return true // JSON is always "connected"
  }

  async close(): Promise<void> {
    this.saveStorage()
  }

  // ===========================================================================
  // TASK CRUD
  // ===========================================================================

  async createTask(input: CreateTaskInput): Promise<Task> {
    const now = new Date()
    const task: Task = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      status: 'created',
      priority: input.priority || 'medium',
      complexityScore: input.complexityScore,
      complexityLevel: input.complexityLevel,
      assignedAgent: input.assignedAgent,
      workflowId: input.workflowId,
      workflowName: input.workflowName,
      parentTaskId: input.parentTaskId,
      createdAt: now,
      updatedAt: now,
      metadata: input.metadata || {},
      tags: input.tags || []
    }

    this.storage.tasks[task.id] = this.taskToStored(task)
    this.saveStorage()

    return task
  }

  async getTask(id: string): Promise<Task | null> {
    const stored = this.storage.tasks[id]
    return stored ? this.storedToTask(stored) : null
  }

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const stored = this.storage.tasks[id]
    if (!stored) return null

    const task = this.storedToTask(stored)
    const updated: Task = {
      ...task,
      ...input,
      updatedAt: new Date(),
      // Preserve non-updatable fields
      id: task.id,
      createdAt: task.createdAt
    }

    // Handle status transitions
    if (input.status === 'in_progress' && !task.startedAt) {
      updated.startedAt = new Date()
    }
    if ((input.status === 'completed' || input.status === 'failed') && !task.completedAt) {
      updated.completedAt = new Date()
    }

    this.storage.tasks[id] = this.taskToStored(updated)
    this.saveStorage()

    return updated
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!this.storage.tasks[id]) return false

    delete this.storage.tasks[id]
    this.saveStorage()

    return true
  }

  // ===========================================================================
  // TASK QUERIES
  // ===========================================================================

  async queryTasks(options: TaskQueryOptions = {}): Promise<Task[]> {
    let tasks = Object.values(this.storage.tasks).map(s => this.storedToTask(s))

    // Apply filters
    if (options.status) {
      const statuses = Array.isArray(options.status) ? options.status : [options.status]
      tasks = tasks.filter(t => statuses.includes(t.status))
    }

    if (options.priority) {
      const priorities = Array.isArray(options.priority) ? options.priority : [options.priority]
      tasks = tasks.filter(t => priorities.includes(t.priority))
    }

    if (options.assignedAgent) {
      tasks = tasks.filter(t => t.assignedAgent === options.assignedAgent)
    }

    if (options.workflowId) {
      tasks = tasks.filter(t => t.workflowId === options.workflowId)
    }

    if (options.parentTaskId !== undefined) {
      if (options.parentTaskId === null) {
        tasks = tasks.filter(t => !t.parentTaskId)
      } else {
        tasks = tasks.filter(t => t.parentTaskId === options.parentTaskId)
      }
    }

    if (options.tags && options.tags.length > 0) {
      tasks = tasks.filter(t => options.tags!.some(tag => t.tags.includes(tag)))
    }

    // Sort
    const orderBy = options.orderBy || 'created_at'
    const orderDir = options.orderDir || 'desc'
    tasks.sort((a, b) => {
      let aVal: any, bVal: any
      switch (orderBy) {
        case 'created_at':
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
          break
        case 'updated_at':
          aVal = a.updatedAt.getTime()
          bVal = b.updatedAt.getTime()
          break
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
          aVal = priorityOrder[a.priority]
          bVal = priorityOrder[b.priority]
          break
        case 'complexity_score':
          aVal = a.complexityScore || 0
          bVal = b.complexityScore || 0
          break
        default:
          aVal = a.createdAt.getTime()
          bVal = b.createdAt.getTime()
      }
      return orderDir === 'asc' ? aVal - bVal : bVal - aVal
    })

    // Pagination
    const offset = options.offset || 0
    const limit = options.limit || 100
    tasks = tasks.slice(offset, offset + limit)

    return tasks
  }

  async getByAgent(agentId: string): Promise<Task[]> {
    return this.queryTasks({ assignedAgent: agentId })
  }

  async getByWorkflow(workflowId: string): Promise<Task[]> {
    return this.queryTasks({ workflowId })
  }

  async getByStatus(status: TaskStatus | TaskStatus[]): Promise<Task[]> {
    return this.queryTasks({ status })
  }

  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    return this.queryTasks({ parentTaskId })
  }

  async getRootTasks(options?: Omit<TaskQueryOptions, 'parentTaskId'>): Promise<Task[]> {
    return this.queryTasks({ ...options, parentTaskId: null })
  }

  async getActiveTasks(): Promise<Task[]> {
    return this.queryTasks({
      status: ['created', 'assigned', 'in_progress', 'blocked', 'review']
    })
  }

  // ===========================================================================
  // EXECUTIONS
  // ===========================================================================

  async startExecution(taskId: string, agentId: string): Promise<TaskExecution> {
    const execution: TaskExecution = {
      id: this.storage.nextExecutionId++,
      taskId,
      agentId,
      status: 'running',
      startedAt: new Date(),
      retryCount: 0,
      metrics: {}
    }

    this.storage.executions[execution.id] = {
      ...execution,
      startedAt: execution.startedAt
    }
    this.saveStorage()

    return execution
  }

  async completeExecution(
    executionId: number,
    output: any,
    status: 'completed' | 'failed' | 'timeout' | 'cancelled' = 'completed',
    errorMessage?: string,
    errorStack?: string
  ): Promise<TaskExecution | null> {
    const execution = this.storage.executions[executionId]
    if (!execution) return null

    const now = new Date()
    const startedAt = new Date(execution.startedAt)

    const updated: TaskExecution = {
      ...execution,
      startedAt,
      status,
      completedAt: now,
      durationMs: now.getTime() - startedAt.getTime(),
      output,
      errorMessage,
      errorStack
    }

    this.storage.executions[executionId] = updated
    this.saveStorage()

    return updated
  }

  async getExecutions(taskId: string): Promise<TaskExecution[]> {
    return Object.values(this.storage.executions)
      .filter(e => e.taskId === taskId)
      .map(e => ({
        ...e,
        startedAt: new Date(e.startedAt),
        completedAt: e.completedAt ? new Date(e.completedAt) : undefined
      }))
  }

  async getLatestExecution(taskId: string): Promise<TaskExecution | null> {
    const executions = await this.getExecutions(taskId)
    if (executions.length === 0) return null
    return executions.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0]
  }

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  async addComment(
    taskId: string,
    authorAgent: string,
    content: string,
    commentType: CommentType = 'note',
    executionId?: number,
    metadata?: Record<string, any>
  ): Promise<TaskComment> {
    const comment: TaskComment = {
      id: this.storage.nextCommentId++,
      taskId,
      authorAgent,
      commentType,
      content,
      createdAt: new Date(),
      executionId,
      metadata: metadata || {}
    }

    this.storage.comments[comment.id] = comment
    this.saveStorage()

    return comment
  }

  async getComments(taskId: string): Promise<TaskComment[]> {
    return Object.values(this.storage.comments)
      .filter(c => c.taskId === taskId)
      .map(c => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  // ===========================================================================
  // CACHE (compatibility - no-op for JSON persister)
  // ===========================================================================

  clearCache(): void {
    // No-op: JSON persister doesn't use cache
  }

  getCacheStats(): { hits: number; misses: number; taskCacheSize: number; listCacheSize: number } {
    return {
      hits: 0,
      misses: 0,
      taskCacheSize: Object.keys(this.storage.tasks).length,
      listCacheSize: 0
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let jsonPersisterInstance: JsonTaskPersister | null = null

/**
 * Get singleton JsonTaskPersister instance
 */
export function getJsonTaskPersister(storagePath?: string): JsonTaskPersister {
  if (!jsonPersisterInstance) {
    jsonPersisterInstance = new JsonTaskPersister(storagePath)
  }
  return jsonPersisterInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetJsonTaskPersister(): void {
  jsonPersisterInstance = null
}
