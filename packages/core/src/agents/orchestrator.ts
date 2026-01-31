import { StateGraph, END } from "@langchain/langgraph"
import { AgentState } from "./types"
import { ArchitectAgent } from "./roles/architect.agent"
import { DeveloperAgent } from "./roles/developer.agent"
import { DebuggerAgent } from "./roles/debugger.agent"
import { OptimizerAgent } from "./roles/optimizer.agent"
import { TesterAgent } from "./roles/tester.agent"
import { DevOpsAgent } from "./roles/devops.agent"
import { RFQSpecialistAgent } from "./roles/rfq-specialist.agent"
import { UIDevAgent } from "./roles/ui-developer.agent"
import { UXDesignerAgent } from "./roles/ux-designer.agent"
import { BusinessAnalystAgent } from "./roles/business-analyst.agent"
import { ProjectManagerAgent } from "./roles/project-manager.agent"
import { ProductOwnerAgent } from "./roles/product-owner.agent"
import { SupplierOpsAgent } from "./roles/supplier-ops.agent"
// ✨ NEW: Validator and Reviewer agents (Days 4 & 6)
import { CodeReviewerAgent } from "./roles/code-reviewer.agent"
import { RequirementsValidatorAgent } from "./roles/requirements-validator.agent"
import { DesignValidatorAgent } from "./roles/design-validator.agent"
import { PostDeployMonitorAgent } from "./roles/post-deploy-monitor.agent"
// ✨ NEW: MergeAgent (Day 9)
import { MergeAgent } from "./roles/merge-coordinator.agent"

// ✨ NEW: Orchestration system imports
import { ConfigLoader } from '../orchestration/config-loader.js'
import { RoleManager } from '../orchestration/role-manager.js'
import { SkillMatcher } from '../orchestration/skill-matcher.js'
import { AgentRegistry } from '../orchestration/agent-registry.js'
import { WorkflowEngine } from '../orchestration/workflow-engine.js'
import path from 'path'
import fs from 'fs/promises'

/**
 * LangGraph Multi-Agent Orchestrator
 * 
 * This is the main orchestrator that coordinates all agents using LangGraph's StateGraph.
 * 
 * Architecture:
 * - Entry Node: Analyzes task and routes to appropriate first agent
 * - Agent Nodes: Execute specialized agents (Architect, Developer, Debugger, etc.)
 * - Conditional Edges: Dynamic routing based on agent results
 * - State Management: Shared state across all agents
 * 
 * Flow Examples:
 * 1. Bug Fix: Entry → Debugger → Developer → Tester → END
 * 2. New Feature: Entry → Architect → Developer → Tester → END
 * 3. Performance: Entry → Debugger + Optimizer (parallel) → Developer → END
 */

// ============================================================================
// AGENT INITIALIZATION
// ============================================================================

const architectAgent = new ArchitectAgent()
const developerAgent = new DeveloperAgent()
const debuggerAgent = new DebuggerAgent()
const optimizerAgent = new OptimizerAgent()
const testerAgent = new TesterAgent()
const devopsAgent = new DevOpsAgent()
const rfqSpecialistAgent = new RFQSpecialistAgent()
const uiDevAgent = new UIDevAgent()
const uxDesignerAgent = new UXDesignerAgent()
const businessAnalystAgent = new BusinessAnalystAgent()
const projectManagerAgent = new ProjectManagerAgent()
const productOwnerAgent = new ProductOwnerAgent()
const supplierOpsAgent = new SupplierOpsAgent()
// ✨ NEW: Validator and Reviewer agents (Days 4 & 6)
const codeReviewerAgent = new CodeReviewerAgent()
const requirementsValidatorAgent = new RequirementsValidatorAgent()
const designValidatorAgent = new DesignValidatorAgent()
const postDeployMonitorAgent = new PostDeployMonitorAgent()
// ✨ NEW: MergeAgent (Day 9)
const mergeAgent = new MergeAgent()

