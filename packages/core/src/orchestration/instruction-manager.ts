/**
 * InstructionManager - Manages agent instructions from markdown files
 *
 * Priority 2 Phase 2: Instruction Files implementation
 *
 * Features:
 * - Load agent system prompts from markdown files
 * - Load phase-specific instructions
 * - Load workflow-specific overrides
 * - Parse markdown into structured sections
 * - Instruction priority: workflow > phase > system
 * - Singleton pattern for global access
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import type { Workflow } from './types'

/**
 * Instruction section from markdown
 */
export interface InstructionSection {
  title: string
  content: string
}

/**
 * Agent instructions set
 */
export interface AgentInstructions {
  roleId: string
  systemPrompt: string
  phaseInstructions: Map<string, string>
  sections: InstructionSection[]
  loaded: boolean
}

/**
 * Workflow-specific instruction overrides
 */
export interface WorkflowInstructions {
  workflowId: string
  roleInstructions: Map<string, string> // roleId -> instructions
  loaded: boolean
}

/**
 * InstructionManager - Central management for agent instructions
 */
export class InstructionManager {
  private agentInstructions: Map<string, AgentInstructions> = new Map()
  private workflowInstructions: Map<string, WorkflowInstructions> = new Map()
  private instructionsBaseDir: string

  constructor() {
    this.instructionsBaseDir = join(process.cwd(), '.cursor/agents-instructions')
  }

  /**
   * Load agent's system prompt and phase instructions
   *
   * @param roleId - Agent role identifier (e.g., 'architect', 'developer')
   * @returns AgentInstructions object or null if not found
   */
  async loadAgentInstructions(roleId: string): Promise<AgentInstructions | null> {
    try {
      // Load base system prompt
      const systemPromptPath = join(this.instructionsBaseDir, roleId, 'system-prompt.md')
      let systemPrompt = ''
      let sections: InstructionSection[] = []

      try {
        const content = await readFile(systemPromptPath, 'utf-8')
        systemPrompt = content
        sections = this.parseInstructionMarkdown(content)
      } catch (error) {
        // System prompt is required - return null if not found
        console.warn(`⚠️  No system prompt found for role: ${roleId}`)
        console.warn(`   Expected at: ${systemPromptPath}`)
        return null
      }

      // Load phase-specific instructions
      const phaseInstructions = new Map<string, string>()
      const phases = ['design', 'planning', 'implementation', 'testing', 'deployment', 'monitoring']

      for (const phase of phases) {
        const phasePath = join(this.instructionsBaseDir, roleId, 'phases', `${phase}.md`)
        try {
          const phaseContent = await readFile(phasePath, 'utf-8')
          phaseInstructions.set(phase, phaseContent)
        } catch (error) {
          // Phase-specific instructions are optional
          // Don't log warnings for missing phase instructions - it's normal
        }
      }

      const instructions: AgentInstructions = {
        roleId,
        systemPrompt,
        phaseInstructions,
        sections,
        loaded: true
      }

      this.agentInstructions.set(roleId, instructions)
      return instructions
    } catch (error) {
      console.error(`❌ Error loading instructions for ${roleId}:`, error)
      return null
    }
  }

  /**
   * Load workflow-specific instruction overrides
   *
   * @param workflow - Workflow object
   * @param workflowFilePath - Path to workflow JSON file
   * @returns WorkflowInstructions object or null if not found
   */
  async loadWorkflowInstructions(
    workflow: Workflow,
    workflowFilePath: string
  ): Promise<WorkflowInstructions | null> {
    const instructionsPath = workflowFilePath.replace('.json', '.instructions.md')

    try {
      const content = await readFile(instructionsPath, 'utf-8')
      const roleInstructions = this.parseWorkflowInstructions(content)

      const instructions: WorkflowInstructions = {
        workflowId: workflow.id,
        roleInstructions,
        loaded: true
      }

      this.workflowInstructions.set(workflow.id, instructions)
      return instructions
    } catch (error) {
      // Workflow instructions are optional
      // Don't log warnings - most workflows won't have custom instructions
      return null
    }
  }

  /**
   * Parse markdown instruction file into structured sections
   *
   * Format:
   * # System Prompt
   * Base instructions for the agent
   *
   * ## Phase: design
   * Phase-specific guidance
   *
   * ### Focus Areas
   * - Focus 1
   * - Focus 2
   *
   * ### Constraints
   * - Constraint 1
   *
   * ### Deliverables
   * - Deliverable 1
   *
   * @param content - Markdown content
   * @returns Array of instruction sections
   */
  private parseInstructionMarkdown(content: string): InstructionSection[] {
    const sections: InstructionSection[] = []
    let currentSection: InstructionSection | null = null
    let currentContent: string[] = []

    const lines = content.split('\n')
    for (const line of lines) {
      // Detect section headers (# or ## or ###)
      if (line.match(/^#{1,3} /)) {
        // Save previous section
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim()
          sections.push(currentSection)
        }

        // Start new section
        currentSection = {
          title: line.replace(/^#{1,3} /, '').trim(),
          content: ''
        }
        currentContent = []
      } else if (currentSection) {
        // Accumulate content
        currentContent.push(line)
      }
    }

    // Save final section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim()
      sections.push(currentSection)
    }

    // Filter out sections with empty content
    return sections.filter(section => section.content.length > 0)
  }

