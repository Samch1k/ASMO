import { AgentState, AgentResult, Artifact, Role, Skill } from "./types"
import { mcpBridge } from "./mcp/mcp-bridge"
import {
  getLLMProvider,
  type ILLMProvider,
  type LLMGenerateOptions,
  type LLMResponse,
  type ModelTier
} from "../llm"
// ✨ BMAD Phase 3: PersonalityPromptLoader for dynamic prompt enrichment
import { PersonalityPromptLoader } from "../orchestration/personality-prompt-loader"

// Optional RunnableConfig for future LangChain integration
type RunnableConfig = Record<string, any> | undefined

/**
 * Options for agent LLM calls
 */
export interface AgentLLMOptions {
  /** Model tier: opus, sonnet, haiku (default: sonnet) */
  model?: ModelTier
  /** Temperature (0.0-1.0). Lower = more deterministic */
  temperature?: number
  /** Maximum tokens in response */
  maxTokens?: number
  /** System prompt override (uses agent's default if not specified) */
  systemPrompt?: string
}

/**
 * Agent metadata interface
 */
export interface AgentMetadata {
  id: string
  capabilities: string[]
  role?: Role
  skills: Skill[]
  allowed_mcps: string[]
}

/**
 * Base abstract class for all agents in the multi-agent system
 * Each specialized agent (Architect, Developer, Debugger, etc.) extends this class
 */
export abstract class BaseAgent {
  // ✨ NEW: Role and skills (optional for backward compatibility)
  protected role?: Role
  protected skills: Skill[] = []

  // ✨ BMAD Phase 3: Current execution context (for personality prompt enrichment)
  private currentTask?: string
  private currentContext?: Record<string, any>

  /**
   * @param agentId - Unique identifier for this agent
   * @param capabilities - List of capabilities this agent possesses
   */
  constructor(
    protected agentId: string,
    protected capabilities: string[]
  ) {}

  /**
   * Main execution method - must be implemented by each agent
   * This is called by the LangGraph orchestrator when the agent is activated
   * 
   * @param state - Current agent state (shared across all agents)
   * @param config - Optional runnable configuration
   * @returns Partial state update to be merged into the workflow state
   */
  abstract execute(
    state: AgentState,
    config?: RunnableConfig
  ): Promise<Partial<AgentState>>

  /**
   * Request data from an MCP server
   * This provides a unified interface to all MCP servers
   *
   * ✨ ENHANCED: Now checks role.allowed_mcps for access control
   *
   * @param mcpName - Name of the MCP server (memory, supabase, filesystem, etc.)
   * @param query - Query parameters for the MCP
   * @returns Response from the MCP server
   */
  protected async requestMCP(
    mcpName: string,
    query: any
  ): Promise<any> {
    // ✨ Check MCP access control
    if (this.role && !this.role.allowed_mcps.includes(mcpName)) {
      this.log(
        `❌ Access denied: Role ${this.role.id} cannot access MCP ${mcpName}`,
        'error'
      )
      return null
    }

    this.log(`MCP Request: ${mcpName}`)

    try {
      const response = await mcpBridge.callMCP(mcpName, query)

      if (!response.success) {
        this.log(`MCP Error: ${response.error}`, 'error')
        return null
      }

      return response.data
    } catch (error) {
      this.log(`MCP Request failed: ${error}`, 'error')
      return null
    }
  }

  /**
   * Create a standardized result object
   * 
   * @param status - Result status
   * @param output - Agent output
   * @param artifacts - Created artifacts (optional)
   * @returns Formatted agent result
   */
  protected createResult(
    status: AgentResult['status'],
    output: any,
    artifacts: Artifact[] = []
  ): AgentResult {
    return {
      agentId: this.agentId,
      status,
      output,
      artifacts,
      confidence: 0.85, // Default confidence
      timestamp: new Date()
    }
  }

  /**
   * Create an artifact (code, ADR, diagram, test, documentation)
   * 
   * @param type - Type of artifact
   * @param content - Artifact content
   * @param metadata - Additional metadata (optional)
   * @returns Formatted artifact
   */
  protected createArtifact(
    type: Artifact['type'],
    content: string,
    metadata: Record<string, any> = {}
  ): Artifact {
    return {
      type,
      content,
      metadata: {
        ...metadata,
        createdBy: this.agentId,
        createdAt: new Date().toISOString()
      }
    }
  }