console.log('🎭 Multi-Agent System initialized with 18 agents (13 original + 4 validators/reviewers + 1 merge)')

// ============================================================================
// ✨ ORCHESTRATION SYSTEM INITIALIZATION
// ============================================================================

// Global orchestration components
let configLoader: ConfigLoader
let roleManager: RoleManager
let skillMatcher: SkillMatcher
let agentRegistry: AgentRegistry
let workflowEngine: WorkflowEngine
let routingRules: any
let orchestrationInitialized = false

/**
 * Initialize the orchestration system (roles, skills, registry, skill matcher)
 */
async function initializeOrchestration(): Promise<void> {
  if (orchestrationInitialized) {
    console.log('ℹ️  Orchestration system already initialized')
    return
  }

  console.log('\n🔧 ═══════════════════════════════════════════')
  console.log('🔧 INITIALIZING ORCHESTRATION SYSTEM')
  console.log('🔧 ═══════════════════════════════════════════\n')

  try {
    // Step 1: ConfigLoader
    console.log('📁 Loading configuration...')
    const useYaml = process.env.USE_YAML_SKILLS === 'true' || process.env.USE_YAML_SKILLS === '1'
    configLoader = new ConfigLoader(
      path.join(process.cwd(), '.cursor/config'),
      { useYamlFormat: useYaml }
    )
    await configLoader.initialize()

    // Step 2: Load roles and skills
    const roles = await configLoader.loadRoles()

    if (useYaml) {
      // YAML mode: Load skill index (metadata only)
      await configLoader.loadSkillIndex()
      console.log(`✅ Loaded ${roles.length} roles, skill index loaded (lazy loading enabled)`)
    } else {
      // Legacy mode: Load all skills
      const skills = await configLoader.loadSkills()
      console.log(`✅ Loaded ${roles.length} roles, ${skills.length} skills`)
    }

    // Step 3: RoleManager
    console.log('🎭 Initializing RoleManager...')
    roleManager = new RoleManager(configLoader)
    await roleManager.loadRoles()
    console.log(`✅ RoleManager ready (${roleManager.getRoleCount()} roles)`)

    // Step 4: AgentRegistry
    console.log('📋 Initializing AgentRegistry...')
    agentRegistry = new AgentRegistry()
    await agentRegistry.autoDiscover(roles, configLoader)
    console.log(`✅ AgentRegistry ready (${agentRegistry.getAllAgents().length} agents)`)

    // Step 5: SkillMatcher
    console.log('🔍 Initializing SkillMatcher...')
    skillMatcher = new SkillMatcher(configLoader, agentRegistry)
    console.log('✅ SkillMatcher ready')

    // Step 6: Load routing rules
    console.log('🛤️  Loading routing rules...')
    const rulesPath = path.join(process.cwd(), '.cursor/config/orchestration', 'routing-rules.json')
    const rulesData = await fs.readFile(rulesPath, 'utf-8')
    routingRules = JSON.parse(rulesData)
    console.log(`✅ Loaded ${routingRules.routing_rules.length} routing rules`)

    // Step 7: WorkflowEngine
    console.log('🔄 Initializing WorkflowEngine...')
    workflowEngine = new WorkflowEngine(agentRegistry, skillMatcher)
    await workflowEngine.initialize()
    console.log(`✅ WorkflowEngine ready (${workflowEngine.getAllWorkflows().length} workflows)`)

    orchestrationInitialized = true

    console.log('\n✅ ═══════════════════════════════════════════')
    console.log('✅ ORCHESTRATION SYSTEM INITIALIZED')
    console.log('✅ ═══════════════════════════════════════════\n')
  } catch (error) {
    console.error('❌ Failed to initialize orchestration system:', error)
    console.log('⚠️  Falling back to keyword-based routing only')
    orchestrationInitialized = false
  }
}

// ============================================================================
// STATE GRAPH CREATION
// ============================================================================

/**
 * Create LangGraph StateGraph with all channels
 */
