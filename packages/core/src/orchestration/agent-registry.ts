import type { Role, Skill, AgentWithRoleSkills } from '../agents/types'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Agent Registry Statistics
 */
export interface AgentRegistryStats {
  total_agents: number
  by_category: Record<string, number>
  by_type: Record<string, number>
  total_skills_covered: number
  total_roles: number
}

/**
 * AgentRegistry - Central registry for managing agents with roles and skills
 *
 * Responsibilities:
 * - Register agents with their roles and skills
 * - Provide lookup by skill, role, or agent ID
 * - Automatically discover agents from role configurations
 * - Track agent capabilities and permissions
 */
export class AgentRegistry {
  private agents: Map<string, AgentWithRoleSkills> = new Map()
  private agentsBySkill: Map<string, AgentWithRoleSkills[]> = new Map()
  private agentsByRole: Map<string, AgentWithRoleSkills[]> = new Map()
  private initialized = false

  /**
   * Register an agent with role and skills
   *
   * @param agentId - Unique agent identifier
   * @param agentClass - Agent class constructor
   * @param role - Role definition
   * @param skills - Array of skills
   */
  registerAgent(
    agentId: string,
    agentClass: any,
    role: Role,
    skills: Skill[]
  ): void {
    // Create agent instance
    const instance = new agentClass()

    // Set role and skills dynamically
    if (typeof instance.setRole === 'function') {
      instance.setRole(role)
    }

    if (typeof instance.addSkills === 'function') {
      instance.addSkills(skills)
    }

    // Create registry entry
    const agentWithRole: AgentWithRoleSkills = {
      agentId,
      role,
      skills,
      capabilities: role.required_skills, // Backward compat
      confidence: this.calculateInitialConfidence(role, skills)
    }

    // Store in main registry
    this.agents.set(agentId, agentWithRole)

    // Index by skills
    for (const skill of skills) {
      if (!this.agentsBySkill.has(skill.id)) {
        this.agentsBySkill.set(skill.id, [])
      }
      this.agentsBySkill.get(skill.id)!.push(agentWithRole)
    }

    // Index by role
    if (!this.agentsByRole.has(role.id)) {
      this.agentsByRole.set(role.id, [])
    }
    this.agentsByRole.get(role.id)!.push(agentWithRole)

    console.log(`✅ Registered agent: ${agentId} (role: ${role.name})`)
  }

  /**
   * Automatically discover agents from role definitions
   *
   * @param roles - Array of role definitions
   * @param skillCatalog - Map of all available skills
   */
  async autoDiscover(
    roles: Role[],
    skillCatalogOrConfigLoader: Map<string, Skill> | any
  ): Promise<void> {
    console.log('\n🔍 Auto-discovering agents from roles...')

    // Check if using ConfigLoader or Map
    const useConfigLoader = skillCatalogOrConfigLoader &&
      typeof skillCatalogOrConfigLoader.loadSkill === 'function'

    for (const role of roles) {
      try {
        // Load agent class dynamically
        const agentClass = await this.loadAgentClass(role.agent_class)

        // Collect skills for role (both required and optional)
        const roleSkills: Skill[] = []
        const allSkillIds = [...role.required_skills, ...(role.optional_skills || [])]

        for (const skillId of allSkillIds) {
          let skill: Skill | null | undefined

          if (useConfigLoader) {
            // New mode: lazy load from ConfigLoader
            skill = await skillCatalogOrConfigLoader.loadSkill(skillId)
          } else {
            // Legacy mode: get from Map
            skill = skillCatalogOrConfigLoader.get(skillId)
          }

          if (skill) {
            roleSkills.push(skill)
          } else {
            console.warn(`⚠️  Skill ${skillId} not found in catalog`)
          }
        }

        // Register agent
        this.registerAgent(role.id, agentClass, role, roleSkills)
      } catch (error) {
        console.error(`❌ Failed to load agent class ${role.agent_class}:`, error)
      }
    }

    this.initialized = true
    console.log(`✅ Auto-discovery complete: ${this.agents.size} agents registered\n`)
  }