  /**
   * Log agent activity
   * 
   * @param message - Log message
   * @param level - Log level
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${this.agentId}]`
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ❌`, message)
        break
      case 'warn':
        console.warn(`${prefix} ⚠️`, message)
        break
      default:
        console.log(`${prefix} ℹ️`, message)
    }
  }

  /**
   * ✨ Set role dynamically (called by AgentRegistry)
   *
   * @param role - Role to assign to this agent
   */
  setRole(role: Role): void {
    this.role = role
    this.validateRoleSkills()
  }

  /**
   * ✨ Add skills dynamically
   *
   * @param skills - Skills to add to this agent
   */
  addSkills(skills: Skill[]): void {
    this.skills.push(...skills)
  }

  /**
   * ✨ Check if this agent has a specific skill
   *
   * @param skillId - Skill ID to check
   * @returns true if agent has this skill
   */
  hasSkill(skillId: string): boolean {
    return this.skills.some(s => s.id === skillId)
  }

  /**
   * ✨ Get confidence for a specific skill
   *
   * @param skillId - Skill ID to get confidence for
   * @returns Confidence threshold (0-1) or 0 if skill not found
   */
  getSkillConfidence(skillId: string): number {
    const skill = this.skills.find(s => s.id === skillId)
    return skill?.confidence_threshold ?? 0
  }

  /**
   * ✨ Validate that agent has required skills from role
   * Logs warnings for missing required skills
   */
  private validateRoleSkills(): void {
    if (!this.role) return

    const missingSkills = this.role.required_skills.filter(
      reqSkill => !this.hasSkill(reqSkill)
    )

    if (missingSkills.length > 0) {
      this.log(
        `⚠️  Warning: Missing required skills: ${missingSkills.join(', ')}`,
        'warn'
      )
    }
  }

  /**
   * ✨ Get complete agent metadata
   *
   * @returns Agent metadata including role, skills, and permissions
   */
  getMetadata(): AgentMetadata {
    return {
      id: this.agentId,
      capabilities: this.capabilities,
      role: this.role,
      skills: this.skills,
      allowed_mcps: this.role?.allowed_mcps ?? []
    }
  }

  /**
   * Check if this agent has a specific capability
   *
   * @param capability - Capability to check
   * @returns true if agent has this capability
   */
  hasCapability(capability: string): boolean {
    return this.capabilities.includes(capability)
  }

  /**
   * Get agent information
   *
   * @returns Agent metadata
   */
  getInfo(): { id: string; capabilities: string[] } {
    return {
      id: this.agentId,
      capabilities: this.capabilities
    }
  }

  // =========================================================================
  // LLM INTEGRATION
  // =========================================================================

  /** LLM provider instance (lazy-loaded) */
  private _llmProvider?: ILLMProvider

  /**
   * Get the LLM provider for this agent
   * Uses the factory to get the best available provider
   */
  protected getLLMProvider(): ILLMProvider {
    if (!this._llmProvider) {
      this._llmProvider = getLLMProvider()
    }
    return this._llmProvider
  }

