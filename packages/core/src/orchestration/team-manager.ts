/**
 * TeamManager - Manages team configurations and workflow generation
 *
 * Phase 2: Team structure implementation
 *
 * Features:
 * - Load team definitions from teams.json
 * - Convert teams to workflow steps
 * - Validate team references in workflows
 * - Provide team metrics for analytics
 * - Singleton pattern for global access
 */

import { readFile } from 'fs/promises'
import { join } from 'path'
import type {
  Team,
  TeamAgent,
  TeamConfig,
  TeamMetrics,
  TeamValidation,
  Workflow,
  WorkflowStep
} from './types'

/**
 * TeamManager - Central management for team configurations
 */
export class TeamManager {
  private teams: Map<string, Team> = new Map()
  private initialized = false

  /**
   * Initialize TeamManager by loading teams.json
   */
  async initialize(configPath?: string): Promise<void> {
    const path = configPath || join(process.cwd(), '.cursor/config/orchestration/teams.json')

    try {
      const data = await readFile(path, 'utf-8')
      const config: TeamConfig = JSON.parse(data)

      for (const team of config.teams) {
        this.teams.set(team.id, team)
      }

      this.initialized = true
      console.log(`✅ TeamManager initialized: ${this.teams.size} teams loaded`)
    } catch (error) {
      // Teams are optional - system works without them
      console.warn('⚠️  No teams.json found, team features disabled')
      console.warn('   To enable teams, create .cursor/config/orchestration/teams.json')
      this.initialized = false
    }
  }

  /**
   * Check if TeamManager is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: string): Team | undefined {
    return this.teams.get(teamId)
  }

  /**
   * Get all teams
   */
  getAllTeams(): Team[] {
    return Array.from(this.teams.values())
  }

  /**
   * Convert team definition to workflow steps
   *
   * @param teamId - Team identifier
   * @param baseOrder - Starting order number for steps (default: 1)
   * @returns Array of workflow steps generated from team agents
   */
  teamToSteps(teamId: string, baseOrder: number = 1): WorkflowStep[] {
    const team = this.teams.get(teamId)
    if (!team) {
      throw new Error(`Team not found: ${teamId}`)
    }

    const steps: WorkflowStep[] = []
    let currentOrder = baseOrder

    // Group agents by phase
    const phaseGroups = new Map<string, TeamAgent[]>()
    for (const agent of team.agents) {
      const phase = agent.phase
      if (!phaseGroups.has(phase)) {
        phaseGroups.set(phase, [])
      }
      phaseGroups.get(phase)!.push(agent)
    }

    // Convert phases to steps
    for (const [phase, agents] of Array.from(phaseGroups)) {
      // Check if this phase should run in parallel
      const isParallel = team.default_parallel?.some(p =>
        agents.some(a => a.role_id === p || a.phase === p)
      )

      for (const agent of agents) {
        steps.push({
          order: currentOrder,
          role_id: agent.role_id,
          phase: agent.phase,
          description: `${agent.phase} phase`,
          deliverables: [],
          exit_criteria: `${agent.phase} phase completed successfully`,
          timeout: '30m',
          ...(agent.focus && { focus: agent.focus }),
          ...(agent.parallel_with && { parallel_with: agent.parallel_with })
        })
      }

      // Increment order for next phase (unless parallel)
      if (!isParallel) {
        currentOrder++
      }
    }

    return steps
  }

  /**
   * Validate workflow team reference
   *
   * Checks if:
   * 1. Team exists
   * 2. All workflow steps reference roles that exist in the team
   *
   * @param workflow - Workflow to validate
   * @returns Validation result with errors if any
   */
  validateWorkflowTeam(workflow: Workflow): TeamValidation {
    if (!workflow.team) {
      return { valid: true, errors: [] }
    }

    const errors: string[] = []
    const team = this.teams.get(workflow.team)

    if (!team) {
      errors.push(`Team not found: ${workflow.team}`)
      return { valid: false, errors }
    }

    // Validate that workflow steps match team agents
    const teamRoles = new Set(team.agents.map(a => a.role_id))
    const workflowRoles = new Set(workflow.steps.map(s => s.role_id))

    for (const role of Array.from(workflowRoles)) {
      if (!teamRoles.has(role)) {
        errors.push(`Workflow uses role "${role}" not in team "${team.id}"`)
      }
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Get team metrics for analytics
   *
   * @param teamId - Team identifier
   * @returns Team metrics or undefined if team not found
   */
  getTeamMetrics(teamId: string): TeamMetrics | undefined {
    const team = this.teams.get(teamId)
    if (!team) return undefined

    return {
      totalAgents: team.agents.length,
      parallelCapable: (team.default_parallel?.length || 0) > 0,
      estimatedDuration: team.estimated_duration || 'unknown'
    }
  }

  /**
   * List all team IDs
   */
  listTeamIds(): string[] {
    return Array.from(this.teams.keys())
  }

  /**
   * Check if team exists
   */
  hasTeam(teamId: string): boolean {
    return this.teams.has(teamId)
  }

  /**
   * Get team count
   */
  getTeamCount(): number {
    return this.teams.size
  }

  /**
   * Get teams by capability (e.g., parallel execution)
   */
  getTeamsByCapability(capability: 'parallel' | 'approval_required'): Team[] {
    return this.getAllTeams().filter(team => {
      if (capability === 'parallel') {
        return (team.default_parallel?.length || 0) > 0
      }
      if (capability === 'approval_required') {
        return team.approval_required === true
      }
      return false
    })
  }

  /**
   * Get summary of all teams
   */
  getSummary(): {
    totalTeams: number
    parallelTeams: number
    approvalTeams: number
    totalAgents: number
  } {
    const teams = this.getAllTeams()
    return {
      totalTeams: teams.length,
      parallelTeams: this.getTeamsByCapability('parallel').length,
      approvalTeams: this.getTeamsByCapability('approval_required').length,
      totalAgents: teams.reduce((sum, team) => sum + team.agents.length, 0)
    }
  }
}

// ============================================================================
// SINGLETON PATTERN
// ============================================================================

/**
 * Singleton instance of TeamManager
 */
let teamManagerInstance: TeamManager | null = null

/**
 * Get global TeamManager instance
 *
 * Creates new instance if doesn't exist.
 * Use this instead of creating TeamManager directly.
 */
export function getTeamManager(): TeamManager {
  if (!teamManagerInstance) {
    teamManagerInstance = new TeamManager()
  }
  return teamManagerInstance
}

/**
 * Reset TeamManager singleton (useful for testing)
 */
export function resetTeamManager(): void {
  teamManagerInstance = null
}
