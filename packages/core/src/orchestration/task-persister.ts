/**
 * TaskPersister - Persist tasks to PostgreSQL
 *
 * BMAD Gaps Closing: Phase 4 - Task Master
 *
 * Handles database operations for task tracking system.
 * Uses same patterns as MetricsPersister for consistency.
 *
 * Features:
 * - CRUD operations for tasks
 * - Task execution tracking
 * - Comment/audit trail management
 * - LRU caching for performance
 * - Connection pooling
 */

import { LRUCache } from 'lru-cache'
import { logger } from '../utils/logger'
import { PERSISTENCE_DEFAULTS } from './config/defaults'

const log = logger.child('TaskPersister')

// Type definitions for optional pg dependency
interface PgPool {
  query(text: string, values?: unknown[]): Promise<{ rows: PgRow[]; rowCount: number | null }>
  connect(): Promise<{ release: () => void }>
  end(): Promise<void>
  on(event: 'error', listener: (err: Error) => void): void
}

interface PgRow {
  [key: string]: unknown
}

interface PgPoolConstructor {
  new (config: {
    connectionString: string
    ssl?: boolean | { rejectUnauthorized: boolean }
    max?: number
    idleTimeoutMillis?: number
    connectionTimeoutMillis?: number
  }): PgPool
}

// pg is optional - only used if DATABASE_URL is configured
let Pool: PgPoolConstructor | null = null

try {
  // Dynamic import to make pg optional
  const pg = require('pg')
  Pool = pg.Pool as PgPoolConstructor
} catch {
  // pg not installed - TaskPersister will work in stub mode
}

// =============================================================================
// TYPES
// =============================================================================

/**
 * Task status values
 */
export type TaskStatus =
  | 'created'
  | 'assigned'
  | 'in_progress'
  | 'blocked'
  | 'review'
  | 'completed'
  | 'failed'
  | 'cancelled'

/**
 * Task priority values
 */
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'

/**
 * Complexity level values
 */
export type ComplexityLevel = 'trivial' | 'simple' | 'medium' | 'complex' | 'enterprise'

/**
 * Comment type values
 */
export type CommentType =
  | 'note'
  | 'status_change'
  | 'assignment'
  | 'blocker'
  | 'resolution'
  | 'review'
  | 'system'

/**
 * Task entity
 */
export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  complexityScore?: number
  complexityLevel?: ComplexityLevel
  assignedAgent?: string
  workflowId?: string
  workflowName?: string
  parentTaskId?: string
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  metadata: Record<string, unknown>
  tags: string[]
}

/**
 * Task creation input
 */
export interface CreateTaskInput {
  title: string
  description?: string
  priority?: TaskPriority
  complexityScore?: number
  complexityLevel?: ComplexityLevel
  assignedAgent?: string
  workflowId?: string
  workflowName?: string
  parentTaskId?: string
  metadata?: Record<string, unknown>
  tags?: string[]
}

/**
 * Task update input
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  complexityScore?: number
  complexityLevel?: ComplexityLevel
  assignedAgent?: string
  workflowId?: string
  workflowName?: string
  metadata?: Record<string, unknown>
  tags?: string[]
}

/**
 * Task execution entity
 */
export interface TaskExecution {
  id: number
  taskId: string
  agentId: string
  status: 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled'
  startedAt: Date
  completedAt?: Date
  durationMs?: number
  output?: unknown
  errorMessage?: string
  errorStack?: string
  retryCount: number
  metrics: Record<string, unknown>
}

/**
 * Task comment entity
 */
export interface TaskComment {
  id: number
  taskId: string
  authorAgent: string
  commentType: CommentType
  content: string
  createdAt: Date
  executionId?: number
  metadata: Record<string, unknown>
}

/**
 * Task query options
 */
export interface TaskQueryOptions {
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  assignedAgent?: string
  workflowId?: string
  parentTaskId?: string | null
  tags?: string[]
  limit?: number
  offset?: number
  orderBy?: 'created_at' | 'updated_at' | 'priority' | 'complexity_score'
  orderDir?: 'asc' | 'desc'
}

// =============================================================================
// TASK PERSISTER
// =============================================================================

