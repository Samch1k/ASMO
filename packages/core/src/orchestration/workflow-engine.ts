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
 * - Phase tracking with PhaseManager
 * - Approval checkpoints at phase boundaries
 */

import type { AgentState, AgentWithRoleSkills } from '../agents/types'
import type { AgentRegistry } from './agent-registry'
import type { SkillMatcher } from './skill-matcher'
import { PhaseManager, WorkflowPhase } from './phase-manager'
import { ApprovalCheckpoint, ApprovalCheckpointConfig } from './approval-checkpoint'
import { IterationManager, RetryConfig } from './iteration-manager'
import { MetricsCollector } from './metrics-collector'
import { MetricsPersister } from './metrics-persister'
import { MetricsOptimizer } from './metrics-optimizer'
import { LearningLoop } from './learning-loop'
import { RetrospectiveAgent } from './retrospective-agent'
import { RetrospectiveReportGenerator } from './retrospective-report-generator'
import { getTeamManager, type TeamManager } from './team-manager'
import { getChecklistManager, type ChecklistManager } from './checklist-manager'
import { getConfigManager, type ConfigManager } from './config/config-manager'
import { getInstructionManager, type InstructionManager } from './instruction-manager'
import { getRoutingLogger } from './routing-logger'
// Adaptive workflow selection
import { ComplexityAnalyzer } from './complexity-analyzer'
import { WorkflowSelector } from './workflow-selector'
// Test enforcement validator
import { TestEnforcementValidator } from './validators/test-enforcement-validator'
// Principle validators (Bob, Winston, John)
import {
  ZeroAmbiguityValidator,
  BoringTechnologyValidator,
  WhyFirstValidator,
  type ValidationResult
} from './validators/principle-validators'
import { getCircuitBreakerManager, CircuitOpenError } from './reliability'
import { ContextCascade } from './context-cascade'
import type {
  Workflow,
  WorkflowStep,
  WorkflowConfig,
  StepResult,
  WorkflowExecutionResult,
  ProjectContext,
  WorkflowSelectionWithPhase
} from './types'
import fs from 'fs/promises'
import path from 'path'
import os from 'os'

/**
 * Options for WorkflowEngine constructor (dependency injection)
 */
export interface WorkflowEngineOptions {
  agentRegistry: AgentRegistry
  approvalConfig?: ApprovalCheckpointConfig
  retryConfig?: RetryConfig
  databaseUrl?: string
  verbose?: boolean  // Enable verbose logging
  configManager?: ConfigManager
  phaseManager?: PhaseManager
  approvalCheckpoint?: ApprovalCheckpoint
  iterationManager?: IterationManager
  metricsCollector?: MetricsCollector
  metricsPersister?: MetricsPersister
  metricsOptimizer?: MetricsOptimizer
  learningLoop?: LearningLoop
  retrospectiveAgent?: RetrospectiveAgent
  retrospectiveReportGenerator?: RetrospectiveReportGenerator
  teamManager?: TeamManager
  checklistManager?: ChecklistManager
  instructionManager?: InstructionManager
  complexityAnalyzer?: ComplexityAnalyzer
  workflowSelector?: WorkflowSelector
  contextCascade?: ContextCascade
  testEnforcementValidator?: TestEnforcementValidator
  principleValidators?: {
    zeroAmbiguity: ZeroAmbiguityValidator
    boringTechnology: BoringTechnologyValidator
    whyFirst: WhyFirstValidator
  }
}

/**
 * WorkflowEngine - Executes multi-agent workflows
 */
