/**
 * MetricsPersister - Persist metrics to SQLite (local, zero-config)
 *
 * Part of BMad Framework integration
 * Handles database operations for workflow and agent metrics
 *
 * Features:
 * - Persist workflow execution metrics
 * - Persist agent step metrics
 * - Query historical metrics for analysis
 * - Auto-create database and tables on first run
 * - Zero-config: just works locally
 */

import Database from 'better-sqlite3'
import type { WorkflowMetrics, AgentStepMetrics } from './metrics-collector'
import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../utils/logger'
import { PERSISTENCE_DEFAULTS } from './config/defaults'

const log = logger.child('MetricsPersister')

// Row types for SQLite query results
interface PerformanceSummaryRow {
  execution_count: number
  avg_duration_ms: number | null
  success_rate: number | null
  avg_steps: number | null
  avg_parallel_steps: number | null
  last_execution: string | null
}

interface AgentPerformanceRow {
  agent_id: string
  phase: string
  execution_count: number
  avg_duration_ms: number | null
  success_rate: number | null
  avg_confidence: number | null
  total_artifacts: number | null
}

interface WorkflowExecutionRow {
  id: string
  workflow_name: string
  task_description: string | null
  task_type: string | null
  total_duration_ms: number
  phase_durations: string | null
  success: number
  step_count: number
  parallel_steps_executed: number
  approval_count: number
  retry_count: number
  created_at: string
  completed_at: string | null
}

interface AgentMetricsRow {
  id: number
  workflow_id: string
  workflow_name: string
  agent_id: string
  phase: string
  step_order: number
  duration_ms: number
  start_time: string
  success: number
  error_message: string | null
  retry_count: number
  confidence_score: number
  artifacts_created: number
}

interface LearningSessionRow {
  id: number
  workflow_id: string
  session_type: string
  findings: string | null
  recommendations: string | null
  confidence_score: number
  implemented: number
  created_at: string
}

interface CountRow {
  count: number
}

/**
 * MetricsPersister - SQLite-based persistence for BMad metrics
 *
 * Database location (in priority order):
 * 1. Explicit path passed to constructor
 * 2. .asmo/metrics.db in current working directory
 */
export class MetricsPersister {
  private db: Database.Database | null = null
  private dbPath: string
  private initialized: boolean = false

  constructor(dbPath?: string) {
    // Determine database path
    this.dbPath = dbPath || path.join(process.cwd(), PERSISTENCE_DEFAULTS.paths.metricsDb)
  }

