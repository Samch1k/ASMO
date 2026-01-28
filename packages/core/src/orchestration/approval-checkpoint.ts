/**
 * ApprovalCheckpoint - Human-in-the-loop approval gates for workflow phases
 *
 * Provides approval checkpoints at critical phase boundaries:
 * - After Requirements phase (before Design)
 * - After Design phase (before Implementation)
 * - After Testing phase (before Deployment)
 *
 * Supports:
 * - CLI-based approval (stdin for PoC)
 * - Auto-approval mode for testing
 * - Timeout handling (default: 5 minutes)
 * - Approval history tracking
 *
 * Usage:
 * ```typescript
 * const checkpoint = new ApprovalCheckpoint()
 * const approved = await checkpoint.requestApproval('requirements', phaseOutput)
 * ```
 */

import * as readline from 'readline'
import { AgentState } from '../agents/types'
import { WorkflowPhase } from './phase-manager'
import { getConfigManager } from './config/config-manager'

export interface ApprovalRequest {
  phase: WorkflowPhase
  timestamp: string
  output: any
  exitCriteria: string
  metadata?: Record<string, any>
}

export interface ApprovalResponse {
  approved: boolean
  timestamp: string
  approver?: string
  feedback?: string
  autoApproved: boolean
  timedOut: boolean
}

export interface ApprovalHistory {
  phase: WorkflowPhase
  request: ApprovalRequest
  response: ApprovalResponse
  durationMs: number
}

export interface ApprovalCheckpointConfig {
  autoApprove?: boolean
  timeoutMs?: number
  approver?: string
  skipCheckpoints?: boolean
}

export class ApprovalCheckpoint {
  private config: Required<ApprovalCheckpointConfig>
  private history: ApprovalHistory[] = []

  // Phases that require approval (will be overridden by config if available)
  private checkpointPhases: WorkflowPhase[] = [
    'requirements',
    'design',
    'testing'
  ]

  constructor(config: ApprovalCheckpointConfig = {}) {
    // ✨ Priority 2: Try to load config from ConfigManager if not explicitly provided
    const configManager = getConfigManager()
    let effectiveConfig = config

    // If no explicit config provided and ConfigManager is initialized, use ConfigManager config
    if (Object.keys(config).length === 0 && configManager.isInitialized()) {
      effectiveConfig = configManager.getApprovalCheckpointConfig()
    }

    this.config = {
      autoApprove: effectiveConfig.autoApprove ?? process.env.AUTO_APPROVE === 'true',
      timeoutMs: effectiveConfig.timeoutMs ?? 5 * 60 * 1000, // 5 minutes default
      approver: effectiveConfig.approver ?? 'human',
      skipCheckpoints: effectiveConfig.skipCheckpoints ?? false
    }

    // ✨ Priority 2: Load checkpoint phases from config if available
    if (configManager.isInitialized()) {
      const approvalConfig = configManager.getApprovalCheckpointConfig()
      if (approvalConfig.checkpointPhases && approvalConfig.checkpointPhases.length > 0) {
        this.checkpointPhases = approvalConfig.checkpointPhases as WorkflowPhase[]
      }
    }

    if (this.config.autoApprove) {
      console.log('⚙️  ApprovalCheckpoint: Auto-approval mode enabled')
    }
    if (this.config.skipCheckpoints) {
      console.log('⚙️  ApprovalCheckpoint: Checkpoints disabled')
    }
  }

  /**
   * Check if a phase requires approval
   */
  requiresApproval(phase: WorkflowPhase): boolean {
    return this.checkpointPhases.includes(phase)
  }

