import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Scrum Master Agent - Agile ceremonies, sprint management, team facilitation
 *
 * Capabilities:
 * - Sprint planning and backlog management
 * - Daily standup facilitation
 * - Sprint retrospectives
 * - Impediment tracking and resolution
 * - Velocity and burndown analysis
 * - Agile coaching and process improvement
 *
 * MCP Integrations:
 * - GitHub MCP (P0): Track issues, sprints, milestones
 * - Memory MCP (P1): Store team retrospectives and action items
 */
export class ScrumMasterAgent extends BaseAgent {
  constructor() {
    super('scrum-master', [
      'sprint_planning',
      'backlog_management',
      'agile_ceremonies',
      'impediment_resolution',
      'velocity_tracking',
      'retrospective_facilitation',
      'story_estimation',
      'team_coaching'
    ])
  }

  /**
   * Execute Scrum Master workflow
   *
   * Process:
   * 1. Analyze current sprint state via GitHub MCP
   * 2. Check team velocity and historical data from Memory MCP
   * 3. Based on task type, facilitate appropriate ceremony
   * 4. Generate actionable insights and recommendations
   * 5. Store ceremony results in Memory MCP
   * 6. Handoff to appropriate agent or complete
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🏃 Starting Scrum Master workflow...')

    try {
      // STEP 1: Analyze current sprint state
      this.log('Analyzing current sprint state...')
      const sprintIssues = await this.requestMCP('github', {
        action: 'search_issues',
        query: `milestone:current is:open`,
        state: 'open'
      })

      // STEP 2: Retrieve team velocity and historical data
      this.log('Retrieving team metrics...')
      const teamMetrics = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: 'sprint velocity retrospective',
        type: 'team_metrics'
      })

      // STEP 3: Determine ceremony type and facilitate
      const ceremonyType = this.determineCeremonyType(state.task)
      this.log(`Facilitating ${ceremonyType}...`)

      const ceremonyResult = await this.facilitateCeremony(
        ceremonyType,
        state,
        { sprintIssues, teamMetrics }
      )

      // STEP 4: Create artifacts
      const ceremonyReport = this.createArtifact(
        'documentation',
        this.formatCeremonyReport(ceremonyType, ceremonyResult),
        {
          ceremonyType,
          timestamp: new Date().toISOString()
        }
      )

      const actionItems = this.extractActionItems(ceremonyResult)

      // STEP 5: Store in Memory MCP
      this.log('Storing ceremony results...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `${ceremonyType}: ${state.task}`,
          entityType: 'agile_ceremony',
          observations: [ceremonyReport.content]
        }]
      })

      // STEP 6: Create result and determine next action
      const result = this.createResult('success', ceremonyResult, [ceremonyReport])
      result.confidence = 0.85

      this.log(`✅ ${ceremonyType} complete with ${actionItems.length} action items`)

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          ceremonyResult,
          actionItems,
          ceremonyType
        },
        nextAction: actionItems.length > 0 ? 'project-manager' : 'END'
      }

    } catch (error) {
      this.log(`Error during execution: ${error}`, 'error')

      const failedResult = this.createResult('failed', {
        error: error instanceof Error ? error.message : 'Unknown error'
      })

      return {
        agentResults: [...state.agentResults, failedResult],
        nextAction: 'END'
      }
    }
  }

  /**
   * Determine ceremony type from task description
   */
  private determineCeremonyType(task: string): string {
    const taskLower = task.toLowerCase()

    if (taskLower.includes('planning') || taskLower.includes('plan sprint')) {
      return 'Sprint Planning'
    } else if (taskLower.includes('retrospective') || taskLower.includes('retro')) {
      return 'Sprint Retrospective'
    } else if (taskLower.includes('standup') || taskLower.includes('daily')) {
      return 'Daily Standup'
    } else if (taskLower.includes('review') || taskLower.includes('demo')) {
      return 'Sprint Review'
    } else if (taskLower.includes('refinement') || taskLower.includes('grooming')) {
      return 'Backlog Refinement'
    } else {
      return 'Sprint Planning' // Default
    }
  }

