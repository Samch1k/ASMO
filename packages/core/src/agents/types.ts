import type { Message } from "../llm"
import type { UserInputSession } from "../orchestration/user-input-types"

/**
 * Context object shared between agents
 * Includes optional instructions field for agent guidance
 */
export interface AgentContext extends Record<string, any> {
  /** Agent instructions loaded from markdown files */
  instructions?: string
  /** User input session for interactive flows */
  userInputSession?: UserInputSession
}

/**
 * Agent state shared across all nodes in the ASMO workflow
 * This state is passed between agents and accumulates context
 */
export interface AgentState {
  /** Messages exchanged in the conversation */
  messages: Message[]

  /** The main task to be accomplished */
  task: string

  /** Type of task being performed */
  taskType: 'bug_fix' | 'feature' | 'optimization' | 'architecture' | 'deployment' | 'testing' | 'documentation' | 'review'

  /** Shared context between agents (includes optional instructions field) */
  context: AgentContext
  
  /** Currently active agent */
  currentAgent: string
  
  /** Results from all executed agents */
  agentResults: AgentResult[]
  
  /** Data retrieved from MCP servers */
  mcpData: Record<string, any>
  
  /** Next action/agent to execute */
  nextAction: string
  
  /** Optional user input for interactive flows */
  userInput?: string

  /** Whether human approval is required before proceeding */
  requiresApproval: boolean

  /** Routing method used: skill-based or keyword-based */
  routing_method?: 'skill_based' | 'keyword_based'

  /** Required skills extracted from the task */
  required_skills?: string[]

  /** Skill matches for this task */
  skill_matches?: SkillMatch[]

  /** Metadata for tracking workflow state */
  metadata?: Record<string, any>

  /** Artifacts produced during execution */
  artifacts?: Artifact[]

  /** Deliverables for the current workflow */
  deliverables?: string[]

  /** Current workflow being executed */
  workflow?: any
}

/**
 * Result produced by an agent after execution
 */
export interface AgentResult {
  /** Unique identifier of the agent */
  agentId: string

  /** Agent name (optional) */
  agentName?: string

  /** Execution status */
  status: 'success' | 'failed' | 'needs_handoff' | 'needs_approval'

  /** Output produced by the agent */
  output: any

  /** Result data (alias for output, for compatibility) */
  result?: any

  /** Artifacts created by the agent (code, ADRs, diagrams, etc.) */
  artifacts: Artifact[]

  /** Next agent to handoff to (if status is 'needs_handoff') */
  handoffTo?: string

  /** Confidence score (0-1) */
  confidence: number

  /** Timestamp when agent executed */
  timestamp: Date | string

  /** Error message if status is 'failed' */
  error?: string
}

/**
 * Artifact produced by agents (code, documentation, diagrams)
 */
export interface Artifact {
  /** Type of artifact */
  type: 'code' | 'adr' | 'diagram' | 'test' | 'documentation'
  
  /** Optional artifact name (e.g., filename) */
  name?: string

  /** Artifact content */
  content: string
  
  /** Additional metadata */
  metadata: Record<string, any>
}

/**
 * MCP Request structure
 */
export interface MCPRequest {
  /** MCP server name */
  mcpName: string
  
  /** Action to perform */
  action: string
  
  /** Request parameters */
  params: any
}

/**
 * MCP Response structure
 */
export interface MCPResponse {
  /** Success status */
  success: boolean
  
  /** Response data */
  data: any
  
  /** Error message if failed */
  error?: string
}

/**
 * Agent capabilities definition
 */
export interface AgentCapabilities {
  /** What this agent can do */
  capabilities: string[]

  /** Which MCP servers this agent can use */
  allowedMCPs: string[]

  /** Priority level (higher = more important) */
  priority: number
}

/**
 * Activation rules for role
 */
export interface ActivationRules {
  /** How this role gets activated */
  type: 'always' | 'auto_attached' | 'agent_requested' | 'manual'

  /** Keywords that trigger this role (for auto_attached type) */
  trigger_keywords?: string[]

  /** Task types this role handles */
  task_types?: Array<'bug_fix' | 'feature' | 'optimization' | 'architecture' | 'deployment' | 'infrastructure' | 'testing' | 'qa' | 'refactor'>
}

/**
 * Agent personality definition
 */
export interface AgentPersonality {
  /** BMAD persona name (e.g., Winston, Amelia, Bob, John) */
  persona_name?: string