  /**
   * Request approval for a phase
   * Blocks execution until approved, rejected, or timeout
   */
  async requestApproval(
    phase: WorkflowPhase,
    output: any,
    exitCriteria: string = '',
    metadata?: Record<string, any>
  ): Promise<ApprovalResponse> {
    const startTime = Date.now()

    const request: ApprovalRequest = {
      phase,
      timestamp: new Date().toISOString(),
      output,
      exitCriteria,
      metadata
    }

    console.log('\n' + '='.repeat(80))
    console.log(`⏸️  APPROVAL CHECKPOINT: ${phase.toUpperCase()} PHASE`)
    console.log('='.repeat(80))

    // Skip if checkpoints disabled
    if (this.config.skipCheckpoints) {
      console.log('✅ Checkpoint skipped (checkpoints disabled)')
      const response: ApprovalResponse = {
        approved: true,
        timestamp: new Date().toISOString(),
        autoApproved: true,
        timedOut: false,
        feedback: 'Checkpoint skipped'
      }
      this.recordApproval(phase, request, response, Date.now() - startTime)
      return response
    }

    // Auto-approve if enabled
    if (this.config.autoApprove) {
      console.log('✅ Auto-approved (auto-approval mode enabled)')
      const response: ApprovalResponse = {
        approved: true,
        timestamp: new Date().toISOString(),
        approver: 'system',
        autoApproved: true,
        timedOut: false
      }
      this.recordApproval(phase, request, response, Date.now() - startTime)
      return response
    }

    // Display phase output
    this.displayPhaseOutput(phase, output, exitCriteria)

    // Request human approval
    const response = await this.requestHumanApproval(phase, request)

    // Record approval
    const duration = Date.now() - startTime
    this.recordApproval(phase, request, response, duration)

    if (response.approved) {
      console.log('✅ Phase approved - continuing workflow')
    } else {
      console.log('❌ Phase rejected - workflow will rollback')
    }
    console.log('='.repeat(80) + '\n')

    return response
  }

  /**
   * Display phase output for human review
   */
  private displayPhaseOutput(phase: WorkflowPhase, output: any, exitCriteria: string): void {
    console.log(`\n📋 Phase: ${phase}`)
    console.log(`📝 Exit Criteria: ${exitCriteria}`)
    console.log('\n📊 Phase Output:')
    console.log('-'.repeat(80))

    // Format output based on phase
    switch (phase) {
      case 'requirements':
        this.displayRequirementsOutput(output)
        break
      case 'design':
        this.displayDesignOutput(output)
        break
      case 'testing':
        this.displayTestingOutput(output)
        break
      default:
        console.log(JSON.stringify(output, null, 2))
    }

    console.log('-'.repeat(80))
  }

  /**
   * Display requirements phase output
   */
  private displayRequirementsOutput(output: any): void {
    if (output.userStories) {
      console.log(`\n📖 User Stories (${output.userStories.length}):`)
      output.userStories.forEach((story: any, index: number) => {
        console.log(`   ${index + 1}. ${story.title || story}`)
      })
    }

    if (output.acceptanceCriteria) {
      console.log(`\n✓ Acceptance Criteria (${output.acceptanceCriteria.length}):`)
      output.acceptanceCriteria.forEach((criteria: any, index: number) => {
        console.log(`   ${index + 1}. ${criteria}`)
      })
    }

    if (output.validation) {
      console.log(`\n📊 Validation Score: ${output.validation.score}/100`)
      if (output.validation.approved !== undefined) {
        console.log(`   Validator Approval: ${output.validation.approved ? '✅ Approved' : '❌ Rejected'}`)
      }
    }
  }

  /**
   * Display design phase output
   */
  private displayDesignOutput(output: any): void {
    if (output.architecture) {
      console.log('\n🏗️  Architecture:')
      console.log(`   ${output.architecture}`)
    }

    if (output.apiEndpoints) {
      console.log(`\n🔌 API Endpoints (${output.apiEndpoints.length}):`)
      output.apiEndpoints.forEach((endpoint: any) => {
        console.log(`   ${endpoint.method} ${endpoint.path}`)
      })
    }

    if (output.databaseSchema) {
      console.log(`\n🗄️  Database Schema:`)
      console.log(`   ${output.databaseSchema}`)
    }

    if (output.validation) {
      console.log(`\n📊 Design Review Score: ${output.validation.score}/100`)
      if (output.validation.approved !== undefined) {
        console.log(`   Validator Approval: ${output.validation.approved ? '✅ Approved' : '❌ Rejected'}`)
      }
    }
  }

