import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import yaml from 'yaml'
import Ajv, { type ValidateFunction } from 'ajv'
import { Role, Skill } from '../agents/types'
import { SkillMDLoader, type SkillMD, type SkillMetadata as SkillMDMetadata } from './skillmd-loader'

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors?: string[]
}

/**
 * Skill metadata for lightweight loading
 */
export interface SkillMetadata {
  id: string
  name: string
  complexity: string
  category: string
  requires_skills: string[]
  file: string
}

/**
 * Skill index structure
 */
export interface SkillIndex {
  version: string
  last_updated: string
  total_skills: number
  categories: Record<string, {
    count: number
    skills: SkillMetadata[]
  }>
}

/**
 * ConfigLoader - Loads and validates roles and skills configurations
 *
 * Responsibilities:
 * - Load JSON configuration files
 * - Validate configs against JSON Schema
 * - Provide type-safe access to configurations
 * - Handle errors gracefully
 */
export class ConfigLoader {
  private ajv: Ajv
  private roleValidator?: ValidateFunction
  private skillValidator?: ValidateFunction

  private rolesCache: Map<string, Role> = new Map()
  private skillsCache: Map<string, Skill> = new Map()
  private skillMetadataCache: Map<string, SkillMetadata> = new Map()
  private skillIndex?: SkillIndex

  // Feature flags
  private useYamlFormat: boolean
  private useSkillMD: boolean
  private skillMDLoader?: SkillMDLoader

  /**
   * Find the first available config base path from fallback chain
   *
   * Fallback chain:
   * 1. .cursor/config (Claude Code)
   * 2. ~/.asmo/config (user home)
   * 3. packages/core/templates (bundled, always available)
   */
  private static async findConfigBasePath(): Promise<string> {
    const fallbackPaths = [
      path.join(process.cwd(), '.cursor/config'),                       // Claude Code
      path.join(os.homedir(), '.asmo/config'),                          // User home
      path.join(process.cwd(), 'packages/core/templates'),              // Monorepo dev
      path.join(__dirname, '../templates'),                             // Bundled (dist → templates)
      path.join(__dirname, '../../templates')                           // Source (src/orchestration → templates)
    ]

    for (const configPath of fallbackPaths) {
      try {
        // Check if the path exists and has required structure
        const rolesPath = path.join(configPath, 'roles')
        const stat = await fs.stat(rolesPath)
        if (stat.isDirectory()) {
          console.log(`✅ Config path found: ${configPath}`)
          return configPath
        }
      } catch {
        // Continue to next path if this one fails
        continue
      }
    }

    // If no path found, return error message with tried paths
    const triedPaths = fallbackPaths.join('\n  - ')
    throw new Error(`No valid config path found. Tried:\n  - ${triedPaths}`)
  }

