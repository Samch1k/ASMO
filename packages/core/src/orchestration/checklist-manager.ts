/**
 * ChecklistManager - Manages workflow checklists and quality gates
 *
 * Phase 3: Checklist implementation
 *
 * Features:
 * - Load checklists from markdown files
 * - Parse markdown into structured items
 * - Validate phase completion criteria
 * - Interactive checklist prompts (CLI)
 * - Quality gates for workflows
 */

import { readFile } from 'fs/promises'
import { join, dirname } from 'path'
import type { Workflow, WorkflowStep } from './types'

/**
 * Checklist item definition
 */
export interface ChecklistItem {
  phase: string
  category: 'before' | 'during' | 'completion' | 'final'
  text: string
  checked: boolean
}

/**
 * Checklist for a workflow
 */
export interface Checklist {
  workflowId: string
  items: ChecklistItem[]
  loaded: boolean
}

/**
 * Phase validation result
 */
export interface PhaseValidation {
  valid: boolean
  missingItems: string[]
}

/**
 * ChecklistManager - Central management for workflow checklists
 */
export class ChecklistManager {
  private checklists: Map<string, Checklist> = new Map()

  /**
   * Load checklist for workflow from .checklist.md file
   *
   * @param workflow - Workflow to load checklist for
   * @param workflowFilePath - Path to workflow JSON file
   * @returns Checklist object or null if not found
   */
  async loadChecklist(workflow: Workflow, workflowFilePath: string): Promise<Checklist | null> {
    const checklistPath = workflowFilePath.replace('.json', '.checklist.md')

    try {
      const content = await readFile(checklistPath, 'utf-8')
      const items = this.parseChecklistMarkdown(content)

      const checklist: Checklist = {
        workflowId: workflow.id,
        items,
        loaded: true
      }

      this.checklists.set(workflow.id, checklist)
      return checklist
    } catch (error) {
      // Checklists are optional - system works without them
      console.warn(`⚠️  No checklist found for workflow: ${workflow.id}`)
      console.warn(`   Expected at: ${checklistPath}`)
      return null
    }
  }