  /**
   * Display testing phase output
   */
  private displayTestingOutput(output: any): void {
    if (output.testResults) {
      console.log('\n🧪 Test Results:')
      console.log(`   Total Tests: ${output.testResults.total || 0}`)
      console.log(`   Passing: ${output.testResults.passing || 0}`)
      console.log(`   Failing: ${output.testResults.failing || 0}`)
      console.log(`   Coverage: ${output.testResults.coverage || 0}%`)
    }

    if (output.performance) {
      console.log('\n⚡ Performance Metrics:')
      console.log(`   Response Time: ${output.performance.responseTime || 'N/A'}`)
      console.log(`   Throughput: ${output.performance.throughput || 'N/A'}`)
    }

    if (output.consolidated) {
      console.log('\n📋 Test Status: Tests consolidated from parallel agents')
    }
  }

  /**
   * Request human approval via CLI
   */
  private async requestHumanApproval(
    _phase: WorkflowPhase,
    _request: ApprovalRequest
  ): Promise<ApprovalResponse> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    const promptUser = (): Promise<ApprovalResponse> => {
      return new Promise((resolve) => {
        rl.question('\n❓ Approve this phase? (y/n/f for feedback): ', (answer) => {
          const normalized = answer.toLowerCase().trim()

          if (normalized === 'y' || normalized === 'yes') {
            rl.close()
            resolve({
              approved: true,
              timestamp: new Date().toISOString(),
              approver: this.config.approver,
              autoApproved: false,
              timedOut: false
            })
          } else if (normalized === 'n' || normalized === 'no') {
            rl.close()
            resolve({
              approved: false,
              timestamp: new Date().toISOString(),
              approver: this.config.approver,
              autoApproved: false,
              timedOut: false,
              feedback: 'Rejected by user'
            })
          } else if (normalized === 'f' || normalized === 'feedback') {
            rl.question('💬 Enter feedback: ', (feedback) => {
              rl.question('❓ Approve? (y/n): ', (finalAnswer) => {
                const finalNormalized = finalAnswer.toLowerCase().trim()
                rl.close()
                resolve({
                  approved: finalNormalized === 'y' || finalNormalized === 'yes',
                  timestamp: new Date().toISOString(),
                  approver: this.config.approver,
                  feedback,
                  autoApproved: false,
                  timedOut: false
                })
              })
            })
          } else {
            console.log('⚠️  Invalid input. Please enter y, n, or f.')
            rl.close()
            // Retry
            resolve(promptUser())
          }
        })
      })
    }

    // Race between user input and timeout
    const approvalPromise = promptUser()
    const timeoutPromise = new Promise<ApprovalResponse>((resolve) => {
      setTimeout(() => {
        rl.close()
        console.log(`\n⏱️  Approval timeout (${this.config.timeoutMs}ms) - auto-rejecting`)
        resolve({
          approved: false,
          timestamp: new Date().toISOString(),
          autoApproved: false,
          timedOut: true,
          feedback: 'Approval timeout'
        })
      }, this.config.timeoutMs)
    })

