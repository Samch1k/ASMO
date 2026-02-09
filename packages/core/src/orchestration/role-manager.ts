import { ConfigLoader } from './config-loader'
import { Role } from '../agents/types'

/**
 * RoleManager - Agent role management
 *
 * Provides CRUD operations for roles:
 * - Loading roles from configuration files
 * - Searching roles by various criteria
 * - Validation and caching
 */
export class RoleManager {
  private roles: Map<string, Role> = new Map()
  private initialized = false

  constructor(private configLoader: ConfigLoader) {}

  /**
   * Load all roles from configuration files
   * Uses ConfigLoader for loading and validation
   */
  async loadRoles(): Promise<void> {
    if (!this.configLoader) {
      throw new Error('ConfigLoader not initialized')
    }

    const roles = await this.configLoader.loadRoles()

    // Clear existing cache
    this.roles.clear()

    // Add all roles to Map for fast access
    for (const role of roles) {
      this.roles.set(role.id, role)
    }

    this.initialized = true

    console.log(`✅ RoleManager: Loaded ${this.roles.size} roles`)
  }

  /**
   * Get role by ID
   * @param roleId - Unique role identifier (kebab-case)
   * @returns Role or undefined if not found
   */
  getRole(roleId: string): Role | undefined {
    this.checkInitialized()
    return this.roles.get(roleId)
  }

  /**
   * Find roles that have the specified skill
   * @param skillId - Skill ID
   * @returns Array of roles with the skill (required or optional)
   */
  findRolesBySkill(skillId: string): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(role => {
      const hasRequired = role.required_skills.includes(skillId)
      const hasOptional = role.optional_skills?.includes(skillId) ?? false
      return hasRequired || hasOptional
    })
  }

  /**
   * Find roles by category
   * @param category - Role category
   * @returns Array of roles in the category
   */
  findRolesByCategory(category: Role['category']): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.category === category
    )
  }

  /**
   * Find roles by type (reasoning/execution/hybrid)
   * @param roleType - Role type
   * @returns Array of roles of the specified type
   */
  findRolesByType(roleType: Role['role_type']): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.role_type === roleType
    )
  }

  /**
   * Get all roles
   * @returns Array of all loaded roles
   */
  getAllRoles(): Role[] {
    this.checkInitialized()
    return Array.from(this.roles.values())
  }

  /**
   * Find roles by keywords
   * Checks trigger_keywords in activation_rules
   * @param keywords - Array of keywords to search
   * @returns Array of roles that have at least one match
   */
  findRolesByKeywords(keywords: string[]): Role[] {
    this.checkInitialized()

    const normalizedKeywords = keywords.map(k => k.toLowerCase().trim())

    return Array.from(this.roles.values()).filter(role => {
      if (role.activation_rules.type !== 'auto_attached') {
        return false
      }

      const triggerKeywords = role.activation_rules.trigger_keywords ?? []

      return triggerKeywords.some(trigger =>
        normalizedKeywords.some(keyword =>
          trigger.toLowerCase().includes(keyword) ||
          keyword.includes(trigger.toLowerCase())
        )
      )
    })
  }

  /**
   * Find roles by task type
   * Checks task_types in activation_rules
   * @param taskType - Task type
   * @returns Array of roles that activate for this task type
   */
  findRolesByTaskType(taskType: string): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(role => {
      if (role.activation_rules.type !== 'auto_attached') {
        return false
      }

      const taskTypes = role.activation_rules.task_types ?? []
      return taskTypes.includes(taskType as any)
    })
  }

  /**
   * Get roles with highest priority
   * @param limit - Maximum number of roles to return (default 5)
   * @returns Array of roles sorted by priority (highest first)
   */
  getTopPriorityRoles(limit: number = 5): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  }

  /**
   * Find roles with specified permissions
   * @param permissions - Object with permission flags
   * @returns Array of roles with matching permissions
   */
  findRolesByPermissions(permissions: {
    can_modify_code?: boolean
    can_deploy?: boolean
    can_run_tests?: boolean
  }): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(role => {
      if (permissions.can_modify_code !== undefined &&
          role.can_modify_code !== permissions.can_modify_code) {
        return false
      }

      if (permissions.can_deploy !== undefined &&
          role.can_deploy !== permissions.can_deploy) {
        return false
      }

      if (permissions.can_run_tests !== undefined &&
          role.can_run_tests !== permissions.can_run_tests) {
        return false
      }

      return true
    })
  }

  /**
   * Find roles that can use the specified MCP server
   * @param mcpName - MCP server name
   * @returns Array of roles with MCP access
   */
  findRolesByMCP(mcpName: string): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.allowed_mcps.includes(mcpName)
    )
  }

  /**
   * Get role statistics
   * @returns Statistics object
   */
  getStatistics(): {
    total: number
    by_category: Record<string, number>
    by_type: Record<string, number>
    with_code_modification: number
    with_deployment: number
    with_tests: number
  } {
    this.checkInitialized()

    const roles = this.getAllRoles()

    const byCategory: Record<string, number> = {}
    const byType: Record<string, number> = {}

    for (const role of roles) {
      byCategory[role.category] = (byCategory[role.category] ?? 0) + 1
      byType[role.role_type] = (byType[role.role_type] ?? 0) + 1
    }

    return {
      total: roles.length,
      by_category: byCategory,
      by_type: byType,
      with_code_modification: roles.filter(r => r.can_modify_code).length,
      with_deployment: roles.filter(r => r.can_deploy).length,
      with_tests: roles.filter(r => r.can_run_tests).length
    }
  }

  /**
   * Check that RoleManager is initialized
   * @throws Error if not initialized
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'RoleManager not initialized. Call loadRoles() first.'
      )
    }
  }

  /**
   * Check if a role exists
   * @param roleId - Role ID
   * @returns true if role exists
   */
  hasRole(roleId: string): boolean {
    this.checkInitialized()
    return this.roles.has(roleId)
  }

  /**
   * Get the number of loaded roles
   * @returns Number of roles
   */
  getRoleCount(): number {
    this.checkInitialized()
    return this.roles.size
  }
}
