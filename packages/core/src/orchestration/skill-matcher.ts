import type { Skill, AgentWithRoleSkills, SkillMatch } from '../agents/types'
import type { AgentRegistry } from './agent-registry'
import type { ConfigLoader, SkillMetadata } from './config-loader'
import { ChatAnthropic } from '@langchain/anthropic'
import type { BaseChatModel } from '@langchain/core/language_models/chat_models'

/**
 * SkillMatcher - LLM-based skill extraction and agent matching
 *
 * Uses Claude 3 Haiku to analyze user prompts and extract required skills,
 * then matches those skills to appropriate agents with confidence scoring.
 */
export class SkillMatcher {
  private configLoader: ConfigLoader
  private agentRegistry: AgentRegistry
  private llm: BaseChatModel
  private skillDependencies: Map<string, SkillDependency>

  // Legacy: support for direct skill catalog (backward compatibility)
  private skillCatalog?: Map<string, Skill>

  constructor(
    configLoaderOrSkillCatalog: ConfigLoader | Map<string, Skill>,
    agentRegistry: AgentRegistry
  ) {
    // Support both ConfigLoader (new) and Map<string, Skill> (legacy)
    if (configLoaderOrSkillCatalog instanceof Map) {
      // Legacy mode: direct skill catalog
      this.skillCatalog = configLoaderOrSkillCatalog
      this.configLoader = null as any // Will not be used in legacy mode
    } else {
      // New mode: ConfigLoader with lazy loading
      this.configLoader = configLoaderOrSkillCatalog
      this.skillCatalog = undefined
    }

    this.agentRegistry = agentRegistry

    // Use Claude 3 Haiku for fast skill extraction
    this.llm = new ChatAnthropic({
      model: 'claude-3-haiku-20240307',
      temperature: 0.1, // Low temperature for consistent skill extraction
      maxTokens: 1024
    })

    // Load skill dependencies
    this.skillDependencies = this.loadSkillDependencies()
  }

  /**
   * Detect workflow patterns in task description
   *
   * Recognizes Superpowers workflow patterns:
   * - TDD workflow
   * - Systematic debugging
   * - Design brainstorming
   * - Implementation planning
   *
   * Supports both English and Russian phrases.
   *
   * @param task - User's task description
   * @returns Array of workflow skill IDs
   */
  private detectWorkflowPatterns(task: string): string[] {
    const taskLower = task.toLowerCase()
    const workflows: string[] = []

    // Pattern 1: TDD Workflow (English + Russian)
    const tddPatterns = [
      // English (with \b for Latin characters)
      /\b(tdd|test[- ]driven|test first|red[- ]green[- ]refactor)\b/i,
      /\bwrite.*test.*first\b/i,
      /\bimplement.*with.*test/i,
      /\btest.*before.*cod(e|ing)/i,
      // Russian (without \b - doesn't work with Cyrillic)
      /(тдд|тест.*перв|сначала.*тест|красн.*зелен.*рефактор)/i,
      /(напиш.*тест.*сначала)/i,
      /(реализ.*с.*тест)/i,
      /(тест.*перед.*код)/i
    ]
    if (tddPatterns.some(pattern => pattern.test(taskLower))) {
      workflows.push('tdd_workflow')
    }

    // Pattern 2: Systematic Debugging (English + Russian)
    const debugPatterns = [
      // English (with \b for Latin characters)
      /\b(debug|fix.*bug|investigate.*error|troubleshoot)\b/i,
      /\broot.*cause/i,
      /\bsystematic.*debug/i,
      /\b(failing|broken|not.*working)\b/i,
      // Russian (without \b - doesn't work with Cyrillic)
      /(отладк|исправ.*баг|исслед.*ошибк|диагност)/i,
      /(корнев.*причин)/i,
      /(системат.*отладк)/i,
      /(падает|сломан|не.*работа)/i,
      /(фикс.*баг)/i
    ]
    if (debugPatterns.some(pattern => pattern.test(taskLower))) {
      workflows.push('systematic_debugging_workflow')
    }

    // Pattern 3: Design Brainstorming (English + Russian)
    const brainstormPatterns = [
      // English (with \b for Latin characters)
      /\b(brainstorm|ideate|explore.*design|design.*option)\b/i,
      /\bwhat.*approach/i,
      /\bhow.*should.*design/i,
      /\brefine.*design/i,
      /\bcreative.*solution/i,
      // Russian (without \b - doesn't work with Cyrillic)
      /(брейншторм|мозгов.*штурм|придум|проработ.*дизайн|вариант.*дизайн)/i,
      /(как.*подход)/i,
      /(как.*спроектир)/i,
      /(улучш.*дизайн)/i,
      /(творческ.*решен)/i,
      /(исслед.*опци)/i
    ]
    if (brainstormPatterns.some(pattern => pattern.test(taskLower))) {
      workflows.push('design_brainstorming_workflow')
    }

    // Pattern 4: Implementation Planning (English + Russian)
    const planningPatterns = [
      // English (with \b for Latin characters)
      /\b(plan|break.*down|task.*list|step.*by.*step)\b/i,
      /\bimplementation.*plan/i,
      /\bhow.*implement/i,
      /\bwhat.*steps/i,
      /\bcreate.*plan/i,
      // Russian (without \b - doesn't work with Cyrillic)
      /(план|разбить|список.*задач|шаг.*за.*шаг)/i,
      /(план.*реализаци)/i,
      /(как.*реализ)/i,
      /(каки.*шаг)/i,
      /(созда.*план)/i,
      /(распис.*задач)/i
    ]
    if (planningPatterns.some(pattern => pattern.test(taskLower))) {
      workflows.push('implementation_planning_workflow')
    }

    if (workflows.length > 0) {
      console.log(`🔍 Detected workflow patterns: ${workflows.join(', ')}`)
    }

    return workflows
  }