  /**
   * Facilitate Agile ceremony using Claude LLM
   */
  private async facilitateCeremony(
    ceremonyType: string,
    state: AgentState,
    context: {
      sprintIssues: any
      teamMetrics: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the Scrum Master for MeatConnect, a B2B marketplace platform.

CEREMONY TYPE: ${ceremonyType}

TEAM CONTEXT:
- Tech Stack: React 19, TypeScript, Express.js, PostgreSQL, Drizzle ORM
- Deployment: Vercel (frontend), Render (backend), Supabase (database)
- Domain: B2B meat products marketplace with RFQ workflow
- Team Size: Cross-functional (Frontend, Backend, DevOps, QA)
- Sprint Length: 2 weeks
- Velocity: ~40-50 story points per sprint (from historical data)

CURRENT SPRINT STATE:
${JSON.stringify(context.sprintIssues, null, 2)}

HISTORICAL METRICS:
${JSON.stringify(context.teamMetrics, null, 2)}

TASK:
${state.task}

${this.getCeremonyGuidance(ceremonyType)}

Format your response as clear, actionable facilitation output.`

    const response = await this.callLLM(systemPrompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 4096
    })

    return response.content
  }

  /**
   * Get ceremony-specific guidance
   */
  private getCeremonyGuidance(ceremonyType: string): string {
    switch (ceremonyType) {
      case 'Sprint Planning':
        return `
PROVIDE:
1. Sprint Goal (clear, measurable objective)
2. Capacity Analysis (team availability, velocity)
3. Story Prioritization (top stories for sprint, ordered by value)
4. Story Point Estimates (Fibonacci: 1, 2, 3, 5, 8, 13)
5. Sprint Commitment (realistic scope based on velocity)
6. Dependencies & Risks (blockers, external dependencies)
7. Definition of Done (acceptance criteria for stories)

Focus on creating a realistic, achievable sprint plan.`

      case 'Sprint Retrospective':
        return `
PROVIDE:
1. What Went Well (celebrate successes, 3-5 items)
2. What Could Be Improved (areas for growth, 3-5 items)
3. Action Items (specific, actionable, with owners)
   - Action: [Description]
   - Owner: [Team member or role]
   - Target: [When to complete]
4. Team Velocity Analysis (compare planned vs actual)
5. Process Improvements (changes to adopt next sprint)
6. Appreciations (team shout-outs, positive feedback)

Focus on continuous improvement and team morale.`

      case 'Daily Standup':
        return `
PROVIDE:
1. Yesterday's Progress (completed work)
2. Today's Plan (work to tackle today)
3. Blockers & Impediments (issues needing resolution)
4. Sprint Progress (% complete, burndown update)
5. Action Items (quick decisions, follow-ups)

Keep it brief, focused, and action-oriented (15 min max).`

      case 'Sprint Review':
        return `
PROVIDE:
1. Demo Summary (features completed this sprint)
2. Stakeholder Feedback (gather input from product owner, users)
3. Acceptance Status (which stories meet Definition of Done)
4. Product Backlog Updates (new insights, priority changes)
5. Next Sprint Preview (upcoming priorities)

Focus on demonstrating value and gathering feedback.`

      case 'Backlog Refinement':
        return `
PROVIDE:
1. Story Refinement (clarify requirements, acceptance criteria)
2. Story Point Estimates (use team's velocity as reference)
3. Story Dependencies (identify blockers, prerequisites)
4. Story Splitting (break down large stories into smaller ones)
5. Priority Recommendations (order backlog by value/urgency)
6. Technical Considerations (flag complex stories for architect)

Focus on preparing stories for upcoming sprints.`

      default:
        return 'Facilitate the Agile ceremony with team collaboration and actionable outcomes.'
    }
  }

  /**
   * Extract action items from ceremony result
   */
  private extractActionItems(ceremonyResult: string): string[] {
    const actionItems: string[] = []
    const lines = ceremonyResult.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Match various action item formats
      if (
        line.match(/^-\s*\[.*?\]/i) || // - [ ] Task format
        line.match(/^action\s*:/i) ||   // Action: format
        line.match(/^todo\s*:/i) ||     // Todo: format
        line.match(/^\d+\.\s*\[.*?\]/i) // 1. [ ] Task format
      ) {
        actionItems.push(line)
      }
    }

    return actionItems
  }

  /**
   * Format ceremony report
   */
  private formatCeremonyReport(ceremonyType: string, result: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# ${ceremonyType} Report

**Date**: ${timestamp}
**Facilitator**: Scrum Master Agent
**Context**: MeatConnect Sprint Management

---

## Ceremony Output

${result}

---

**Generated by**: Scrum Master Agent (ASMO Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}
`
  }
}