  /**
   * ✨ NEW: Call LLM with a prompt
   *
   * This is the primary method for agents to interact with LLMs.
   * Uses the session provider ($0) by default, falls back to API if needed.
   *
   * @param prompt - The prompt to send to the LLM
   * @param options - Optional settings (model, temperature, etc.)
   * @returns LLM response with content and metadata
   *
   * @example
   * ```typescript
   * // Simple call with defaults
   * const response = await this.callLLM('Analyze this code for bugs')
   * console.log(response.content)
   *
   * // With options
   * const response = await this.callLLM('Generate architecture diagram', {
   *   model: 'opus',
   *   temperature: 0.3
   * })
   * ```
   */
  protected async callLLM(
    prompt: string,
    options?: AgentLLMOptions
  ): Promise<LLMResponse> {
    const provider = this.getLLMProvider()

    this.log(`LLM call via ${provider.name} (${provider.cost})`)

    // ✨ BMAD Phase 3: Await async getDefaultSystemPrompt()
    const systemPrompt = options?.systemPrompt ?? await this.getDefaultSystemPrompt(
      this.currentTask,
      this.currentContext
    )

    const llmOptions: LLMGenerateOptions = {
      model: options?.model ?? 'sonnet',
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      systemPrompt
    }

    try {
      const response = await provider.generate(prompt, llmOptions)

      this.log(`LLM response: ${response.content.length} chars in ${response.duration}ms`)

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`LLM call failed: ${errorMessage}`, 'error')
      throw error
    }
  }

  /**
   * ✨ NEW: Call LLM and parse response as JSON
   *
   * Use this when you need structured data from the LLM.
   * The prompt should instruct the LLM to return valid JSON.
   *
   * @param prompt - The prompt (should request JSON output)
   * @param options - Optional settings
   * @returns Parsed JSON object of type T
   *
   * @example
   * ```typescript
   * interface AnalysisResult {
   *   issues: string[]
   *   severity: 'low' | 'medium' | 'high'
   * }
   *
   * const result = await this.callLLMForJSON<AnalysisResult>(
   *   'Analyze this code and return JSON with issues and severity',
   *   { model: 'sonnet' }
   * )
   * ```
   */
  protected async callLLMForJSON<T = unknown>(
    prompt: string,
    options?: AgentLLMOptions
  ): Promise<T> {
    const provider = this.getLLMProvider()

    this.log(`LLM JSON call via ${provider.name}`)

    // ✨ BMAD Phase 3: Await async getJSONSystemPrompt()
    const systemPrompt = options?.systemPrompt ?? await this.getJSONSystemPrompt()

    const llmOptions: LLMGenerateOptions = {
      model: options?.model ?? 'sonnet',
      temperature: options?.temperature ?? 0.2, // Lower temp for JSON
      maxTokens: options?.maxTokens,
      systemPrompt
    }

    try {
      const result = await provider.generateJSON<T>(prompt, llmOptions)

      this.log(`LLM JSON parsed successfully`)

      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      this.log(`LLM JSON call failed: ${errorMessage}`, 'error')
      throw error
    }
  }

  /**
   * ✨ BMAD Phase 3: Get default system prompt for this agent
   *
   * If the agent has a personality defined, uses PersonalityPromptLoader
   * to enrich the prompt with personality traits, principles, and signatures.
   * Otherwise, falls back to generic prompt.
   *
   * Override in subclasses for agent-specific prompts.
   *
   * @param task - Optional task for language detection
   * @param context - Optional context for language detection
   * @returns System prompt (enriched with personality if available)
   */
  protected async getDefaultSystemPrompt(
    task?: string,
    context?: Record<string, any>
  ): Promise<string> {
    // ✨ BMAD Phase 3: Use PersonalityPromptLoader if personality defined
    if (this.role?.personality) {
      try {
        const loader = new PersonalityPromptLoader()

        const agentConfig = {
          id: this.role.id,
          name: this.role.name,
          description: this.role.description,
          prompt_template: this.role.metadata?.prompt_template as string | undefined,
          personality: this.role.personality,
          principles: this.role.principles
        }

        return await loader.loadPromptWithPersonality(
          agentConfig,
          task || '',
          context || {}
        )
      } catch (error) {
        this.log(`⚠️  Failed to load personality prompt, using fallback: ${error}`, 'warn')
        // Fall through to generic prompt
      }
    }

    // Fallback to generic prompt
    return this.getGenericSystemPrompt()
  }

  /**
   * Get generic system prompt (fallback when no personality available)
   */
  private getGenericSystemPrompt(): string {
    const roleInfo = this.role
      ? `You are a ${this.role.id} agent.`
      : `You are an AI assistant.`

    const capabilityInfo = this.capabilities.length > 0
      ? `Your capabilities include: ${this.capabilities.join(', ')}.`
      : ''

    return `${roleInfo} ${capabilityInfo}

Please provide clear, concise, and accurate responses.
Focus on the task at hand and provide actionable insights.`.trim()
  }

  /**
   * ✨ BMAD Phase 3: Get system prompt for JSON generation
   * Ensures valid JSON output
   */
  protected async getJSONSystemPrompt(): Promise<string> {
    const basePrompt = await this.getDefaultSystemPrompt(
      this.currentTask,
      this.currentContext
    )

    return `${basePrompt}

IMPORTANT: You must respond ONLY with valid JSON. No markdown, no explanations, just pure JSON.
Ensure all strings are properly escaped and the JSON is well-formed.`
  }

  /**
   * ✨ BMAD Phase 3: Set execution context for personality prompt enrichment
   *
   * Call this at the beginning of execute() to enable personality-based prompts.
   *
   * @param state - Current agent state
   */
  protected setExecutionContext(state: AgentState): void {
    this.currentTask = state.task
    this.currentContext = state.context
  }
}