/**
 * TaskPersister - Database persistence for Task Master
 *
 * NOTE: Requires PostgreSQL. For local development without PostgreSQL,
 * use JsonTaskPersister instead.
 */
export class TaskPersister {
  private pool: PgPool | null = null
  private connectionString: string
  private enabled: boolean = false

  // LRU Caches
  private taskCache: LRUCache<string, Task>
  private taskListCache: LRUCache<string, Task[]>

  // Cache stats
  private cacheHits = 0
  private cacheMisses = 0

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL || ''

    const { database } = PERSISTENCE_DEFAULTS

    // Only initialize if pg is available AND we have a connection string
    if (Pool && this.connectionString) {
      this.pool = new Pool({
        connectionString: this.connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: database.poolSize,
        idleTimeoutMillis: database.idleTimeoutMs,
        connectionTimeoutMillis: database.connectionTimeoutMs
      })
      this.enabled = true

      // Set up error handler inside the block where pool is initialized
      this.pool.on('error', (err: Error) => {
        log.error('Unexpected pool error', { error: err.message })
      })
    }
    // No warning - TaskPersister is optional, use JsonTaskPersister for local dev

    // Initialize LRU caches
    this.taskCache = new LRUCache({
      max: database.taskCacheMax,
      ttl: database.cacheTtlMs,
      ttlAutopurge: true
    })

    this.taskListCache = new LRUCache({
      max: database.taskListCacheMax,
      ttl: database.shortCacheTtlMs,
      ttlAutopurge: true
    })

