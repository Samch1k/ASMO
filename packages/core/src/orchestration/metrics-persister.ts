/**
 * MetricsPersister - Persist metrics to PostgreSQL
 *
 * Part of BMad Framework integration
 * Handles database operations for workflow and agent metrics
 *
 * Features:
 * - Persist workflow execution metrics
 * - Persist agent step metrics
 * - Query historical metrics for analysis
 * - Batch operations for performance
 * - Connection pooling
 */

import type { WorkflowMetrics, AgentStepMetrics } from './metrics-collector'
import pg from 'pg'

const { Pool } = pg

/**
 * MetricsPersister - Database persistence for BMad metrics
 */
export class MetricsPersister {
  private pool: pg.Pool
  private connectionString: string

  constructor(connectionString?: string) {
    this.connectionString = connectionString || process.env.DATABASE_URL || ''

    if (!this.connectionString) {
      console.warn('⚠️  [MetricsPersister] No DATABASE_URL provided - metrics will NOT be persisted')
    }

    this.pool = new Pool({
      connectionString: this.connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10, // Maximum pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000
    })

    // Handle pool errors
    this.pool.on('error', (err) => {
      console.error('❌ [MetricsPersister] Unexpected pool error:', err)
    })
  }

  /**
   * Check if persister is connected to database
   */
  async isConnected(): Promise<boolean> {
    if (!this.connectionString) return false

    try {
      const client = await this.pool.connect()
      client.release()
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Persist workflow execution metrics to database
   */
  async persistWorkflowMetrics(metrics: WorkflowMetrics): Promise<void> {
    if (!this.connectionString) {
      console.log('⚠️  [MetricsPersister] Skipping workflow metrics persistence (no DB connection)')
      return
    }

    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      const query = `
        INSERT INTO workflow_executions
        (id, workflow_name, task_description, task_type, total_duration_ms,
         phase_durations, success, step_count, parallel_steps_executed,
         approval_count, retry_count, created_at, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO UPDATE SET
          completed_at = EXCLUDED.completed_at,
          success = EXCLUDED.success,
          total_duration_ms = EXCLUDED.total_duration_ms
      `

      const values = [
        metrics.workflowId,
        metrics.workflowName,
        metrics.taskDescription,
        metrics.taskType,
        metrics.totalDurationMs,
        JSON.stringify(metrics.phaseDurations),
        metrics.success,
        metrics.stepCount,
        metrics.parallelStepsExecuted,
        metrics.approvalCount,
        metrics.retryCount,
        metrics.createdAt,
        metrics.completedAt
      ]

      await client.query(query, values)
      await client.query('COMMIT')

      console.log(`✅ [MetricsPersister] Workflow metrics persisted: ${metrics.workflowId}`)
    } catch (error: any) {
      await client.query('ROLLBACK')
      console.error('❌ [MetricsPersister] Failed to persist workflow metrics:', error.message)
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Persist agent step metrics in batch
   */
  async persistStepMetrics(stepMetrics: AgentStepMetrics[]): Promise<void> {
    if (!this.connectionString) {
      console.log('⚠️  [MetricsPersister] Skipping step metrics persistence (no DB connection)')
      return
    }

    if (stepMetrics.length === 0) {
      console.log('⚠️  [MetricsPersister] No step metrics to persist')
      return
    }

    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      // Batch insert for performance
      const query = `
        INSERT INTO agent_execution_metrics
        (workflow_id, workflow_name, agent_id, phase, step_order, duration_ms,
         start_time, success, error_message, retry_count, confidence_score,
         artifacts_created)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `

      for (const metric of stepMetrics) {
        const values = [
          metric.workflowId,
          metric.workflowName,
          metric.agentId,
          metric.phase,
          metric.stepOrder,
          metric.durationMs,
          metric.startTime,
          metric.success,
          metric.errorMessage || null,
          metric.retryCount,
          metric.confidenceScore,
          metric.artifactsCreated
        ]

        await client.query(query, values)
      }

      await client.query('COMMIT')

      console.log(`✅ [MetricsPersister] Step metrics persisted: ${stepMetrics.length} steps`)
    } catch (error: any) {
      await client.query('ROLLBACK')
      console.error('❌ [MetricsPersister] Failed to persist step metrics:', error.message)
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Retrieve workflow history for a specific workflow name
   */
  async getWorkflowHistory(
    workflowName?: string,
    limit: number = 10
  ): Promise<WorkflowMetrics[]> {
    if (!this.connectionString) {
      console.log('⚠️  [MetricsPersister] Cannot retrieve history (no DB connection)')
      return []
    }

    try {
      const query = workflowName
        ? `SELECT * FROM workflow_executions
           WHERE workflow_name = $1
           ORDER BY created_at DESC
           LIMIT $2`
        : `SELECT * FROM workflow_executions
           ORDER BY created_at DESC
           LIMIT $1`

      const params = workflowName ? [workflowName, limit] : [limit]
      const result = await this.pool.query(query, params)

      return result.rows.map(row => this.mapRowToWorkflowMetrics(row))
    } catch (error: any) {
      console.error('❌ [MetricsPersister] Failed to retrieve workflow history:', error.message)
      return []
    }
  }

  /**
   * Get agent metrics for a specific workflow
   */
  async getAgentMetricsForWorkflow(workflowId: string): Promise<AgentStepMetrics[]> {
    if (!this.connectionString) {
      console.log('⚠️  [MetricsPersister] Cannot retrieve metrics (no DB connection)')
      return []
    }

    try {
      const query = `
        SELECT * FROM agent_execution_metrics
        WHERE workflow_id = $1
        ORDER BY step_order ASC
      `

      const result = await this.pool.query(query, [workflowId])

      return result.rows.map(row => this.mapRowToAgentMetrics(row))
    } catch (error: any) {
      console.error('❌ [MetricsPersister] Failed to retrieve agent metrics:', error.message)
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
    if (!this.connectionString) {
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
      const query = workflowName
        ? `SELECT * FROM v_recent_workflow_performance WHERE workflow_name = $1`
        : `SELECT * FROM v_recent_workflow_performance LIMIT 1`

      const params = workflowName ? [workflowName] : []
      const result = await this.pool.query(query, params)

      if (result.rows.length === 0) {
        return {
          executionCount: 0,
          avgDurationMs: 0,
          successRate: 0,
          avgSteps: 0,
          avgParallelSteps: 0,
          lastExecution: null
        }
      }

      const row = result.rows[0]
      return {
        executionCount: parseInt(row.execution_count),
        avgDurationMs: parseFloat(row.avg_duration_ms),
        successRate: parseFloat(row.success_rate),
        avgSteps: parseFloat(row.avg_steps),
        avgParallelSteps: parseFloat(row.avg_parallel_steps),
        lastExecution: row.last_execution ? new Date(row.last_execution) : null
      }
    } catch (error: any) {
      console.error('❌ [MetricsPersister] Failed to get performance summary:', error.message)
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
    if (!this.connectionString) {
      return []
    }

    try {
      const query = agentId
        ? `SELECT * FROM v_agent_performance_summary WHERE agent_id = $1`
        : `SELECT * FROM v_agent_performance_summary`

      const params = agentId ? [agentId] : []
      const result = await this.pool.query(query, params)

      return result.rows.map(row => ({
        agentId: row.agent_id,
        phase: row.phase,
        executionCount: parseInt(row.execution_count),
        avgDurationMs: parseFloat(row.avg_duration_ms),
        successRate: parseFloat(row.success_rate),
        avgConfidence: parseFloat(row.avg_confidence),
        totalArtifacts: parseInt(row.total_artifacts)
      }))
    } catch (error: any) {
      console.error('❌ [MetricsPersister] Failed to get agent performance:', error.message)
      return []
    }
  }

  /**
   * Clean up old metrics (retention policy)
   */
  async cleanupOldMetrics(daysToKeep: number = 90): Promise<number> {
    if (!this.connectionString) {
      return 0
    }

    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')

      const query = `
        DELETE FROM workflow_executions
        WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
      `

      const result = await client.query(query)
      await client.query('COMMIT')

      const deletedCount = result.rowCount || 0
      console.log(`✅ [MetricsPersister] Cleaned up ${deletedCount} old workflow records`)

      return deletedCount
    } catch (error: any) {
      await client.query('ROLLBACK')
      console.error('❌ [MetricsPersister] Failed to cleanup old metrics:', error.message)
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Close database connection pool
   */
  async close(): Promise<void> {
    await this.pool.end()
    console.log('✅ [MetricsPersister] Database connection pool closed')
  }

  /**
   * Map database row to WorkflowMetrics
   */
  private mapRowToWorkflowMetrics(row: any): WorkflowMetrics {
    return {
      workflowId: row.id,
      workflowName: row.workflow_name,
      taskDescription: row.task_description,
      taskType: row.task_type,
      totalDurationMs: parseInt(row.total_duration_ms),
      phaseDurations: typeof row.phase_durations === 'string'
        ? JSON.parse(row.phase_durations)
        : row.phase_durations,
      success: row.success,
      stepCount: parseInt(row.step_count),
      parallelStepsExecuted: parseInt(row.parallel_steps_executed),
      approvalCount: parseInt(row.approval_count),
      retryCount: parseInt(row.retry_count),
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined
    }
  }

  /**
   * Map database row to AgentStepMetrics
   */
  private mapRowToAgentMetrics(row: any): AgentStepMetrics {
    return {
      workflowId: row.workflow_id,
      workflowName: row.workflow_name,
      agentId: row.agent_id,
      phase: row.phase,
      stepOrder: parseInt(row.step_order),
      durationMs: parseInt(row.duration_ms),
      startTime: new Date(row.start_time),
      success: row.success,
      errorMessage: row.error_message,
      retryCount: parseInt(row.retry_count),
      confidenceScore: parseFloat(row.confidence_score),
      artifactsCreated: parseInt(row.artifacts_created)
    }
  }
}