  /**
   * Dynamically load agent class from file system
   *
   * @param className - Agent class name (e.g., "ArchitectAgent")
   * @returns Agent class constructor
   */
  private async loadAgentClass(className: string): Promise<any> {
    // Convert ArchitectAgent → architect.agent.ts
    const filename = className.replace('Agent', '').toLowerCase() + '.agent'

    try {
      // Get current directory for relative imports
      const __filename = fileURLToPath(import.meta.url)
      const __dirname = path.dirname(__filename)

      // Construct path to agent file
      const agentPath = path.resolve(__dirname, '../../agents/roles', `${filename}.js`)

      // Dynamic import
      const module = await import(agentPath)

      // Return class (either named export or default)
      return module[className] || module.default
    } catch (error) {
      throw new Error(`Could not load agent class ${className}: ${error}`)
    }
  }

  /**
   * Get agents by skill ID
   *
   * @param skillId - Skill identifier
   * @returns Array of agents with this skill
   */
  getAgentsBySkill(skillId: string): AgentWithRoleSkills[] {
    this.checkInitialized()
    return this.agentsBySkill.get(skillId) || []
  }

  /**
   * Get agents by role ID
   *
   * @param roleId - Role identifier
   * @returns Array of agents with this role
   */
  getAgentsByRole(roleId: string): AgentWithRoleSkills[] {
    this.checkInitialized()
    return this.agentsByRole.get(roleId) || []
  }

  /**
   * Get agent by ID
   *
   * @param agentId - Agent identifier
   * @returns Agent or undefined
   */
  getAgent(agentId: string): AgentWithRoleSkills | undefined {
    this.checkInitialized()
    return this.agents.get(agentId)
  }

  /**
   * Get all registered agents
   *
   * @returns Array of all agents
   */
  getAllAgents(): AgentWithRoleSkills[] {
    this.checkInitialized()
    return Array.from(this.agents.values())
  }

  /**
   * Get registry statistics
   *
   * @returns Statistics about registered agents
   */
  getStatistics(): AgentRegistryStats {
    const agents = this.getAllAgents()

    // Count by category
    const byCategory: Record<string, number> = {}
    for (const agent of agents) {
      const category = agent.role.category
      byCategory[category] = (byCategory[category] || 0) + 1
    }

    // Count by type
    const byType: Record<string, number> = {}
    for (const agent of agents) {
      const type = agent.role.role_type
      byType[type] = (byType[type] || 0) + 1
    }

    return {
      total_agents: agents.length,
      by_category: byCategory,
      by_type: byType,
      total_skills_covered: this.agentsBySkill.size,
      total_roles: this.agentsByRole.size
    }
  }

  /**
   * Check if registry is initialized
   * @throws Error if not initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error('AgentRegistry not initialized. Call autoDiscover() first.')
    }
  }

  /**
   * Calculate initial confidence score for agent
   *
   * @param role - Role definition
   * @param skills - Array of skills
   * @returns Confidence score (0-1)
   */
  private calculateInitialConfidence(role: Role, skills: Skill[]): number {
    // Factor 1: Priority (0-1 normalized from 1-10)
    const priorityFactor = role.priority / 10

    // Factor 2: Skill coverage (0-1 based on number of skills)
    const skillFactor = Math.min(skills.length / 5, 1.0)

    // Average both factors
    return (priorityFactor + skillFactor) / 2
  }

  /**
   * Get agents by category
   *
   * @param category - Agent category
   * @returns Array of agents in this category
   */
  getAgentsByCategory(category: string): AgentWithRoleSkills[] {
    return this.getAllAgents().filter(a => a.role.category === category)
  }

  /**
   * Get agents by role type
   *
   * @param roleType - Role type (reasoning, execution, hybrid)
   * @returns Array of agents with this role type
   */
  getAgentsByRoleType(roleType: string): AgentWithRoleSkills[] {
    return this.getAllAgents().filter(a => a.role.role_type === roleType)
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}