export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map()
  private globalSettings!: WorkflowConfig['global_settings']
  private initialized = false
  private currentWorkflow: Workflow | null = null // Track current workflow for checklist access
  private currentComplexityScore: number | undefined
  private currentWorkflowName: string | undefined
  private verbose: boolean = false

  // All fields below are initialized in initializeComponents() called from constructor
  private agentRegistry!: AgentRegistry
  private phaseManager!: PhaseManager
  private approvalCheckpoint!: ApprovalCheckpoint
  private iterationManager!: IterationManager
  private metricsCollector!: MetricsCollector
  private metricsPersister!: MetricsPersister
  private metricsOptimizer!: MetricsOptimizer
  private learningLoop!: LearningLoop
  private retrospectiveAgent!: RetrospectiveAgent
  private retrospectiveReportGenerator!: RetrospectiveReportGenerator
  private teamManager!: TeamManager
  private checklistManager!: ChecklistManager
  private configManager!: ConfigManager
  private instructionManager!: InstructionManager
  private complexityAnalyzer!: ComplexityAnalyzer
  private workflowSelector!: WorkflowSelector
  private contextCascade!: ContextCascade
  private testEnforcementValidator!: TestEnforcementValidator
  private principleValidators!: {
    zeroAmbiguity: ZeroAmbiguityValidator
    boringTechnology: BoringTechnologyValidator
    whyFirst: WhyFirstValidator
  }

  /**
   * Create a WorkflowEngine with all dependencies auto-initialized.
   * This is the recommended way to create a WorkflowEngine instance.
   *
   * @param agentRegistry - Agent registry for agent resolution
   * @param approvalConfig - Optional approval checkpoint configuration
   * @param retryConfig - Optional retry configuration
   * @param databaseUrl - Optional database URL for metrics persistence
   * @param verbose - Enable verbose logging
   * @returns Fully initialized WorkflowEngine
   */
  static create(
    agentRegistry: AgentRegistry,
    approvalConfig?: ApprovalCheckpointConfig,
    retryConfig?: RetryConfig,
    databaseUrl?: string,
    verbose?: boolean
  ): WorkflowEngine {
    const configManager = getConfigManager()

    const complexityConfig = configManager.isInitialized()
      ? configManager.getConfig().complexityAnalyzer
      : undefined

    const workflowSelectorConfig = configManager.isInitialized()
      ? configManager.getConfig().workflowSelector
      : undefined

    const metricsPersister = new MetricsPersister(databaseUrl)

    return new WorkflowEngine({
      agentRegistry,
      approvalConfig,
      retryConfig,
      databaseUrl,
      verbose,
      configManager,
      phaseManager: new PhaseManager(),
      approvalCheckpoint: new ApprovalCheckpoint(
        approvalConfig || (configManager.isInitialized()
          ? configManager.getApprovalCheckpointConfig()
          : undefined)
      ),
      iterationManager: new IterationManager(
        retryConfig || (configManager.isInitialized()
          ? configManager.getIterationManagerConfig()
          : undefined)
      ),
      metricsCollector: new MetricsCollector(),
      metricsPersister,
      metricsOptimizer: new MetricsOptimizer(metricsPersister),
      learningLoop: new LearningLoop(metricsPersister),
      retrospectiveAgent: new RetrospectiveAgent(metricsPersister),
      retrospectiveReportGenerator: new RetrospectiveReportGenerator(),
      teamManager: getTeamManager(),
      checklistManager: getChecklistManager(),
      instructionManager: getInstructionManager(),
      complexityAnalyzer: new ComplexityAnalyzer(complexityConfig, verbose),
      workflowSelector: new WorkflowSelector(workflowSelectorConfig, verbose),
      contextCascade: new ContextCascade(),
      testEnforcementValidator: new TestEnforcementValidator(),
      principleValidators: {
        zeroAmbiguity: new ZeroAmbiguityValidator(),
        boringTechnology: new BoringTechnologyValidator(),
        whyFirst: new WhyFirstValidator()
      }
    })
  }

  constructor(options: WorkflowEngineOptions)
  /**
   * @deprecated Use WorkflowEngine.create() or new WorkflowEngine(options) instead
   */
  constructor(
    agentRegistry: AgentRegistry,
    _skillMatcher?: SkillMatcher,
    approvalConfig?: ApprovalCheckpointConfig,
    retryConfig?: RetryConfig,
    databaseUrl?: string
  )
  constructor(
    agentRegistryOrOptions: AgentRegistry | WorkflowEngineOptions,
    _skillMatcher?: SkillMatcher,
    approvalConfig?: ApprovalCheckpointConfig,
    retryConfig?: RetryConfig,
    databaseUrl?: string
  ) {
    // Support both new options-based and legacy positional arguments
    if (typeof agentRegistryOrOptions === 'object' && 'agentRegistry' in agentRegistryOrOptions) {
      this.initializeComponents(agentRegistryOrOptions as WorkflowEngineOptions)
    } else {
      // Legacy constructor path — build options and delegate
      const agentRegistry = agentRegistryOrOptions as AgentRegistry
      const configManager = getConfigManager()

      const legacyOpts: WorkflowEngineOptions = {
        agentRegistry,
        approvalConfig: approvalConfig || (configManager.isInitialized()
          ? configManager.getApprovalCheckpointConfig()
          : undefined),
        retryConfig: retryConfig || (configManager.isInitialized()
          ? configManager.getIterationManagerConfig()
          : undefined),
        databaseUrl,
        configManager,
        complexityAnalyzer: new ComplexityAnalyzer(
          configManager.isInitialized() ? configManager.getConfig().complexityAnalyzer : undefined
        ),
        workflowSelector: new WorkflowSelector(
          configManager.isInitialized() ? configManager.getConfig().workflowSelector : undefined
        )
      }

      this.initializeComponents(legacyOpts)
    }

    console.log('[WorkflowEngine] Initialized with phase tracking, metrics, validators, and adaptive selection')
  }

  /**
   * Shared initialization for both constructor paths
   */
  private initializeComponents(opts: WorkflowEngineOptions): void {
    this.agentRegistry = opts.agentRegistry
    this.configManager = opts.configManager || getConfigManager()
    this.verbose = opts.verbose ?? false

    this.globalSettings = {
      max_parallel_agents: 5,
      default_timeout: '30m',
      continue_on_partial_failure: false,
      log_all_steps: true,
      state_merge_strategy: 'namespace_isolation'
    }

    this.phaseManager = opts.phaseManager || new PhaseManager()
    this.approvalCheckpoint = opts.approvalCheckpoint || new ApprovalCheckpoint(opts.approvalConfig)
    this.iterationManager = opts.iterationManager || new IterationManager(opts.retryConfig)
    this.metricsCollector = opts.metricsCollector || new MetricsCollector()
    this.metricsPersister = opts.metricsPersister || new MetricsPersister(opts.databaseUrl)
    this.metricsOptimizer = opts.metricsOptimizer || new MetricsOptimizer(this.metricsPersister)
    this.learningLoop = opts.learningLoop || new LearningLoop(this.metricsPersister)
    this.retrospectiveAgent = opts.retrospectiveAgent || new RetrospectiveAgent(this.metricsPersister)
    this.retrospectiveReportGenerator = opts.retrospectiveReportGenerator || new RetrospectiveReportGenerator()
    this.teamManager = opts.teamManager || getTeamManager()
    this.checklistManager = opts.checklistManager || getChecklistManager()
    this.instructionManager = opts.instructionManager || getInstructionManager()
    this.complexityAnalyzer = opts.complexityAnalyzer || new ComplexityAnalyzer(undefined, this.verbose)
    this.workflowSelector = opts.workflowSelector || new WorkflowSelector(undefined, this.verbose)
    this.contextCascade = opts.contextCascade || new ContextCascade()
    this.testEnforcementValidator = opts.testEnforcementValidator || new TestEnforcementValidator()
    this.principleValidators = opts.principleValidators || {
      zeroAmbiguity: new ZeroAmbiguityValidator(),
      boringTechnology: new BoringTechnologyValidator(),
      whyFirst: new WhyFirstValidator()
    }

    // Initialize global routing logger with verbose mode
    getRoutingLogger({ verbose: this.verbose })
  }

  /**
   * Initialize workflow engine by loading workflows from config
   * Supports both phase-based structure and legacy workflows.json
   *
   * Fallback chain for workflows:
   * 1. .cursor/config/orchestration/workflows (Claude Code)
   * 2. ~/.asmo/config/workflows (user home)
   * 3. packages/core/templates/workflows (bundled, always available)
   */
  async initialize(configPath?: string): Promise<void> {
    try {
      // Initialize ConfigManager first (before everything else)
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
          console.log('[WorkflowEngine] ConfigManager loaded')
        }
      }

      // Define fallback chain for phase-based workflows
      const workflowPaths = [
        path.join(process.cwd(), '.cursor/config/orchestration/workflows'),  // Claude Code
        path.join(os.homedir(), '.asmo/config/workflows'),                   // User home
        path.join(process.cwd(), 'packages/core/templates/workflows'),       // Monorepo dev
        path.join(__dirname, '../templates/workflows'),                       // Bundled ESM (dist → templates)
        path.join(__dirname, '../../templates/workflows')                     // Bundled legacy
      ]

      // Try each path in the fallback chain
      let loadedFrom: string | null = null
      for (const workflowsDir of workflowPaths) {
        if (await this.directoryExists(workflowsDir)) {
          console.log(`[WorkflowEngine] Loading workflows from: ${workflowsDir}`)
          const workflows = await this.loadPhaseBasedWorkflows(workflowsDir)

          this.workflows.clear()
          for (const workflow of workflows) {
            this.workflows.set(workflow.id, workflow)
          }

          loadedFrom = workflowsDir

          // Register workflows with WorkflowSelector for adaptive selection
          this.complexityAnalyzer.registerWorkflows(Array.from(this.workflows.values()))
          this.workflowSelector.registerWorkflows(Array.from(this.workflows.values()))
          console.log(`[WorkflowEngine] ${this.workflows.size} workflows loaded`)

          // Initialize team manager
          await this.teamManager.initialize()

          // Set initialized flag AFTER all components are ready
          this.initialized = true

          break  // Success - stop trying other paths
        }
      }

      // If phase-based loading failed, try legacy workflows.json fallback
      if (!loadedFrom) {
        console.log('[WorkflowEngine] Phase-based structure not found, trying legacy workflows.json...')

        const legacyPaths = [
          configPath,  // User-specified path (if provided)
          path.join(process.cwd(), '.cursor/config/orchestration/workflows.json'),
          path.join(os.homedir(), '.asmo/config/workflows.json')
        ].filter(Boolean) as string[]

        for (const workflowPath of legacyPaths) {
          try {
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
              console.log('[WorkflowEngine] Using global_settings from workflows.json')
            }

            loadedFrom = workflowPath

            // Register workflows with complexity analyzer and selector
            const workflowsToRegister = Array.from(this.workflows.values())
            this.complexityAnalyzer.registerWorkflows(workflowsToRegister)
            this.workflowSelector.registerWorkflows(workflowsToRegister)

            console.log(`[WorkflowEngine] ${this.workflows.size} workflows loaded from legacy workflows.json (${workflowPath})`)

            // Initialize team manager
            await this.teamManager.initialize()

            // Set initialized flag AFTER all components are ready
            this.initialized = true

            break  // Success - stop trying other paths
          } catch {
            // Continue to next path if this one fails
            continue
          }
        }
      }

      // If still not loaded, throw error
      if (!loadedFrom) {
        throw new Error(
          'Failed to load workflows from any location. Tried:\n' +
          workflowPaths.map(p => `  - ${p}`).join('\n') + '\n' +
          'Ensure workflows exist in one of these locations.'
        )
      }

      // Apply learning feedback: optimize workflows based on historical metrics
      await this.applyLearningOptimizations()
    } catch (error) {
      console.error('[WorkflowEngine] Failed to initialize:', error)
      throw error
    }
  }

  /**
   * Apply learning optimizations to loaded workflows
   * Uses MetricsOptimizer to analyze historical data and apply safe optimizations
   */
  private async applyLearningOptimizations(): Promise<void> {
    try {
      let totalApplied = 0

      for (const [workflowId, workflow] of this.workflows) {
        const result = await this.metricsOptimizer.analyzeWorkflow(workflow, true)

        if (result.appliedOptimizations.length > 0) {
          // Replace workflow with optimized version
          this.workflows.set(workflowId, result.workflow)
          totalApplied += result.appliedOptimizations.length

          console.log(
            `[Learning] Applied ${result.appliedOptimizations.length} optimizations to "${workflow.name}": ` +
            result.appliedOptimizations.map(o => o.type).join(', ')
          )
        }
      }

      if (totalApplied > 0) {
        console.log(`[Learning] Total optimizations applied: ${totalApplied}`)
      }
    } catch (error) {
      // Non-blocking: learning failure shouldn't prevent workflow engine from working
      console.warn('[Learning] Failed to apply optimizations:', error)
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
   * Select workflow adaptively based on task complexity
   *
   * NEW: BMAD Phase 1.5 - Adaptive workflow selection
   *
   * This method uses ComplexityAnalyzer to understand the task complexity
   * and WorkflowSelector to choose the most appropriate workflow.
   *
   * @param taskDescription - Natural language task description
   * @param context - Optional project context for better analysis
   * @param userPreference - Optional user-specified workflow ID (overrides auto-selection)
   * @returns WorkflowSelectionWithPhase with workflow, complexity, phase detection, and reasoning
   */
  async selectWorkflowAdaptively(
    taskDescription: string,
    context?: ProjectContext,
    userPreference?: string
  ): Promise<WorkflowSelectionWithPhase> {
    if (!this.initialized) {
      throw new Error('WorkflowEngine not initialized. Call initialize() first.')
    }

    // Register current workflows with selector
    const workflows = Array.from(this.workflows.values())
    this.workflowSelector.registerWorkflows(workflows)

    // Select workflow with phase detection (gracefully degrades when PhaseDetector unavailable)
    const selection = await this.workflowSelector.selectWorkflowWithPhase(
      taskDescription,
      context,
      userPreference
    )

    // Log complexity analysis and recommendation
    console.log(`[WorkflowSelection] ${selection.workflow.name} (${selection.workflow.id}) | complexity: ${selection.complexity.level} (${selection.complexity.score}/100) | confidence: ${(selection.confidence * 100).toFixed(0)}%`)

    if (selection.joinPoint && selection.joinPoint > 0) {
      console.log(`[WorkflowSelection] Phase detection: join at "${selection.phase}" (step ${selection.joinPoint}), skipping: ${selection.skipPhases?.join(' → ') || 'none'}`)
    }

    // If confidence is low, show alternatives
    if (!this.workflowSelector.shouldAutoSelect(selection.confidence)) {
      console.log(`[WorkflowSelection] Low confidence. Alternatives: ${selection.alternatives.map(a => `${a.workflowId} (${(a.confidence * 100).toFixed(0)}%)`).join(', ')}`)
    }

    return selection
  }

  /**
   * Execute a workflow with adaptive input resolution
   *
   * Accepts 2 types of input (resolved in priority order):
   * 1. Workflow ID: "bug_fix_workflow" → direct specification
   * 2. Natural language: "Fix login bug" → adaptive selection
   *
   * @param workflowIdOrDescription - Workflow ID or task description
   * @param initialState - Initial agent state (optional)
   * @param context - Project context for adaptive selection (optional)
   * @returns Workflow execution result with success status and outputs
   */
  async execute(
    workflowIdOrDescription: string,
    initialState?: Partial<AgentState>,
    context?: ProjectContext
  ): Promise<WorkflowExecutionResult> {
    if (!this.initialized) {
      throw new Error('WorkflowEngine not initialized. Call initialize() first.')
    }

    if (this.verbose) {
      console.log('\n🚀 [WorkflowEngine] Starting execution...')
      console.log(`   Input: ${workflowIdOrDescription.slice(0, 80)}${workflowIdOrDescription.length > 80 ? '...' : ''}`)
    }

    // Resolve input → workflow + state + optional phase join point
    const { workflow, state, startPhase } = await this.resolveInput(
      workflowIdOrDescription,
      initialState,
      context
    )

    if (this.verbose) {
      console.log(`   Workflow: ${workflow.name} (${workflow.id})`)
      if (startPhase) {
        console.log(`   Starting from phase: ${startPhase}`)
      }
    }

    // Phase-aware execution when join point detected
    if (startPhase) {
      return this.executeFromPhase(workflow, startPhase, state, context)
    }

    // Execute workflow from the beginning
    return this.executeWorkflow(workflow, state)
  }

  /**
   * Resolve user input to workflow and initial state
   *
   * Resolution strategies (priority order):
   * 1. Workflow ID (exact match) - direct lookup + complexity analysis for YOLO
   * 2. Natural Language (adaptive) - delegates to WorkflowSelector + ComplexityAnalyzer + PhaseDetector
   *
   * @private
   * @param input - User input string
   * @param initialState - Optional initial state to merge
   * @param context - Optional project context for adaptive selection
   * @returns Resolved workflow, constructed AgentState, and optional startPhase for phase joining
   */
  private async resolveInput(
    input: string,
    initialState?: Partial<AgentState>,
    context?: ProjectContext
  ): Promise<{ workflow: Workflow; state: AgentState; startPhase?: string }> {

    // 1. Workflow ID (direct specification)
    if (this.isWorkflowId(input)) {
      const workflow = this.workflows.get(input)

      if (!workflow) {
        throw new Error(`Workflow not found: ${input}`)
      }

      console.log(`[ResolveInput] Path: direct ID → ${workflow.name} (${workflow.id})`)

      // Run complexity analysis for YOLO mode,
      // but only if score not already computed (e.g., from prior selectWorkflowAdaptively)
      if (this.currentComplexityScore === undefined) {
        const taskDescription = initialState?.task || input
        console.log(`[ResolveInput] Running complexity analysis for YOLO scoring...`)
        const complexity = await this.complexityAnalyzer.analyzeTask(taskDescription, context)
        this.currentComplexityScore = complexity.score
        console.log(`[ResolveInput] Complexity score: ${complexity.score}/100 (${complexity.level})`)
      }
      this.currentWorkflowName = workflow.name

      return {
        workflow,
        state: this.buildState(initialState, input)
      }
    }

    // 2. Natural Language (via WorkflowSelector - adaptive)
    console.log(`[ResolveInput] Path: natural language → adaptive selection`)
    const selection = await this.selectWorkflowAdaptively(input, context)
    this.currentComplexityScore = selection.complexity.score
    this.currentWorkflowName = selection.workflow.name

    const hasPhaseJoin = selection.joinPoint && selection.joinPoint > 0
    const state = this.buildState(initialState, input)
    if (hasPhaseJoin) {
      console.log(`[ResolveInput] Phase join detected: starting at "${selection.phase}" (step ${selection.joinPoint})`)
    }

    // Record phase detection info in metadata for logs/reports
    if (hasPhaseJoin) {
      state.metadata = {
        ...state.metadata,
        phaseDetection: {
          phase: selection.phase,
          confidence: selection.phaseConfidence,
          reasoning: selection.phaseReasoning,
          skipPhases: selection.skipPhases,
          joinPoint: selection.joinPoint
        }
      }
    }

    return {
      workflow: selection.workflow,
      state,
      startPhase: hasPhaseJoin ? selection.phase : undefined
    }
  }

  /**
   * Check if input is a workflow ID
   * @private
   */
  private isWorkflowId(input: string): boolean {
    return this.workflows.has(input)
  }

  /**
   * Build AgentState from initial state and task
   * @private
   */
  private buildState(
    initialState: Partial<AgentState> | undefined,
    task: string
  ): AgentState {
    return {
      messages: initialState?.messages || [],
      task: initialState?.task || task,
      taskType: initialState?.taskType || 'feature',
      context: initialState?.context || {},
      currentAgent: initialState?.currentAgent || '',
      agentResults: initialState?.agentResults || [],
      mcpData: initialState?.mcpData || {},
      nextAction: initialState?.nextAction || '',
      requiresApproval: initialState?.requiresApproval ?? false,
      ...initialState // Spread any additional optional fields
    }
  }

  /**
   * Execute workflow from a specific phase
   *
   * NEW: Adaptive Workflow System - Phase Joining
   *
   * This method allows starting a workflow from any phase,
   * skipping earlier phases when context indicates they're already complete.
   *
   * Handles parallel steps: if multiple steps share the same phase,
   * uses the minimum index for skip calculation.
   *
   * @param workflow - Workflow to execute
   * @param startPhase - Phase to start from (e.g., 'review', 'refactoring')
   * @param initialState - Initial agent state
   * @param context - Project context (optional)
   * @returns Workflow execution result
   */
  async executeFromPhase(
    workflow: Workflow,
    startPhase: string,
    initialState?: Partial<AgentState>,
    context?: ProjectContext
  ): Promise<WorkflowExecutionResult> {
    if (!this.initialized) {
      throw new Error('WorkflowEngine not initialized. Call initialize() first.')
    }

    // Find ALL steps with target phase (for parallel execution support)
    const phaseSteps = workflow.steps
      .map((step, index) => ({ step, index }))
      .filter(({ step }) => step.phase === startPhase)

    if (phaseSteps.length === 0) {
      throw new Error(
        `Phase "${startPhase}" not found in workflow "${workflow.name}". ` +
        `Available phases: ${[...new Set(workflow.steps.map(s => s.phase))].join(', ')}`
      )
    }

    // Use minimum index for skip calculation (handles parallel steps)
    const startStepIndex = Math.min(...phaseSteps.map(p => p.index))

    // Log parallel steps info
    if (phaseSteps.length > 1) {
      console.log(`[Phase] "${startPhase}" has ${phaseSteps.length} parallel steps:`)
      phaseSteps.forEach(({ step }) => {
        console.log(`   - ${step.role_id} (order: ${step.order})`)
      })
    }

    // Soft validation - warn about prerequisites but don't block
    const targetStep = workflow.steps[startStepIndex]
    if (targetStep?.phase_join_criteria) {
      const prerequisites = targetStep.phase_join_criteria.prerequisites ||
                           targetStep.phase_join_criteria.requires || []
      if (prerequisites.length > 0) {
        console.log(`[Phase] Warning: Phase "${startPhase}" has prerequisites:`)
        prerequisites.forEach(p => console.log(`   - ${p}`))
        console.log(`   Assuming prerequisites are met. Proceeding...\n`)
      }
    }

    // Calculate skipped phases (unique phases before start index)
    const skippedPhases = [...new Set(
      workflow.steps
        .slice(0, startStepIndex)
        .map(s => s.phase)
    )]

    console.log(`[PhaseJoin] ${workflow.name} | starting at: ${startPhase}${skippedPhases.length > 0 ? ` | skipping: ${skippedPhases.join(' → ')}` : ''}`)

    // Create modified workflow with only the remaining steps
    const modifiedWorkflow: Workflow = {
      ...workflow,
      steps: workflow.steps.slice(startStepIndex),
      metadata: {
        ...workflow.metadata,
        originalSteps: workflow.steps.length,
        skippedPhases,
        startedFromPhase: startPhase
      }
    }

    // Prepare state with phase joining context
    const state: AgentState = {
      messages: initialState?.messages || [],
      task: initialState?.task || '',
      taskType: initialState?.taskType || 'feature',
      context: {
        ...initialState?.context,
        ...context,
        skippedPhases,
        startedFromPhase: startPhase,
        phaseJoinContext: `Joined workflow at "${startPhase}" phase. Assumed prior phases are complete.`
      },
      currentAgent: initialState?.currentAgent || '',
      agentResults: initialState?.agentResults || [],
      mcpData: initialState?.mcpData || {},
      nextAction: initialState?.nextAction || '',
      requiresApproval: initialState?.requiresApproval ?? false,
      metadata: {
        ...initialState?.metadata,
        phaseJoining: {
          enabled: true,
          startPhase,
          skippedPhases,
          originalWorkflowSteps: workflow.steps.length,
          remainingSteps: modifiedWorkflow.steps.length
        }
      },
      ...initialState
    }

    // Execute the modified workflow
    return this.executeWorkflow(modifiedWorkflow, state)
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

    // Set current workflow for checklist access
    this.currentWorkflow = workflow

    console.log(`[Workflow] ${workflow.name} (${workflow.id}) | ${workflow.steps.length} steps | est: ${workflow.estimated_time}`)

    // Validate team reference if present
    if (workflow.team && this.teamManager.isInitialized()) {
      const validation = this.teamManager.validateWorkflowTeam(workflow)
      if (!validation.valid) {
        throw new Error(`Workflow team validation failed: ${validation.errors.join(', ')}`)
      }
      console.log(`[Workflow] Team validated: ${workflow.team}`)
    }

    // Load checklist if available
    if (workflow.metadata?.source_file) {
      const checklist = await this.checklistManager.loadChecklist(
        workflow,
        workflow.metadata.source_file
      )
      if (checklist) {
        console.log(`[Workflow] Checklist loaded: ${checklist.items.length} items`)
      }
    }

    // Load workflow instructions if available
    if (workflow.metadata?.source_file) {
      const workflowInstructions = await this.instructionManager.loadWorkflowInstructions(
        workflow,
        workflow.metadata.source_file
      )
      if (workflowInstructions) {
        console.log(`[Workflow] Instructions loaded for ${workflowInstructions.roleInstructions.size} roles`)
      }
    }

    // Initialize phase tracking
    let state = this.phaseManager.initializePhaseTracking({ ...initialState })

    // Start metrics collection
    const workflowMetricsId = this.metricsCollector.startWorkflowMetrics(workflow, state)
    console.log(`[Metrics] Started collection: ${workflowMetricsId}`)

    try {
      // Group steps by order (same order = parallel execution)
      const stepGroups = this.groupStepsByOrder(workflow.steps)

      for (let i = 0; i < stepGroups.length; i++) {
        const stepGroup = stepGroups[i]
        const groupOrder = stepGroup[0].order

        console.log(`[Step] Group ${groupOrder} (${stepGroup.length} step${stepGroup.length > 1 ? 's' : ''})`)

        if (stepGroup.length > 1) {
          // PARALLEL execution
          console.log(`[Step] Executing ${stepGroup.length} agents in PARALLEL:`)
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
            console.warn(`[Step] Exit criteria not fully met for ${step.role_id}: "${step.exit_criteria}"`)
          }
        }

        console.log(`[Step] Group ${groupOrder} completed`)

        // Phase transition and approval checkpoint logic
        // Check if we should transition to a new phase
        const currentPhase = stepGroup[0].phase as WorkflowPhase
        const statePhase = (state.metadata?.currentPhase as WorkflowPhase) || null

        // Transition to new phase if this is the first step in that phase
        if (currentPhase !== statePhase) {
          console.log(`[Phase] Transition: ${statePhase} → ${currentPhase}`)

          // Record completion of previous phase
          if (statePhase) {
            this.metricsCollector.recordPhaseCompletion(statePhase)
          }

          state = await this.phaseManager.transitionPhase(state, currentPhase)
        }

        // Context Cascade: load dependent documents for this phase
        try {
          const contextResult = await this.contextCascade.loadContextForWorkflow(workflow.id)
          if (contextResult.loaded.length > 0) {
            state = {
              ...state,
              context: {
                ...state.context,
                cascadedContext: this.contextCascade.formatContextForAgent(contextResult.context),
                cascadedDocuments: contextResult.loaded
              }
            }
            console.log(`[ContextCascade] Loaded: ${contextResult.loaded.join(', ')}`)
          }
          if (contextResult.missing.length > 0) {
            console.log(`[ContextCascade] Missing: ${contextResult.missing.join(', ')}`)
          }
        } catch (err) {
          console.warn(`[ContextCascade] Failed:`, err)
        }

        // Check if any step in this group requires approval
        const requiresApproval = stepGroup.some(step => step.requires_approval === true)

        if (requiresApproval || this.approvalCheckpoint.requiresApproval(currentPhase)) {
          console.log(`[Phase] Approval checkpoint required for phase: ${currentPhase}`)

          // Request approval
          const checkpointResult = await this.approvalCheckpoint.checkpointIfRequired(
            state,
            currentPhase,
            this.currentComplexityScore,
            this.currentWorkflowName
          )

          if (checkpointResult.shouldBlock) {
            if (!checkpointResult.approved) {
              console.log(`[Phase] Rejected: ${currentPhase} rejected - rolling back workflow`)

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
              console.log(`[Phase] Approved: ${currentPhase} approved - continuing workflow`)
            }
          }
        }

        // Check if we can exit the current phase
        const exitValidation = this.phaseManager.canExitPhase(state, currentPhase)
        if (!exitValidation.canProceed) {
          console.warn(`[Phase] ${currentPhase} exit criteria not fully met:`)
          exitValidation.issues.forEach(issue => console.warn(`   - ${issue}`))
        }
        if (exitValidation.warnings.length > 0) {
          exitValidation.warnings.forEach(warning => console.warn(`[Phase] ${warning}`))
        }
      }

      const totalDuration = (Date.now() - startTime) / 1000

      const phaseProgress = this.phaseManager.getPhaseProgress(state)
      const successCount = stepResults.filter(r => r.success).length
      console.log(`[Workflow] Complete: ${workflow.name} | ${totalDuration.toFixed(1)}s | ${successCount}/${stepResults.length} steps OK | phases: ${phaseProgress.percentComplete}%`)

      // Finalize and persist metrics
      await this.finalizeAndPersistMetrics(workflow, state, stepResults, true)

      return {
        workflow,
        success: true,
        duration: totalDuration,
        steps: stepResults,
        finalState: state
      }
    } catch (error) {
      const totalDuration = (Date.now() - startTime) / 1000

      console.error(`[Workflow] Failed: ${workflow.name} | ${totalDuration.toFixed(1)}s | ${error}`)

      // Finalize and persist metrics (failure case)
      await this.finalizeAndPersistMetrics(workflow, state, stepResults, false)

      return {
        workflow,
        success: false,
        duration: totalDuration,
        steps: stepResults,
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

      // Use BMAD persona name if available, otherwise role name
      const displayName = agent.role.personality?.persona_name || agent.role.name

      console.log(`   Starting: ${displayName} (${step.phase})...`)
      if (agents.length > 1) {
        console.log(`   [AgentSelect] ${agents.length} candidates for role "${step.role_id}", selected: ${agent.agentId} (confidence: ${(agent.confidence * 100).toFixed(0)}%)`)
      }

      // Display checklist before step execution
      if (this.currentWorkflow && this.checklistManager.hasChecklist(this.currentWorkflow.id)) {
        const phaseName = step.description || `${step.phase}`
        await this.checklistManager.promptChecklist(this.currentWorkflow.id, phaseName)
      }

      // Load and inject instructions into state
      const instructions = await this.instructionManager.getInstructionsForStep(
        step.role_id,
        step.phase,
        this.currentWorkflow?.id
      )

      if (instructions) {
        console.log(`   [Instructions] Loaded for ${step.role_id}/${step.phase}`)
      }

      // Enrich state with instructions
      const enrichedState: AgentState = {
        ...state,
        context: {
          ...state.context,
          instructions: instructions || undefined
        }
      }

      // Record step start
      this.metricsCollector.recordStepStart(step, agent.agentId)

      // Resolve agent instance for retry support
      const registry: any = this.agentRegistry as any
      const instance = typeof registry.getAgentInstance === 'function'
        ? registry.getAgentInstance(agent.agentId)
        : undefined

      // CircuitBreaker: fail fast if agent is repeatedly broken
      const circuitBreaker = getCircuitBreakerManager().get(`workflow-${agent.agentId}`)
      const cbState = circuitBreaker.getState()

      if (cbState !== 'CLOSED') {
        console.log(`   [CircuitBreaker] ${agent.agentId}: state=${cbState}`)
      }

      if (cbState === 'OPEN') {
        throw new CircuitOpenError(`Circuit breaker open for ${agent.agentId}`)
      }

      const isRealAgent = instance && typeof instance.execute === 'function'
      const timeoutValue = step.timeout || this.globalSettings.default_timeout
      console.log(`   [Execution] mode=${isRealAgent ? 'real' : 'mock'}, timeout=${timeoutValue}, circuitBreaker=${cbState}`)

      // Layering: CircuitBreaker (outer) → Timeout → IterationManager retry (inner)
      const output: Partial<AgentState> = await circuitBreaker.execute(async () => {
        if (instance && typeof instance.execute === 'function') {
          // Real agent: execute with retry via IterationManager
          const executionState: AgentState = { ...enrichedState, currentAgent: agent.agentId }
          if (typeof instance.initializeExecutionContext === 'function') {
            instance.initializeExecutionContext(executionState)
          }

          return this.executeWithTimeout(
            async () => {
              const iterResult = await this.iterationManager.executeWithRetry(instance, executionState)
              if (!iterResult.success) {
                throw iterResult.finalError || new Error(`Agent ${agent.agentId} failed after retries`)
              }
              return iterResult.finalOutput!
            },
            step.timeout || this.globalSettings.default_timeout,
            `${step.role_id}/${step.phase}`
          )
        } else {
          // Mock agent: no retry needed
          return this.executeWithTimeout(
            () => this.runAgent(agent, enrichedState),
            step.timeout || this.globalSettings.default_timeout,
            `${step.role_id}/${step.phase}`
          )
        }
      })

      const duration = (Date.now() - startTime) / 1000
      console.log(`   ✓ ${displayName} completed in ${duration.toFixed(1)}s`)

      // Validate checklist completion criteria
      if (this.currentWorkflow && this.checklistManager.hasChecklist(this.currentWorkflow.id)) {
        const phaseName = step.description || `${step.phase}`
        const validation = this.checklistManager.validatePhaseComplete(
          this.currentWorkflow.id,
          phaseName
        )

        if (!validation.valid) {
          console.warn(`   [Checklist] Incomplete for ${phaseName}:`)
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

      // Validate test enforcement (Amelia's Principle) - STRICT BLOCKING
      const testValidation = await this.testEnforcementValidator.validateTestPassage(
        state,
        step,
        stepResult
      )

      if (!testValidation.valid) {
        // BLOCK completion - строгое блокирование
        const formattedErrors = this.testEnforcementValidator.formatValidationResult(testValidation)
        console.error(formattedErrors)
        throw new Error(`Step blocked by test enforcement: ${testValidation.errors.join('; ')}`)
      }

      // Log warnings (if any)
      if (testValidation.warnings.length > 0) {
        testValidation.warnings.forEach(warn => console.warn(`   ${warn}`))
      }

      // Validate BMAD principles (Bob, Winston, John) - STRICT BLOCKING
      const principleValidations = await this.validatePrinciples(step, agent, stepResult, state)

      // Check for principle violations
      const violations = principleValidations.filter(v => !v.valid)
      if (violations.length > 0) {
        const violatedPrinciples = violations.map(v => v.principle).join(', ')
        const allErrors = violations.flatMap(v => v.errors).join('; ')
        throw new Error(`Step blocked by principle violations (${violatedPrinciples}): ${allErrors}`)
      }

      // Record step completion
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

      // Record step completion (failure)
      this.metricsCollector.recordStepCompletion(step, step.role_id, stepResult, state)

      return stepResult
    }
  }

  /**
   * Validate BMAD principles (Bob, Winston, John)
   *
   * Checks if the step result violates any strict principles defined for the agent.
   * Supports bilingual error messages (EN/RU).
   *
   * @param step - The workflow step being validated
   * @param agent - The agent that executed the step
   * @param stepResult - The result from step execution
   * @param state - Current workflow state
   * @returns Array of validation results (one per strict principle)
   */
  private async validatePrinciples(
    _step: WorkflowStep,
    agent: AgentWithRoleSkills,
    stepResult: StepResult,
    state: AgentState
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    // Get agent's strict principles
    const strictPrinciples = agent.role.principles?.filter(p => p.strict) || []

    if (strictPrinciples.length === 0) {
      // No strict principles to validate
      return results
    }

    // Detect language from state context or task
    const language = this.detectLanguage(state)

    console.log(`   [Validator] Checking ${strictPrinciples.length} strict principle(s) for ${agent.agentId}...`)

    // Validate each strict principle
    for (const principle of strictPrinciples) {
      let validation: ValidationResult | null = null

      switch (principle.name) {
        case 'zero_ambiguity': {
          // Bob's principle: Check for ambiguous terms in story/requirements
          const text = stepResult.output.context?.story ||
                       stepResult.output.context?.requirements ||
                       stepResult.output.context?.acceptance_criteria ||
                       ''

          if (text) {
            validation = await this.principleValidators.zeroAmbiguity.validate(text, language)
          }
          break
        }

        case 'boring_technology': {
          // Winston's principle: Check for risky technology choices
          const techStack = stepResult.output.context?.tech_stack ||
                           stepResult.output.context?.technologies ||
                           []

          if (Array.isArray(techStack) && techStack.length > 0) {
            validation = await this.principleValidators.boringTechnology.validate(techStack, language)
          }
          break
        }

        case 'why_first': {
          // John's principle: Check for business value explanation
          const requirement = stepResult.output.context?.requirement ||
                             stepResult.output.context?.story ||
                             stepResult.output.context?.feature_description ||
                             ''

          if (requirement) {
            validation = await this.principleValidators.whyFirst.validate(requirement, language)
          }
          break
        }

        default:
          // Unknown principle - skip validation
          console.warn(`   [Validator] Unknown principle: ${principle.name} - skipping validation`)
          break
      }

      // If validation was performed, add to results
      if (validation) {
        results.push(validation)

        // Log errors (BLOCKING)
        if (!validation.valid) {
          console.error(`   [Validator] Principle violation: ${validation.principle}`)
          console.error(`   Agent: ${validation.agent}`)
          validation.errors.forEach(err => console.error(`   ${err}`))
        }

        // Log warnings (non-blocking)
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(warn => console.warn(`   ${warn}`))
        }
      }
    }

    return results
  }

  /**
   * Detect language from state
   *
   * Simple language detection based on Cyrillic characters in context.
   *
   * @param state - Current workflow state
   * @returns Language code ('en' or 'ru')
   */
  private detectLanguage(state: AgentState): 'en' | 'ru' {
    // Check context for explicit language setting
    if (state.context?.language === 'ru' || state.context?.language === 'en') {
      return state.context.language
    }

    // Check task for Cyrillic characters
    if (state.task && /[а-яА-ЯёЁ]/.test(state.task)) {
      return 'ru'
    }

    // Check context values for Cyrillic
    const contextStr = JSON.stringify(state.context || {})
    if (/[а-яА-ЯёЁ]/.test(contextStr)) {
      return 'ru'
    }

    // Default to English
    return 'en'
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

    console.log('[Step] Starting parallel execution...')

    // Execute all steps in parallel with Promise.allSettled
    const resultPromises = steps.map(step => this.executeStep(step, state))
    const settledResults = await Promise.allSettled(resultPromises)

    // Process results
    const results: StepResult[] = []
    const successfulOutputs: Partial<AgentState>[] = []

    settledResults.forEach((settled, index) => {
      const stepName = steps[index].role_id
      if (settled.status === 'fulfilled') {
        console.log(`   [Parallel] ${stepName}: ${settled.value.success ? '✓ success' : '✗ failed'} (${settled.value.duration.toFixed(1)}s)`)
        results.push(settled.value)
        if (settled.value.success) {
          successfulOutputs.push({
            ...settled.value.output,
            _agentId: settled.value.agentId,
            _phase: steps[index].phase
          } as any)
        }
      } else {
        console.log(`   [Parallel] ${stepName}: ✗ rejected (${settled.reason?.message || 'Unknown error'})`)
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
      console.error(`   [Step] ${failed.length} agent(s) failed:`)
      failed.forEach(f => {
        console.error(`      - ${f.step.role_id}: ${f.error}`)
      })

      if (!this.globalSettings.continue_on_partial_failure && failed.length === results.length) {
        throw new Error('All parallel agents failed')
      }
    }

    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`[Step] All parallel agents completed in ${totalDuration}s`)

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
    const registry: any = this.agentRegistry as any
    const instance = typeof registry.getAgentInstance === 'function'
      ? registry.getAgentInstance(agent.agentId)
      : undefined

    if (!instance || typeof instance.execute !== 'function') {
      // Fallback to mock result when no executable instance is available
      console.warn(`[ASMO] Agent "${agent.agentId}" — no executable instance, returning mock result`)
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
            status: 'success' as const,
            output: `Agent ${agent.agentId} executed successfully (mock)`,
            artifacts: [],
            confidence: 1.0,
            timestamp: new Date()
          }
        ]
      }
    }

    const executionState: AgentState = {
      ...state,
      currentAgent: agent.agentId
    }

    // Initialize execution context for personality prompt enrichment
    if (typeof instance.initializeExecutionContext === 'function') {
      instance.initializeExecutionContext(executionState)
    } else if (typeof instance.setExecutionContext === 'function') {
      // Backward-compat fallback (if method is public in custom agents)
      instance.setExecutionContext(executionState)
    }

    return instance.execute(executionState)
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
   * Consolidates artifacts from agentResults into state.artifacts
   */
  private mergeStepResult(
    state: AgentState,
    result: StepResult
  ): AgentState {
    const newAgentResults = result.output.agentResults || []

    // Collect new artifacts from agent results
    const newArtifacts = newAgentResults.flatMap(
      (r: any) => r.artifacts || []
    )

    return {
      ...state,
      ...result.output,
      agentResults: [
        ...state.agentResults,
        ...newAgentResults
      ],
      artifacts: [
        ...(state.artifacts || []),
        ...newArtifacts
      ],
      context: {
        ...state.context,
        ...result.output.context
      }
    }
  }

  /**
   * Merge parallel results with namespace isolation
   * Preserves artifacts from all parallel agents
   */
  private mergeParallelResults(
    baseState: AgentState,
    outputs: Partial<AgentState>[],
    results: StepResult[]
  ): AgentState {
    // Namespace isolation strategy - each agent writes to its own namespace
    console.log(`[Merge] Merging ${outputs.length} parallel outputs (strategy: namespace_isolation)`)
    const mergedContext: Record<string, any> = { ...baseState.context }

    for (const output of outputs) {
      const agentId = (output as any)._agentId
      const phase = (output as any)._phase

      if (agentId) {
        // Store in namespaced key
        const namespace = `${agentId}_${phase}_findings`
        mergedContext[namespace] = output.context || {}
        console.log(`[Merge] Created namespace: ${namespace}`)
      }

      // Also merge top-level context keys (implementation, tests, etc.)
      if (output.context) {
        Object.assign(mergedContext, output.context)
      }
    }

    // Collect all agent results, preserving artifacts from each
    const allResults = results
      .filter(r => r.success)
      .map(r => {
        // Extract artifacts from agent's output
        const agentResults = r.output?.agentResults || []
        const artifacts = agentResults.flatMap((ar: any) => ar.artifacts || [])

        return {
          agentId: r.agentId,
          status: 'success' as const,
          output: r.output,
          artifacts,
          confidence: 1.0,
          timestamp: new Date()
        }
      })

    // Consolidate all artifacts into state.artifacts
    const allArtifacts = allResults.flatMap(r => r.artifacts || [])

    return {
      ...baseState,
      agentResults: [
        ...baseState.agentResults,
        ...allResults
      ],
      artifacts: [
        ...(baseState.artifacts || []),
        ...allArtifacts
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
   * Get PhaseManager instance
   */
  getPhaseManager(): PhaseManager {
    return this.phaseManager
  }

  /**
   * Get ApprovalCheckpoint instance
   */
  getApprovalCheckpoint(): ApprovalCheckpoint {
    return this.approvalCheckpoint
  }

  /**
   * Get IterationManager instance
   */
  getIterationManager(): IterationManager {
    return this.iterationManager
  }

  /**
   * Get current phase progress for a workflow state
   */
  getPhaseProgress(state: AgentState) {
    return this.phaseManager.getPhaseProgress(state)
  }

  /**
   * Get approval history
   */
  getApprovalHistory() {
    return this.approvalCheckpoint.getHistory()
  }

  /**
   * Create workflow from team definition
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
   * Get TeamManager instance
   */
  getTeamManager(): TeamManager {
    return this.teamManager
  }

  /**
   * Get ChecklistManager instance
   */
  getChecklistManager(): ChecklistManager {
    return this.checklistManager
  }

  /**
   * Get ConfigManager instance
   */
  getConfigManager(): ConfigManager {
    return this.configManager
  }

  /**
   * Get InstructionManager instance
   */
  getInstructionManager(): InstructionManager {
    return this.instructionManager
  }

  /**
   * Display phase and approval summary
   */
  displayWorkflowSummary(state: AgentState): void {
    const progress = this.phaseManager.getPhaseProgress(state)
    const stats = this.approvalCheckpoint.getStatistics()
    const iterStats = this.iterationManager.getGlobalStatistics()

    console.log(`[Summary] Phases: ${progress.percentComplete}% (${progress.completedPhases.join(', ') || 'none'} done)`)

    if (stats.totalApprovals > 0) {
      console.log(`[Summary] Approvals: ${stats.approved}/${stats.totalApprovals} approved, ${stats.rejected} rejected`)
    }

    if (iterStats.totalExecutions > 0) {
      console.log(`[Summary] Retries: ${iterStats.totalRetries} across ${iterStats.totalExecutions} executions (${iterStats.overallSuccessRate.toFixed(1)}% success)`)
    }
  }

  /**
   * Finalize and persist metrics with learning loop analysis
   */
  private async finalizeAndPersistMetrics(
    workflow: Workflow,
    state: AgentState,
    _stepResults: StepResult[],
    success: boolean
  ): Promise<void> {
    try {
      // Check if metrics collection is active
      if (!this.metricsCollector.isCollecting()) {
        console.warn('[Metrics] Collection not active, skipping finalization')
        return
      }

      // 1. Finalize workflow metrics
      const workflowMetrics = this.metricsCollector.finalizeMetrics(workflow, state, success)

      // 2. Get step metrics
      const stepMetrics = this.metricsCollector.getStepMetrics()

      console.log(`[Metrics] Collected ${stepMetrics.length} step metrics`)

      // 3. Persist metrics (SQLite auto-initializes in .asmo/metrics.db)
      await this.metricsPersister.persistWorkflowMetrics(workflowMetrics)

      // 4. Persist step metrics
      if (stepMetrics.length > 0) {
        await this.metricsPersister.persistStepMetrics(stepMetrics)
      }

      // Log only if persistence is enabled
      if (this.metricsPersister.isEnabled()) {
        console.log(`[Metrics] Persisted to ${this.metricsPersister.getDatabasePath()}`)
      }

      // 6. Run learning loop analysis (async, non-blocking)
      console.log(`[Metrics] Running learning loop analysis...`)

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

      console.log(`[Metrics] Learning loop: ${learningSession.findings.length} findings, ${learningSession.recommendations.length} recommendations (${(learningSession.confidenceScore * 100).toFixed(0)}% confidence)`)

      // Generate retrospective analysis

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

      console.log(`[Metrics] Finalization complete`)
    } catch (error) {
      console.error(`[Metrics] Error finalizing:`, error)
      // Don't throw - metrics failure shouldn't break workflow execution
      // But reset collector to prevent state corruption
      this.metricsCollector.reset()
    }
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let workflowEngineInstance: WorkflowEngine | null = null

/**
 * Get singleton WorkflowEngine instance
 */
export function getWorkflowEngine(
  agentRegistry?: AgentRegistry,
  approvalConfig?: ApprovalCheckpointConfig,
  retryConfig?: RetryConfig,
  databaseUrl?: string
): WorkflowEngine {
  if (!workflowEngineInstance) {
    if (!agentRegistry) {
      throw new Error('AgentRegistry is required for first WorkflowEngine creation')
    }
    workflowEngineInstance = WorkflowEngine.create(agentRegistry, approvalConfig, retryConfig, databaseUrl)
  }
  return workflowEngineInstance
}

/**
 * Reset singleton (for testing)
 */
export function resetWorkflowEngine(): void {
  workflowEngineInstance = null
}