    return Promise.race([approvalPromise, timeoutPromise])
  }

  /**
   * Record approval in history
   */
  private recordApproval(
    phase: WorkflowPhase,
    request: ApprovalRequest,
    response: ApprovalResponse,
    durationMs: number
  ): void {
    this.history.push({
      phase,
      request,
      response,
      durationMs
    })
  }

  /**
   * Get approval history
   */
  getHistory(): ApprovalHistory[] {
    return [...this.history]
  }

  /**
   * Get approval history for a specific phase
   */
  getPhaseHistory(phase: WorkflowPhase): ApprovalHistory[] {
    return this.history.filter(h => h.phase === phase)
  }

  /**
   * Get approval statistics
   */
  getStatistics(): {
    totalApprovals: number
    approved: number
    rejected: number
    timedOut: number
    autoApproved: number
    averageDurationMs: number
  } {
    const total = this.history.length
    const approved = this.history.filter(h => h.response.approved).length
    const rejected = this.history.filter(h => !h.response.approved).length
    const timedOut = this.history.filter(h => h.response.timedOut).length
    const autoApproved = this.history.filter(h => h.response.autoApproved).length
    const averageDuration = total > 0
      ? this.history.reduce((sum, h) => sum + h.durationMs, 0) / total
      : 0

    return {
      totalApprovals: total,
      approved,
      rejected,
      timedOut,
      autoApproved,
      averageDurationMs: Math.round(averageDuration)
    }
  }

  /**
   * Clear approval history
   */
  clearHistory(): void {
    this.history = []
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ApprovalCheckpointConfig>): void {
    this.config = {
      ...this.config,
      ...config
    }

    if (config.autoApprove !== undefined) {
      console.log(`⚙️  Auto-approval mode: ${config.autoApprove ? 'enabled' : 'disabled'}`)
    }
    if (config.skipCheckpoints !== undefined) {
      console.log(`⚙️  Checkpoints: ${config.skipCheckpoints ? 'disabled' : 'enabled'}`)
    }
  }

  /**
   * Check if checkpoint should block workflow
   * Used by WorkflowEngine to determine if execution should pause
   */
  async checkpointIfRequired(
    state: AgentState,
    phase: WorkflowPhase
  ): Promise<{
    shouldBlock: boolean
    approved?: boolean
    response?: ApprovalResponse
  }> {
    if (!this.requiresApproval(phase)) {
      return { shouldBlock: false }
    }

    // Extract phase output from state
    const output = this.extractPhaseOutput(state, phase)
    const exitCriteria = this.getExitCriteria(phase)

    // Request approval
    const response = await this.requestApproval(phase, output, exitCriteria)

    return {
      shouldBlock: true,
      approved: response.approved,
      response
    }
  }

  /**
   * Extract phase output from state
   */
  private extractPhaseOutput(state: AgentState, phase: WorkflowPhase): any {
    switch (phase) {
      case 'requirements':
        return {
          userStories: state.context?.userStories,
          acceptanceCriteria: state.context?.acceptanceCriteria,
          validation: {
            score: state.metadata?.validation_score,
            approved: state.metadata?.requirements_validated
          }
        }
      case 'design':
        return {
          architecture: state.context?.architecture,
          apiEndpoints: state.context?.apiEndpoints,
          databaseSchema: state.context?.databaseSchema,
          validation: {
            score: state.metadata?.design_score,
            approved: state.metadata?.design_validated
          }
        }
      case 'testing':
        return {
          testResults: state.context?.testResults,
          performance: state.context?.performance,
          consolidated: state.context?.consolidatedTestReport
        }
      default:
        return state.context || {}
    }
  }

  /**
   * Get exit criteria for phase
   */
  private getExitCriteria(phase: WorkflowPhase): string {
    const criteria: Record<WorkflowPhase, string> = {
      requirements: 'Requirements validated and approved',
      design: 'Design validated and approved',
      planning: 'Project plan created with estimates',
      implementation: 'Code implemented and reviewed',
      testing: 'Tests passing with acceptable coverage',
      deployment: 'Deployed and health verified'
    }
    return criteria[phase]
  }

  /**
   * Format approval history for display
   */
  formatHistory(): string {
    if (this.history.length === 0) {
      return 'No approval history'
    }

    const lines: string[] = [
      '\n📜 Approval History:',
      '='.repeat(80)
    ]

    this.history.forEach((item, index) => {
      const status = item.response.approved ? '✅ APPROVED' : '❌ REJECTED'
      const type = item.response.autoApproved ? '(Auto)' : '(Manual)'
      const duration = `${Math.round(item.durationMs / 1000)}s`

      lines.push(`${index + 1}. ${item.phase.toUpperCase()} - ${status} ${type} - ${duration}`)

      if (item.response.feedback) {
        lines.push(`   Feedback: ${item.response.feedback}`)
      }
    })

    lines.push('='.repeat(80))

    return lines.join('\n')
  }
}

/**
 * Singleton instance for convenience
 */
export const approvalCheckpoint = new ApprovalCheckpoint()