const workflow = new StateGraph<AgentState>({
  channels: {
    messages: {
      value: null,
      default: () => []
    },
    task: {
      value: null
    },
    taskType: {
      value: null
    },
    context: {
      value: null,
      default: () => ({})
    },
    currentAgent: {
      value: null
    },
    agentResults: {
      value: null,
      default: () => []
    },
    mcpData: {
      value: null,
      default: () => ({})
    },
    nextAction: {
      value: null
    },
    requiresApproval: {
      value: false
    }
  }
})

// ============================================================================
// NODE DEFINITIONS
// ============================================================================

/**
 * Entry Node - Analyzes task and routes to appropriate first agent
 * ✨ ENHANCED: Now supports workflow execution, skill-based routing with fallback to keyword-based
 */
workflow.addNode("entry", async (state: AgentState) => {
  console.log('\n🎯 ═══════════════════════════════════════════════════════')
  console.log('🎯 ORCHESTRATOR: Analyzing task')
  console.log(`🎯 Task: "${state.task}"`)
  console.log('🎯 ═══════════════════════════════════════════════════════\n')

  // ✨ Initialize orchestration system if not already done
  if (!orchestrationInitialized) {
    await initializeOrchestration()
  }

  let requiredSkills: string[] = []
  let taskType: AgentState['taskType'] = 'feature'

  // ✨ STEP 1: Try skill-based routing
  if (orchestrationInitialized && routingRules.routing_strategies.skill_based.enabled) {
    console.log('🔍 Step 1: Skill-based routing...')

    try {
      requiredSkills = await skillMatcher.extractRequiredSkills(state.task)

      if (requiredSkills.length > 0) {
        console.log(`✅ Skills identified: ${requiredSkills.join(', ')}`)
        taskType = determineTaskTypeFromSkills(requiredSkills)

        // ✨ STEP 1.5: Check for matching workflow
        if (workflowEngine && workflowEngine.isInitialized()) {
          const matchedWorkflow = workflowEngine.findMatchingWorkflow(
            state.task,
            taskType,
            requiredSkills
          )

          if (matchedWorkflow) {
            console.log(`\n🔄 ═════════════ WORKFLOW MATCH ═════════════`)
            console.log(`   Workflow: ${matchedWorkflow.name}`)
            console.log(`   ID: ${matchedWorkflow.id}`)
            console.log(`   Steps: ${matchedWorkflow.steps.length}`)
            console.log(`   Estimated: ${matchedWorkflow.estimated_time}`)
            console.log('🔄 ═══════════════════════════════════════════\n')

            // Log routing decision
            await logRoutingDecision(
              state.task,
              'skill_based',
              `workflow:${matchedWorkflow.id}`,
              0.95, // High confidence for workflow match
              {
                workflow_id: matchedWorkflow.id,
                workflow_name: matchedWorkflow.name,
                skills: requiredSkills,
                task_type: taskType
              }
            )

            // Execute the workflow
            const workflowResult = await workflowEngine.executeWorkflow(matchedWorkflow, {
              ...state,
              taskType,
              context: {
                ...state.context,
                routing_method: 'workflow',
                workflow_id: matchedWorkflow.id,
                required_skills: requiredSkills
              }
            })

            // Return final state from workflow
            return {
              ...workflowResult.finalState,
              nextAction: 'END', // Workflow completed
              context: {
                ...workflowResult.finalState.context,
                workflow_success: workflowResult.success,
                workflow_duration: workflowResult.totalDuration,
                workflow_steps_completed: workflowResult.stepResults.filter(r => r.success).length
              }
            }
          }
        }

        // No workflow matched, continue with skill-based routing
        const skillMatches = skillMatcher.matchSkillsToAgents(requiredSkills)

        if (skillMatches.length > 0) {
          const bestMatch = skillMatches[0]

          // Check confidence threshold
          if (bestMatch.confidence >= routingRules.confidence_thresholds.skill_based_minimum) {
            console.log('\n🎯 ═════════════ SKILL-BASED ROUTING ═════════════')
            console.log(`   Agent: ${bestMatch.agent.agentId}`)
            console.log(`   Role: ${bestMatch.agent.role.name}`)
            console.log(`   Confidence: ${(bestMatch.confidence * 100).toFixed(0)}%`)
            console.log(`   Reason: ${bestMatch.reason}`)
            console.log('🎯 ═══════════════════════════════════════════════\n')

            // Log routing decision
            await logRoutingDecision(
              state.task,
              'skill_based',
              bestMatch.agent.agentId,
              bestMatch.confidence,
              {
                skills: requiredSkills,
                skill_matches: skillMatches.slice(0, 3).map(m => ({
                  agent: m.agent.agentId,
                  confidence: m.confidence
                }))
              }
            )

            return {
              taskType,
              currentAgent: bestMatch.agent.agentId,
              nextAction: bestMatch.agent.agentId,
              context: {
                ...state.context,
                routing_method: 'skill_based',
                required_skills: requiredSkills,
                skill_matches: skillMatches,
                confidence: bestMatch.confidence
              }
            }
          } else {
            console.log(`⚠️  Confidence too low (${(bestMatch.confidence * 100).toFixed(0)}% < ${routingRules.confidence_thresholds.skill_based_minimum * 100}%), trying fallback...`)
          }
        } else {
          console.log('⚠️  No agent matches found for skills')
        }
      } else {
        console.log('ℹ️  No skills extracted from task')
      }
    } catch (error) {
      console.error('❌ Skill-based routing failed:', error)
    }
  }

  // ✨ STEP 2: Fallback to keyword-based routing
  console.log('\n🔍 Step 2: Keyword-based routing (fallback)...')

  const analysis = analyzeTask(state.task) // Existing function

  console.log('\n📊 ═════════════ KEYWORD-BASED ROUTING ═════════════')
  console.log(`   Task Type: ${analysis.taskType}`)
  console.log(`   First Agent: ${analysis.firstAgent}`)
  console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(0)}%`)
  console.log('📊 ═══════════════════════════════════════════════\n')

  // Log routing decision
  await logRoutingDecision(
    state.task,
    'keyword_based',
    analysis.firstAgent,
    analysis.confidence,
    {
      task_type: analysis.taskType
    }
  )

  return {
    taskType: analysis.taskType,
    currentAgent: analysis.firstAgent,
    nextAction: analysis.firstAgent,
    context: {
      ...state.context,
      routing_method: 'keyword_based',
      confidence: analysis.confidence
    }
  }
})

/**
 * Architect Agent Node
 */
workflow.addNode("architect", async (state: AgentState) => {
  console.log('\n🏗️  ═══════════════════════════════════════════════════════')
  console.log('🏗️  ARCHITECT AGENT: Starting')
  console.log('🏗️  ═══════════════════════════════════════════════════════\n')
  
  const result = await architectAgent.execute(state)
  
  console.log('\n🏗️  ARCHITECT AGENT: Complete')
  console.log(`🏗️  Next Action: ${result.nextAction}\n`)
  
  return result
})

/**
 * Developer Agent Node
 */
workflow.addNode("developer", async (state: AgentState) => {
  console.log('\n💻 ═══════════════════════════════════════════════════════')
  console.log('💻 DEVELOPER AGENT: Starting')
  console.log('💻 ═══════════════════════════════════════════════════════\n')
  
  const result = await developerAgent.execute(state)
  
  console.log('\n💻 DEVELOPER AGENT: Complete')
  console.log(`💻 Next Action: ${result.nextAction}\n`)
  
  return result
})

/**
 * Debugger Agent Node
 */
workflow.addNode("debugger", async (state: AgentState) => {
  console.log('\n🐛 ═══════════════════════════════════════════════════════')
  console.log('🐛 DEBUGGER AGENT: Starting')
  console.log('🐛 ═══════════════════════════════════════════════════════\n')
  
  const result = await debuggerAgent.execute(state)
  
  console.log('\n🐛 DEBUGGER AGENT: Complete')
  console.log(`🐛 Next Action: ${result.nextAction}\n`)
  
  return result
})

/**
 * Optimizer Agent Node
 */
workflow.addNode("optimizer", async (state: AgentState) => {
  return await optimizerAgent.execute(state)
})

/**
 * Tester Agent Node
 */
workflow.addNode("tester", async (state: AgentState) => {
  return await testerAgent.execute(state)
})

/**
 * DevOps Agent Node
 */
workflow.addNode("devops", async (state: AgentState) => {
  return await devopsAgent.execute(state)
})

/**
 * RFQ Specialist Agent Node
 */
workflow.addNode("rfq-specialist", async (state: AgentState) => {
  return await rfqSpecialistAgent.execute(state)
})

/**
 * UI Developer Agent Node
 */
workflow.addNode("ui-developer", async (state: AgentState) => {
  return await uiDevAgent.execute(state)
})

/**
 * UX Designer Agent Node
 */
workflow.addNode("ux-designer", async (state: AgentState) => {
  return await uxDesignerAgent.execute(state)
})

/**
 * Business Analyst Agent Node
 */
workflow.addNode("business-analyst", async (state: AgentState) => {
  return await businessAnalystAgent.execute(state)
})

/**
 * Project Manager Agent Node
 */
workflow.addNode("project-manager", async (state: AgentState) => {
  return await projectManagerAgent.execute(state)
})

/**
 * Product Owner Agent Node
 */
workflow.addNode("product-owner", async (state: AgentState) => {
  return await productOwnerAgent.execute(state)
})

/**
 * Supplier Ops Agent Node
 */
workflow.addNode("supplier-ops", async (state: AgentState) => {
  return await supplierOpsAgent.execute(state)
})

/**
 * ✨ Code Reviewer Agent Node (Day 6)
 */
workflow.addNode("code-reviewer", async (state: AgentState) => {
  console.log('\n🔍 ═══════════════════════════════════════════════════════')
  console.log('🔍 CODE REVIEWER AGENT: Starting')
  console.log('🔍 ═══════════════════════════════════════════════════════\n')

  const result = await codeReviewerAgent.execute(state)

  console.log('\n🔍 CODE REVIEWER AGENT: Complete')
  console.log(`🔍 Next Action: ${result.nextAction}\n`)

  return result
})

/**
 * ✨ Requirements Validator Agent Node (Day 4)
 */
workflow.addNode("requirements-validator", async (state: AgentState) => {
  console.log('\n✅ ═══════════════════════════════════════════════════════')
  console.log('✅ REQUIREMENTS VALIDATOR AGENT: Starting')
  console.log('✅ ═══════════════════════════════════════════════════════\n')

  const result = await requirementsValidatorAgent.execute(state)

  console.log('\n✅ REQUIREMENTS VALIDATOR AGENT: Complete')
  console.log(`✅ Next Action: ${result.nextAction}\n`)

  return result
})

/**
 * ✨ Design Validator Agent Node (Day 4)
 */
workflow.addNode("design-validator", async (state: AgentState) => {
  console.log('\n🎨 ═══════════════════════════════════════════════════════')
  console.log('🎨 DESIGN VALIDATOR AGENT: Starting')
  console.log('🎨 ═══════════════════════════════════════════════════════\n')

  const result = await designValidatorAgent.execute(state)

  console.log('\n🎨 DESIGN VALIDATOR AGENT: Complete')
  console.log(`🎨 Next Action: ${result.nextAction}\n`)

  return result
})

/**
 * ✨ Post-Deploy Monitor Agent Node (Day 4)
 */
workflow.addNode("post-deploy-monitor", async (state: AgentState) => {
  console.log('\n📊 ═══════════════════════════════════════════════════════')
  console.log('📊 POST-DEPLOY MONITOR AGENT: Starting')
  console.log('📊 ═══════════════════════════════════════════════════════\n')

  const result = await postDeployMonitorAgent.execute(state)

  console.log('\n📊 POST-DEPLOY MONITOR AGENT: Complete')
  console.log(`📊 Next Action: ${result.nextAction}\n`)

  return result
})

/**
 * ✨ Merge Agent Node (Day 9)
 * Consolidates parallel agent outputs with intelligent conflict resolution
 */
workflow.addNode("merge-agent", async (state: AgentState) => {
  console.log('\n🔀 ═══════════════════════════════════════════════════════')
  console.log('🔀 MERGE AGENT: Starting parallel output consolidation')
  console.log('🔀 ═══════════════════════════════════════════════════════\n')

  const result = await mergeAgent.execute(state)

  console.log('\n🔀 MERGE AGENT: Complete')
  console.log(`🔀 Next Action: ${result.nextAction}\n`)

  return result
})

// ============================================================================
// ROUTING LOGIC
// ============================================================================

/**
 * Main routing function - determines which agent to call next
 */
function routeAgent(state: AgentState): string {
  const nextAction = state.nextAction
  
  console.log(`\n🔀 ROUTER: Next action = ${nextAction}`)
  
  // End execution
  if (nextAction === 'END') {
    console.log('🏁 ROUTER: Workflow complete\n')
    return END
  }
  
  // Validate next action is valid agent
  const validAgents = [
    'architect', 'developer', 'debugger', 'optimizer', 'tester', 'devops',
    'ui-developer', 'ux-designer', 'business-analyst', 'project-manager',
    'product-owner', 'rfq-specialist', 'supplier-ops',
    // ✨ NEW: Validator and Reviewer agents
    'code-reviewer', 'requirements-validator', 'design-validator', 'post-deploy-monitor',
    // ✨ NEW: MergeAgent (Day 9)
    'merge-agent'
  ]
  
  if (validAgents.includes(nextAction)) {
    console.log(`🔀 ROUTER: Routing to ${nextAction}\n`)
    return nextAction
  }
  
  // Unknown action - end workflow
  console.warn(`⚠️  ROUTER: Unknown action '${nextAction}', ending workflow\n`)
  return END
}

// ============================================================================
// EDGE DEFINITIONS
// ============================================================================

// Set entry point
workflow.setEntryPoint("entry")

// Add conditional edges from entry
workflow.addConditionalEdges("entry", routeAgent)

// Add conditional edges from each agent
workflow.addConditionalEdges("architect", routeAgent)
workflow.addConditionalEdges("developer", routeAgent)
workflow.addConditionalEdges("debugger", routeAgent)
workflow.addConditionalEdges("optimizer", routeAgent)
workflow.addConditionalEdges("tester", routeAgent)
workflow.addConditionalEdges("devops", routeAgent)
workflow.addConditionalEdges("rfq-specialist", routeAgent)
workflow.addConditionalEdges("ui-developer", routeAgent)
workflow.addConditionalEdges("ux-designer", routeAgent)
workflow.addConditionalEdges("business-analyst", routeAgent)
workflow.addConditionalEdges("project-manager", routeAgent)
workflow.addConditionalEdges("product-owner", routeAgent)
workflow.addConditionalEdges("supplier-ops", routeAgent)
// ✨ NEW: Validator and Reviewer agent edges
workflow.addConditionalEdges("code-reviewer", routeAgent)
workflow.addConditionalEdges("requirements-validator", routeAgent)
workflow.addConditionalEdges("design-validator", routeAgent)
workflow.addConditionalEdges("post-deploy-monitor", routeAgent)
// ✨ NEW: MergeAgent edge (Day 9)
workflow.addConditionalEdges("merge-agent", routeAgent)

// ============================================================================
// COMPILE WORKFLOW
// ============================================================================

console.log('📦 Compiling LangGraph workflow...')
export const orchestratorApp = workflow.compile()
console.log('✅ LangGraph workflow compiled successfully\n')

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Run a multi-agent task
 * 
 * @param task - Task description
 * @returns Final agent state with results
 */
export async function runMultiAgentTask(task: string): Promise<AgentState> {
  console.log('\n🚀 ═══════════════════════════════════════════════════════')
  console.log('🚀 MULTI-AGENT SYSTEM: Starting')
  console.log('🚀 Task:', task)
  console.log('🚀 ═══════════════════════════════════════════════════════\n')
  
  const startTime = Date.now()
  
  // Create initial state
  const initialState: AgentState = {
    messages: [],
    task,
    taskType: 'feature', // Will be determined by entry node
    context: {},
    currentAgent: '',
    agentResults: [],
    mcpData: {},
    nextAction: '',
    requiresApproval: false
  }
  
  try {
    // Execute workflow
    const result = await orchestratorApp.invoke(initialState)
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2)
    
    console.log('\n✅ ═══════════════════════════════════════════════════════')
    console.log('✅ MULTI-AGENT SYSTEM: Complete')
    console.log(`✅ Duration: ${duration}s`)
    console.log(`✅ Agents Used: ${result.agentResults.map(r => r.agentId).join(' → ')}`)
    console.log(`✅ Final Status: ${result.agentResults[result.agentResults.length - 1]?.status || 'unknown'}`)
    console.log('✅ ═══════════════════════════════════════════════════════\n')
    
    return result
  } catch (error) {
    console.error('\n❌ ═══════════════════════════════════════════════════════')
    console.error('❌ MULTI-AGENT SYSTEM: Error')
    console.error('❌', error)
    console.error('❌ ═══════════════════════════════════════════════════════\n')
    
    throw error
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * ✨ Determine task type from extracted skills
 */
function determineTaskTypeFromSkills(skills: string[]): AgentState['taskType'] {
  if (skills.includes('debugging') || skills.includes('bug_reproduction') || skills.includes('error_investigation')) {
    return 'bug_fix'
  }
  if (skills.includes('deployment') || skills.includes('ci_cd')) {
    return 'deployment'
  }
  if (skills.includes('e2e_testing') || skills.includes('unit_testing') || skills.includes('test_coverage')) {
    return 'testing'
  }
  if (skills.includes('performance_optimization') || skills.includes('query_optimization') || skills.includes('code_optimization')) {
    return 'optimization'
  }
  if (skills.includes('architecture_decisions') || skills.includes('system_design')) {
    return 'architecture'
  }
  if (skills.includes('code_writing') || skills.includes('feature_implementation')) {
    return 'feature'
  }

  return 'feature' // Default
}

/**
 * ✨ Log routing decision to file
 */
async function logRoutingDecision(
  task: string,
  method: 'skill_based' | 'keyword_based',
  selectedAgent: string,
  confidence: number,
  details: any
): Promise<void> {
  if (!routingRules?.fallback_strategy?.log_routing_decisions) {
    return
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    task: task.substring(0, 200), // Truncate for privacy
    routing_method: method,
    selected_agent: selectedAgent,
    confidence: parseFloat(confidence.toFixed(3)),
    details
  }

  const logPath = path.join(process.cwd(), routingRules.fallback_strategy.log_path || '.cursor/logs/routing-decisions.jsonl')

  try {
    // Ensure log directory exists
    const logDir = path.dirname(logPath)
    await fs.mkdir(logDir, { recursive: true })

    // Append log entry
    await fs.appendFile(logPath, JSON.stringify(logEntry) + '\n', 'utf-8')
  } catch (error) {
    // Graceful fail - don't break routing if logging fails
    console.warn('⚠️  Failed to log routing decision:', error)
  }
}

/**
 * Analyze task to determine type and first agent (EXISTING - keyword-based)
 */
function analyzeTask(task: string): {
  taskType: AgentState['taskType']
  firstAgent: string
  confidence: number
} {
  const taskLower = task.toLowerCase()
  
  // Bug/Error patterns
  if (
    taskLower.includes('bug') ||
    taskLower.includes('error') ||
    taskLower.includes('fail') ||
    taskLower.includes('broken') ||
    taskLower.includes('crash') ||
    taskLower.includes('500') ||
    taskLower.includes('исправ')
  ) {
    return {
      taskType: 'bug_fix',
      firstAgent: 'debugger',
      confidence: 0.95
    }
  }
  
  // Performance/Optimization patterns
  if (
    taskLower.includes('slow') ||
    taskLower.includes('performance') ||
    taskLower.includes('optimize') ||
    taskLower.includes('speed') ||
    taskLower.includes('медленн') ||
    taskLower.includes('оптимиз')
  ) {
    return {
      taskType: 'optimization',
      firstAgent: 'optimizer', // Will fall back to debugger for now
      confidence: 0.9
    }
  }
  
  // Architecture/Design patterns
  if (
    taskLower.includes('design') ||
    taskLower.includes('architecture') ||
    taskLower.includes('architect') ||
    taskLower.includes('schema') ||
    taskLower.includes('архитектур') ||
    taskLower.includes('дизайн')
  ) {
    return {
      taskType: 'architecture',
      firstAgent: 'architect',
      confidence: 0.95
    }
  }
  
  // Default: Feature implementation
  // Architect → Developer → Tester flow
  return {
    taskType: 'feature',
    firstAgent: 'architect',
    confidence: 0.8
  }
}

/**
 * Get orchestrator statistics
 */
export function getOrchestratorStats() {
  return {
    totalAgents: 18,
    availableAgents: [
      'architect', 'developer', 'debugger', 'optimizer', 'tester', 'devops',
      'ui-developer', 'ux-designer', 'business-analyst', 'project-manager',
      'product-owner', 'rfq-specialist', 'supplier-ops',
      // ✨ NEW: Validator and Reviewer agents
      'code-reviewer', 'requirements-validator', 'design-validator', 'post-deploy-monitor',
      // ✨ NEW: MergeAgent (Day 9)
      'merge-agent'
    ],
    version: '2.2.0', // Bumped for MergeAgent
    framework: 'LangGraph'
  }
}

/**
 * ✨ Run a specific workflow by ID
 *
 * @param workflowId - ID of the workflow to execute
 * @param task - Task description
 * @returns Workflow execution result
 */
export async function runWorkflow(workflowId: string, task: string) {
  // Initialize if needed
  if (!orchestrationInitialized) {
    await initializeOrchestration()
  }

  if (!workflowEngine || !workflowEngine.isInitialized()) {
    throw new Error('WorkflowEngine not initialized')
  }

  const workflow = workflowEngine.getWorkflow(workflowId)
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowId}`)
  }

  console.log('\n🚀 ═══════════════════════════════════════════════════════')
  console.log(`🚀 RUNNING WORKFLOW: ${workflow.name}`)
  console.log(`🚀 Task: ${task}`)
  console.log('🚀 ═══════════════════════════════════════════════════════\n')

  const initialState: AgentState = {
    messages: [],
    task,
    taskType: 'feature',
    context: {
      workflow_id: workflowId,
      routing_method: 'workflow'
    },
    currentAgent: '',
    agentResults: [],
    mcpData: {},
    nextAction: '',
    requiresApproval: false
  }

  return await workflowEngine.executeWorkflow(workflow, initialState)
}

/**
 * ✨ Get all available workflows
 */
export function getAvailableWorkflows() {
  if (!workflowEngine || !workflowEngine.isInitialized()) {
    return []
  }

  return workflowEngine.getAllWorkflows().map(w => ({
    id: w.id,
    name: w.name,
    description: w.description,
    steps: w.steps.length,
    estimated_time: w.estimated_time
  }))
}

/**
 * ✨ Get workflow engine instance (for advanced usage)
 */
export function getWorkflowEngine() {
  return workflowEngine
}

// ============================================================================
// ✨ INITIALIZATION ON MODULE LOAD
// ============================================================================

/**
 * Initialize orchestration system on module load
 * This runs asynchronously and doesn't block the module
 */
initializeOrchestration().catch((error) => {
  console.error('Failed to initialize orchestration on module load:', error)
  console.log('⚠️  Orchestration will initialize on first task')
})