  constructor(
    private configBasePath: string = '.cursor/config',
    options: { useYamlFormat?: boolean; useSkillMD?: boolean } = {}
  ) {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    })

    // Feature flag precedence: constructor option > env var > default
    // SKILL.md is default format (Anthropic Standard 2026)
    const envSkillMD = process.env.USE_SKILLMD
    this.useSkillMD = options.useSkillMD ??
      (envSkillMD !== undefined ? (envSkillMD === 'true' || envSkillMD === '1') : true)

    this.useYamlFormat = !this.useSkillMD && (
      options.useYamlFormat ??
      (process.env.USE_YAML_SKILLS === 'true' || process.env.USE_YAML_SKILLS === '1')
    )

    // Initialize SkillMDLoader if SKILL.md mode enabled
    // Skills path is derived from configBasePath parent or uses bundled templates
    if (this.useSkillMD) {
      // If configBasePath is .cursor/config or ~/.asmo/config, look for sibling skills dir
      // Otherwise use templates/skills from the same location as configBasePath
      const configParent = path.dirname(this.configBasePath)
      const skillsPath = this.configBasePath.includes('templates')
        ? path.join(this.configBasePath, 'skills')  // templates/skills
        : path.join(configParent, 'skills')          // .cursor/skills or ~/.asmo/skills

      this.skillMDLoader = new SkillMDLoader(skillsPath)
    }
  }

  /**
   * Initialize validators by loading JSON schemas
   */
  async initialize(): Promise<void> {
    try {
      // Load role schema
      const roleSchemaPath = path.join(this.configBasePath, 'roles/roles.schema.json')
      const roleSchemaContent = await fs.readFile(roleSchemaPath, 'utf-8')
      const roleSchema = JSON.parse(roleSchemaContent)
      this.roleValidator = this.ajv.compile(roleSchema)

      // Load skill schema
      const skillSchemaPath = path.join(this.configBasePath, 'skills/skills.schema.json')
      const skillSchemaContent = await fs.readFile(skillSchemaPath, 'utf-8')
      const skillSchema = JSON.parse(skillSchemaContent)
      this.skillValidator = this.ajv.compile(skillSchema)

      console.log('✅ ConfigLoader initialized with JSON Schema validators')
    } catch (error) {
      throw new Error(`Failed to initialize ConfigLoader: ${error}`)
    }
  }

  /**
   * Load all roles from configuration files
   *
   * Loads from:
   * - core-roles.json
   * - specialized-roles.json
   * - project-roles.json
   * - validation-roles.json
   */
  async loadRoles(): Promise<Role[]> {
    if (!this.roleValidator) {
      throw new Error('ConfigLoader not initialized. Call initialize() first.')
    }

    const roleFiles = [
      'core-roles.json',
      'specialized-roles.json',
      'validation-roles.json',
      'project-roles.json'
    ]

    const allRoles: Role[] = []

    for (const filename of roleFiles) {
      const filePath = path.join(this.configBasePath, 'roles', filename)

      try {
        // Check if file exists
        await fs.access(filePath)

        // Load and parse
        const content = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Validate (non-blocking - warn but continue loading)
        const validation = this.validateRoleConfig(data)
        if (!validation.valid) {
          console.warn(`⚠️  Validation warnings in ${filename} (loading anyway):`, validation.errors?.slice(0, 5))
          if (validation.errors && validation.errors.length > 5) {
            console.warn(`   ... and ${validation.errors.length - 5} more warnings`)
          }
        }

        // Skip empty role files (e.g. project-roles.json used for user customization)
        if (!data.roles || data.roles.length === 0) {
          console.log(`ℹ️  ${filename} has no roles, skipping`)
          continue
        }

        // Add to cache and result
        for (const role of data.roles) {
          this.rolesCache.set(role.id, role)
          allRoles.push(role)
        }

        console.log(`✅ Loaded ${data.roles.length} roles from ${filename}`)
      } catch (error: any) {
        if (error.code === 'ENOENT') {
          console.log(`ℹ️  ${filename} not found, skipping`)
        } else {
          console.error(`❌ Error loading ${filename}:`, error.message)
        }
      }
    }

    console.log(`✅ Total roles loaded: ${allRoles.length}`)
    return allRoles
  }

  /**
   * Convert SKILL.md to Skill format
   * @private
   */
  private convertSkillMDToSkill(skillMD: SkillMD, metadata?: SkillMDMetadata): Skill {
    // Valid skill categories
    type SkillCategory = 'development' | 'testing' | 'devops' | 'architecture' | 'debugging' |
                         'performance' | 'ui_design' | 'ux_design' | 'business' | 'product' |
                         'project_management' | 'project_specific'

    const validCategories: SkillCategory[] = [
      'development', 'testing', 'devops', 'architecture', 'debugging',
      'performance', 'ui_design', 'ux_design', 'business', 'product',
      'project_management', 'project_specific'
    ]

    // Extract metadata from body if available
    const metadataMatch = skillMD.body.match(/\*\*Metadata:\*\*\s*([\s\S]*?)(?:\n\n|$)/)
    let category: SkillCategory = 'development' // Default category
    let complexity = 'intermediate'
    let estimatedTime = '1-2h'
    let confidenceThreshold = 0.75

    if (metadataMatch) {
      const metadataText = metadataMatch[1]
      const categoryMatch = metadataText.match(/- Category:\s*(.+)/)
      const complexityMatch = metadataText.match(/- Complexity:\s*(.+)/)
      const timeMatch = metadataText.match(/- Estimated Time:\s*(.+)/)
      const confidenceMatch = metadataText.match(/- Confidence Threshold:\s*(.+)/)

      if (categoryMatch) {
        const parsedCategory = categoryMatch[1].trim() as SkillCategory
        if (validCategories.includes(parsedCategory)) {
          category = parsedCategory
        }
      }
      if (complexityMatch) complexity = complexityMatch[1].trim()
      if (timeMatch) estimatedTime = timeMatch[1].trim()
      if (confidenceMatch) confidenceThreshold = parseFloat(confidenceMatch[1].trim())
    }

    return {
      id: skillMD.id,
      name: skillMD.frontmatter.name || metadata?.name || skillMD.id,
      description: skillMD.frontmatter.description || metadata?.description || '',
      category,
      complexity: complexity as 'basic' | 'intermediate' | 'advanced' | 'expert',
      requires_skills: [],
      required_mcps: [],
      confidence_threshold: confidenceThreshold,
      estimated_time: estimatedTime,
      composable_with: []
    }
  }

  /**
   * Load skills - delegates to SKILL.md, YAML, or legacy JSON loader based on feature flags
   *
   * Loads from:
   * - .cursor/skills/{skill_id}/SKILL.md (SKILL.md mode - progressive disclosure)
   * - skills/index.yaml (YAML mode - metadata only, lazy loads full skills)
   * - skills-catalog.json (legacy mode - loads all skills at once)
   */
  async loadSkills(): Promise<Skill[]> {
    if (this.useSkillMD) {
      // SKILL.md mode: Load metadata only, return empty array
      // Skills will be loaded on-demand via loadSkill()
      await this.loadSkillIndex()
      return []
    } else if (this.useYamlFormat) {
      // YAML mode: Load metadata only, return empty array
      // Skills will be loaded on-demand via loadSkill()
      await this.loadSkillIndex()
      return []
    } else {
      // Legacy mode: Load all skills at once
      return this.loadSkillsLegacy()
    }
  }

  /**
   * Load skill index (SKILL.md or YAML mode)
   *
   * Loads metadata-only index:
   * - SKILL.md mode: Load from .cursor/skills/{skill_id}/SKILL.md frontmatter (~4k tokens for 90 skills)
   * - YAML mode: Load from index.yaml (~15k tokens vs 875k for full catalog)
   * This is the primary entry point for progressive disclosure pattern.
   */
  async loadSkillIndex(): Promise<SkillIndex> {
    if (this.skillIndex) {
      return this.skillIndex
    }

    // SKILL.md mode: Load from SkillMDLoader
    if (this.useSkillMD && this.skillMDLoader) {
      try {
        const skillIds = await this.skillMDLoader.listSkills()
        const categories: Record<string, { count: number; skills: SkillMetadata[] }> = {}

        // Load metadata for all skills
        for (const skillId of skillIds) {
          const metadata = await this.skillMDLoader.loadMetadata(skillId)
          if (metadata) {
            // Extract category and complexity from frontmatter if available
            const metadataAny = metadata as Record<string, any>
            const category = metadataAny.category || 'general'
            const complexity = metadataAny.complexity || 'intermediate'

            if (!categories[category]) {
              categories[category] = { count: 0, skills: [] }
            }

            categories[category].skills.push({
              id: skillId,
              name: metadata.name,
              complexity,
              category,
              requires_skills: metadataAny.requires_skills || [],
              file: `${skillId}/SKILL.md`
            })
            categories[category].count++

            // Cache for fast lookup
            this.skillMetadataCache.set(skillId, {
              id: skillId,
              name: metadata.name,
              complexity,
              category,
              requires_skills: metadataAny.requires_skills || [],
              file: `${skillId}/SKILL.md`
            })
          }
        }

        this.skillIndex = {
          version: '2.0.0',
          last_updated: new Date().toISOString().split('T')[0],
          total_skills: skillIds.length,
          categories
        }

        console.log(`✅ Loaded SKILL.md index: ${skillIds.length} skills, ${Object.keys(categories).length} categories`)
        return this.skillIndex
      } catch (error: any) {
        throw new Error(`Failed to load SKILL.md index: ${error.message}`)
      }
    }

    // YAML mode: Load from index.yaml
    const indexPath = path.join(this.configBasePath, 'skills/index.yaml')

    try {
      const content = await fs.readFile(indexPath, 'utf-8')
      const index = yaml.parse(content) as SkillIndex

      // Cache metadata for fast lookup
      for (const [_category, data] of Object.entries(index.categories)) {
        for (const meta of data.skills) {
          this.skillMetadataCache.set(meta.id, {
            ...meta,
            file: path.join(this.configBasePath, 'skills', meta.file)
          })
        }
      }

      this.skillIndex = index
      console.log(`✅ Loaded YAML skill index: ${index.total_skills} skills, ${Object.keys(index.categories).length} categories`)

      return index
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`index.yaml not found at ${indexPath}. Either create index.yaml for YAML mode or set USE_SKILLMD=true for SKILL.md mode.`)
      } else {
        throw new Error(`Failed to load skill index: ${error.message}`)
      }
    }
  }

  /**
   * Load a single skill by ID (lazy loading)
   *
   * @param skillId - Skill ID to load
   * @returns Skill object or null if not found
   */
  async loadSkill(skillId: string): Promise<Skill | null> {
    // Check cache first
    if (this.skillsCache.has(skillId)) {
      return this.skillsCache.get(skillId)!
    }

    // SKILL.md mode: Use SkillMDLoader
    if (this.useSkillMD && this.skillMDLoader) {
      try {
        const skillMD = await this.skillMDLoader.loadFull(skillId)
        if (!skillMD) {
          console.warn(`⚠️  SKILL.md not found: ${skillId}`)
          return null
        }

        const metadata = this.skillMetadataCache.get(skillId)
        const skill = this.convertSkillMDToSkill(skillMD, metadata ? {
          name: metadata.name,
          description: skillMD.frontmatter.description
        } : undefined)

        // Cache and return
        this.skillsCache.set(skillId, skill)
        return skill
      } catch (error: any) {
        console.error(`❌ Failed to load SKILL.md ${skillId}:`, error.message)
        return null
      }
    }

    // YAML/Legacy mode
    // Get metadata
    const meta = this.skillMetadataCache.get(skillId)
    if (!meta) {
      console.warn(`⚠️  Skill metadata not found: ${skillId}`)
      return null
    }

    try {
      // Load YAML file
      const content = await fs.readFile(meta.file, 'utf-8')
      const skill = yaml.parse(content) as Skill

      // Validate
      const validation = this.validateSkill(skill)
      if (!validation.valid) {
        console.warn(`⚠️  Validation failed for ${skillId}:`, validation.errors)
        return null
      }

      // Cache and return
      this.skillsCache.set(skillId, skill)
      return skill
    } catch (error: any) {
      console.error(`❌ Failed to load skill ${skillId}:`, error.message)
      return null
    }
  }

  /**
   * Load all skills in a category (batch lazy loading)
   *
   * @param category - Category name
   * @returns Array of skills in category
   */
  async loadSkillsByCategory(category: string): Promise<Skill[]> {
    if (!this.skillIndex) {
      await this.loadSkillIndex()
    }

    const categoryData = this.skillIndex?.categories[category]
    if (!categoryData) {
      console.warn(`⚠️  Category not found: ${category}`)
      return []
    }

    const skills: Skill[] = []

    for (const meta of categoryData.skills) {
      const skill = await this.loadSkill(meta.id)
      if (skill) {
        skills.push(skill)
      }
    }

    console.log(`✅ Loaded ${skills.length} skills from category: ${category}`)
    return skills
  }

  /**
   * Preload specific skills (optimization for known skill sets)
   *
   * @param skillIds - Array of skill IDs to preload
   */
  async preloadSkills(skillIds: string[]): Promise<void> {
    const loadPromises = skillIds.map(id => this.loadSkill(id))
    await Promise.all(loadPromises)
    console.log(`✅ Preloaded ${skillIds.length} skills`)
  }

  /**
   * Get skill metadata (lightweight, already loaded)
   *
   * @param skillId - Skill ID
   * @returns Skill metadata or undefined
   */
  getSkillMetadata(skillId: string): SkillMetadata | undefined {
    return this.skillMetadataCache.get(skillId)
  }

  /**
   * Get all skill IDs (from metadata cache)
   *
   * @returns Array of all skill IDs
   */
  getAllSkillIds(): string[] {
    return Array.from(this.skillMetadataCache.keys())
  }

  /**
   * Load Superpowers skills from plugin directory
   *
   * Reads all Superpowers skill.md files and converts them to Skill format.
   * Superpowers skills are detailed workflow guides in Markdown format.
   *
   * @returns Array of converted Superpowers skills
   */
  async loadSuperpowersSkills(): Promise<Skill[]> {
    const homeDir = process.env.HOME || process.env.USERPROFILE
    if (!homeDir) {
      console.warn('⚠️  HOME directory not found, cannot load Superpowers skills')
      return []
    }

    const superpowersPath = path.join(
      homeDir,
      '.claude/plugins/cache/claude-plugins-official/superpowers/4.0.3/skills'
    )

    try {
      // Check if Superpowers is installed
      await fs.access(superpowersPath)
    } catch (error) {
      console.log('ℹ️  Superpowers plugin not found, skipping Superpowers skills')
      return []
    }

    const skills: Skill[] = []

    try {
      // Read all skill directories
      const skillDirs = await fs.readdir(superpowersPath, { withFileTypes: true })

      for (const dir of skillDirs) {
        if (!dir.isDirectory()) continue

        const skillMdPath = path.join(superpowersPath, dir.name, 'skill.md')

        try {
          const content = await fs.readFile(skillMdPath, 'utf-8')

          // Parse frontmatter (YAML between --- markers)
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
          if (!frontmatterMatch) continue

          const frontmatter = yaml.parse(frontmatterMatch[1])

          // Create Skill object from Superpowers skill
          const skill: Skill = {
            id: `superpowers_${frontmatter.name?.replace(/-/g, '_')}`,
            name: frontmatter.name || dir.name,
            description: frontmatter.description || 'Superpowers workflow',
            category: 'development', // Superpowers skills are development workflows
            complexity: 'intermediate',
            requires_skills: [],
            required_mcps: ['filesystem'],
            confidence_threshold: 0.75,
            estimated_time: 'N/A',
            composable_with: [],
            metadata: {
              tools: [],
              docs: [],
              difficulty: 6,
              success_rate: 0.85,
              aliases: [frontmatter.name || dir.name],
              source: 'superpowers',
              superpowers_skill: frontmatter.name || dir.name,
              superpowers_path: skillMdPath,
              superpowers_full_content: content  // Store full Markdown content
            }
          }

          skills.push(skill)
        } catch (error) {
          // Skip skills that can't be read
          continue
        }
      }

      console.log(`✅ Loaded ${skills.length} Superpowers skills from plugin`)
      return skills
    } catch (error: any) {
      console.error(`❌ Failed to load Superpowers skills: ${error.message}`)
      return []
    }
  }

  /**
   * Load all skills from JSON catalog (legacy mode)
   *
   * This is the original loadSkills() implementation for backward compatibility.
   * Loads all 75 skills at once (~875k tokens).
   *
   * @deprecated Use SKILL.md format (default). Set USE_SKILLMD=false only for legacy compatibility.
   */
  async loadSkillsLegacy(): Promise<Skill[]> {
    console.warn('[ASMO] Legacy skill loading is deprecated. Migrate to SKILL.md format.')
    if (!this.skillValidator) {
      throw new Error('ConfigLoader not initialized. Call initialize() first.')
    }

    const catalogPath = path.join(this.configBasePath, 'skills/skills-catalog.json')

    try {
      // Load catalog
      const content = await fs.readFile(catalogPath, 'utf-8')
      const data = JSON.parse(content)

      // Validate
      const validation = this.validateSkillConfig(data)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors?.join(', ')}`)
      }

      // Add to cache
      for (const skill of data.skills) {
        this.skillsCache.set(skill.id, skill)
      }

      console.log(`✅ Loaded ${data.skills.length} skills from skills-catalog.json (legacy mode)`)
      return data.skills
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log('ℹ️  skills-catalog.json not found, returning empty array')
        return []
      } else {
        throw new Error(`Failed to load skills: ${error.message}`)
      }
    }
  }

  /**
   * Validate role configuration against schema
   */
  validateRoleConfig(config: any): ValidationResult {
    if (!this.roleValidator) {
      throw new Error('Role validator not initialized')
    }

    const valid = this.roleValidator(config)

    if (!valid && this.roleValidator.errors) {
      return {
        valid: false,
        errors: this.roleValidator.errors.map(err =>
          `${err.instancePath} ${err.message}`
        )
      }
    }

    return { valid: true }
  }

  /**
   * Validate skill configuration against schema
   */
  validateSkillConfig(config: any): ValidationResult {
    if (!this.skillValidator) {
      throw new Error('Skill validator not initialized')
    }

    const valid = this.skillValidator(config)

    if (!valid && this.skillValidator.errors) {
      return {
        valid: false,
        errors: this.skillValidator.errors.map(err =>
          `${err.instancePath} ${err.message}`
        )
      }
    }

    return { valid: true }
  }

  /**
   * Validate single role object
   */
  validateRole(role: Role): ValidationResult {
    // Create a minimal config wrapper for validation
    const config = {
      version: "1.0.0",
      roles: [role]
    }

    return this.validateRoleConfig(config)
  }

  /**
   * Validate single skill object
   */
  validateSkill(skill: Skill): ValidationResult {
    // Create a minimal config wrapper for validation
    const config = {
      version: "1.0.0",
      skills: [skill]
    }

    return this.validateSkillConfig(config)
  }

  /**
   * Get role by ID from cache
   */
  getRole(roleId: string): Role | undefined {
    return this.rolesCache.get(roleId)
  }

  /**
   * Get skill by ID from cache
   */
  getSkill(skillId: string): Skill | undefined {
    return this.skillsCache.get(skillId)
  }

  /**
   * Get all roles from cache
   */
  getAllRoles(): Role[] {
    return Array.from(this.rolesCache.values())
  }

  /**
   * Get all skills from cache
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skillsCache.values())
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.rolesCache.clear()
    this.skillsCache.clear()
    this.skillMetadataCache.clear()
    this.skillIndex = undefined
  }

  /**
   * Reload all configurations
   */
  async reload(): Promise<void> {
    this.clearCache()
    await this.loadRoles()
    await this.loadSkills()
  }

  /**
   * Get current loading mode
   */
  isUsingYamlFormat(): boolean {
    return this.useYamlFormat
  }

  /**
   * Check if using SKILL.md format
   */
  isUsingSkillMD(): boolean {
    return this.useSkillMD
  }

  /**
   * Get current loading mode as string
   */
  getLoadingMode(): 'skillmd' | 'yaml' | 'legacy' {
    if (this.useSkillMD) return 'skillmd'
    if (this.useYamlFormat) return 'yaml'
    return 'legacy'
  }
}

/**
 * Singleton instance for global access
 */
let configLoaderInstance: ConfigLoader | null = null

/**
 * Get or create ConfigLoader singleton
 *
 * Uses fallback chain: .cursor/config → ~/.asmo/config → bundled templates
 *
 * @param options - Configuration options
 * @returns ConfigLoader instance
 */
export async function getConfigLoader(options?: { useYamlFormat?: boolean }): Promise<ConfigLoader> {
  if (!configLoaderInstance) {
    const configPath = await ConfigLoader['findConfigBasePath']()
    configLoaderInstance = new ConfigLoader(configPath, options)
    await configLoaderInstance.initialize()
    // Populate skill metadata cache for skill lookup
    await configLoaderInstance.loadSkillIndex()
  }
  return configLoaderInstance
}

/**
 * Reset singleton (useful for testing)
 */
export function resetConfigLoader(): void {
  configLoaderInstance = null
}