  /** Personality traits */
  traits: string[]

  /** Communication style description */
  style: string

  /** Catchphrase in English */
  catchphrase_en: string

  /** Catchphrase in Russian */
  catchphrase_ru: string

  /** Communication preferences */
  communication: {
    formality: 'low' | 'medium' | 'medium-high' | 'high'
    emoji_usage: 'none' | 'minimal' | 'moderate' | 'frequent' | 'rare'
    signature_en: string
    signature_ru: string
  }
}

/**
 * Agent principle definition
 */
export interface AgentPrinciple {
  /** Principle name (e.g., 'test_enforcement', 'zero_ambiguity') */
  name: string

  /** Description in English */
  description_en: string

  /** Description in Russian */
  description_ru: string

  /** Whether this principle blocks execution if violated */
  strict: boolean
}

/**
 * Role definition
 */
export interface Role {
  /** Unique role identifier (kebab-case) */
  id: string

  /** Human-readable role name */
  name: string

  /** Detailed description of role purpose and responsibilities */
  description: string

  /** Role classification category */
  category: 'core' | 'specialized' | 'project_specific' | 'business'

  /** Type of role: reasoning (planning), execution (implementation), or hybrid (both) */
  role_type: 'reasoning' | 'execution' | 'hybrid'

  /** Whether this role is allowed to modify source code */
  can_modify_code?: boolean

  /** Whether this role is allowed to deploy to production */
  can_deploy?: boolean

  /** Whether this role is allowed to execute tests */
  can_run_tests?: boolean

  /** Whether this role requires an architectural plan before execution */
  requires_plan?: boolean

  /** Whether this role requires human approval before execution */
  requires_approval?: boolean

  /** List of required skill IDs (must have all) */
  required_skills: string[]

  /** List of optional skill IDs (nice-to-have) */
  optional_skills?: string[]

  /** Role priority (1-10, where 10 is highest) */
  priority: number

  /** MCP servers this role can access */
  allowed_mcps: string[]

  /** Activation rules */
  activation_rules: ActivationRules

  /** TypeScript class name implementing this role (must end with 'Agent') */
  agent_class: string

  /** Agent personality (optional) */
  personality?: AgentPersonality

  /** Agent principles (optional) */
  principles?: AgentPrinciple[]

  /** Additional role-specific metadata */
  metadata?: {
    llm_temperature?: number
    max_tokens?: number
    output_artifacts?: Array<'code' | 'adr' | 'diagram' | 'test' | 'documentation'>
    [key: string]: any
  }
}

/**
 * Skill definition
 */
export interface Skill {
  /** Unique skill identifier (snake_case) */
  id: string

  /** Human-readable skill name */
  name: string

  /** Detailed description of what this skill enables */
  description: string

  /** Skill classification category */
  category: 'development' | 'testing' | 'devops' | 'architecture' | 'debugging' |
            'performance' | 'ui_design' | 'ux_design' | 'business' | 'product' |
            'project_management' | 'project_specific'

  /** Complexity level of the skill */
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert'

  /** Prerequisite skill IDs that must be present before using this skill */
  requires_skills: string[]

  /** MCP servers required to execute this skill */
  required_mcps: string[]

  /** Minimum confidence score (0-1) required for agent to claim this skill */
  confidence_threshold: number

  /** Estimated time to complete task using this skill (e.g., '30m', '2h', 'N/A') */
  estimated_time?: string

  /** Skill IDs that can be executed in parallel with this skill */
  composable_with?: string[]

  /** Additional skill-specific metadata */
  metadata?: {
    tools?: string[]
    documentation_links?: string[]
    difficulty_level?: number
    success_rate?: number
    aliases?: string[]
    [key: string]: any
  }
}

/**
 * Agent with role and skills
 */
export interface AgentWithRoleSkills {
  agentId: string
  role: Role
  skills: Skill[]
  capabilities: string[] // Backward compatible
  confidence: number
}

/**
 * Result of matching skill to agent
 */
export interface SkillMatch {
  skill: Skill
  agent: AgentWithRoleSkills
  confidence: number
  reason: string
}

/**
 * Agent routing decision (for multi-agent selection)
 */
export interface AgentRoutingDecision {
  selected_agents: string[]
  parallel: boolean
  reasoning: string
  confidence: number
  fallback_agents?: string[]
}

