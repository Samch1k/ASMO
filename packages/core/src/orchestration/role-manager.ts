import { ConfigLoader } from './config-loader'
import { Role } from '../agents/types'

/**
 * RoleManager - управление ролями агентов
 *
 * Предоставляет CRUD операции для ролей:
 * - Загрузка ролей из конфигурационных файлов
 * - Поиск ролей по различным критериям
 * - Валидация и кэширование
 */
export class RoleManager {
  private roles: Map<string, Role> = new Map()
  private initialized = false

  constructor(private configLoader: ConfigLoader) {}

  /**
   * Загрузить все роли из конфигурационных файлов
   * Использует ConfigLoader для загрузки и валидации
   */
  async loadRoles(): Promise<void> {
    if (!this.configLoader) {
      throw new Error('ConfigLoader not initialized')
    }

    const roles = await this.configLoader.loadRoles()

    // Очистить существующий кэш
    this.roles.clear()

    // Добавить все роли в Map для быстрого доступа
    for (const role of roles) {
      this.roles.set(role.id, role)
    }

    this.initialized = true

    console.log(`✅ RoleManager: Loaded ${this.roles.size} roles`)
  }

  /**
   * Получить роль по ID
   * @param roleId - Уникальный идентификатор роли (kebab-case)
   * @returns Role или undefined если не найдена
   */
  getRole(roleId: string): Role | undefined {
    this.checkInitialized()
    return this.roles.get(roleId)
  }

  /**
   * Найти роли, которые имеют указанный скил
   * @param skillId - ID скила
   * @returns Массив ролей со скилом (required или optional)
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
   * Найти роли по категории
   * @param category - Категория роли
   * @returns Массив ролей в категории
   */
  findRolesByCategory(category: Role['category']): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.category === category
    )
  }

  /**
   * Найти роли по типу (reasoning/execution/hybrid)
   * @param roleType - Тип роли
   * @returns Массив ролей указанного типа
   */
  findRolesByType(roleType: Role['role_type']): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.role_type === roleType
    )
  }

  /**
   * Получить все роли
   * @returns Массив всех загруженных ролей
   */
  getAllRoles(): Role[] {
    this.checkInitialized()
    return Array.from(this.roles.values())
  }

  /**
   * Найти роли по ключевым словам
   * Проверяет trigger_keywords в activation_rules
   * @param keywords - Массив ключевых слов для поиска
   * @returns Массив ролей, у которых есть хотя бы одно совпадение
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
   * Найти роли по типу задачи
   * Проверяет task_types в activation_rules
   * @param taskType - Тип задачи
   * @returns Массив ролей, которые активируются для этого типа задачи
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
   * Получить роли с наивысшим приоритетом
   * @param limit - Максимальное количество ролей для возврата (по умолчанию 5)
   * @returns Массив ролей, отсортированных по приоритету (высший первым)
   */
  getTopPriorityRoles(limit: number = 5): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
  }

  /**
   * Найти роли с указанными разрешениями
   * @param permissions - Объект с флагами разрешений
   * @returns Массив ролей с соответствующими разрешениями
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
   * Найти роли, которые могут использовать указанный MCP сервер
   * @param mcpName - Название MCP сервера
   * @returns Массив ролей с доступом к MCP
   */
  findRolesByMCP(mcpName: string): Role[] {
    this.checkInitialized()

    return Array.from(this.roles.values()).filter(
      role => role.allowed_mcps.includes(mcpName)
    )
  }

  /**
   * Получить статистику по ролям
   * @returns Объект со статистикой
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
   * Проверить, что RoleManager инициализирован
   * @throws Error если не инициализирован
   */
  private checkInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        'RoleManager not initialized. Call loadRoles() first.'
      )
    }
  }

  /**
   * Проверить, что роль существует
   * @param roleId - ID роли
   * @returns true если роль существует
   */
  hasRole(roleId: string): boolean {
    this.checkInitialized()
    return this.roles.has(roleId)
  }

  /**
   * Получить количество загруженных ролей
   * @returns Количество ролей
   */
  getRoleCount(): number {
    this.checkInitialized()
    return this.roles.size
  }
}
