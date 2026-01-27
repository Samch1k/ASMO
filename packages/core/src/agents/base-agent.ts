import { AgentState, AgentResult, Artifact, MCPRequest, MCPResponse, Role, Skill } from "./types"
import { mcpBridge } from "./mcp/mcp-bridge"

// Optional RunnableConfig for future LangChain integration
type RunnableConfig = Record<string, any> | undefined

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
}

