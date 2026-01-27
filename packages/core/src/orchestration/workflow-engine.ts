/**
 * WorkflowEngine - Execute multi-agent workflows with parallel execution support
 *
 * Phase 6: Workflow Engine implementation
 *
 * Features:
 * - Sequential and parallel step execution
 * - State merging between parallel agents
 * - Exit criteria validation
 * - Timeout handling
 * - Graceful error handling
 * - ✨ Day 8: Phase tracking with PhaseManager
 * - ✨ Day 8: Approval checkpoints at phase boundaries
 */

import type { AgentState, AgentWithRoleSkills } from '../agents/types'
import type { AgentRegistry } from './agent-registry'
import type { SkillMatcher } from './skill-matcher'
import { PhaseManager, WorkflowPhase } from './phase-manager'
import { ApprovalCheckpoint, ApprovalCheckpointConfig } from './approval-checkpoint'
import { IterationManager, RetryConfig } from './iteration-manager'
import { MetricsCollector } from './metrics-collector'
import { MetricsPersister } from './metrics-persister'
import { LearningLoop } from './learning-loop'
import { MetricsOptimizer } from './metrics-optimizer'
import { RetrospectiveAgent } from './retrospective-agent'
import { RetrospectiveReportGenerator } from './retrospective-report-generator'
import { getTeamManager, type TeamManager } from './team-manager'
import { getChecklistManager, type ChecklistManager } from './checklist-manager'
import { getConfigManager, type ConfigManager } from './config/config-manager'
import { getInstructionManager, type InstructionManager } from './instruction-manager'
import type {
  Workflow,
  WorkflowStep,
  WorkflowConfig,
  StepResult,
  WorkflowExecutionResult,
  TeamMetrics
} from './types'
import fs from 'fs/promises'
import path from 'path'

/**
 * WorkflowEngine - Executes multi-agent workflows
 */
