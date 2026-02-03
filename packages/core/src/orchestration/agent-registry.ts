import type { Role, Skill, AgentWithRoleSkills } from '../agents/types'
import type { BaseAgent } from '../agents/base-agent'

// Import all agent classes for static registry
import { ArchitectAgent } from '../agents/roles/architect.agent'
import { DeveloperAgent } from '../agents/roles/developer.agent'
import { TesterAgent } from '../agents/roles/tester.agent'
import { DebuggerAgent } from '../agents/roles/debugger.agent'
import { DevOpsAgent } from '../agents/roles/devops.agent'
import { OptimizerAgent } from '../agents/roles/optimizer.agent'
import { UIDevAgent } from '../agents/roles/ui-developer.agent'
import { UXDesignerAgent } from '../agents/roles/ux-designer.agent'
import { CodeReviewerAgent } from '../agents/roles/code-reviewer.agent'
import { DesignValidatorAgent } from '../agents/roles/design-validator.agent'
import { MergeAgent } from '../agents/roles/merge-coordinator.agent'
import { PostDeployMonitorAgent } from '../agents/roles/post-deploy-monitor.agent'
import { RequirementsValidatorAgent } from '../agents/roles/requirements-validator.agent'
import { BusinessAnalystAgent } from '../agents/roles/business-analyst.agent'
import { ProjectManagerAgent } from '../agents/roles/project-manager.agent'
import { ProductOwnerAgent } from '../agents/roles/product-owner.agent'
import { APIDesignerAgent } from '../agents/roles/api-designer.agent'
import { DataArchitectAgent } from '../agents/roles/data-architect.agent'
import { PerformanceEngineerAgent } from '../agents/roles/performance-engineer.agent'
import { ScrumMasterAgent } from '../agents/roles/scrum-master.agent'
import { SecuritySpecialistAgent } from '../agents/roles/security-specialist.agent'
import { ProductManagerAgent } from '../agents/roles/product-manager.agent'
import { RFQSpecialistAgent } from '../agents/roles/rfq-specialist.agent'
import { SupplierOpsAgent } from '../agents/roles/supplier-ops.agent'
import { AnalystAgent } from '../agents/roles/analyst.agent'
import { TechWriterAgent } from '../agents/roles/tech-writer.agent'
import { TestArchitectAgent } from '../agents/roles/test-architect.agent'
import { AdversarialReviewerAgent } from '../agents/roles/adversarial-reviewer.agent'

// Static registry of agent classes (avoids dynamic imports which don't work with bundled code)
const AGENT_CLASS_REGISTRY: Record<string, any> = {
  ArchitectAgent,
  DeveloperAgent,
  TesterAgent,
  DebuggerAgent,
  DevOpsAgent,
  OptimizerAgent,
  UIDeveloperAgent: UIDevAgent,
  UIDevAgent,
  UXDesignerAgent,
  CodeReviewerAgent,
  DesignValidatorAgent,
  MergeAgent,
  MergeCoordinatorAgent: MergeAgent,
  PostDeployMonitorAgent,
  RequirementsValidatorAgent,
  BusinessAnalystAgent,
  ProjectManagerAgent,
  ProductOwnerAgent,
  APIDesignerAgent,
  DataArchitectAgent,
  PerformanceEngineerAgent,
  ScrumMasterAgent,
  SecuritySpecialistAgent,
  ProductManagerAgent,
  RFQSpecialistAgent,
  SupplierOpsAgent,
  AnalystAgent,
  TechWriterAgent,
  TestArchitectAgent,
  AdversarialReviewerAgent
}

/**
 * Options for selecting an agent
 */
export interface SelectAgentOptions {
  /** Direct selection by agent ID (highest priority) */
  agentId?: string
  /** Search by skills */
  skills?: string[]
  /** Search by role ID */
  roleId?: string
  /** Sort by confidence when selecting by role (default: true) */
  sortByConfidence?: boolean
}

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
  private agentInstances: Map<string, BaseAgent> = new Map()
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
    this.agentInstances.set(agentId, instance)

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
   * Load agent class from static registry
   *
   * @param className - Agent class name (e.g., "ArchitectAgent")
   * @returns Agent class constructor
   */
  private async loadAgentClass(className: string): Promise<any> {
    // Look up in static registry
    const AgentClass = AGENT_CLASS_REGISTRY[className]

    if (!AgentClass) {
      throw new Error(`Unknown agent class: ${className}. Available: ${Object.keys(AGENT_CLASS_REGISTRY).join(', ')}`)
    }

    return AgentClass
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
   * Get agent instance by ID
   *
   * @param agentId - Agent identifier
   * @returns Agent instance or undefined
   */
  getAgentInstance(agentId: string): BaseAgent | undefined {
    this.checkInitialized()
    return this.agentInstances.get(agentId)
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
   * Get all registered agent instances
   *
   * @returns Array of agent instances
   */
  getAllAgentInstances(): BaseAgent[] {
    this.checkInitialized()
    return Array.from(this.agentInstances.values())
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
   * Select an agent based on options (unified selection method)
   *
   * Priority order:
   * 1. Direct agentId selection
   * 2. Role-based selection (with optional confidence sorting)
   * 3. Skill-based selection
   * 4. Fallback to first available agent
   *
   * @param options - Selection criteria
   * @returns Selected agent instance or undefined
   */
  selectAgent(options: SelectAgentOptions): BaseAgent | undefined {
    this.checkInitialized()

    // 1. Direct selection by agent ID (highest priority)
    if (options.agentId) {
      const agent = this.getAgentInstance(options.agentId)
      if (agent) return agent
    }

    // 2. Selection by role
    if (options.roleId) {
      const agents = this.getAgentsByRole(options.roleId)
      if (agents.length) {
        // Sort by confidence if requested (default: true)
        const shouldSort = options.sortByConfidence !== false
        const sorted = shouldSort
          ? [...agents].sort((a, b) => b.confidence - a.confidence)
          : agents
        return this.getAgentInstance(sorted[0].agentId)
      }
    }

    // 3. Selection by skills (first match)
    if (options.skills?.length) {
      for (const skill of options.skills) {
        const agents = this.getAgentsBySkill(skill)
        if (agents.length) {
          return this.getAgentInstance(agents[0].agentId)
        }
      }
    }

    // 4. Fallback - first available agent
    const all = this.getAllAgentInstances()
    return all.length > 0 ? all[0] : undefined
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}