  /**
   * Parse workflow-specific instruction overrides by role
   *
   * Format:
   * ## Role: architect
   * Custom instructions for architect in this workflow
   *
   * ## Role: developer
   * Custom instructions for developer in this workflow
   *
   * @param content - Markdown content
   * @returns Map of roleId -> instructions
   */
  private parseWorkflowInstructions(content: string): Map<string, string> {
    const roleInstructions = new Map<string, string>()
    let currentRole: string | null = null
    let currentContent: string[] = []

    const lines = content.split('\n')
    for (const line of lines) {
      // Detect role headers (## Role: {roleId})
      const match = line.match(/^## Role: (.+)$/)
      if (match) {
        // Save previous role
        if (currentRole) {
          roleInstructions.set(currentRole, currentContent.join('\n').trim())
        }

        // Start new role
        currentRole = match[1].trim()
        currentContent = []
      } else if (currentRole) {
        // Accumulate content
        currentContent.push(line)
      }
    }

    // Save final role
    if (currentRole) {
      roleInstructions.set(currentRole, currentContent.join('\n').trim())
    }

    return roleInstructions
  }

  /**
   * Get composed instructions for a step with priority
   *
   * Priority: workflow > phase > system
   *
   * @param roleId - Agent role identifier
   * @param phase - Phase name
   * @param workflowId - Workflow identifier (optional)
   * @returns Composed instruction string
   */
  async getInstructionsForStep(
    roleId: string,
    phase: string,
    workflowId?: string
  ): Promise<string> {
    const parts: string[] = []

    // Load agent instructions if not already loaded
    if (!this.agentInstructions.has(roleId)) {
      await this.loadAgentInstructions(roleId)
    }

    const agentInstructions = this.agentInstructions.get(roleId)

    // Layer 1: System prompt (base)
    if (agentInstructions?.systemPrompt) {
      parts.push('# System Prompt\n\n' + agentInstructions.systemPrompt)
    }

    // Layer 2: Phase-specific instructions
    if (agentInstructions?.phaseInstructions.has(phase)) {
      const phaseInstructions = agentInstructions.phaseInstructions.get(phase)
      if (phaseInstructions) {
        parts.push(`\n\n# Phase Instructions: ${phase}\n\n${phaseInstructions}`)
      }
    }

    // Layer 3: Workflow-specific overrides (highest priority)
    if (workflowId) {
      const workflowInstructions = this.workflowInstructions.get(workflowId)
      if (workflowInstructions?.roleInstructions.has(roleId)) {
        const override = workflowInstructions.roleInstructions.get(roleId)
        if (override) {
          parts.push(`\n\n# Workflow-Specific Instructions\n\n${override}`)
        }
      }
    }

    return parts.join('\n')
  }

  /**
   * Check if instructions exist for agent
   *
   * @param roleId - Agent role identifier
   * @returns Boolean indicating if instructions are loaded
   */
  hasInstructions(roleId: string): boolean {
    return this.agentInstructions.has(roleId)
  }

  /**
   * Get agent instructions
   *
   * @param roleId - Agent role identifier
   * @returns AgentInstructions or undefined
   */
  getAgentInstructions(roleId: string): AgentInstructions | undefined {
    return this.agentInstructions.get(roleId)
  }

  /**
   * Get workflow instructions
   *
   * @param workflowId - Workflow identifier
   * @returns WorkflowInstructions or undefined
   */
  getWorkflowInstructions(workflowId: string): WorkflowInstructions | undefined {
    return this.workflowInstructions.get(workflowId)
  }

  /**
   * Get summary of loaded instructions
   *
   * @returns Statistics about loaded instructions
   */
  getSummary(): {
    agentsWithInstructions: number
    workflowsWithInstructions: number
    totalPhaseInstructions: number
  } {
    let totalPhaseInstructions = 0
    for (const instructions of this.agentInstructions.values()) {
      totalPhaseInstructions += instructions.phaseInstructions.size
    }

    return {
      agentsWithInstructions: this.agentInstructions.size,
      workflowsWithInstructions: this.workflowInstructions.size,
      totalPhaseInstructions
    }
  }

  /**
   * Clear loaded instructions (useful for testing)
   */
  clear(): void {
    this.agentInstructions.clear()
    this.workflowInstructions.clear()
  }
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

/**
 * Singleton instance of InstructionManager
 */
let instructionManagerInstance: InstructionManager | null = null

/**
 * Get global InstructionManager instance
 *
 * Creates new instance if doesn't exist.
 * Use this instead of creating InstructionManager directly.
 */
export function getInstructionManager(): InstructionManager {
  if (!instructionManagerInstance) {
    instructionManagerInstance = new InstructionManager()
  }
  return instructionManagerInstance
}

/**
 * Reset InstructionManager singleton (useful for testing)
 */
export function resetInstructionManager(): void {
  instructionManagerInstance = null
}
