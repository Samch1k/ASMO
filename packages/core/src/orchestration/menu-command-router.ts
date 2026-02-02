/**
 * MenuCommandRouter - BMAD menu-driven command system
 *
 * Enables short command syntax like [IR], [DS], [CC] (EN) and [ГР], [ИС], [КК] (RU)
 * Maps commands to existing and new workflows
 *
 * BMAD Phase 1.1: Menu-driven commands with bilingual support
 */

import type { Workflow } from './types'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Menu command definition
 */
export interface MenuCommand {
  /** Command code (e.g., 'IR', 'DS', 'ГР', 'ИС') */
  code: string
  /** Target workflow ID */
  workflowId: string
  /** Command status (exists in codebase or new) */
  status: 'exists' | 'new'
  /** Command name (English) */
  name_en: string
  /** Command name (Russian) */
  name_ru: string
  /** Required context keys for validation */
  requiredContext?: string[]
}

/**
 * Menu command match result
 */
export interface MenuCommandMatch {
  /** Matched command */
  command: MenuCommand
  /** Task context extracted from input (text after command) */
  taskContext: string
  /** Resolved workflow (undefined if workflow doesn't exist yet) */
  workflow: Workflow | undefined
}

/**
 * WorkflowEngine interface (minimal for type safety)
 */
export interface IWorkflowEngine {
  getWorkflow(workflowId: string): Workflow | undefined
}

// =============================================================================
// MENU COMMAND ROUTER
// =============================================================================

/**
 * MenuCommandRouter - Route menu commands to workflows
 *
 * Supports bilingual commands (EN/RU):
 * - [IR]/[ГР] → check_implementation_readiness_workflow (EXISTS)
 * - [CC]/[КК] → correct_course_workflow (EXISTS)
 * - [DS]/[ИС] → dev_story_workflow (NEW)
 * - [CR]/[КО] → code_review_workflow (NEW)
 * - [CS]/[СИ] → create_story_workflow (NEW)
 * - [CP]/[СБ] → create_product_brief_workflow (EXISTS)
 * - [VP]/[ВТ] → create_prd_workflow (EXISTS)
 * - [CE]/[СЭ] → create_epics_and_stories_workflow (EXISTS)
 */
export class MenuCommandRouter {
  private commands: Map<string, MenuCommand>

  constructor(private workflowEngine: IWorkflowEngine) {
    this.commands = this.loadCommands()
  }

  /**
   * Detect and route menu command from input string
   *
   * Examples:
   * - "[IR]" → Implementation Readiness workflow
   * - "[DS] implement user login" → Dev Story workflow with task context
   * - "[ГР]" → Implementation Readiness (Russian)
   * - "[ИС] реализовать аутентификацию" → Dev Story (Russian)
   *
   * @param input - User input string (may contain command + context)
   * @returns MenuCommandMatch if command detected, null otherwise
   */
  async detectAndRoute(input: string): Promise<MenuCommandMatch | null> {
    // Pattern matches: [IR], [DS], [ГР], [ИС], etc.
    // Supports 2-4 uppercase Latin or Cyrillic letters
    const commandPattern = /\[([A-ZА-Я]{2,4})\]/gi
    const matches = [...input.matchAll(commandPattern)]

    if (matches.length === 0) {
      return null
    }

    // Extract command code (first match)
    const commandCode = matches[0][1].toUpperCase()
    const command = this.commands.get(commandCode)

    if (!command) {
      return null
    }

    // Extract task context (text after command)
    const taskContext = input.replace(matches[0][0], '').trim()

    // Resolve workflow (may be undefined for NEW workflows not yet created)
    const workflow = this.workflowEngine.getWorkflow(command.workflowId)

    return {
      command,
      taskContext,
      workflow
    }
  }

  /**
   * Get command by code
   */
  getCommand(code: string): MenuCommand | undefined {
    return this.commands.get(code.toUpperCase())
  }

  /**
   * Get all commands
   */
  getAllCommands(): MenuCommand[] {
    return Array.from(this.commands.values())
  }

  /**
   * Get all commands for a specific workflow
   */
  getCommandsForWorkflow(workflowId: string): MenuCommand[] {
    return Array.from(this.commands.values()).filter(
      cmd => cmd.workflowId === workflowId
    )
  }