    log.info('Initialized with LRU caches')
  }

  // ===========================================================================
  // CONNECTION
  // ===========================================================================

  /**
   * Check if persister is enabled (has valid pool connection)
   */
  isEnabled(): boolean {
    return this.enabled && this.pool !== null
  }

  async isConnected(): Promise<boolean> {
    if (!this.pool || !this.connectionString) return false

    try {
      const client = await this.pool.connect()
      client.release()
      return true
    } catch {
      return false
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
    }
  }

  // ===========================================================================
  // TASK CRUD
  // ===========================================================================

  /**
   * Create a new task
   */
  async createTask(input: CreateTaskInput): Promise<Task> {
    if (!this.pool) {
      throw new Error('[TaskPersister] Cannot create task: database not connected')
    }

    const query = `
      INSERT INTO tasks (
        title, description, priority, complexity_score, complexity_level,
        assigned_agent, workflow_id, workflow_name, parent_task_id,
        metadata, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `

    const values = [
      input.title,
      input.description || null,
      input.priority || 'medium',
      input.complexityScore || null,
      input.complexityLevel || null,
      input.assignedAgent || null,
      input.workflowId || null,
      input.workflowName || null,
      input.parentTaskId || null,
      JSON.stringify(input.metadata || {}),
      input.tags || []
    ]

    const result = await this.pool.query(query, values)
    const task = this.rowToTask(result.rows[0])

    // Cache the new task
    this.taskCache.set(task.id, task)

    // Invalidate list caches
    this.taskListCache.clear()

    return task
  }

  /**
   * Get task by ID
   */
  async getTask(id: string): Promise<Task | null> {
    // Check cache
    const cached = this.taskCache.get(id)
    if (cached) {
      this.cacheHits++
      return cached
    }
    this.cacheMisses++

    if (!this.pool) {
      return null
    }

    const query = 'SELECT * FROM tasks WHERE id = $1'
    const result = await this.pool.query(query, [id])

    if (result.rows.length === 0) {
      return null
    }

    const task = this.rowToTask(result.rows[0])
    this.taskCache.set(id, task)
    return task
  }

  /**
   * Update a task
   */
  async updateTask(id: string, input: UpdateTaskInput): Promise<Task | null> {
    const setClauses: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (input.title !== undefined) {
      setClauses.push(`title = $${paramIndex++}`)
      values.push(input.title)
    }
    if (input.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`)
      values.push(input.description)
    }
    if (input.status !== undefined) {
      setClauses.push(`status = $${paramIndex++}`)
      values.push(input.status)
    }
    if (input.priority !== undefined) {
      setClauses.push(`priority = $${paramIndex++}`)
      values.push(input.priority)
    }
    if (input.complexityScore !== undefined) {
      setClauses.push(`complexity_score = $${paramIndex++}`)
      values.push(input.complexityScore)
    }
    if (input.complexityLevel !== undefined) {
      setClauses.push(`complexity_level = $${paramIndex++}`)
      values.push(input.complexityLevel)
    }
    if (input.assignedAgent !== undefined) {
      setClauses.push(`assigned_agent = $${paramIndex++}`)
      values.push(input.assignedAgent)
    }
    if (input.workflowId !== undefined) {
      setClauses.push(`workflow_id = $${paramIndex++}`)
      values.push(input.workflowId)
    }
    if (input.workflowName !== undefined) {
      setClauses.push(`workflow_name = $${paramIndex++}`)
      values.push(input.workflowName)
    }
    if (input.metadata !== undefined) {
      setClauses.push(`metadata = $${paramIndex++}`)
      values.push(JSON.stringify(input.metadata))
    }
    if (input.tags !== undefined) {
      setClauses.push(`tags = $${paramIndex++}`)
      values.push(input.tags)
    }

    if (setClauses.length === 0) {
      return this.getTask(id)
    }

    if (!this.pool) {
      throw new Error('[TaskPersister] Cannot update task: database not connected')
    }

    values.push(id)
    const query = `
      UPDATE tasks
      SET ${setClauses.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `

    const result = await this.pool.query(query, values)

    if (result.rows.length === 0) {
      return null
    }

    const task = this.rowToTask(result.rows[0])

    // Update cache
    this.taskCache.set(id, task)
    this.taskListCache.clear()

    return task
  }

  /**
   * Update task status
   */
  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return this.updateTask(id, { status })
  }

  /**
   * Delete a task
   */
  async deleteTask(id: string): Promise<boolean> {
    if (!this.pool) {
      return false
    }

    const query = 'DELETE FROM tasks WHERE id = $1'
    const result = await this.pool.query(query, [id])

    if (result.rowCount && result.rowCount > 0) {
      this.taskCache.delete(id)
      this.taskListCache.clear()
      return true
    }

    return false
  }

  // ===========================================================================
  // TASK QUERIES
  // ===========================================================================

  /**
   * Query tasks with filters
   */
  async queryTasks(options: TaskQueryOptions = {}): Promise<Task[]> {
    const cacheKey = JSON.stringify(options)

    // Check cache
    const cached = this.taskListCache.get(cacheKey)
    if (cached) {
      this.cacheHits++
      return cached
    }
    this.cacheMisses++

    const conditions: string[] = []
    const values: unknown[] = []
    let paramIndex = 1

    if (options.status) {
      if (Array.isArray(options.status)) {
        conditions.push(`status = ANY($${paramIndex++})`)
        values.push(options.status)
      } else {
        conditions.push(`status = $${paramIndex++}`)
        values.push(options.status)
      }
    }

    if (options.priority) {
      if (Array.isArray(options.priority)) {
        conditions.push(`priority = ANY($${paramIndex++})`)
        values.push(options.priority)
      } else {
        conditions.push(`priority = $${paramIndex++}`)
        values.push(options.priority)
      }
    }

    if (options.assignedAgent) {
      conditions.push(`assigned_agent = $${paramIndex++}`)
      values.push(options.assignedAgent)
    }

    if (options.workflowId) {
      conditions.push(`workflow_id = $${paramIndex++}`)
      values.push(options.workflowId)
    }

    if (options.parentTaskId !== undefined) {
      if (options.parentTaskId === null) {
        conditions.push('parent_task_id IS NULL')
      } else {
        conditions.push(`parent_task_id = $${paramIndex++}`)
        values.push(options.parentTaskId)
      }
    }

    if (options.tags && options.tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`)
      values.push(options.tags)
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : ''

    const orderBy = options.orderBy || 'created_at'
    const orderDir = options.orderDir || 'desc'
    const limit = options.limit || 100
    const offset = options.offset || 0

    if (!this.pool) {
      return []
    }

    const query = `
      SELECT * FROM tasks
      ${whereClause}
      ORDER BY ${orderBy} ${orderDir}
      LIMIT ${limit} OFFSET ${offset}
    `

    const result = await this.pool.query(query, values)
    const tasks = result.rows.map(row => this.rowToTask(row))

    // Cache results
    this.taskListCache.set(cacheKey, tasks)

    return tasks
  }

  /**
   * Get tasks by agent
   */
  async getByAgent(agentId: string): Promise<Task[]> {
    return this.queryTasks({ assignedAgent: agentId })
  }

  /**
   * Get tasks by workflow
   */
  async getByWorkflow(workflowId: string): Promise<Task[]> {
    return this.queryTasks({ workflowId })
  }

  /**
   * Get tasks by status
   */
  async getByStatus(status: TaskStatus | TaskStatus[]): Promise<Task[]> {
    return this.queryTasks({ status })
  }

  /**
   * Get subtasks of a parent task
   */
  async getSubtasks(parentTaskId: string): Promise<Task[]> {
    return this.queryTasks({ parentTaskId })
  }

  /**
   * Get root tasks (no parent)
   */
  async getRootTasks(options?: Omit<TaskQueryOptions, 'parentTaskId'>): Promise<Task[]> {
    return this.queryTasks({ ...options, parentTaskId: null })
  }

  /**
   * Get active tasks (non-terminal status)
   */
  async getActiveTasks(): Promise<Task[]> {
    return this.queryTasks({
      status: ['created', 'assigned', 'in_progress', 'blocked', 'review']
    })
  }

  // ===========================================================================
  // EXECUTIONS
  // ===========================================================================

  /**
   * Start a task execution
   */
  async startExecution(taskId: string, agentId: string): Promise<TaskExecution> {
    if (!this.pool) {
      throw new Error('[TaskPersister] Cannot start execution: database not connected')
    }

    const query = `
      INSERT INTO task_executions (task_id, agent_id, status)
      VALUES ($1, $2, 'running')
      RETURNING *
    `

    const result = await this.pool.query(query, [taskId, agentId])
    return this.rowToExecution(result.rows[0])
  }

  /**
   * Complete a task execution
   */
  async completeExecution(
    executionId: number,
    output: unknown,
    status: 'completed' | 'failed' | 'timeout' | 'cancelled' = 'completed',
    errorMessage?: string,
    errorStack?: string
  ): Promise<TaskExecution | null> {
    if (!this.pool) {
      return null
    }

    const query = `
      UPDATE task_executions
      SET status = $1, output = $2, completed_at = NOW(),
          error_message = $3, error_stack = $4
      WHERE id = $5
      RETURNING *
    `

    const result = await this.pool.query(query, [
      status,
      JSON.stringify(output || null),
      errorMessage || null,
      errorStack || null,
      executionId
    ])

    if (result.rows.length === 0) {
      return null
    }

    return this.rowToExecution(result.rows[0])
  }

  /**
   * Get executions for a task
   */
  async getExecutions(taskId: string): Promise<TaskExecution[]> {
    if (!this.pool) {
      return []
    }

    const query = `
      SELECT * FROM task_executions
      WHERE task_id = $1
      ORDER BY started_at DESC
    `

    const result = await this.pool.query(query, [taskId])
    return result.rows.map(row => this.rowToExecution(row))
  }

  /**
   * Get latest execution for a task
   */
  async getLatestExecution(taskId: string): Promise<TaskExecution | null> {
    if (!this.pool) {
      return null
    }

    const query = `
      SELECT * FROM task_executions
      WHERE task_id = $1
      ORDER BY started_at DESC
      LIMIT 1
    `

    const result = await this.pool.query(query, [taskId])
    if (result.rows.length === 0) {
      return null
    }

    return this.rowToExecution(result.rows[0])
  }

  // ===========================================================================
  // COMMENTS
  // ===========================================================================

  /**
   * Add a comment to a task
   */
  async addComment(
    taskId: string,
    authorAgent: string,
    content: string,
    commentType: CommentType = 'note',
    executionId?: number,
    metadata?: Record<string, unknown>
  ): Promise<TaskComment> {
    if (!this.pool) {
      throw new Error('[TaskPersister] Cannot add comment: database not connected')
    }

    const query = `
      INSERT INTO task_comments (task_id, author_agent, content, comment_type, execution_id, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `

    const result = await this.pool.query(query, [
      taskId,
      authorAgent,
      content,
      commentType,
      executionId || null,
      JSON.stringify(metadata || {})
    ])

    return this.rowToComment(result.rows[0])
  }

  /**
   * Get comments for a task
   */
  async getComments(taskId: string): Promise<TaskComment[]> {
    if (!this.pool) {
      return []
    }

    const query = `
      SELECT * FROM task_comments
      WHERE task_id = $1
      ORDER BY created_at ASC
    `

    const result = await this.pool.query(query, [taskId])
    return result.rows.map(row => this.rowToComment(row))
  }

  // ===========================================================================
  // CACHE MANAGEMENT
  // ===========================================================================

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.taskCache.clear()
    this.taskListCache.clear()
    this.cacheHits = 0
    this.cacheMisses = 0
  }

  /**
   * Invalidate cache for a specific task
   */
  invalidateTask(taskId: string): void {
    this.taskCache.delete(taskId)
    this.taskListCache.clear()
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    taskCache: { size: number; max: number }
    taskListCache: { size: number; max: number }
    overall: { hitRate: number; hits: number; misses: number }
  } {
    const total = this.cacheHits + this.cacheMisses
    return {
      taskCache: {
        size: this.taskCache.size,
        max: 500
      },
      taskListCache: {
        size: this.taskListCache.size,
        max: 100
      },
      overall: {
        hitRate: total > 0 ? this.cacheHits / total : 0,
        hits: this.cacheHits,
        misses: this.cacheMisses
      }
    }
  }

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  private rowToTask(row: PgRow): Task {
    return {
      id: row.id as string,
      title: row.title as string,
      description: row.description as string | undefined,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      complexityScore: row.complexity_score as number | undefined,
      complexityLevel: row.complexity_level as ComplexityLevel | undefined,
      assignedAgent: row.assigned_agent as string | undefined,
      workflowId: row.workflow_id as string | undefined,
      workflowName: row.workflow_name as string | undefined,
      parentTaskId: row.parent_task_id as string | undefined,
      createdAt: row.created_at as Date,
      updatedAt: row.updated_at as Date,
      startedAt: row.started_at as Date | undefined,
      completedAt: row.completed_at as Date | undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata as Record<string, unknown>) || {},
      tags: (row.tags as string[]) || []
    }
  }

  private rowToExecution(row: PgRow): TaskExecution {
    return {
      id: row.id as number,
      taskId: row.task_id as string,
      agentId: row.agent_id as string,
      status: row.status as TaskExecution['status'],
      startedAt: row.started_at as Date,
      completedAt: row.completed_at as Date | undefined,
      durationMs: row.duration_ms as number | undefined,
      output: typeof row.output === 'string' ? JSON.parse(row.output) : row.output,
      errorMessage: row.error_message as string | undefined,
      errorStack: row.error_stack as string | undefined,
      retryCount: row.retry_count as number,
      metrics: typeof row.metrics === 'string' ? JSON.parse(row.metrics) : (row.metrics as Record<string, unknown>) || {}
    }
  }

  private rowToComment(row: PgRow): TaskComment {
    return {
      id: row.id as number,
      taskId: row.task_id as string,
      authorAgent: row.author_agent as string,
      commentType: row.comment_type as CommentType,
      content: row.content as string,
      createdAt: row.created_at as Date,
      executionId: row.execution_id as number | undefined,
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata as Record<string, unknown>) || {}
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let persisterInstance: TaskPersister | null = null

/**
 * Get singleton TaskPersister instance
 */
export function getTaskPersister(connectionString?: string): TaskPersister {
  if (!persisterInstance) {
    persisterInstance = new TaskPersister(connectionString)
  }
  return persisterInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetTaskPersister(): void {
  if (persisterInstance) {
    persisterInstance.clearCache()
  }
  persisterInstance = null
}