export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map()
  private globalSettings: WorkflowConfig['global_settings']
  private initialized = false
  private currentWorkflow: Workflow | null = null // ✨ Phase 3: Track current workflow for checklist access

  // ✨ Day 8: Phase tracking and approval checkpoints
  private phaseManager: PhaseManager
  private approvalCheckpoint: ApprovalCheckpoint
  // ✨ Day 9: Retry logic with exponential backoff
  private iterationManager: IterationManager
  // ✨ BMad: Metrics collection and learning loop
  private metricsCollector: MetricsCollector
  private metricsPersister: MetricsPersister
  private learningLoop: LearningLoop
  private metricsOptimizer: MetricsOptimizer
  // ✨ BMad Day 3: Retrospective analysis
  private retrospectiveAgent: RetrospectiveAgent
  private retrospectiveReportGenerator: RetrospectiveReportGenerator
  // ✨ Phase 2: Team management
  private teamManager: TeamManager
  // ✨ Phase 3: Checklist management
  private checklistManager: ChecklistManager
  // ✨ Priority 2: Configuration management
  private configManager: ConfigManager
  // ✨ Priority 2 Phase 2: Instruction management
  private instructionManager: InstructionManager

  constructor(
    private agentRegistry: AgentRegistry,
    private skillMatcher?: SkillMatcher,
    approvalConfig?: ApprovalCheckpointConfig,
    retryConfig?: RetryConfig,
    databaseUrl?: string
  ) {
    // ✨ Priority 2: Get ConfigManager instance
    this.configManager = getConfigManager()

    // Default settings (will be overridden by ConfigManager if initialized)
    this.globalSettings = {
      max_parallel_agents: 5,
      default_timeout: '30m',
      continue_on_partial_failure: false,
      log_all_steps: true,
      state_merge_strategy: 'namespace_isolation'
    }

    // ✨ Initialize phase tracking and approval system
    this.phaseManager = new PhaseManager()
    // ✨ Priority 2: Pass configs from ConfigManager if initialized, otherwise use provided config
    this.approvalCheckpoint = new ApprovalCheckpoint(
      approvalConfig || (this.configManager.isInitialized()
        ? this.configManager.getApprovalCheckpointConfig()
        : undefined)
    )
    // ✨ Initialize retry logic
    this.iterationManager = new IterationManager(
      retryConfig || (this.configManager.isInitialized()
        ? this.configManager.getIterationManagerConfig()
        : undefined)
    )
    // ✨ Initialize BMad metrics and learning loop
    this.metricsCollector = new MetricsCollector()
    this.metricsPersister = new MetricsPersister(databaseUrl)
    this.learningLoop = new LearningLoop(this.metricsPersister)
    this.metricsOptimizer = new MetricsOptimizer(this.metricsPersister)
    // ✨ BMad Day 3: Initialize retrospective analysis
    this.retrospectiveAgent = new RetrospectiveAgent(this.metricsPersister)
    this.retrospectiveReportGenerator = new RetrospectiveReportGenerator()
    // ✨ Phase 2: Initialize team manager
    this.teamManager = getTeamManager()
    // ✨ Phase 3: Initialize checklist manager
    this.checklistManager = getChecklistManager()
    // ✨ Priority 2 Phase 2: Initialize instruction manager
    this.instructionManager = getInstructionManager()

    console.log('✨ WorkflowEngine: Phase tracking, approval checkpoints, retry logic, and BMad metrics enabled')
  }

  /**
   * Initialize workflow engine by loading workflows from config
   * Supports both phase-based structure and legacy workflows.json
   */
  async initialize(configPath?: string): Promise<void> {
    try {
      // ✨ Priority 2: Initialize ConfigManager first (before everything else)
      if (!this.configManager.isInitialized()) {
        await this.configManager.initialize()

        // Override globalSettings with config values if ConfigManager initialized
        if (this.configManager.isInitialized()) {
          const workflowEngineConfig = this.configManager.getWorkflowEngineConfig()
          this.globalSettings = {
            max_parallel_agents: workflowEngineConfig.max_parallel_agents,
            default_timeout: workflowEngineConfig.default_timeout,
            continue_on_partial_failure: workflowEngineConfig.continue_on_partial_failure,
            log_all_steps: workflowEngineConfig.log_all_steps,
            state_merge_strategy: workflowEngineConfig.state_merge_strategy
          }
          console.log('✅ ConfigManager loaded: global settings updated from config')
        }
      }

      // Try phase-based structure first
      const workflowsDir = path.join(process.cwd(), '.cursor/config/orchestration/workflows')

      if (await this.directoryExists(workflowsDir)) {
        console.log('📂 Loading workflows from phase-based structure...')
        const workflows = await this.loadPhaseBasedWorkflows(workflowsDir)

        this.workflows.clear()
        for (const workflow of workflows) {
          this.workflows.set(workflow.id, workflow)
        }

        this.initialized = true
        console.log(`✅ WorkflowEngine initialized: ${this.workflows.size} workflows loaded from phase-based structure`)

        // ✨ Phase 2: Initialize team manager
        await this.teamManager.initialize()
      } else {
        // Fallback to legacy workflows.json
        console.log('📂 Phase-based structure not found, loading from legacy workflows.json...')
        const workflowPath = configPath || path.join(
          process.cwd(),
          '.cursor/config/orchestration/workflows.json'
        )

        const data = await fs.readFile(workflowPath, 'utf-8')
        const config: WorkflowConfig = JSON.parse(data)

        // Load workflows
        this.workflows.clear()
        for (const workflow of config.workflows) {
          this.workflows.set(workflow.id, workflow)
        }

        // Load global settings (legacy workflows.json overrides take precedence over config file)
        if (config.global_settings) {
          this.globalSettings = { ...this.globalSettings, ...config.global_settings }
          console.log('💡 Note: Using global_settings from workflows.json (overrides orchestration.config.ts)')
        }

        this.initialized = true
        console.log(`✅ WorkflowEngine initialized: ${this.workflows.size} workflows loaded from legacy workflows.json`)
        console.log(`💡 Consider migrating to phase-based structure with: tsx .cursor/scripts/migrate-workflows-to-phases.ts`)

        // ✨ Phase 2: Initialize team manager
        await this.teamManager.initialize()
      }
    } catch (error) {
      console.error('❌ Failed to initialize WorkflowEngine:', error)
      throw error
    }
  }

  /**
   * Check if a directory exists
   */
  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      const stat = await fs.stat(dirPath)
      return stat.isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Load workflows from phase-based directory structure
   */
  private async loadPhaseBasedWorkflows(baseDir: string): Promise<Workflow[]> {
    const workflows: Workflow[] = []
    const phases = await fs.readdir(baseDir)

    // Filter for phase directories (match pattern: 1-quick-flow, 2-feature-development, etc.)
    const phaseDirectories = phases.filter(p => /^\d+-/.test(p))

    for (const phase of phaseDirectories) {
      const phaseDir = path.join(baseDir, phase)

      // Check if it's a directory
      const phaseStat = await fs.stat(phaseDir)
      if (!phaseStat.isDirectory()) continue

      // Read all JSON files in the phase directory
      const files = await fs.readdir(phaseDir)
      const jsonFiles = files.filter(f => f.endsWith('.json'))

      for (const file of jsonFiles) {
        const filePath = path.join(phaseDir, file)
        const data = await fs.readFile(filePath, 'utf-8')
        const workflow: Workflow = JSON.parse(data)

        // Inject phase metadata
        workflow.metadata = workflow.metadata || {}
        workflow.metadata.phase = phase.split('-')[0] // Extract phase number (e.g., "1")
        workflow.metadata.phase_name = phase.substring(phase.indexOf('-') + 1) // Extract phase name (e.g., "quick-flow")
        workflow.metadata.source_file = filePath

        workflows.push(workflow)
        console.log(`   ✓ Loaded ${workflow.id} from ${phase}/`)
      }
    }

    return workflows
  }

  /**
   * Get workflow by ID
   */
  getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId)
  }

  /**
   * Get all workflows
   */
  getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  /**
   * Find matching workflow for a task
   */
  findMatchingWorkflow(
    task: string,
    taskType?: string,
    requiredSkills?: string[]
  ): Workflow | null {
    const taskLower = task.toLowerCase()

    for (const workflow of this.workflows.values()) {
      const condition = workflow.trigger_condition

      // Check keywords match
      const keywordMatch = condition.keywords?.some(kw =>
        taskLower.includes(kw.toLowerCase())
      ) ?? false

      // Check task type match
      const taskTypeMatch = condition.task_types?.includes(taskType || '') ?? false

      // Check skills match
      const skillMatch = condition.required_skills?.some(skill =>
        requiredSkills?.includes(skill)
      ) ?? false

      // Match if any condition is met (keyword AND (taskType OR skill))
      if (keywordMatch && (taskTypeMatch || skillMatch || !taskType)) {
        return workflow
      }
    }

    return null
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(
    workflow: Workflow,
    initialState: AgentState
  ): Promise<WorkflowExecutionResult> {
    const startTime = Date.now()
    const stepResults: StepResult[] = []

    // ✨ Phase 3: Set current workflow for checklist access
    this.currentWorkflow = workflow

    console.log(`\n🔄 ═══════════════════════════════════════════════════`)
    console.log(`🔄 WORKFLOW: ${workflow.name}`)
    console.log(`🔄 ID: ${workflow.id}`)
    console.log(`🔄 Steps: ${workflow.steps.length}`)
    console.log(`🔄 Estimated: ${workflow.estimated_time}`)
    console.log(`🔄 ═══════════════════════════════════════════════════\n`)

    // ✨ Phase 2: Validate team reference if present
    if (workflow.team && this.teamManager.isInitialized()) {
      const validation = this.teamManager.validateWorkflowTeam(workflow)
      if (!validation.valid) {
        throw new Error(`Workflow team validation failed: ${validation.errors.join(', ')}`)
      }
      console.log(`✅ Team validation passed: ${workflow.team}`)
    }

    // ✨ Phase 3: Load checklist if available
    if (workflow.metadata?.source_file) {
      const checklist = await this.checklistManager.loadChecklist(
        workflow,
        workflow.metadata.source_file
      )
      if (checklist) {
        console.log(`📋 Checklist loaded: ${checklist.items.length} items`)
      }
    }

    // ✨ Priority 2 Phase 2: Load workflow instructions if available
    if (workflow.metadata?.source_file) {
      const workflowInstructions = await this.instructionManager.loadWorkflowInstructions(
        workflow,
        workflow.metadata.source_file
      )
      if (workflowInstructions) {
        console.log(`📝 Workflow instructions loaded for ${workflowInstructions.roleInstructions.size} roles`)
      }
    }

    // ✨ Day 8: Initialize phase tracking
    let state = this.phaseManager.initializePhaseTracking({ ...initialState })

    // ✨ BMad: Start metrics collection
    const workflowMetricsId = this.metricsCollector.startWorkflowMetrics(workflow, state)
    console.log(`📊 [BMad] Started metrics collection: ${workflowMetricsId}`)

    // ✨ BMad Day 2: Optimize workflow based on historical data
    const optimizedResult = await this.metricsOptimizer.analyzeWorkflow(workflow, true)
    if (optimizedResult.appliedOptimizations.length > 0) {
      console.log(`🚀 [MetricsOptimizer] Applied ${optimizedResult.appliedOptimizations.length} optimizations`)
      console.log(`⏱️  [MetricsOptimizer] Estimated time reduction: ${optimizedResult.estimatedTimeReduction}%`)
      workflow = optimizedResult.workflow
    } else if (optimizedResult.recommendations.length > 0) {
      console.log(`💡 [MetricsOptimizer] Generated ${optimizedResult.recommendations.length} recommendations (manual review required)`)
    }

    try {
      // Group steps by order (same order = parallel execution)
      const stepGroups = this.groupStepsByOrder(workflow.steps)

      for (let i = 0; i < stepGroups.length; i++) {
        const stepGroup = stepGroups[i]
        const groupOrder = stepGroup[0].order

        console.log(`\n📍 Step Group ${groupOrder} (${stepGroup.length} step${stepGroup.length > 1 ? 's' : ''})`)

        if (stepGroup.length > 1) {
          // ✨ PARALLEL execution
          console.log(`⚡ Executing ${stepGroup.length} agents in PARALLEL:`)
          stepGroup.forEach(step => console.log(`   - ${step.role_id} (${step.phase})`))

          const { newState, results } = await this.executeParallelSteps(stepGroup, state)
          state = newState
          stepResults.push(...results)
        } else {
          // Sequential execution
          const step = stepGroup[0]
          console.log(`→ Executing ${step.role_id} (${step.phase})`)

          const result = await this.executeStep(step, state)
          stepResults.push(result)

          if (result.success) {
            state = this.mergeStepResult(state, result)
          } else if (!this.globalSettings.continue_on_partial_failure) {
            throw new Error(`Step ${step.role_id}/${step.phase} failed: ${result.error}`)
          }
        }

        // Validate exit criteria for all steps in the group
        for (const step of stepGroup) {
          const stepResult = stepResults.find(
            r => r.step.role_id === step.role_id && r.step.phase === step.phase
          )

          if (stepResult?.success && !this.checkExitCriteria(step, state)) {
            console.warn(`⚠️  Exit criteria not fully met for ${step.role_id}: "${step.exit_criteria}"`)
          }
        }

        console.log(`✅ Step Group ${groupOrder} completed`)

        // ✨ Day 8: Phase transition and approval checkpoint logic
        // Check if we should transition to a new phase
        const currentPhase = stepGroup[0].phase as WorkflowPhase
        const statePhase = (state.metadata?.currentPhase as WorkflowPhase) || null

        // Transition to new phase if this is the first step in that phase
        if (currentPhase !== statePhase) {
          console.log(`\n🔄 Phase transition detected: ${statePhase} → ${currentPhase}`)

          // ✨ BMad: Record completion of previous phase
          if (statePhase) {
            this.metricsCollector.recordPhaseCompletion(statePhase)
          }

          state = await this.phaseManager.transitionPhase(state, currentPhase)
        }

        // Check if any step in this group requires approval
        const requiresApproval = stepGroup.some(step => step.requires_approval === true)

        if (requiresApproval || this.approvalCheckpoint.requiresApproval(currentPhase)) {
          console.log(`\n⏸️  Approval checkpoint required for phase: ${currentPhase}`)

          // Request approval
          const checkpointResult = await this.approvalCheckpoint.checkpointIfRequired(
            state,
            currentPhase
          )

          if (checkpointResult.shouldBlock) {
            if (!checkpointResult.approved) {
              console.log(`\n❌ Phase ${currentPhase} rejected - rolling back workflow`)

              // Store rejection reason in state
              if (checkpointResult.response?.feedback) {
                state = {
                  ...state,
                  metadata: {
                    ...state.metadata,
                    rejectionReason: checkpointResult.response.feedback
                  }
                }
              }

              // Rollback to previous phase
              state = await this.phaseManager.rollbackPhase(
                state,
                checkpointResult.response?.feedback || 'Approval rejected by user'
              )

              throw new Error(
                `Workflow halted: Phase ${currentPhase} approval rejected. ` +
                `Reason: ${checkpointResult.response?.feedback || 'User rejection'}`
              )
            } else {
              console.log(`✅ Phase ${currentPhase} approved - continuing workflow`)
            }
          }
        }

        // Check if we can exit the current phase
        const exitValidation = this.phaseManager.canExitPhase(state, currentPhase)
        if (!exitValidation.canProceed) {
          console.warn(`⚠️  Phase ${currentPhase} exit criteria not fully met:`)
          exitValidation.issues.forEach(issue => console.warn(`   - ${issue}`))
        }
        if (exitValidation.warnings.length > 0) {
          exitValidation.warnings.forEach(warning => console.warn(`⚠️  ${warning}`))
        }
      }

      const totalDuration = (Date.now() - startTime) / 1000

      // ✨ Day 8: Display phase progress
      const phaseProgress = this.phaseManager.getPhaseProgress(state)
      const isComplete = this.phaseManager.isWorkflowComplete(state)

      console.log(`\n✅ ═══════════════════════════════════════════════════`)
      console.log(`✅ WORKFLOW COMPLETE: ${workflow.name}`)
      console.log(`✅ Duration: ${totalDuration.toFixed(1)}s`)
      console.log(`✅ Steps executed: ${stepResults.length}`)
      console.log(`✅ Success: ${stepResults.filter(r => r.success).length}/${stepResults.length}`)
      console.log(`✅ Phase Progress: ${phaseProgress.percentComplete}% (${phaseProgress.completedPhases.length}/${this.phaseManager.getAllPhases().length} phases)`)
      console.log(`✅ Current Phase: ${phaseProgress.currentPhase || 'N/A'}`)
      console.log(`✅ Workflow Complete: ${isComplete ? 'YES' : 'NO'}`)

      // Display approval history
      const approvalStats = this.approvalCheckpoint.getStatistics()
      if (approvalStats.totalApprovals > 0) {
        console.log(`✅ Approvals: ${approvalStats.approved}/${approvalStats.totalApprovals} approved`)
      }

      console.log(`✅ ═══════════════════════════════════════════════════\n`)

      // ✨ BMad: Finalize and persist metrics
      await this.finalizeAndPersistMetrics(workflow, state, stepResults, true)

      return {
        workflow,
        success: true,
        totalDuration,
        stepResults,
        finalState: state
      }
    } catch (error) {
      const totalDuration = (Date.now() - startTime) / 1000

      console.error(`\n❌ ═══════════════════════════════════════════════════`)
      console.error(`❌ WORKFLOW FAILED: ${workflow.name}`)
      console.error(`❌ Duration: ${totalDuration.toFixed(1)}s`)
      console.error(`❌ Error: ${error}`)
      console.error(`❌ ═══════════════════════════════════════════════════\n`)

      // ✨ BMad: Finalize and persist metrics (failure case)
      await this.finalizeAndPersistMetrics(workflow, state, stepResults, false)

      return {
        workflow,
        success: false,
        totalDuration,
        stepResults,
        finalState: state,
        error: error instanceof Error ? error.message : String(error)
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(
    step: WorkflowStep,
    state: AgentState
  ): Promise<StepResult> {
    const startTime = Date.now()

    try {
      // Get agents with this role
      const agents = this.agentRegistry.getAgentsByRole(step.role_id)

      if (agents.length === 0) {
        throw new Error(`No agents found for role: ${step.role_id}`)
      }

      // Select best agent (by confidence)
      const agent = agents.sort((a, b) => b.confidence - a.confidence)[0]

      console.log(`   Starting: ${agent.role.name} (${step.phase})...`)

      // ✨ Phase 3: Display checklist before step execution
      if (this.currentWorkflow && this.checklistManager.hasChecklist(this.currentWorkflow.id)) {
        const phaseName = step.description || `${step.phase}`
        await this.checklistManager.promptChecklist(this.currentWorkflow.id, phaseName)
      }

      // ✨ Priority 2 Phase 2: Load and inject instructions into state
      const instructions = await this.instructionManager.getInstructionsForStep(
        step.role_id,
        step.phase,
        this.currentWorkflow?.id
      )

      // Enrich state with instructions
      const enrichedState: AgentState = {
        ...state,
        context: {
          ...state.context,
          instructions: instructions || undefined
        }
      }

      // ✨ BMad: Record step start
      this.metricsCollector.recordStepStart(step, agent.agentId)

      // Execute with timeout (use enriched state with instructions)
      const output = await this.executeWithTimeout(
        () => this.runAgent(agent, enrichedState),
        step.timeout || this.globalSettings.default_timeout,
        `${step.role_id}/${step.phase}`
      )

      const duration = (Date.now() - startTime) / 1000
      console.log(`   ✓ ${agent.role.name} completed in ${duration.toFixed(1)}s`)

      // ✨ Phase 3: Validate checklist completion criteria
      if (this.currentWorkflow && this.checklistManager.hasChecklist(this.currentWorkflow.id)) {
        const phaseName = step.description || `${step.phase}`
        const validation = this.checklistManager.validatePhaseComplete(
          this.currentWorkflow.id,
          phaseName
        )

        if (!validation.valid) {
          console.warn(`   ⚠️  Checklist incomplete for ${phaseName}:`)
          for (const item of validation.missingItems) {
            console.warn(`      ☐ ${item}`)
          }
          // Note: We don't block execution, just warn
          // To enable strict mode, add: throw new Error(`Checklist incomplete`)
        }
      }

      const stepResult: StepResult = {
        step,
        agentId: agent.agentId,
        success: true,
        duration,
        output
      }

      // ✨ BMad: Record step completion
      this.metricsCollector.recordStepCompletion(step, agent.agentId, stepResult, state)

      return stepResult
    } catch (error) {
      const duration = (Date.now() - startTime) / 1000

      console.error(`   ✗ ${step.role_id} failed after ${duration.toFixed(1)}s: ${error}`)

      const stepResult: StepResult = {
        step,
        agentId: step.role_id,
        success: false,
        duration,
        output: {},
        error: error instanceof Error ? error.message : String(error)
      }

      // ✨ BMad: Record step completion (failure)
      this.metricsCollector.recordStepCompletion(step, step.role_id, stepResult, state)

      return stepResult
    }
  }

  /**
   * Execute parallel steps
   */
  private async executeParallelSteps(
    steps: WorkflowStep[],
    state: AgentState
  ): Promise<{ newState: AgentState; results: StepResult[] }> {
    const startTime = Date.now()

    // Check max parallel limit
    if (steps.length > this.globalSettings.max_parallel_agents) {
      console.warn(
        `⚠️  Too many parallel steps (${steps.length}), chunking into groups of ${this.globalSettings.max_parallel_agents}...`
      )

      // Execute in chunks
      const chunks = this.chunkArray(steps, this.globalSettings.max_parallel_agents)
      let currentState = state
      const allResults: StepResult[] = []

      for (const chunk of chunks) {
        const { newState, results } = await this.executeParallelSteps(chunk, currentState)
        currentState = newState
        allResults.push(...results)
      }

      return { newState: currentState, results: allResults }
    }

    console.log('   ⚡ Starting parallel execution...')

    // Execute all steps in parallel with Promise.allSettled
    const resultPromises = steps.map(step => this.executeStep(step, state))
    const settledResults = await Promise.allSettled(resultPromises)

    // Process results
    const results: StepResult[] = []
    const successfulOutputs: Partial<AgentState>[] = []

    settledResults.forEach((settled, index) => {
      if (settled.status === 'fulfilled') {
        results.push(settled.value)
        if (settled.value.success) {
          successfulOutputs.push({
            ...settled.value.output,
            _agentId: settled.value.agentId,
            _phase: steps[index].phase
          } as any)
        }
      } else {
        results.push({
          step: steps[index],
          agentId: steps[index].role_id,
          success: false,
          duration: 0,
          output: {},
          error: settled.reason?.message || 'Unknown error'
        })
      }
    })

    const failed = results.filter(r => !r.success)
    if (failed.length > 0) {
      console.error(`   ⚠️  ${failed.length} agent(s) failed:`)
      failed.forEach(f => {
        console.error(`      - ${f.step.role_id}: ${f.error}`)
      })

      if (!this.globalSettings.continue_on_partial_failure && failed.length === results.length) {
        throw new Error('All parallel agents failed')
      }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`   ⚡ All parallel agents completed in ${totalDuration}s`)

    // Merge all successful outputs
    const newState = this.mergeParallelResults(state, successfulOutputs, results)

    return { newState, results }
  }

  /**
   * Run an agent
   */
  private async runAgent(
    agent: AgentWithRoleSkills,
    state: AgentState
  ): Promise<Partial<AgentState>> {
    // In production, this would create an instance and call execute()
    // For now, return a mock result showing the agent was selected
    return {
      currentAgent: agent.agentId,
      context: {
        ...state.context,
        [`${agent.agentId}_executed`]: true,
        [`${agent.agentId}_timestamp`]: new Date().toISOString()
      },
      agentResults: [
        ...state.agentResults,
        {
          agentId: agent.agentId,
          result: `Agent ${agent.agentId} executed successfully`,
          timestamp: new Date().toISOString()
        }
      ]
    }
  }

  /**
   * Execute with timeout
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeout: string,
    description: string
  ): Promise<T> {
    const ms = this.parseTimeout(timeout)

    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${description} timed out after ${timeout}`)),
          ms
        )
      )
    ])
  }

  /**
   * Parse timeout string (e.g., "15m", "1h", "30s")
   */
  private parseTimeout(timeout: string): number {
    const match = timeout.match(/^(\d+)(s|m|h)$/)
    if (!match) return 30 * 60 * 1000 // Default 30 min

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value * 1000
      case 'm': return value * 60 * 1000
      case 'h': return value * 60 * 60 * 1000
      default: return 30 * 60 * 1000
    }
  }

  /**
   * Group steps by order (same order = parallel)
   */
  private groupStepsByOrder(steps: WorkflowStep[]): WorkflowStep[][] {
    const groups = new Map<number, WorkflowStep[]>()

    for (const step of steps) {
      if (!groups.has(step.order)) {
        groups.set(step.order, [])
      }
      groups.get(step.order)!.push(step)
    }

    // Sort by order
    return Array.from(groups.entries())
      .sort(([a], [b]) => a - b)
      .map(([, steps]) => steps)
  }

  /**
   * Merge step result into state
   */
  private mergeStepResult(
    state: AgentState,
    result: StepResult
  ): AgentState {
    return {
      ...state,
      ...result.output,
      agentResults: [
        ...state.agentResults,
        ...(result.output.agentResults || [])
      ],
      context: {
        ...state.context,
        ...result.output.context
      }
    }
  }

  /**
   * Merge parallel results with namespace isolation
   */
  private mergeParallelResults(
    baseState: AgentState,
    outputs: Partial<AgentState>[],
    results: StepResult[]
  ): AgentState {
    // Namespace isolation strategy - each agent writes to its own namespace
    const mergedContext: Record<string, any> = { ...baseState.context }

    for (const output of outputs) {
      const agentId = (output as any)._agentId
      const phase = (output as any)._phase

      if (agentId) {
        // Store in namespaced key
        const namespace = `${agentId}_${phase}_findings`
        mergedContext[namespace] = output.context || {}
      }
    }

    // Collect all agent results
    const allResults = results
      .filter(r => r.success)
      .map(r => ({
        agentId: r.agentId,
        phase: r.step.phase,
        duration: r.duration,
        timestamp: new Date().toISOString()
      }))

    return {
      ...baseState,
      agentResults: [
        ...baseState.agentResults,
        ...allResults
      ],
      context: mergedContext,
      currentAgent: results[results.length - 1]?.agentId || baseState.currentAgent
    }
  }

  /**
   * Check exit criteria for a step
   */
  private checkExitCriteria(step: WorkflowStep, state: AgentState): boolean {
    // Check deliverables presence
    if (step.deliverables && step.deliverables.length > 0) {
      for (const deliverable of step.deliverables) {
        const hasDeliverable =
          state.context?.[deliverable] !== undefined ||
          state.context?.[`${step.role_id}_${deliverable}`] !== undefined

        if (!hasDeliverable) {
          return false
        }
      }
    }

    // Simple heuristic checks on exit criteria
    const criteria = step.exit_criteria.toLowerCase()
    const contextStr = JSON.stringify(state.context || {}).toLowerCase()

    // Check for common success indicators
    if (criteria.includes('pass') && contextStr.includes('fail')) {
      return false
    }

    return true
  }

  /**
   * Chunk array into smaller arrays
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  /**
   * Check if engine is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get global settings
   */
  getGlobalSettings(): WorkflowConfig['global_settings'] {
    return { ...this.globalSettings }
  }

  /**
   * ✨ Day 8: Get PhaseManager instance
   */
  getPhaseManager(): PhaseManager {
    return this.phaseManager
  }

  /**
   * ✨ Day 8: Get ApprovalCheckpoint instance
   */
  getApprovalCheckpoint(): ApprovalCheckpoint {
    return this.approvalCheckpoint
  }

  /**
   * ✨ Day 9: Get IterationManager instance
   */
  getIterationManager(): IterationManager {
    return this.iterationManager
  }

  /**
   * ✨ Day 8: Get current phase progress for a workflow state
   */
  getPhaseProgress(state: AgentState) {
    return this.phaseManager.getPhaseProgress(state)
  }

  /**
   * ✨ Day 8: Get approval history
   */
  getApprovalHistory() {
    return this.approvalCheckpoint.getHistory()
  }

  /**
   * ✨ Phase 2: Create workflow from team definition
   *
   * Generates a workflow by converting team agents to workflow steps.
   * Useful for dynamic workflow creation based on team templates.
   *
   * @param teamId - Team identifier
   * @param workflowId - Unique ID for the generated workflow
   * @param name - Human-readable workflow name
   * @param description - Optional workflow description
   * @returns Generated workflow ready for execution
   * @throws Error if team not found or team manager not initialized
   */
  createWorkflowFromTeam(
    teamId: string,
    workflowId: string,
    name: string,
    description?: string
  ): Workflow {
    if (!this.teamManager.isInitialized()) {
      throw new Error('TeamManager not initialized. Run initialize() first.')
    }

    const team = this.teamManager.getTeam(teamId)
    if (!team) {
      throw new Error(`Team not found: ${teamId}`)
    }

    const steps = this.teamManager.teamToSteps(teamId)
    const teamMetrics = this.teamManager.getTeamMetrics(teamId)

    return {
      id: workflowId,
      name,
      description: description || `Generated from team: ${team.name}`,
      trigger_condition: {
        keywords: [],
        task_types: [],
        required_skills: []
      },
      steps,
      team: teamId,
      estimated_time: teamMetrics?.estimatedDuration || 'unknown',
      success_criteria: 'All team phases completed successfully',
      metadata: {
        generated_from_team: true,
        team_id: teamId,
        team_name: team.name
      }
    }
  }

  /**
   * ✨ Phase 2: Get TeamManager instance
   */
  getTeamManager(): TeamManager {
    return this.teamManager
  }

  /**
   * ✨ Phase 3: Get ChecklistManager instance
   */
  getChecklistManager(): ChecklistManager {
    return this.checklistManager
  }

  /**
   * ✨ Priority 2: Get ConfigManager instance
   */
  getConfigManager(): ConfigManager {
    return this.configManager
  }

  /**
   * ✨ Priority 2 Phase 2: Get InstructionManager instance
   */
  getInstructionManager(): InstructionManager {
    return this.instructionManager
  }

  /**
   * ✨ Day 8: Display phase and approval summary
   */
  displayWorkflowSummary(state: AgentState): void {
    console.log('\n' + '='.repeat(80))
    console.log('📊 WORKFLOW SUMMARY')
    console.log('='.repeat(80))

    // Phase progress
    const progress = this.phaseManager.getPhaseProgress(state)
    console.log(`\n🔄 Phase Progress: ${progress.percentComplete}%`)
    console.log(`   Current Phase: ${progress.currentPhase || 'Not started'}`)
    console.log(`   Completed: ${progress.completedPhases.join(', ') || 'None'}`)
    console.log(`   Remaining: ${progress.remainingPhases.join(', ') || 'None'}`)

    // Phase history
    const history = this.phaseManager.getPhaseHistory(state)
    if (history.length > 0) {
      console.log(`\n📜 Phase Transitions:`)
      history.forEach((transition, index) => {
        const status = transition.success ? '✅' : '❌'
        console.log(`   ${index + 1}. ${status} ${transition.from || 'START'} → ${transition.to}`)
        if (transition.reason) {
          console.log(`      Reason: ${transition.reason}`)
        }
      })
    }

    // Approval history
    const approvalHistory = this.approvalCheckpoint.formatHistory()
    console.log(approvalHistory)

    // Approval Statistics
    const stats = this.approvalCheckpoint.getStatistics()
    console.log(`\n📈 Approval Statistics:`)
    console.log(`   Total Checkpoints: ${stats.totalApprovals}`)
    console.log(`   Approved: ${stats.approved}`)
    console.log(`   Rejected: ${stats.rejected}`)
    console.log(`   Auto-Approved: ${stats.autoApproved}`)
    console.log(`   Timed Out: ${stats.timedOut}`)
    if (stats.averageDurationMs > 0) {
      console.log(`   Average Duration: ${(stats.averageDurationMs / 1000).toFixed(1)}s`)
    }

    // ✨ Day 9: Iteration/Retry Statistics
    const iterStats = this.iterationManager.getGlobalStatistics()
    if (iterStats.totalExecutions > 0) {
      console.log(`\n🔄 Retry Statistics:`)
      console.log(`   Total Agents with Retries: ${iterStats.totalAgents}`)
      console.log(`   Total Executions: ${iterStats.totalExecutions}`)
      console.log(`   Successful: ${iterStats.successfulExecutions} (${iterStats.overallSuccessRate.toFixed(1)}%)`)
      console.log(`   Failed: ${iterStats.failedExecutions}`)
      console.log(`   Total Retries: ${iterStats.totalRetries}`)
      console.log(`   Average Retries per Execution: ${iterStats.averageRetriesPerExecution.toFixed(2)}`)
    }

    console.log('='.repeat(80) + '\n')
  }

  /**
   * ✨ BMad: Finalize and persist metrics with learning loop analysis
   */
  private async finalizeAndPersistMetrics(
    workflow: Workflow,
    state: AgentState,
    stepResults: StepResult[],
    success: boolean
  ): Promise<void> {
    try {
      // Check if metrics collection is active
      if (!this.metricsCollector.isCollecting()) {
        console.warn('⚠️  [BMad] Metrics collection not active, skipping finalization')
        return
      }

      console.log(`\n📊 [BMad] Finalizing workflow metrics...`)

      // 1. Finalize workflow metrics
      const workflowMetrics = this.metricsCollector.finalizeMetrics(workflow, state, success)

      // 2. Get step metrics
      const stepMetrics = this.metricsCollector.getStepMetrics()

      console.log(`📊 [BMad] Collected ${stepMetrics.length} step metrics`)

      // 3. Check if database is connected
      const isConnected = await this.metricsPersister.isConnected()

      if (!isConnected) {
        console.warn('⚠️  [BMad] Database not connected, metrics will not be persisted')
        console.log(`📊 [BMad] Metrics summary:`)
        console.log(`   Workflow: ${workflowMetrics.workflowName}`)
        console.log(`   Duration: ${(workflowMetrics.totalDurationMs / 1000).toFixed(1)}s`)
        console.log(`   Success: ${workflowMetrics.success}`)
        console.log(`   Steps: ${workflowMetrics.stepCount}`)
        console.log(`   Parallel Steps: ${workflowMetrics.parallelStepsExecuted}`)

        // Reset collector for next workflow
        this.metricsCollector.reset()
        return
      }

      // 4. Persist workflow metrics
      await this.metricsPersister.persistWorkflowMetrics(workflowMetrics)

      // 5. Persist step metrics
      if (stepMetrics.length > 0) {
        await this.metricsPersister.persistStepMetrics(stepMetrics)
      }

      console.log(`✅ [BMad] Metrics persisted successfully`)

      // 6. Run learning loop analysis (async, non-blocking)
      console.log(`🔄 [BMad] Starting learning loop analysis...`)

      // Get historical metrics for comparison (last 10 executions of this workflow)
      const historicalMetrics = await this.metricsPersister.getWorkflowHistory(
        workflow.name,
        10
      )

      // Analyze execution and generate insights
      const learningSession = await this.learningLoop.analyzeExecution(
        workflowMetrics,
        stepMetrics,
        historicalMetrics
      )

      console.log(`✅ [BMad] Learning loop analysis complete`)
      console.log(`   Findings: ${learningSession.findings.length}`)
      console.log(`   Recommendations: ${learningSession.recommendations.length}`)
      console.log(`   Confidence: ${(learningSession.confidenceScore * 100).toFixed(0)}%`)

      // Display high-priority findings
      const highPriorityFindings = learningSession.findings.filter(f => f.priority === 'high')
      if (highPriorityFindings.length > 0) {
        console.log(`\n🔍 [BMad] High Priority Findings:`)
        highPriorityFindings.forEach((finding, index) => {
          console.log(`   ${index + 1}. [${finding.type}] ${finding.description}`)
          console.log(`      → ${finding.recommendation}`)
        })
      }

      // Display recommendations
      if (learningSession.recommendations.length > 0) {
        console.log(`\n💡 [BMad] Recommendations:`)
        learningSession.recommendations.slice(0, 3).forEach((rec, index) => {
          console.log(`   ${index + 1}. ${rec}`)
        })
      }

      // ✨ BMad Day 3: Generate retrospective analysis
      console.log(`\n🔍 [RetrospectiveAgent] Generating retrospective analysis...`)

      const retrospective = await this.retrospectiveAgent.generateRetrospective(
        workflowMetrics,
        stepMetrics,
        learningSession.findings
      )

      // Save retrospective report to file
      await this.retrospectiveReportGenerator.generateReport(retrospective)

      // Display top recommendations in console
      this.retrospectiveReportGenerator.displayTopRecommendations(retrospective, 3)

      // Reset collector for next workflow
      this.metricsCollector.reset()

      console.log(`\n✅ [BMad] Workflow metrics finalization complete\n`)
    } catch (error) {
      console.error(`❌ [BMad] Error finalizing metrics:`, error)
      // Don't throw - metrics failure shouldn't break workflow execution
      // But reset collector to prevent state corruption
      this.metricsCollector.reset()
    }
  }
}