  /**
   * Parse markdown checklist into structured items
   *
   * Format:
   * ## Phase X: Name
   * ### Before Starting
   * - [ ] Item 1
   * - [x] Item 2 (checked)
   * ### During Execution
   * - [ ] Item 3
   * ### Completion Criteria
   * - [ ] Item 4
   * ## Final Approval
   * - [ ] Item 5
   *
   * @param content - Markdown content
   * @returns Array of checklist items
   */
  private parseChecklistMarkdown(content: string): ChecklistItem[] {
    const items: ChecklistItem[] = []
    let currentPhase = ''
    let currentCategory: 'before' | 'during' | 'completion' | 'final' = 'before'

    const lines = content.split('\n')
    for (const line of lines) {
      // Detect phase headers (## Phase X: Name or ## Final Approval)
      if (line.startsWith('## ')) {
        currentPhase = line.replace(/^## /, '').trim()
        continue
      }

      // Detect category headers (### Before Starting, ### During Execution, etc.)
      if (line.startsWith('### ')) {
        const header = line.replace(/^### /, '').toLowerCase()
        if (header.includes('before')) {
          currentCategory = 'before'
        } else if (header.includes('during')) {
          currentCategory = 'during'
        } else if (header.includes('completion') || header.includes('criteria')) {
          currentCategory = 'completion'
        } else if (header.includes('final')) {
          currentCategory = 'final'
        }
        continue
      }

      // Detect checklist items (- [ ] text or - [x] text)
      const match = line.match(/^- \[([ x])\] (.+)$/)
      if (match && currentPhase) {
        items.push({
          phase: currentPhase,
          category: currentCategory,
          text: match[2].trim(),
          checked: match[1] === 'x'
        })
      }
    }

    return items
  }

  /**
   * Get checklist items for specific phase
   *
   * @param workflowId - Workflow identifier
   * @param phase - Phase name
   * @returns Array of checklist items for the phase
   */
  getPhaseChecklist(workflowId: string, phase: string): ChecklistItem[] {
    const checklist = this.checklists.get(workflowId)
    if (!checklist) return []

    return checklist.items.filter(item => item.phase === phase)
  }

  /**
   * Get checklist items by category for a phase
   *
   * @param workflowId - Workflow identifier
   * @param phase - Phase name
   * @param category - Category filter
   * @returns Filtered checklist items
   */
  getPhaseChecklistByCategory(
    workflowId: string,
    phase: string,
    category: 'before' | 'during' | 'completion' | 'final'
  ): ChecklistItem[] {
    const items = this.getPhaseChecklist(workflowId, phase)
    return items.filter(item => item.category === category)
  }

  /**
   * Validate phase completion criteria
   *
   * Checks if all "completion" category items are checked for a phase.
   *
   * @param workflowId - Workflow identifier
   * @param phase - Phase name
   * @returns Validation result with missing items
   */
  validatePhaseComplete(workflowId: string, phase: string): PhaseValidation {
    const items = this.getPhaseChecklist(workflowId, phase)
    const completionItems = items.filter(item => item.category === 'completion')
    const missing = completionItems.filter(item => !item.checked)

    return {
      valid: missing.length === 0,
      missingItems: missing.map(item => item.text)
    }
  }

  /**
   * Interactive checklist validation (for CLI)
   *
   * Displays checklist items and prompts for confirmation.
   * In real implementation, would use interactive prompts.
   * For now, just logs and returns true.
   *
   * @param workflowId - Workflow identifier
   * @param phase - Phase name
   * @returns Boolean indicating whether to proceed
   */
  async promptChecklist(workflowId: string, phase: string): Promise<boolean> {
    const items = this.getPhaseChecklist(workflowId, phase)
    if (items.length === 0) return true // No checklist, proceed

    console.log(`\n📋 Checklist for ${phase}:\n`)

    // Group by category
    const categories: Array<'before' | 'during' | 'completion'> = ['before', 'during', 'completion']

    for (const category of categories) {
      const categoryItems = items.filter(item => item.category === category)
      if (categoryItems.length === 0) continue

      const categoryLabel = category === 'before' ? 'Before Starting' :
                           category === 'during' ? 'During Execution' :
                           'Completion Criteria'

      console.log(`\n  ${categoryLabel}:`)
      for (const item of categoryItems) {
        const status = item.checked ? '✓' : '☐'
        console.log(`    ${status} ${item.text}`)
      }
    }

    console.log('\n⚠️  Review checklist above before proceeding\n')

    // In real implementation, would prompt user for confirmation
    // For now, just proceed
    return true
  }

  /**
   * Check if checklist exists for workflow
   *
   * @param workflowId - Workflow identifier
   * @returns Boolean indicating if checklist is loaded
   */
  hasChecklist(workflowId: string): boolean {
    return this.checklists.has(workflowId)
  }

  /**
   * Get checklist for workflow
   *
   * @param workflowId - Workflow identifier
   * @returns Checklist or undefined
   */
  getChecklist(workflowId: string): Checklist | undefined {
    return this.checklists.get(workflowId)
  }

  /**
   * Mark checklist item as checked
   *
   * @param workflowId - Workflow identifier
   * @param phase - Phase name
   * @param itemText - Text of the item to mark
   */
  markItemChecked(workflowId: string, phase: string, itemText: string): void {
    const checklist = this.checklists.get(workflowId)
    if (!checklist) return

    const item = checklist.items.find(
      i => i.phase === phase && i.text === itemText
    )

    if (item) {
      item.checked = true
    }
  }

  /**
   * Get checklist summary
   *
   * @param workflowId - Workflow identifier
   * @returns Summary statistics
   */
  getChecklistSummary(workflowId: string): {
    totalItems: number
    checkedItems: number
    completionPercentage: number
  } | null {
    const checklist = this.checklists.get(workflowId)
    if (!checklist) return null

    const totalItems = checklist.items.length
    const checkedItems = checklist.items.filter(i => i.checked).length
    const completionPercentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

    return {
      totalItems,
      checkedItems,
      completionPercentage
    }
  }

  /**
   * Clear loaded checklists (useful for testing)
   */
  clear(): void {
    this.checklists.clear()
  }
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

/**
 * Singleton instance of ChecklistManager
 */
let checklistManagerInstance: ChecklistManager | null = null

/**
 * Get global ChecklistManager instance
 *
 * Creates new instance if doesn't exist.
 * Use this instead of creating ChecklistManager directly.
 */
export function getChecklistManager(): ChecklistManager {
  if (!checklistManagerInstance) {
    checklistManagerInstance = new ChecklistManager()
  }
  return checklistManagerInstance
}

/**
 * Reset ChecklistManager singleton (useful for testing)
 */
export function resetChecklistManager(): void {
  checklistManagerInstance = null
}
