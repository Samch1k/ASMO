import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Product Owner Agent - Strategy, prioritization, and roadmap planning
 *
 * Capabilities:
 * - LLM-based priority scoring using MoSCoW method
 * - Business value calculation (0-100 score)
 * - Roadmap positioning based on priority and value
 * - Stakeholder impact analysis
 * - Strategic alignment validation
 *
 * MCP Integrations:
 * - Memory MCP: Store prioritization decisions for learning
 * - Filesystem MCP: Read existing roadmap documents
 */
export class ProductOwnerAgent extends BaseAgent {
  constructor() {
    super('product-owner', [
      'strategy',
      'roadmap',
      'prioritization',
      'stakeholder_management',
      'business_value_assessment'
    ])
  }

  /**
   * Execute product strategy and prioritization workflow
   *
   * Process:
   * 1. Extract task from state
   * 2. Check Memory MCP for similar prioritization decisions
   * 3. Calculate priority using MoSCoW method (LLM-based)
   * 4. Assess business value (0-100)
   * 5. Position in roadmap (Q1-Q4)
   * 6. Analyze stakeholder impact
   * 7. Generate strategy document
   * 8. Store decision in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🎯 Defining product strategy and priority...')

    try {
      // STEP 1: Extract task
      const task = state.task || this.extractTaskFromMessages(state)

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createEmptyResult(state)
      }

      // STEP 2: Check Memory MCP for similar decisions
      this.log('Checking prioritization history...')
      const pastDecisions = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `product priority ${task}`,
        type: 'prioritization_decision',
        limit: 3
      })

      // STEP 3: Calculate priority using MoSCoW
      this.log('Calculating priority (MoSCoW method)...')
      const priorityAnalysis = await this.calculatePriority(task, state.context)

      // STEP 4: Assess business value
      this.log('Assessing business value...')
      const businessValue = await this.assessBusinessValue(task, priorityAnalysis)

      // STEP 5: Position in roadmap
      this.log('Positioning in roadmap...')
      const roadmapPosition = this.positionInRoadmap(
        priorityAnalysis.moscowCategory,
        businessValue.score
      )

      // STEP 6: Analyze stakeholder impact
      this.log('Analyzing stakeholder impact...')
      const stakeholderImpact = await this.analyzeStakeholderImpact(task)

      // STEP 7: Generate strategy document
      const strategyDocument = this.generateStrategyDocument(
        task,
        priorityAnalysis,
        businessValue,
        roadmapPosition,
        stakeholderImpact,
        pastDecisions
      )

      // STEP 8: Store in Memory MCP
      this.log('Storing prioritization decision...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Product Priority: ${task}`,
          entityType: 'prioritization_decision',
          observations: [
            `MoSCoW: ${priorityAnalysis.moscowCategory}`,
            `Business Value: ${businessValue.score}/100`,
            `Roadmap: ${roadmapPosition.quarter} ${roadmapPosition.year}`,
            `Stakeholders Impacted: ${stakeholderImpact.impactedGroups.join(', ')}`
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        strategyDocument.fullDocument,
        {
          moscowPriority: priorityAnalysis.moscowCategory,
          businessValue: businessValue.score,
          roadmapQuarter: roadmapPosition.quarter,
          roadmapYear: roadmapPosition.year
        }
      )

      // Create result
      const result = this.createResult(
        'success',
        {
          priority: priorityAnalysis.moscowCategory,
          priorityScore: priorityAnalysis.score,
          businessValue: businessValue.score,
          roadmap: `${roadmapPosition.quarter} ${roadmapPosition.year}`,
          recommendation: strategyDocument.recommendation
        },
        [artifact]
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          productStrategy: {
            priority: priorityAnalysis.moscowCategory,
            businessValue: businessValue.score,
            roadmap: roadmapPosition
          }
        },
        nextAction: 'business_analyst' // Hand to BA for detailed requirements
      }

    } catch (error: any) {
      this.log(`Product strategy failed: ${error.message}`, 'error')

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
   * Calculate priority using MoSCoW method
   * Returns: Must Have, Should Have, Could Have, Won't Have (this time)
   */
  private async calculatePriority(task: string, context: any): Promise<{
    moscowCategory: 'Must Have' | 'Should Have' | 'Could Have' | 'Won\'t Have'
    score: number
    reasoning: string
  }> {
    const prompt = `As a Product Owner, analyze the priority of this task using the MoSCoW method.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

MoSCoW Categories:
- Must Have: Critical for core business, system won't work without it, legal requirement
- Should Have: Important but not vital, workaround exists, high value
- Could Have: Desirable but not necessary, low impact if omitted
- Won't Have (this time): Out of scope for current release, future consideration

Provide response in JSON format:
{
  "moscowCategory": "Must Have" | "Should Have" | "Could Have" | "Won't Have",
  "score": 90,
  "reasoning": "Detailed explanation of why this priority was assigned..."
}

Score: 0-100 (Must Have: 80-100, Should Have: 60-79, Could Have: 40-59, Won't Have: 0-39)`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })
    const content = response.content

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      // Fallback
      return {
        moscowCategory: 'Should Have',
        score: 65,
        reasoning: 'Could not parse LLM response, defaulting to Should Have'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Assess business value (0-100 score)
   * Considers: revenue impact, cost savings, user satisfaction, strategic alignment
   */
  private async assessBusinessValue(task: string, priorityAnalysis: any): Promise<{
    score: number
    breakdown: {
      revenueImpact: number
      costSavings: number
      userSatisfaction: number
      strategicAlignment: number
    }
    reasoning: string
  }> {
    const prompt = `Assess the business value of this task for your application.

Task: ${task}
Priority: ${priorityAnalysis.moscowCategory}

Evaluate business value across 4 dimensions (0-25 points each):
1. Revenue Impact: Will this increase revenue? (direct sales, upsells, retention)
2. Cost Savings: Will this reduce operational costs? (automation, efficiency)
3. User Satisfaction: Will this improve user experience? (NPS, retention, referrals)
4. Strategic Alignment: Does this align with company strategy? (market position, competitive advantage)

Provide response in JSON format:
{
  "score": 85,
  "breakdown": {
    "revenueImpact": 22,
    "costSavings": 18,
    "userSatisfaction": 25,
    "strategicAlignment": 20
  },
  "reasoning": "Detailed explanation of business value assessment..."
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        score: 50,
        breakdown: {
          revenueImpact: 12,
          costSavings: 12,
          userSatisfaction: 13,
          strategicAlignment: 13
        },
        reasoning: 'Could not parse LLM response, using moderate business value'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Position feature in roadmap based on priority and business value
   */
  private positionInRoadmap(
    moscowCategory: string,
    businessValue: number
  ): {
    quarter: string
    year: number
    phase: string
    rationale: string
  } {
    const currentYear = new Date().getFullYear()
    const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1

    // Priority matrix: MoSCoW + Business Value → Roadmap position
    if (moscowCategory === 'Must Have' && businessValue >= 70) {
      return {
        quarter: `Q${currentQuarter}`,
        year: currentYear,
        phase: 'Immediate',
        rationale: 'Critical feature with high business value - prioritize for current quarter'
      }
    }

    if (moscowCategory === 'Must Have' || businessValue >= 80) {
      const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1
      const nextYear = currentQuarter === 4 ? currentYear + 1 : currentYear
      return {
        quarter: `Q${nextQuarter}`,
        year: nextYear,
        phase: 'Next Quarter',
        rationale: 'High priority or value - schedule for next quarter'
      }
    }

    if (moscowCategory === 'Should Have' && businessValue >= 60) {
      const futureQuarter = (currentQuarter + 2) % 4 || 4
      const futureYear = currentQuarter >= 3 ? currentYear + 1 : currentYear
      return {
        quarter: `Q${futureQuarter}`,
        year: futureYear,
        phase: 'Near Term',
        rationale: 'Important feature - schedule within 6 months'
      }
    }

    if (moscowCategory === 'Could Have') {
      return {
        quarter: 'Q3-Q4',
        year: currentYear + 1,
        phase: 'Backlog',
        rationale: 'Nice-to-have feature - add to backlog for future consideration'
      }
    }

    return {
      quarter: 'TBD',
      year: currentYear + 1,
      phase: 'Future',
      rationale: 'Low priority - defer to future roadmap review'
    }
  }

  /**
   * Analyze stakeholder impact
   */
  private async analyzeStakeholderImpact(task: string): Promise<{
    impactedGroups: string[]
    impact: Record<string, string>
    overallImpact: 'High' | 'Medium' | 'Low'
  }> {
    const prompt = `Analyze stakeholder impact for this task in your application.

Task: ${task}

Stakeholder Groups:
- Users (end users who interact with the application)
- Operations Team (internal staff managing the platform)
- Business Team (leadership, product management, marketing)
- Tech Team (developers, DevOps, QA engineers)
- Support Team (customer service, help desk)

For each impacted group, describe the impact. Provide response in JSON format:
{
  "impactedGroups": ["Users", "Operations Team"],
  "impact": {
    "Users": "Impact description...",
    "Suppliers": "Impact description..."
  },
  "overallImpact": "High" | "Medium" | "Low"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096
    })
    const content = response.content

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        impactedGroups: ['Users'],
        impact: { 'Users': 'General impact on platform users' },
        overallImpact: 'Medium'
      }
    }

    return JSON.parse(jsonMatch[0])
  }

  /**
   * Generate comprehensive strategy document
   */
  private generateStrategyDocument(
    task: string,
    priorityAnalysis: any,
    businessValue: any,
    roadmapPosition: any,
    stakeholderImpact: any,
    pastDecisions: any
  ): {
    fullDocument: string
    recommendation: string
  } {
    const recommendation = this.generateRecommendation(
      priorityAnalysis.moscowCategory,
      businessValue.score,
      roadmapPosition
    )

    const fullDocument = `# Product Strategy: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Product Owner**: AI Agent
**Status**: Strategic Review Complete

---

## Executive Summary

${recommendation}

---

## Priority Analysis (MoSCoW Method)

**Category**: ${priorityAnalysis.moscowCategory}
**Score**: ${priorityAnalysis.score}/100

### Reasoning
${priorityAnalysis.reasoning}

---

## Business Value Assessment

**Overall Score**: ${businessValue.score}/100

### Value Breakdown
- **Revenue Impact**: ${businessValue.breakdown.revenueImpact}/25
- **Cost Savings**: ${businessValue.breakdown.costSavings}/25
- **User Satisfaction**: ${businessValue.breakdown.userSatisfaction}/25
- **Strategic Alignment**: ${businessValue.breakdown.strategicAlignment}/25

### Analysis
${businessValue.reasoning}

---

## Roadmap Position

**Target**: ${roadmapPosition.quarter} ${roadmapPosition.year}
**Phase**: ${roadmapPosition.phase}

### Rationale
${roadmapPosition.rationale}

---

## Stakeholder Impact

**Overall Impact**: ${stakeholderImpact.overallImpact}
**Impacted Groups**: ${stakeholderImpact.impactedGroups.join(', ')}

${Object.entries(stakeholderImpact.impact).map(([group, impact]) =>
  `### ${group}\n${impact}`
).join('\n\n')}

