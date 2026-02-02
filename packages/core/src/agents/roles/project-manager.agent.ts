import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Project Manager Agent - Sprint planning, task breakdown, risk management
 *
 * Capabilities:
 * - LLM-based task breakdown using Work Breakdown Structure (WBS)
 * - Time estimation (story points → hours conversion)
 * - Risk assessment with likelihood × impact matrix
 * - Dependency identification and critical path analysis
 * - Resource allocation planning
 * - Sprint planning and milestone definition
 *
 * MCP Integrations:
 * - Memory MCP: Store project plans for learning and comparison
 * - Filesystem MCP: Read requirements and design documents
 */
export class ProjectManagerAgent extends BaseAgent {
  constructor() {
    super('project-manager', [
      'sprint_planning',
      'coordination',
      'tracking',
      'risk_management',
      'task_breakdown',
      'estimation'
    ])
  }

  /**
   * Execute project planning workflow
   *
   * Process:
   * 1. Extract requirements and design from state
   * 2. Check Memory MCP for similar past projects
   * 3. Generate Work Breakdown Structure (WBS)
   * 4. Estimate effort for each task (story points → hours)
   * 5. Identify dependencies and critical path
   * 6. Assess risks (likelihood × impact matrix)
   * 7. Allocate resources to tasks
   * 8. Define sprint plan and milestones
   * 9. Generate comprehensive project plan document
   * 10. Store plan in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('📋 Creating comprehensive project plan...')

    try {
      // STEP 1: Extract task and context
      const task = state.task || this.extractTaskFromMessages(state)

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createEmptyResult(state)
      }

      // Extract requirements and design context
      const requirements = this.extractRequirements(state)
      const design = this.extractDesign(state)

      // STEP 2: Check Memory MCP for similar projects
      this.log('Checking past project plans...')
      const pastProjects = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `project plan ${task}`,
        type: 'project_plan',
        limit: 3
      })

      // STEP 3: Generate Work Breakdown Structure
      this.log('Creating Work Breakdown Structure (WBS)...')
      const wbs = await this.generateWBS(task, requirements, design)

      // STEP 4: Estimate effort
      this.log('Estimating effort for tasks...')
      const estimates = await this.estimateEffort(wbs.tasks)

      // STEP 5: Identify dependencies
      this.log('Identifying dependencies and critical path...')
      const dependencies = await this.identifyDependencies(wbs.tasks)

      // STEP 6: Assess risks
      this.log('Assessing project risks...')
      const risks = await this.assessRisks(task, wbs.tasks, design)

      // STEP 7: Allocate resources
      this.log('Allocating resources...')
      const resourceAllocation = this.allocateResources(wbs.tasks, estimates)

      // STEP 8: Define sprint plan
      this.log('Creating sprint plan...')
      const sprintPlan = this.createSprintPlan(wbs.tasks, estimates, dependencies)

      // STEP 9: Generate comprehensive project plan document
      const projectPlanDocument = this.generateProjectPlanDocument(
        task,
        wbs,
        estimates,
        dependencies,
        risks,
        resourceAllocation,
        sprintPlan,
        pastProjects
      )

      // STEP 10: Store in Memory MCP
      this.log('Storing project plan...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Project Plan: ${task}`,
          entityType: 'project_plan',
          observations: [
            `Total Tasks: ${wbs.tasks.length}`,
            `Total Effort: ${estimates.totalHours} hours (${estimates.totalDays} days)`,
            `High Risks: ${risks.filter((r: any) => r.severity === 'High').length}`,
            `Sprint Duration: ${sprintPlan.totalSprints} sprints`,
            `Critical Path: ${dependencies.criticalPath.join(' → ')}`
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        projectPlanDocument.fullDocument,
        {
          taskCount: wbs.tasks.length,
          totalHours: estimates.totalHours,
          totalDays: estimates.totalDays,
          sprintCount: sprintPlan.totalSprints,
          riskCount: risks.length
        }
      )

      // Create result
      const result = this.createResult(
        'success',
        {
          taskCount: wbs.tasks.length,
          totalEffort: `${estimates.totalHours}h (${estimates.totalDays}d)`,
          sprints: sprintPlan.totalSprints,
          highRisks: risks.filter((r: any) => r.severity === 'High').length,
          criticalPath: dependencies.criticalPath
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          projectPlan: {
            tasks: wbs.tasks,
            totalHours: estimates.totalHours,
            sprints: sprintPlan.totalSprints,
            risks: risks
          }
        },
        nextAction: 'developer' // Ready for implementation
      }

    } catch (error: any) {
      this.log(`Project planning failed: ${error.message}`, 'error')

      const errorResult = this.createResult(
        'failed',
        { error: error.message },
        []
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  /**
   * Generate Work Breakdown Structure (WBS)
   * Breaks down high-level task into manageable subtasks
   */
  private async generateWBS(task: string, requirements: any, design: any): Promise<{
    tasks: Array<{
      id: string
      name: string
      description: string
      category: string
      priority: 'Critical' | 'High' | 'Medium' | 'Low'
      phase: string
    }>
    totalTasks: number
  }> {
    const prompt = `As a Project Manager, create a Work Breakdown Structure (WBS) for this task.

Task: ${task}

Requirements Summary: ${JSON.stringify(requirements, null, 2)}
Design Summary: ${JSON.stringify(design, null, 2)}

Break down the work into specific, actionable tasks organized by phase:
- Setup & Configuration
- Database Schema
- Backend API
- Frontend UI
- Testing
- Deployment

For each task, provide:
- id (e.g., "TASK-001")
- name (concise task title)
- description (what needs to be done)
- category (database/backend/frontend/testing/devops)
- priority (Critical/High/Medium/Low)
- phase (setup/development/testing/deployment)

Provide response in JSON format:
{
  "tasks": [
    {
      "id": "TASK-001",
      "name": "Create database migration",
      "description": "Create SQL migration for new tables...",
      "category": "database",
      "priority": "Critical",
      "phase": "setup"
    }
  ],
  "totalTasks": 12
}

Aim for 8-15 tasks (not too granular, not too high-level).`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })
    const content = response.content

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback
      return {
        tasks: [
          {
            id: 'TASK-001',
            name: 'Setup development environment',
            description: 'Configure project structure and dependencies',
            category: 'setup',
            priority: 'Critical',
            phase: 'setup'
          },
          {
            id: 'TASK-002',
            name: 'Implement core functionality',
            description: 'Build main features according to requirements',
            category: 'backend',
            priority: 'Critical',
            phase: 'development'
          },
          {
            id: 'TASK-003',
            name: 'Create tests',
            description: 'Write unit and integration tests',
            category: 'testing',
            priority: 'High',
            phase: 'testing'
          }
        ],
        totalTasks: 3
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Estimate effort for each task
   * Converts complexity → story points → hours
   */
  private async estimateEffort(tasks: any[]): Promise<{
    taskEstimates: Array<{
      taskId: string
      storyPoints: number
      hours: number
      days: number
      confidence: 'High' | 'Medium' | 'Low'
    }>
    totalHours: number
    totalDays: number
  }> {
    const prompt = `Estimate effort for these tasks using story points and hours.

Tasks:
${tasks.map(t => `- ${t.id}: ${t.name} (${t.category}, ${t.priority})`).join('\n')}

Story Point Scale:
- 1 point = 2-4 hours (simple, straightforward)
- 2 points = 4-8 hours (moderate complexity)
- 3 points = 8-16 hours (complex, requires research)
- 5 points = 16-24 hours (very complex, multiple components)
- 8 points = 24-40 hours (extremely complex, consider breaking down)

For each task, provide:
- taskId
- storyPoints (1/2/3/5/8)
- hours (estimated hours based on story points)
- days (hours / 8, rounded up)
- confidence (High/Medium/Low - how certain is the estimate)

Provide response in JSON format:
{
  "taskEstimates": [
    {
      "taskId": "TASK-001",
      "storyPoints": 3,
      "hours": 12,
      "days": 2,
      "confidence": "High"
    }
  ],
  "totalHours": 96,
  "totalDays": 12
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback: 8 hours per task
      const fallbackEstimates = tasks.map((t, _idx) => ({
        taskId: t.id,
        storyPoints: 2,
        hours: 8,
        days: 1,
        confidence: 'Medium' as const
      }))

      return {
        taskEstimates: fallbackEstimates,
        totalHours: fallbackEstimates.length * 8,
        totalDays: fallbackEstimates.length
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Identify task dependencies and calculate critical path
   */
  private async identifyDependencies(tasks: any[]): Promise<{
    dependencies: Array<{
      taskId: string
      dependsOn: string[]
      reasoning: string
    }>
    criticalPath: string[]
    parallelizable: string[][]
  }> {
    const prompt = `Identify dependencies between these tasks and determine the critical path.

Tasks:
${tasks.map(t => `- ${t.id}: ${t.name} (${t.phase}, ${t.category})`).join('\n')}

Rules:
- Database migrations must happen before API/UI development
- Backend APIs must exist before frontend can consume them
- Tests depend on implementation being complete
- Deployment depends on tests passing

For each task, identify what it depends on (if anything).

Provide response in JSON format:
{
  "dependencies": [
    {
      "taskId": "TASK-002",
      "dependsOn": ["TASK-001"],
      "reasoning": "API needs database schema to be ready"
    }
  ],
  "criticalPath": ["TASK-001", "TASK-002", "TASK-005"],
  "parallelizable": [
    ["TASK-003", "TASK-004"]
  ]
}

Critical path = longest sequence of dependent tasks (determines minimum project duration).
Parallelizable = tasks that can be done simultaneously.`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback: sequential dependencies
      return {
        dependencies: tasks.slice(1).map((t, idx) => ({
          taskId: t.id,
          dependsOn: [tasks[idx].id],
          reasoning: 'Sequential workflow'
        })),
        criticalPath: tasks.map(t => t.id),
        parallelizable: []
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Assess project risks using likelihood × impact matrix
   */
  private async assessRisks(task: string, tasks: any[], design: any): Promise<Array<{
    id: string
    risk: string
    category: string
    likelihood: 'High' | 'Medium' | 'Low'
    impact: 'High' | 'Medium' | 'Low'
    severity: 'Critical' | 'High' | 'Medium' | 'Low'
    mitigation: string
  }>> {
    const prompt = `Assess project risks for this task in a B2B meat trading platform.

Task: ${task}

Tasks to complete:
${tasks.map(t => `- ${t.name} (${t.category})`).join('\n')}

Design context: ${JSON.stringify(design, null, 2)}

Identify 3-6 risks across these categories:
- Technical (complexity, technology limitations, integration issues)
- Resource (availability, skill gaps, dependencies on others)
- Schedule (tight deadlines, scope creep, estimation errors)
- Business (market changes, stakeholder alignment, budget)

For each risk, provide:
- id (e.g., "RISK-001")
- risk (description of the risk)
- category (technical/resource/schedule/business)
- likelihood (High/Medium/Low - probability of occurring)
- impact (High/Medium/Low - damage if it occurs)
- severity (derived from likelihood × impact matrix)
- mitigation (how to prevent or reduce the risk)

Likelihood × Impact Matrix:
- High × High = Critical
- High × Medium = High
- Medium × High = High
- Medium × Medium = Medium
- Low × High = Medium
- High × Low = Medium
- Medium × Low = Low
- Low × Medium = Low
- Low × Low = Low

Provide response in JSON format:
{
  "risks": [
    {
      "id": "RISK-001",
      "risk": "Database migration may fail in production",
      "category": "technical",
      "likelihood": "Medium",
      "impact": "High",
      "severity": "High",
      "mitigation": "Test migration on staging environment, create rollback plan"
    }
  ]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 8192
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback risks
      return [
        {
          id: 'RISK-001',
          risk: 'Scope creep due to unclear requirements',
          category: 'schedule',
          likelihood: 'Medium',
          impact: 'Medium',
          severity: 'Medium',
          mitigation: 'Maintain strict scope control, document all changes'
        },
        {
          id: 'RISK-002',
          risk: 'Technical complexity higher than estimated',
          category: 'technical',
          likelihood: 'Medium',
          impact: 'High',
          severity: 'High',
          mitigation: 'Add buffer time, involve senior engineers early'
        }
      ]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.risks || []
  }

  /**
   * Allocate resources (agents) to tasks
   */
  private allocateResources(tasks: any[], estimates: any): {
    allocations: Array<{
      taskId: string
      assignedTo: string
      reason: string
    }>
    resourceUtilization: Record<string, number>
  } {
    const allocations = tasks.map(task => {
      // Map task category to agent role
      let assignedTo = 'developer'

      switch (task.category) {
        case 'database':
          assignedTo = 'architect' // Database design
          break
        case 'backend':
          assignedTo = 'developer' // Backend APIs
          break
        case 'frontend':
          assignedTo = 'ui_developer' // UI components
          break
        case 'testing':
          assignedTo = 'tester' // QA testing
          break
        case 'devops':
        case 'deployment':
          assignedTo = 'devops' // Infrastructure
          break
        case 'setup':
          assignedTo = 'architect' // Initial setup
          break
        default:
          assignedTo = 'developer'
      }

      return {
        taskId: task.id,
        assignedTo,
        reason: `${task.category} work best suited for ${assignedTo}`
      }
    })

    // Calculate resource utilization
    const resourceUtilization: Record<string, number> = {}
    allocations.forEach(alloc => {
      const estimate = estimates.taskEstimates.find((e: any) => e.taskId === alloc.taskId)
      const hours = estimate?.hours || 8
      resourceUtilization[alloc.assignedTo] = (resourceUtilization[alloc.assignedTo] || 0) + hours
    })

    return { allocations, resourceUtilization }
  }

  /**
   * Create sprint plan (2-week sprints)
   */
  private createSprintPlan(tasks: any[], estimates: any, _dependencies: any): {
    sprints: Array<{
      number: number
      duration: string
      tasks: string[]
      totalHours: number
    }>
    totalSprints: number
  } {
    const HOURS_PER_SPRINT = 80 // 2 weeks × 5 days × 8 hours
    const sprints: Array<{
      number: number
      duration: string
      tasks: string[]
      totalHours: number
    }> = []

    let currentSprintNumber = 1
    let currentSprintHours = 0
    let currentSprintTasks: string[] = []

    // Simple greedy allocation (in reality would consider dependencies)
    tasks.forEach((task: any) => {
      const estimate = estimates.taskEstimates.find((e: any) => e.taskId === task.id)
      const hours = estimate?.hours || 8

      if (currentSprintHours + hours > HOURS_PER_SPRINT && currentSprintTasks.length > 0) {
        // Start new sprint
        sprints.push({
          number: currentSprintNumber,
          duration: '2 weeks',
          tasks: [...currentSprintTasks],
          totalHours: currentSprintHours
        })
        currentSprintNumber++
        currentSprintHours = 0
        currentSprintTasks = []
      }

      currentSprintTasks.push(task.id)
      currentSprintHours += hours
    })

    // Add final sprint
    if (currentSprintTasks.length > 0) {
      sprints.push({
        number: currentSprintNumber,
        duration: '2 weeks',
        tasks: currentSprintTasks,
        totalHours: currentSprintHours
      })
    }

    return {
      sprints,
      totalSprints: sprints.length
    }
  }

  /**
   * Generate comprehensive project plan document
   */
  private generateProjectPlanDocument(
    task: string,
    wbs: any,
    estimates: any,
    dependencies: any,
    risks: any[],
    resourceAllocation: any,
    sprintPlan: any,
    pastProjects: any
  ): {
    fullDocument: string
  } {
    const fullDocument = `# Project Plan: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Project Manager**: AI Agent
**Status**: Planning Complete

---

## Executive Summary

**Total Tasks**: ${wbs.totalTasks}
**Estimated Effort**: ${estimates.totalHours} hours (${estimates.totalDays} working days)
**Duration**: ${sprintPlan.totalSprints} sprints (${sprintPlan.totalSprints * 2} weeks)
**High-Priority Risks**: ${risks.filter(r => r.severity === 'High' || r.severity === 'Critical').length}
**Critical Path Length**: ${dependencies.criticalPath.length} tasks

---

## Work Breakdown Structure (WBS)

${wbs.tasks.map((t: any, idx: number) => {
  const estimate = estimates.taskEstimates.find((e: any) => e.taskId === t.id)
  const deps = dependencies.dependencies.find((d: any) => d.taskId === t.id)

  return `### ${idx + 1}. ${t.name} (${t.id})

**Category**: ${t.category}
**Priority**: ${t.priority}
**Phase**: ${t.phase}

${t.description}

**Estimate**: ${estimate?.storyPoints || 2} story points (${estimate?.hours || 8}h, ${estimate?.days || 1}d)
**Confidence**: ${estimate?.confidence || 'Medium'}
${deps && deps.dependsOn.length > 0 ? `**Dependencies**: ${deps.dependsOn.join(', ')}\n**Reasoning**: ${deps.reasoning}` : '**Dependencies**: None'}`
}).join('\n\n')}

---

## Critical Path Analysis

**Critical Path**: ${dependencies.criticalPath.join(' → ')}

**Minimum Duration**: ${dependencies.criticalPath.map((taskId: string) => {
  const estimate = estimates.taskEstimates.find((e: any) => e.taskId === taskId)
  return estimate?.days || 1
}).reduce((a: number, b: number) => a + b, 0)} days

${dependencies.parallelizable.length > 0 ? `**Parallelizable Tasks**:\n${dependencies.parallelizable.map((group: string[]) => `- ${group.join(', ')}`).join('\n')}` : '**Note**: All tasks are sequential (no parallel work opportunities)'}

---

## Effort Estimates

| Task ID | Task Name | Story Points | Hours | Days | Confidence |
|---------|-----------|--------------|-------|------|------------|
${estimates.taskEstimates.map((e: any) => {
  const task = wbs.tasks.find((t: any) => t.id === e.taskId)
  return `| ${e.taskId} | ${task?.name || 'Unknown'} | ${e.storyPoints} | ${e.hours}h | ${e.days}d | ${e.confidence} |`
}).join('\n')}
| **TOTAL** | | **${estimates.taskEstimates.reduce((sum: number, e: any) => sum + e.storyPoints, 0)}** | **${estimates.totalHours}h** | **${estimates.totalDays}d** | |

---

## Risk Assessment

${risks.map((r: any) => `### ${r.id}: ${r.risk}

**Category**: ${r.category}
**Likelihood**: ${r.likelihood}
**Impact**: ${r.impact}
**Severity**: ${r.severity}

**Mitigation Strategy**:
${r.mitigation}`).join('\n\n')}

---

## Risk Matrix

| Likelihood \\ Impact | High | Medium | Low |
|---------------------|------|--------|-----|
| **High** | ${risks.filter(r => r.likelihood === 'High' && r.impact === 'High').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'High' && r.impact === 'Medium').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'High' && r.impact === 'Low').map(r => r.id).join(', ') || '-'} |
| **Medium** | ${risks.filter(r => r.likelihood === 'Medium' && r.impact === 'High').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'Medium' && r.impact === 'Medium').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'Medium' && r.impact === 'Low').map(r => r.id).join(', ') || '-'} |
| **Low** | ${risks.filter(r => r.likelihood === 'Low' && r.impact === 'High').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'Low' && r.impact === 'Medium').map(r => r.id).join(', ') || '-'} | ${risks.filter(r => r.likelihood === 'Low' && r.impact === 'Low').map(r => r.id).join(', ') || '-'} |

---

## Resource Allocation

${resourceAllocation.allocations.map((a: any) => {
  const task = wbs.tasks.find((t: any) => t.id === a.taskId)
  const estimate = estimates.taskEstimates.find((e: any) => e.taskId === a.taskId)
  return `### ${a.taskId}: ${task?.name || 'Unknown'}
**Assigned To**: ${a.assignedTo}
**Effort**: ${estimate?.hours || 8}h
**Reason**: ${a.reason}`
}).join('\n\n')}

---

## Resource Utilization

| Agent | Total Hours | Workload |
|-------|-------------|----------|
${Object.entries(resourceAllocation.resourceUtilization).map(([agent, hours]) =>
  `| ${agent} | ${hours}h | ${((hours as number) / estimates.totalHours * 100).toFixed(1)}% |`
).join('\n')}

---

## Sprint Plan (2-week sprints)

${sprintPlan.sprints.map((sprint: any) => `### Sprint ${sprint.number} (${sprint.duration})

**Tasks**: ${sprint.tasks.length}
**Estimated Effort**: ${sprint.totalHours}h
**Capacity Utilization**: ${(sprint.totalHours / 80 * 100).toFixed(0)}%

**Tasks in this sprint**:
${sprint.tasks.map((taskId: string) => {
  const task = wbs.tasks.find((t: any) => t.id === taskId)
  const estimate = estimates.taskEstimates.find((e: any) => e.taskId === taskId)
  const allocation = resourceAllocation.allocations.find((a: any) => a.taskId === taskId)
  return `- ${taskId}: ${task?.name || 'Unknown'} (${estimate?.hours || 8}h, ${allocation?.assignedTo || 'unassigned'})`
}).join('\n')}`).join('\n\n')}

---

## Milestones

${sprintPlan.sprints.map((sprint: any, _idx: number) =>
  `- [ ] Sprint ${sprint.number} Complete (End of Week ${sprint.number * 2})`
).join('\n')}
- [ ] Code Review Complete
- [ ] All Tests Passing
- [ ] Production Deployment

---

## Historical Context

${pastProjects && pastProjects.length > 0 ?
  `Similar projects completed in the past:\n${pastProjects.map((p: any) => `- ${p.name || p.title || 'Previous project'}`).join('\n')}` :
  'No similar projects found in history.'
}

---

## Success Criteria

- All ${wbs.totalTasks} tasks completed
- All tests passing (unit, integration, E2E)
- Code review approved
- All High/Critical risks mitigated
- Performance targets met
- Deployed to production successfully

---

**Generated by**: Project Manager Agent
**Timestamp**: ${new Date().toISOString()}
**Ready for**: Implementation Phase
`

    return { fullDocument }
  }

  /**
   * Extract task from messages if not in state.task
   */
  private extractTaskFromMessages(state: AgentState): string {
    for (const message of state.messages.slice().reverse()) {
      const content = typeof message.content === 'string' ? message.content : ''
      if (content && content.length > 10) {
        return content
      }
    }
    return ''
  }

  /**
   * Extract requirements from previous agent results
   */
  private extractRequirements(state: AgentState): any {
    // Look for Business Analyst output
    for (const result of state.agentResults.slice().reverse()) {
      if (result.agentName === 'business-analyst' || result.agentName === 'business_analyst') {
        return result.result
      }
    }

    // Fallback: check state.context
    if (state.context?.requirements) {
      return state.context.requirements
    }

    return { functional: [], nonFunctional: [], constraints: [] }
  }

  /**
   * Extract design from previous agent results
   */
  private extractDesign(state: AgentState): any {
    // Look for Architect output
    for (const result of state.agentResults.slice().reverse()) {
      if (result.agentName === 'architect') {
        return result.result
      }
    }

    // Fallback: check state.context
    if (state.context?.design) {
      return state.context.design
    }

    return { adr: null, api: null, database: null }
  }

  /**
   * Create empty result when no task provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# Project Plan\n\nNo task provided for planning.',
      {}
    )

    const result = this.createResult(
      'failed',
      { error: 'No task provided' },
      [artifact]
    )

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