  /**
   * Initialize database connection and create tables if needed
   * Called lazily on first operation
   */
  private ensureInitialized(): void {
    if (this.initialized) return

    try {
      // Ensure .asmo directory exists
      const dir = path.dirname(this.dbPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Open database (creates file if doesn't exist)
      this.db = new Database(this.dbPath)

      // Enable WAL mode for better concurrent read performance
      this.db.pragma('journal_mode = WAL')

      // Create tables
      this.createTables()

      this.initialized = true
    } catch (error) {
      // Silent fail - metrics are optional
      log.error('Failed to initialize metrics database', { error: error instanceof Error ? error.message : String(error) })
      this.db = null
    }
  }

  /**
   * Create database tables if they don't exist
   */
  private createTables(): void {
    if (!this.db) return

    this.db.exec(`
      -- Workflow executions table
      CREATE TABLE IF NOT EXISTS workflow_executions (
        id TEXT PRIMARY KEY,
        workflow_name TEXT NOT NULL,
        task_description TEXT,
        task_type TEXT,
        total_duration_ms INTEGER NOT NULL,
        phase_durations TEXT,  -- JSON
        success INTEGER NOT NULL,  -- 0 or 1
        step_count INTEGER NOT NULL,
        parallel_steps_executed INTEGER DEFAULT 0,
        approval_count INTEGER DEFAULT 0,
        retry_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );

      -- Agent step metrics table
      CREATE TABLE IF NOT EXISTS agent_execution_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        workflow_name TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        step_order INTEGER NOT NULL,
        duration_ms INTEGER NOT NULL,
        start_time TEXT NOT NULL,
        success INTEGER NOT NULL,  -- 0 or 1
        error_message TEXT,
        retry_count INTEGER DEFAULT 0,
        confidence_score REAL DEFAULT 0,
        artifacts_created INTEGER DEFAULT 0,
        FOREIGN KEY (workflow_id) REFERENCES workflow_executions(id)
      );

      -- Learning sessions table (for LearningLoop)
      CREATE TABLE IF NOT EXISTS learning_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workflow_id TEXT NOT NULL,
        session_type TEXT NOT NULL,
        findings TEXT,  -- JSON
        recommendations TEXT,  -- JSON
        confidence_score REAL DEFAULT 0,
        implemented INTEGER DEFAULT 0,  -- 0 or 1
        created_at TEXT NOT NULL
      );

      -- Indexes for common queries
      CREATE INDEX IF NOT EXISTS idx_workflow_name ON workflow_executions(workflow_name);
      CREATE INDEX IF NOT EXISTS idx_workflow_created ON workflow_executions(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_agent_workflow ON agent_execution_metrics(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_agent_phase ON agent_execution_metrics(phase);
      CREATE INDEX IF NOT EXISTS idx_learning_workflow ON learning_sessions(workflow_id);
      CREATE INDEX IF NOT EXISTS idx_learning_created ON learning_sessions(created_at DESC);
    `)
  }

  /**
   * Check if persister is connected to database
   */
  async isConnected(): Promise<boolean> {
    this.ensureInitialized()
    return this.db !== null
  }

  /**
   * Check if metrics persistence is enabled
   */
  isEnabled(): boolean {
    this.ensureInitialized()
    return this.db !== null
  }

  /**
   * Persist workflow execution metrics to database
   */
  async persistWorkflowMetrics(metrics: WorkflowMetrics): Promise<void> {
    this.ensureInitialized()
    if (!this.db) return

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO workflow_executions
        (id, workflow_name, task_description, task_type, total_duration_ms,
         phase_durations, success, step_count, parallel_steps_executed,
         approval_count, retry_count, created_at, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run(
        metrics.workflowId,
        metrics.workflowName,
        metrics.taskDescription,
        metrics.taskType,
        metrics.totalDurationMs,
        JSON.stringify(metrics.phaseDurations),
        metrics.success ? 1 : 0,
        metrics.stepCount,
        metrics.parallelStepsExecuted,
        metrics.approvalCount,
        metrics.retryCount,
        metrics.createdAt.toISOString(),
        metrics.completedAt?.toISOString() || null
      )
    } catch (error) {
      // Silent fail - metrics are optional
      log.error('Failed to persist workflow metrics', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * Persist agent step metrics in batch
   */
  async persistStepMetrics(stepMetrics: AgentStepMetrics[]): Promise<void> {
    this.ensureInitialized()
    if (!this.db || stepMetrics.length === 0) return

    try {
      const stmt = this.db.prepare(`
        INSERT INTO agent_execution_metrics
        (workflow_id, workflow_name, agent_id, phase, step_order, duration_ms,
         start_time, success, error_message, retry_count, confidence_score,
         artifacts_created)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const insertMany = this.db.transaction((metrics: AgentStepMetrics[]) => {
        for (const metric of metrics) {
          stmt.run(
            metric.workflowId,
            metric.workflowName,
            metric.agentId,
            metric.phase,
            metric.stepOrder,
            metric.durationMs,
            metric.startTime.toISOString(),
            metric.success ? 1 : 0,
            metric.errorMessage || null,
            metric.retryCount,
            metric.confidenceScore,
            metric.artifactsCreated
          )
        }
      })

      insertMany(stepMetrics)
    } catch (error) {
      // Silent fail - metrics are optional
      log.error('Failed to persist step metrics', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  /**
   * Retrieve workflow history for a specific workflow name
   */
  async getWorkflowHistory(
    workflowName?: string,
    limit: number = 10
  ): Promise<WorkflowMetrics[]> {
    this.ensureInitialized()
    if (!this.db) return []

    try {
      let rows: WorkflowExecutionRow[]

      if (workflowName) {
        const stmt = this.db.prepare(`
          SELECT * FROM workflow_executions
          WHERE workflow_name = ?
          ORDER BY created_at DESC
          LIMIT ?
        `)
        rows = stmt.all(workflowName, limit) as WorkflowExecutionRow[]
      } else {
        const stmt = this.db.prepare(`
          SELECT * FROM workflow_executions
          ORDER BY created_at DESC
          LIMIT ?
        `)
        rows = stmt.all(limit) as WorkflowExecutionRow[]
      }

      return rows.map(row => this.mapRowToWorkflowMetrics(row))
    } catch (error) {
      log.error('Failed to retrieve workflow history', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }

  /**
   * Get agent metrics for a specific workflow
   */
  async getAgentMetricsForWorkflow(workflowId: string): Promise<AgentStepMetrics[]> {
    this.ensureInitialized()
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM agent_execution_metrics
        WHERE workflow_id = ?
        ORDER BY step_order ASC
      `)

      const rows = stmt.all(workflowId) as AgentMetricsRow[]
      return rows.map(row => this.mapRowToAgentMetrics(row))
    } catch (error) {
      log.error('Failed to retrieve agent metrics', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }

  /**
   * Get workflow performance summary
   */
  async getWorkflowPerformanceSummary(workflowName?: string): Promise<{
    executionCount: number
    avgDurationMs: number
    successRate: number
    avgSteps: number
    avgParallelSteps: number
    lastExecution: Date | null
  }> {
    this.ensureInitialized()
    if (!this.db) {
      return {
        executionCount: 0,
        avgDurationMs: 0,
        successRate: 0,
        avgSteps: 0,
        avgParallelSteps: 0,
        lastExecution: null
      }
    }

    try {
      let stmt
      if (workflowName) {
        stmt = this.db.prepare(`
          SELECT
            COUNT(*) as execution_count,
            AVG(total_duration_ms) as avg_duration_ms,
            AVG(success) * 100 as success_rate,
            AVG(step_count) as avg_steps,
            AVG(parallel_steps_executed) as avg_parallel_steps,
            MAX(created_at) as last_execution
          FROM workflow_executions
          WHERE workflow_name = ?
        `)
      } else {
        stmt = this.db.prepare(`
          SELECT
            COUNT(*) as execution_count,
            AVG(total_duration_ms) as avg_duration_ms,
            AVG(success) * 100 as success_rate,
            AVG(step_count) as avg_steps,
            AVG(parallel_steps_executed) as avg_parallel_steps,
            MAX(created_at) as last_execution
          FROM workflow_executions
        `)
      }

      const row = (workflowName ? stmt.get(workflowName) : stmt.get()) as PerformanceSummaryRow | undefined

      if (!row || row.execution_count === 0) {
        return {
          executionCount: 0,
          avgDurationMs: 0,
          successRate: 0,
          avgSteps: 0,
          avgParallelSteps: 0,
          lastExecution: null
        }
      }

      return {
        executionCount: row.execution_count,
        avgDurationMs: row.avg_duration_ms || 0,
        successRate: row.success_rate || 0,
        avgSteps: row.avg_steps || 0,
        avgParallelSteps: row.avg_parallel_steps || 0,
        lastExecution: row.last_execution ? new Date(row.last_execution) : null
      }
    } catch (error) {
      log.error('Failed to get performance summary', { error: error instanceof Error ? error.message : String(error) })
      return {
        executionCount: 0,
        avgDurationMs: 0,
        successRate: 0,
        avgSteps: 0,
        avgParallelSteps: 0,
        lastExecution: null
      }
    }
  }

  /**
   * Get agent performance summary
   */
  async getAgentPerformanceSummary(agentId?: string): Promise<Array<{
    agentId: string
    phase: string
    executionCount: number
    avgDurationMs: number
    successRate: number
    avgConfidence: number
    totalArtifacts: number
  }>> {
    this.ensureInitialized()
    if (!this.db) return []

    try {
      let stmt
      if (agentId) {
        stmt = this.db.prepare(`
          SELECT
            agent_id,
            phase,
            COUNT(*) as execution_count,
            AVG(duration_ms) as avg_duration_ms,
            AVG(success) * 100 as success_rate,
            AVG(confidence_score) as avg_confidence,
            SUM(artifacts_created) as total_artifacts
          FROM agent_execution_metrics
          WHERE agent_id = ?
          GROUP BY agent_id, phase
        `)
      } else {
        stmt = this.db.prepare(`
          SELECT
            agent_id,
            phase,
            COUNT(*) as execution_count,
            AVG(duration_ms) as avg_duration_ms,
            AVG(success) * 100 as success_rate,
            AVG(confidence_score) as avg_confidence,
            SUM(artifacts_created) as total_artifacts
          FROM agent_execution_metrics
          GROUP BY agent_id, phase
        `)
      }

      const rows = (agentId ? stmt.all(agentId) : stmt.all()) as AgentPerformanceRow[]

      return rows.map((row) => ({
        agentId: row.agent_id,
        phase: row.phase,
        executionCount: row.execution_count,
        avgDurationMs: row.avg_duration_ms || 0,
        successRate: row.success_rate || 0,
        avgConfidence: row.avg_confidence || 0,
        totalArtifacts: row.total_artifacts || 0
      }))
    } catch (error) {
      log.error('Failed to get agent performance', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }

  /**
   * Clean up old metrics (retention policy)
   */
  async cleanupOldMetrics(daysToKeep: number = 90): Promise<number> {
    this.ensureInitialized()
    if (!this.db) return 0

    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      // Delete old agent metrics first (foreign key)
      const deleteAgentStmt = this.db.prepare(`
        DELETE FROM agent_execution_metrics
        WHERE workflow_id IN (
          SELECT id FROM workflow_executions
          WHERE created_at < ?
        )
      `)
      deleteAgentStmt.run(cutoffDate.toISOString())

      // Delete old workflow executions
      const deleteWorkflowStmt = this.db.prepare(`
        DELETE FROM workflow_executions
        WHERE created_at < ?
      `)
      const result = deleteWorkflowStmt.run(cutoffDate.toISOString())

      return result.changes
    } catch (error) {
      log.error('Failed to cleanup old metrics', { error: error instanceof Error ? error.message : String(error) })
      return 0
    }
  }

  /**
   * Get database file path
   */
  getDatabasePath(): string {
    return this.dbPath
  }

  // ============================================================================
  // Learning Sessions (for LearningLoop)
  // ============================================================================

  /**
   * Persist a learning session
   */
  async persistLearningSession(session: {
    workflowId: string
    sessionType: string
    findings: unknown[]
    recommendations: string[]
    confidenceScore: number
    implemented: boolean
    createdAt: Date
  }): Promise<number | null> {
    this.ensureInitialized()
    if (!this.db) return null

    try {
      const stmt = this.db.prepare(`
        INSERT INTO learning_sessions
        (workflow_id, session_type, findings, recommendations, confidence_score, implemented, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)

      const result = stmt.run(
        session.workflowId,
        session.sessionType,
        JSON.stringify(session.findings),
        JSON.stringify(session.recommendations),
        session.confidenceScore,
        session.implemented ? 1 : 0,
        session.createdAt.toISOString()
      )

      return result.lastInsertRowid as number
    } catch (error) {
      log.error('Failed to persist learning session', { error: error instanceof Error ? error.message : String(error) })
      return null
    }
  }

  /**
   * Get learning sessions for a workflow
   */
  async getLearningHistory(workflowId: string, limit: number = 5): Promise<Array<{
    sessionId: number
    workflowId: string
    sessionType: string
    findings: unknown[]
    recommendations: string[]
    confidenceScore: number
    implemented: boolean
    createdAt: Date
  }>> {
    this.ensureInitialized()
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM learning_sessions
        WHERE workflow_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `)

      const rows = stmt.all(workflowId, limit) as LearningSessionRow[]

      return rows.map((row) => ({
        sessionId: row.id,
        workflowId: row.workflow_id,
        sessionType: row.session_type,
        findings: row.findings ? JSON.parse(row.findings) : [],
        recommendations: row.recommendations ? JSON.parse(row.recommendations) : [],
        confidenceScore: row.confidence_score,
        implemented: row.implemented === 1,
        createdAt: new Date(row.created_at)
      }))
    } catch (error) {
      log.error('Failed to get learning history', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }

  /**
   * Get recent learning sessions across all workflows
   */
  async getRecentLearningSessions(limit: number = 50): Promise<Array<{
    findings: unknown[]
    recommendations: string[]
  }>> {
    this.ensureInitialized()
    if (!this.db) return []

    try {
      const stmt = this.db.prepare(`
        SELECT findings, recommendations
        FROM learning_sessions
        ORDER BY created_at DESC
        LIMIT ?
      `)

      const rows = stmt.all(limit) as Pick<LearningSessionRow, 'findings' | 'recommendations'>[]

      return rows.map((row) => ({
        findings: row.findings ? JSON.parse(row.findings) : [],
        recommendations: row.recommendations ? JSON.parse(row.recommendations) : []
      }))
    } catch (error) {
      log.error('Failed to get recent learning sessions', { error: error instanceof Error ? error.message : String(error) })
      return []
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    workflowCount: number
    stepMetricsCount: number
    dbSizeBytes: number
  }> {
    this.ensureInitialized()
    if (!this.db) {
      return { workflowCount: 0, stepMetricsCount: 0, dbSizeBytes: 0 }
    }

    try {
      const workflowCount = this.db.prepare('SELECT COUNT(*) as count FROM workflow_executions').get() as CountRow | undefined
      const stepCount = this.db.prepare('SELECT COUNT(*) as count FROM agent_execution_metrics').get() as CountRow | undefined

      let dbSizeBytes = 0
      if (fs.existsSync(this.dbPath)) {
        const stats = fs.statSync(this.dbPath)
        dbSizeBytes = stats.size
      }

      return {
        workflowCount: workflowCount?.count || 0,
        stepMetricsCount: stepCount?.count || 0,
        dbSizeBytes
      }
    } catch (error) {
      return { workflowCount: 0, stepMetricsCount: 0, dbSizeBytes: 0 }
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      this.db.close()
      this.db = null
      this.initialized = false
    }
  }

  /**
   * Map database row to WorkflowMetrics
   */
  private mapRowToWorkflowMetrics(row: WorkflowExecutionRow): WorkflowMetrics {
    return {
      workflowId: row.id,
      workflowName: row.workflow_name,
      taskDescription: row.task_description || '',
      taskType: row.task_type || '',
      totalDurationMs: row.total_duration_ms,
      phaseDurations: row.phase_durations ? JSON.parse(row.phase_durations) : {},
      success: row.success === 1,
      stepCount: row.step_count,
      parallelStepsExecuted: row.parallel_steps_executed,
      approvalCount: row.approval_count,
      retryCount: row.retry_count,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    }
  }

  /**
   * Map database row to AgentStepMetrics
   */
  private mapRowToAgentMetrics(row: AgentMetricsRow): AgentStepMetrics {
    return {
      workflowId: row.workflow_id,
      workflowName: row.workflow_name,
      agentId: row.agent_id,
      phase: row.phase,
      stepOrder: row.step_order,
      durationMs: row.duration_ms,
      startTime: new Date(row.start_time),
      success: row.success === 1,
      errorMessage: row.error_message || undefined,
      retryCount: row.retry_count,
      confidenceScore: row.confidence_score,
      artifactsCreated: row.artifacts_created
    }
  }
}