---

## Historical Context

${pastDecisions && pastDecisions.length > 0 ?
  `Similar prioritization decisions made in the past:\n${pastDecisions.map((d: any) => `- ${d.name || d.title || 'Previous decision'}`).join('\n')}` :
  'No similar decisions found in history.'
}

---

## Recommendation

${recommendation}

### Next Steps
1. Forward to Business Analyst for detailed requirements gathering
2. Stakeholder review and approval (if high priority)
3. Schedule for ${roadmapPosition.quarter} ${roadmapPosition.year}
4. Monitor business metrics after implementation

---

**Generated by**: Product Owner Agent
**Timestamp**: ${new Date().toISOString()}
`

    return { fullDocument, recommendation }
  }

  /**
   * Generate actionable recommendation
   */
  private generateRecommendation(
    moscowCategory: string,
    businessValue: number,
    roadmapPosition: any
  ): string {
    if (moscowCategory === 'Must Have' && businessValue >= 70) {
      return `**RECOMMENDED: IMMEDIATE PRIORITY** - This is a critical feature with high business value (${businessValue}/100). Recommend fast-tracking for ${roadmapPosition.quarter} ${roadmapPosition.year}. Allocate dedicated resources and expedite through all phases.`
    }

    if (moscowCategory === 'Must Have') {
      return `**RECOMMENDED: HIGH PRIORITY** - This is a critical feature (${moscowCategory}) and should be prioritized for ${roadmapPosition.quarter} ${roadmapPosition.year}. Business value is ${businessValue}/100.`
    }

    if (businessValue >= 80) {
      return `**RECOMMENDED: STRATEGIC PRIORITY** - High business value (${businessValue}/100) justifies prioritization despite ${moscowCategory} classification. Schedule for ${roadmapPosition.quarter} ${roadmapPosition.year}.`
    }

    if (moscowCategory === 'Should Have' && businessValue >= 60) {
      return `**RECOMMENDED: STANDARD PRIORITY** - Important feature (${moscowCategory}) with solid business value (${businessValue}/100). Schedule for ${roadmapPosition.quarter} ${roadmapPosition.year} as capacity allows.`
    }

    if (moscowCategory === 'Could Have') {
      return `**RECOMMENDED: BACKLOG** - Nice-to-have feature (${moscowCategory}) with moderate business value (${businessValue}/100). Add to backlog for future consideration. Review in ${roadmapPosition.year}.`
    }

    return `**RECOMMENDED: DEFER** - Low priority (${moscowCategory}) with limited business value (${businessValue}/100). Recommend deferring to future roadmap review.`
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
   * Create empty result when no task provided
   */
  private createEmptyResult(state: AgentState): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      '# Product Strategy\n\nNo task provided for prioritization.',
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