  /**
   * Load all BMAD menu commands (EN + RU)
   *
   * 5 EXISTING workflows + 3 NEW workflows = 8 workflows
   * Each workflow has 2 commands (EN + RU) = 16 commands total
   */
  private loadCommands(): Map<string, MenuCommand> {
    const commands: MenuCommand[] = [
      // =======================================================================
      // EXISTING WORKFLOWS (5)
      // =======================================================================

      // [IR]/[ГР] - Implementation Readiness (workflow #16)
      {
        code: 'IR',
        workflowId: 'check_implementation_readiness_workflow',
        status: 'exists',
        name_en: 'Implementation Readiness',
        name_ru: 'Готовность к Реализации',
        requiredContext: [] // Can run standalone
      },
      {
        code: 'ГР',
        workflowId: 'check_implementation_readiness_workflow',
        status: 'exists',
        name_en: 'Implementation Readiness',
        name_ru: 'Готовность к Реализации',
        requiredContext: []
      },

      // [CC]/[КК] - Course Correction (workflow #18)
      {
        code: 'CC',
        workflowId: 'correct_course_workflow',
        status: 'exists',
        name_en: 'Course Correction',
        name_ru: 'Коррекция курса',
        requiredContext: []
      },
      {
        code: 'КК',
        workflowId: 'correct_course_workflow',
        status: 'exists',
        name_en: 'Course Correction',
        name_ru: 'Коррекция курса',
        requiredContext: []
      },

      // [CP]/[СБ] - Create Product Brief (workflow #12)
      {
        code: 'CP',
        workflowId: 'create_product_brief_workflow',
        status: 'exists',
        name_en: 'Create Product Brief',
        name_ru: 'Создание Продуктового Брифа',
        requiredContext: []
      },
      {
        code: 'СБ',
        workflowId: 'create_product_brief_workflow',
        status: 'exists',
        name_en: 'Create Product Brief',
        name_ru: 'Создание Продуктового Брифа',
        requiredContext: []
      },

      // [VP]/[ВТ] - Validate PRD (workflow #13)
      {
        code: 'VP',
        workflowId: 'create_prd_workflow',
        status: 'exists',
        name_en: 'Create PRD',
        name_ru: 'Создание ТЗ',
        requiredContext: []
      },
      {
        code: 'ВТ',
        workflowId: 'create_prd_workflow',
        status: 'exists',
        name_en: 'Create PRD',
        name_ru: 'Создание ТЗ',
        requiredContext: []
      },

      // [CE]/[СЭ] - Create Epics and Stories (workflow #15)
      {
        code: 'CE',
        workflowId: 'create_epics_and_stories_workflow',
        status: 'exists',
        name_en: 'Create Epics and Stories',
        name_ru: 'Создание Эпиков и Историй',
        requiredContext: []
      },
      {
        code: 'СЭ',
        workflowId: 'create_epics_and_stories_workflow',
        status: 'exists',
        name_en: 'Create Epics and Stories',
        name_ru: 'Создание Эпиков и Историй',
        requiredContext: []
      },

      // =======================================================================
      // NEW WORKFLOWS (3) - To be created in Phase 1.3
      // =======================================================================

      // [DS]/[ИС] - Dev Story (TDD workflow)
      {
        code: 'DS',
        workflowId: 'dev_story_workflow',
        status: 'new',
        name_en: 'Dev Story (TDD)',
        name_ru: 'История для Разработки (TDD)',
        requiredContext: [] // Story description can be in task context
      },
      {
        code: 'ИС',
        workflowId: 'dev_story_workflow',
        status: 'new',
        name_en: 'Dev Story (TDD)',
        name_ru: 'История для Разработки (TDD)',
        requiredContext: []
      },

      // [CR]/[КО] - Code Review
      {
        code: 'CR',
        workflowId: 'code_review_workflow',
        status: 'new',
        name_en: 'Code Review',
        name_ru: 'Обзор Кода',
        requiredContext: [] // Code to review can be inferred from context
      },
      {
        code: 'КО',
        workflowId: 'code_review_workflow',
        status: 'new',
        name_en: 'Code Review',
        name_ru: 'Обзор Кода',
        requiredContext: []
      },

      // [CS]/[СИ] - Create Story (zero ambiguity)
      {
        code: 'CS',
        workflowId: 'create_story_workflow',
        status: 'new',
        name_en: 'Create Story (Zero Ambiguity)',
        name_ru: 'Создание Истории (Без Неоднозначности)',
        requiredContext: [] // Epic or feature description can be in task context
      },
      {
        code: 'СИ',
        workflowId: 'create_story_workflow',
        status: 'new',
        name_en: 'Create Story (Zero Ambiguity)',
        name_ru: 'Создание Истории (Без Неоднозначности)',
        requiredContext: []
      }
    ]

    // Convert to Map for O(1) lookup
    return new Map(commands.map(cmd => [cmd.code, cmd]))
  }

  /**
   * Validate required context for a command
   *
   * @param command - Command to validate
   * @param context - Context object to check
   * @returns Array of missing context keys (empty if valid)
   */
  validateRequiredContext(
    command: MenuCommand,
    context: Record<string, any>
  ): string[] {
    if (!command.requiredContext || command.requiredContext.length === 0) {
      return []
    }

    const missing: string[] = []
    for (const key of command.requiredContext) {
      if (!(key in context) || context[key] === undefined || context[key] === null) {
        missing.push(key)
      }
    }

    return missing
  }
}