  /**
   * Extract required skills from a task description using LLM
   *
   * @param task - User's task description
   * @returns Array of skill IDs required for the task
   */
  async extractRequiredSkills(task: string): Promise<string[]> {
    // STEP 1: Detect workflow patterns (Superpowers integration)
    const workflowSkills = this.detectWorkflowPatterns(task)

    // Prepare skill metadata for LLM (lightweight)
    let skillMetadata: Array<{
      id: string
      name: string
      category: string
      complexity: string
    }>

    if (this.skillCatalog) {
      // Legacy mode: use full skill catalog
      skillMetadata = Array.from(this.skillCatalog.values()).map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        complexity: s.complexity
      }))
    } else {
      // New mode: use metadata from ConfigLoader (lightweight)
      const allSkillIds = this.configLoader.getAllSkillIds()
      skillMetadata = allSkillIds.map(id => {
        const meta = this.configLoader.getSkillMetadata(id)!
        return {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          complexity: meta.complexity
        }
      })
    }

    // STEP 2: Enhanced system prompt with workflow awareness
    const systemPrompt = `You are analyzing a development task to identify required skills.

AVAILABLE SKILLS:
${JSON.stringify(skillMetadata, null, 2)}

TASK:
"${task}"

WORKFLOW PATTERNS DETECTED: ${workflowSkills.length > 0 ? workflowSkills.join(', ') : 'none'}

INSTRUCTIONS:
1. Analyze the task carefully
2. Identify which skills from the list are ESSENTIAL for completing this task
3. Return ONLY the skill IDs as a JSON array
4. Be conservative - only include skills that are truly required
5. Consider the task's main action (implement, fix, deploy, test, etc.)
6. Match skill categories and complexity levels
7. If workflow patterns are detected, relevant workflow skills will be automatically added

EXAMPLES:
- "Fix authentication bug" → ["bug_diagnosis", "code_writing", "typescript_expert"]
- "Deploy to production" → ["deployment", "ci_cd", "infrastructure"]
- "Implement user profile page" → ["code_writing", "feature_implementation", "component_styling"]
- "Optimize slow database queries" → ["query_optimization", "performance_analysis", "profiling"]
- "Debug this issue using systematic approach" → ["bug_diagnosis", "root_cause_analysis"]

OUTPUT FORMAT (JSON only):
["skill_id_1", "skill_id_2", ...]`

    try {
      const response = await this.llm.invoke([
        { role: 'user', content: systemPrompt }
      ])

      // Parse LLM response
      const content = typeof response.content === 'string'
        ? response.content
        : JSON.stringify(response.content)

      // Extract JSON array from response (handle various formats)
      const jsonMatch = content.match(/\[[\s\S]*?\]/)
      if (!jsonMatch) {
        console.warn('⚠️  No valid JSON array found in LLM response')
        return workflowSkills // Return at least workflow skills
      }

      const skillIds: string[] = JSON.parse(jsonMatch[0])

      // STEP 3: Merge LLM-extracted skills with workflow skills
      const mergedSkills = [...new Set([...skillIds, ...workflowSkills])]

      // Validate: all skill IDs must exist
      const validSkillIds = await this.validateSkillIds(mergedSkills)

      if (validSkillIds.length < mergedSkills.length) {
        const invalidIds = mergedSkills.filter(id => !validSkillIds.includes(id))
        console.warn(`⚠️  Invalid skill IDs filtered out: ${invalidIds.join(', ')}`)
      }

      // Add dependency skills
      const withDeps = await this.addDependencySkillsAsync(validSkillIds)

      // Preload skills for fast access during matching
      if (!this.skillCatalog && validSkillIds.length > 0) {
        await this.configLoader.preloadSkills(withDeps)
      }

      const workflowCount = workflowSkills.filter(w => validSkillIds.includes(w)).length
      console.log(`✅ Extracted ${withDeps.length} skills (${validSkillIds.length - workflowCount} direct + ${workflowCount} workflow + ${withDeps.length - validSkillIds.length} dependencies)`)

      return withDeps
    } catch (error) {
      console.error('❌ Failed to extract skills from task:', error)
      return workflowSkills // Return at least workflow skills as fallback
    }
  }

  /**
   * Validate skill IDs exist in catalog or ConfigLoader
   */
  private async validateSkillIds(skillIds: string[]): Promise<string[]> {
    if (this.skillCatalog) {
      // Legacy mode: check Map
      return skillIds.filter(id => this.skillCatalog!.has(id))
    } else {
      // New mode: check metadata cache
      const allSkillIds = this.configLoader.getAllSkillIds()
      return skillIds.filter(id => allSkillIds.includes(id))
    }
  }

  /**
   * Add dependency skills (async version for lazy loading)
   */
  private async addDependencySkillsAsync(skillIds: string[]): Promise<string[]> {
    if (this.skillCatalog) {
      // Legacy mode: use synchronous method
      return this.addDependencySkills(skillIds)
    }

    // New mode: lazy load skills to check dependencies
    const result = new Set<string>(skillIds)
    const toProcess = [...skillIds]

    while (toProcess.length > 0) {
      const skillId = toProcess.pop()!
      const skill = await this.configLoader.loadSkill(skillId)

      if (skill && skill.requires_skills) {
        for (const dep of skill.requires_skills) {
          if (!result.has(dep)) {
            result.add(dep)
            toProcess.push(dep)
          }
        }
      }
    }

    return [...Array.from(result)]
  }

  /**
   * Match skills to agents with confidence scoring
   *
   * @param requiredSkills - Array of skill IDs needed
   * @returns Array of skill matches sorted by confidence (highest first)
   */
  async matchSkillsToAgents(requiredSkills: string[]): Promise<SkillMatch[]> {
    const matches: SkillMatch[] = []

    for (const skillId of requiredSkills) {
      // Get skill (from cache or lazy load)
      const skill = await this.getSkill(skillId)
      if (!skill) {
        console.warn(`⚠️  Skill not found: ${skillId}`)
        continue
      }

      // Find all agents with this skill
      const agents = this.agentRegistry.getAgentsBySkill(skillId)

      for (const agent of agents) {
        const confidence = this.calculateConfidence(agent, skill)

        matches.push({
          skill,
          agent,
          confidence,
          reason: this.generateMatchReason(agent, skill, confidence)
        })
      }
    }

    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Get skill from catalog or lazy load from ConfigLoader
   */
  private async getSkill(skillId: string): Promise<Skill | null> {
    if (this.skillCatalog) {
      // Legacy mode: get from Map
      return this.skillCatalog.get(skillId) || null
    } else {
      // New mode: lazy load from ConfigLoader
      return this.configLoader.loadSkill(skillId)
    }
  }

  /**
   * Check skill dependencies
   *
   * @param skillId - Skill ID to check
   * @returns Array of prerequisite skill IDs
   */
  checkSkillDependencies(skillId: string): string[] {
    const skill = this.skillCatalog.get(skillId)
    if (!skill) return []

    return skill.requires_skills || []
  }

  /**
   * Get all skills in the catalog
   */
  getAllSkills(): Skill[] {
    return Array.from(this.skillCatalog.values())
  }

  /**
   * Get skills by category
   */
  getSkillsByCategory(category: string): Skill[] {
    return this.getAllSkills().filter(s => s.category === category)
  }

  /**
   * Add prerequisite skills based on dependencies
   *
   * @param skillIds - Initial skill IDs
   * @returns Skill IDs with dependencies added
   */
  private addDependencySkills(skillIds: string[]): string[] {
    const result = new Set<string>(skillIds)
    const toProcess = [...skillIds]

    while (toProcess.length > 0) {
      const skillId = toProcess.pop()!
      const skill = this.skillCatalog.get(skillId)

      if (skill && skill.requires_skills) {
        for (const dep of skill.requires_skills) {
          if (!result.has(dep)) {
            result.add(dep)
            toProcess.push(dep)
          }
        }
      }
    }

    return [...Array.from(result)]
  }

  /**
   * Calculate confidence score for agent-skill match
   *
   * Factors:
   * 1. Required vs optional skill (60% vs 40%)
   * 2. Role priority (5% per point above 5)
   * 3. Role type match (execution > hybrid > reasoning for practical skills)
   * 4. Skill complexity match
   * 5. Skill confidence threshold
   *
   * @param agent - Agent to evaluate
   * @param skill - Skill to match
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(
    agent: AgentWithRoleSkills,
    skill: Skill
  ): number {
    let confidence = 0

    // Factor 1: Required skill (high confidence) vs Optional skill (medium confidence)
    if (agent.role.required_skills.includes(skill.id)) {
      confidence += 0.6
    } else if (agent.role.optional_skills?.includes(skill.id)) {
      confidence += 0.4
    } else {
      // Agent doesn't explicitly have this skill - low confidence
      confidence += 0.2
    }

    // Factor 2: Role priority (0.05 per point above 5)
    const priorityBonus = Math.max(0, (agent.role.priority - 5) * 0.05)
    confidence += priorityBonus

    // Factor 3: Role type match (execution roles better for practical skills)
    if (
      skill.category === 'development' ||
      skill.category === 'testing' ||
      skill.category === 'devops'
    ) {
      if (agent.role.role_type === 'execution') {
        confidence += 0.1
      } else if (agent.role.role_type === 'hybrid') {
        confidence += 0.05
      }
    } else if (
      skill.category === 'architecture' ||
      skill.category === 'ux_design' ||
      skill.category === 'business'
    ) {
      // Reasoning roles better for planning/design skills
      if (agent.role.role_type === 'reasoning') {
        confidence += 0.1
      } else if (agent.role.role_type === 'hybrid') {
        confidence += 0.05
      }
    }

    // Factor 4: Skill complexity vs role capabilities
    const complexityBonus = this.matchComplexity(skill.complexity, agent.role.priority)
    confidence += complexityBonus

    // Factor 5: Skill's own confidence threshold (inverse factor)
    // Lower threshold = more accessible skill = slight bonus
    const thresholdBonus = (1 - skill.confidence_threshold) * 0.05
    confidence += thresholdBonus

    // Cap at 1.0
    return Math.min(confidence, 1.0)
  }

  /**
   * Match skill complexity to role priority
   */
  private matchComplexity(complexity: string, rolePriority: number): number {
    switch (complexity) {
      case 'expert':
        return rolePriority >= 8 ? 0.1 : 0
      case 'advanced':
        return rolePriority >= 6 ? 0.08 : 0
      case 'intermediate':
        return rolePriority >= 5 ? 0.05 : 0.02
      case 'basic':
        return 0.03
      default:
        return 0
    }
  }

  /**
   * Generate human-readable reason for match
   */
  private generateMatchReason(
    agent: AgentWithRoleSkills,
    skill: Skill,
    confidence: number
  ): string {
    const confidencePercent = (confidence * 100).toFixed(0)
    const isRequired = agent.role.required_skills.includes(skill.id)
    const isOptional = agent.role.optional_skills?.includes(skill.id)

    if (isRequired) {
      return `${agent.role.name} has ${skill.name} as a required skill (${confidencePercent}% confidence)`
    } else if (isOptional) {
      return `${agent.role.name} has ${skill.name} as an optional skill (${confidencePercent}% confidence)`
    } else {
      return `${agent.role.name} may assist with ${skill.name} (${confidencePercent}% confidence)`
    }
  }

  /**
   * Load skill dependencies from config file
   *
   * @private
   */
  private loadSkillDependencies(): Map<string, SkillDependency> {
    // In production, this would load from .cursor/config/skills/skill-dependencies.json
    // For now, we'll return an empty map since dependencies are also in the skill catalog
    return new Map()
  }

  /**
   * Extract keywords from task (helper for keyword-based fallback)
   */
  extractKeywords(task: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
      'can', 'could', 'should', 'would', 'please', 'help', 'me', 'you'
    ])

    const words = task
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))

    return [...new Set(words)] // Unique words only
  }
}

/**
 * Skill dependency structure
 */
interface SkillDependency {
  requires: string[]
  recommended: string[]
  conflicts_with: string[]
}
