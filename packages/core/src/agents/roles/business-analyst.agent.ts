import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Business Analyst Agent - Requirements gathering and user story creation
 *
 * Capabilities:
 * - Requirements extraction from natural language and product strategy
 * - User story generation (As a [user], I want [goal], So that [benefit])
 * - Acceptance criteria definition (Given-When-Then format)
 * - Success metrics and KPIs identification
 * - Edge case identification
 * - Requirements traceability
 *
 * MCP Integrations:
 * - Memory MCP: Store requirements for learning and traceability
 * - Filesystem MCP: Read existing requirements documents
 */
export class BusinessAnalystAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('business-analyst', [
      'requirements',
      'user_stories',
      'kpis',
      'business_logic',
      'requirements_elicitation',
      'acceptance_criteria'
    ])

    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2,
      maxTokens: 4096
    })
  }

  /**
   * Execute requirements analysis workflow
   *
   * Process:
   * 1. Extract task and product strategy from state
   * 2. Check Memory MCP for similar requirements
   * 3. Extract requirements from natural language
   * 4. Generate user stories in standard format
   * 5. Create acceptance criteria (Given-When-Then)
   * 6. Identify success metrics and KPIs
   * 7. Identify edge cases and error scenarios
   * 8. Generate comprehensive requirements document
   * 9. Store requirements in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('📊 Analyzing business requirements...')

    try {
      // STEP 1: Extract task and context
      const task = state.task || this.extractTaskFromMessages(state)
      const productStrategy = state.context?.productStrategy

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar requirements
      this.log('Checking requirements history...')
      const pastRequirements = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `requirements ${task}`,
        type: 'requirements_document',
        limit: 3
      })

      // STEP 3: Extract requirements
      this.log('Extracting requirements from description...')
      const extractedRequirements = await this.extractRequirements(task, productStrategy)

      // STEP 4: Generate user stories
      this.log('Generating user stories...')
      const userStories = await this.generateUserStories(task, extractedRequirements)

      // STEP 5: Create acceptance criteria
      this.log('Creating acceptance criteria...')
      const acceptanceCriteria = await this.generateAcceptanceCriteria(task, userStories)

      // STEP 6: Identify success metrics
      this.log('Identifying success metrics...')
      const successMetrics = await this.identifySuccessMetrics(task, userStories)

      // STEP 7: Identify edge cases
      this.log('Identifying edge cases...')
      const edgeCases = await this.identifyEdgeCases(task, userStories)

      // STEP 8: Generate requirements document
      const requirementsDocument = this.generateRequirementsDocument(
        task,
        extractedRequirements,
        userStories,
        acceptanceCriteria,
        successMetrics,
        edgeCases,
        productStrategy,
        pastRequirements
      )

      // STEP 9: Store in Memory MCP
      this.log('Storing requirements document...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Requirements: ${task}`,
          entityType: 'requirements_document',
          observations: [
            `User Stories: ${userStories.length}`,
            `Acceptance Criteria: ${acceptanceCriteria.length}`,
            `Edge Cases: ${edgeCases.length}`,
            `Success Metrics: ${successMetrics.length}`,
            ...userStories.map(s => `Story: ${s.title}`)
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        requirementsDocument.fullDocument,
        {
          userStoryCount: userStories.length,
          acceptanceCriteriaCount: acceptanceCriteria.length,
          edgeCaseCount: edgeCases.length
        }
      )

      // Create result
      const result = this.createResult(
        'success',
        {
          userStories: userStories.map(s => s.title),
          acceptanceCriteria: acceptanceCriteria.map(c => c.title),
          successMetrics: successMetrics,
          edgeCaseCount: edgeCases.length,
          requirementsSummary: requirementsDocument.summary
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          requirements: {
            userStories,
            acceptanceCriteria,
            successMetrics,
            edgeCases
          }
        },
        nextAction: 'requirements_validator' // Hand to validator for review
      }

    } catch (error: any) {
      this.log(`Requirements analysis failed: ${error.message}`, 'error')

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
   * Extract requirements from natural language description
   */
  private async extractRequirements(task: string, productStrategy: any): Promise<{
    functional: string[]
    nonFunctional: string[]
    constraints: string[]
  }> {
    const prompt = `Extract requirements from this task description.

Task: ${task}

Product Strategy: ${productStrategy ? JSON.stringify(productStrategy, null, 2) : 'Not provided'}

Categorize requirements into:
1. Functional Requirements: What the system must do (features, behaviors, interactions)
2. Non-Functional Requirements: System qualities (performance, security, usability, accessibility)
3. Constraints: Technical, business, or regulatory limitations

Provide response in JSON format:
{
  "functional": ["Requirement 1", "Requirement 2", ...],
  "nonFunctional": ["NFR 1", "NFR 2", ...],
  "constraints": ["Constraint 1", "Constraint 2", ...]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        functional: [task],
        nonFunctional: ['Performance: System should respond within acceptable time'],
        constraints: ['Technical: Must integrate with existing MeatConnect platform']
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Generate user stories in standard format
   * Format: As a [persona], I want [goal], So that [benefit]
   */
  private async generateUserStories(task: string, requirements: any): Promise<Array<{
    id: string
    title: string
    persona: string
    goal: string
    benefit: string
    priority: 'High' | 'Medium' | 'Low'
    estimatedEffort: string
  }>> {
    const prompt = `Generate user stories for this task in your application.

Task: ${task}

Functional Requirements: ${requirements.functional.join(', ')}

Context:
- Users: End users who interact with the application
- Operators: Staff members who manage operations
- Admins: Platform administrators

Generate 2-5 user stories in the format:
As a [User/Operator/Admin], I want [goal], So that [benefit]

For each story, estimate effort (XS, S, M, L, XL) and priority (High, Medium, Low).

Provide response in JSON format:
{
  "stories": [
    {
      "id": "US-001",
      "title": "As a Buyer, I want to...",
      "persona": "Buyer",
      "goal": "description of what they want to do",
      "benefit": "description of why this is valuable",
      "priority": "High",
      "estimatedEffort": "M"
    }
  ]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        id: 'US-001',
        title: `As a User, I want ${task}`,
        persona: 'User',
        goal: task,
        benefit: 'to accomplish my task',
        priority: 'Medium',
        estimatedEffort: 'M'
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.stories || []
  }

  /**
   * Generate acceptance criteria in Given-When-Then format
   */
  private async generateAcceptanceCriteria(task: string, userStories: any[]): Promise<Array<{
    id: string
    title: string
    userStoryId: string
    scenarios: Array<{
      given: string
      when: string
      then: string
    }>
  }>> {
    const prompt = `Generate acceptance criteria for these user stories using Given-When-Then format.

Task: ${task}

User Stories:
${userStories.map(s => `${s.id}: ${s.title}`).join('\n')}

For each user story, create 2-4 acceptance criteria scenarios in the format:
- Given [initial context/state]
- When [action/event]
- Then [expected outcome]

Provide response in JSON format:
{
  "criteria": [
    {
      "id": "AC-001",
      "title": "Brief description of acceptance criterion",
      "userStoryId": "US-001",
      "scenarios": [
        {
          "given": "initial state",
          "when": "user action",
          "then": "expected result"
        }
      ]
    }
  ]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        id: 'AC-001',
        title: 'Basic acceptance criterion',
        userStoryId: userStories[0]?.id || 'US-001',
        scenarios: [{
          given: 'User is on the page',
          when: 'User performs action',
          then: 'Expected outcome occurs'
        }]
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.criteria || []
  }

  /**
   * Identify success metrics and KPIs
   */
  private async identifySuccessMetrics(task: string, userStories: any[]): Promise<Array<{
    metric: string
    target: string
    measurement: string
    category: 'Adoption' | 'Engagement' | 'Performance' | 'Business'
  }>> {
    const prompt = `Identify success metrics and KPIs for this feature in a B2B meat trading platform.

Task: ${task}

User Stories: ${userStories.map(s => s.title).join('; ')}

Define 3-6 measurable success metrics across these categories:
- Adoption: User uptake, feature discovery
- Engagement: Usage frequency, time spent
- Performance: System metrics (response time, error rate)
- Business: Revenue, cost savings, conversion rates

Provide response in JSON format:
{
  "metrics": [
    {
      "metric": "User Adoption Rate",
      "target": "70% of active users within 30 days",
      "measurement": "Track unique users using feature / total active users",
      "category": "Adoption"
    }
  ]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        metric: 'Feature Usage',
        target: '50% of users',
        measurement: 'Track feature interactions',
        category: 'Adoption'
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.metrics || []
  }

  /**
   * Identify edge cases and error scenarios
   */
  private async identifyEdgeCases(task: string, userStories: any[]): Promise<Array<{
    scenario: string
    handling: string
    priority: 'High' | 'Medium' | 'Low'
  }>> {
    const prompt = `Identify edge cases and error scenarios for this feature.

Task: ${task}

User Stories: ${userStories.map(s => s.title).join('; ')}

Consider:
- Invalid input (empty, null, malformed, out of range)
- Boundary conditions (max/min values, limits)
- Error states (network failures, timeouts, server errors)
- Concurrent operations (race conditions, conflicts)
- Permission issues (unauthorized access, insufficient permissions)
- Data inconsistencies

For each edge case, describe how it should be handled.

Provide response in JSON format:
{
  "edgeCases": [
    {
      "scenario": "User submits empty form",
      "handling": "Display validation error message, highlight required fields",
      "priority": "High"
    }
  ]
}`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content)

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return [{
        scenario: 'Invalid input',
        handling: 'Display error message',
        priority: 'High'
      }]
    }

    const parsed = JSON.parse(jsonMatch[0])
    return parsed.edgeCases || []
  }

  /**
   * Generate comprehensive requirements document
   */
  private generateRequirementsDocument(
    task: string,
    requirements: any,
    userStories: any[],
    acceptanceCriteria: any[],
    successMetrics: any[],
    edgeCases: any[],
    productStrategy: any,
    pastRequirements: any
  ): {
    fullDocument: string
    summary: string
  } {
    const summary = `Generated ${userStories.length} user stories with ${acceptanceCriteria.length} acceptance criteria, ${successMetrics.length} success metrics, and ${edgeCases.length} edge cases identified.`

    const fullDocument = `# Business Requirements Document: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Business Analyst**: AI Agent
**Status**: Requirements Analysis Complete

---

## Executive Summary

${summary}

${productStrategy ? `**Product Priority**: ${productStrategy.priority} (Business Value: ${productStrategy.businessValue}/100)` : ''}

---

## Requirements Overview

### Functional Requirements (${requirements.functional.length})
${requirements.functional.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

### Non-Functional Requirements (${requirements.nonFunctional.length})
${requirements.nonFunctional.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

### Constraints (${requirements.constraints.length})
${requirements.constraints.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

---

## User Stories (${userStories.length})

${userStories.map(story => `### ${story.id}: ${story.title}

**Persona**: ${story.persona}
**Priority**: ${story.priority}
**Estimated Effort**: ${story.estimatedEffort}

**Goal**: ${story.goal}
**Benefit**: ${story.benefit}
`).join('\n---\n\n')}

---

## Acceptance Criteria (${acceptanceCriteria.length})

${acceptanceCriteria.map(ac => `### ${ac.id}: ${ac.title}

**User Story**: ${ac.userStoryId}

${ac.scenarios.map((s: any, i: number) => `**Scenario ${i + 1}**:
- **Given** ${s.given}
- **When** ${s.when}
- **Then** ${s.then}
`).join('\n')}
`).join('\n---\n\n')}

---

## Success Metrics & KPIs (${successMetrics.length})

${successMetrics.map(m => `### ${m.metric} (${m.category})

**Target**: ${m.target}
**Measurement**: ${m.measurement}
`).join('\n')}

---

## Edge Cases & Error Handling (${edgeCases.length})

${edgeCases.map((ec, i) => `### ${i + 1}. ${ec.scenario} (${ec.priority} Priority)

**Handling**: ${ec.handling}
`).join('\n')}

---

## Traceability Matrix

| User Story | Acceptance Criteria | Success Metrics |
|------------|---------------------|-----------------|
${userStories.map(story => {
  const relatedAC = acceptanceCriteria.filter(ac => ac.userStoryId === story.id)
  return `| ${story.id} | ${relatedAC.map(ac => ac.id).join(', ') || 'N/A'} | See above |`
}).join('\n')}

---

## Historical Context

${pastRequirements && pastRequirements.length > 0 ?
  `Similar requirements documents:\n${pastRequirements.map((r: any) => `- ${r.name || r.title || 'Previous requirement'}`).join('\n')}` :
  'No similar requirements found in history.'
}

---

## Next Steps

1. **Validation**: Forward to Requirements Validator for INVEST criteria review
2. **Design**: Once validated, hand to Architect for technical design
3. **Estimation**: Project Manager to estimate effort and timeline
4. **Implementation**: Developer team to implement features

---

## Sign-Off

- [ ] Product Owner approval
- [ ] Technical Lead review
- [ ] Stakeholder sign-off

---

**Generated by**: Business Analyst Agent
**Timestamp**: ${new Date().toISOString()}
`

    return { fullDocument, summary }
  }

  /**
   * Extract task from messages
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
   * Create empty result when no task provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# Business Requirements Document\n\nNo task provided for requirements analysis.',
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
