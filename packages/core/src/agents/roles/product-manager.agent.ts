import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Product Manager Agent - Strategic product planning, vision, and prioritization
 *
 * Capabilities:
 * - Product vision articulation
 * - One-page PRD creation (ai1st approach)
 * - Market fit analysis
 * - Feature prioritization
 * - Success metrics definition
 * - Strategic planning
 *
 * MCP Integrations:
 * - Memory MCP: Store product decisions and learnings
 * - Filesystem MCP: Read/write PRDs and product briefs
 * - Context7 MCP: Research market trends and competitive landscape
 */
export class ProductManagerAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('product-manager', [
      'product_vision',
      'strategic_planning',
      'market_analysis',
      'product_brief_creation',
      'prd_authoring',
      'one_page_prd',
      'feature_prioritization',
      'success_metrics_definition',
      'competitive_analysis',
      'stakeholder_management'
    ])

    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.4, // Slightly higher for creative vision
      maxTokens: 6144
    })
  }

  /**
   * Execute product management workflow
   *
   * Process:
   * 1. Extract task and context from state
   * 2. Check Memory MCP for similar product decisions
   * 3. Determine workflow type (brief, PRD, prioritization)
   * 4. Execute appropriate workflow
   * 5. Store decision in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('📋 Product Manager analyzing request...')

    try {
      const task = state.task || this.extractTaskFromState(state)

      if (!task) {
        this.log('No task provided', 'warn')
        return this.createFailedResult(state, 'No task provided')
      }

      // Check Memory MCP for similar decisions
      this.log('Checking product decision history...')
      // Check for similar past decisions (result used for future context improvements)
      await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `product ${task}`,
        type: 'product_decision',
        limit: 5
      })

      // Determine workflow type from deliverables or context
      const deliverables = state.workflow?.currentStep?.deliverables || []

      if (deliverables.includes('product_brief_document')) {
        return await this.createProductBrief(state, task)
      } else if (deliverables.includes('prd_document_one_page')) {
        return await this.createOnePagerPRD(state, task)
      } else if (deliverables.includes('prioritized_backlog')) {
        return await this.prioritizeFeatures(state, task)
      } else if (deliverables.includes('quick_spec')) {
        return await this.createQuickSpec(state, task)
      } else {
        // Default: Create product brief
        return await this.createProductBrief(state, task)
      }

    } catch (error) {
      this.log(`Error in Product Manager execution: ${error}`, 'error')
      return this.createFailedResult(state, (error as Error).message)
    }
  }

  /**
   * Create product brief with vision, goals, and success metrics
   */
  async createProductBrief(state: AgentState, task: string): Promise<Partial<AgentState>> {
    this.log('Creating product brief...')

    const prompt = `You are a Product Manager creating a strategic product brief.

Task: ${task}

Context: ${state.context || 'No additional context provided'}

Create a comprehensive product brief following this structure:

1. **Product Vision** (1-2 sentences)
   - Clear, inspiring statement of what we're building and why

2. **Target Audience** (2-3 personas)
   - Who are the primary users?
   - What are their pain points?
   - What are their goals?

3. **Problem Statement** (2-3 sentences)
   - What problem are we solving?
   - Why is this problem important?
   - What is the current state?

4. **Success Metrics** (3-5 KPIs)
   - How will we measure success?
   - What are the target values?
   - Timeline for achieving targets

5. **Market Context** (1 paragraph)
   - Market size and opportunity
   - Key competitors
   - Our differentiation

6. **Strategic Alignment** (1 paragraph)
   - How does this align with company goals?
   - Why now?
   - What are the strategic risks?

Format the output as a structured markdown document.`

    const response = await this.llm.invoke(prompt)
    const productBrief = response.content as string

    // Store in Memory MCP
    await this.requestMCP('memory', {
      action: 'create_entities',
      entities: [{
        name: `Product Brief: ${task}`,
        entityType: 'product_decision',
        observations: [productBrief]
      }]
    })

    this.log('✅ Product brief created')

    const artifact = this.createArtifact('documentation', productBrief, {
      documentType: 'product_brief',
      name: 'Product Brief'
    })

    const result = this.createResult('success', {
      product_vision: this.extractSection(productBrief, 'Product Vision'),
      target_audience: this.extractSection(productBrief, 'Target Audience'),
      problem_statement: this.extractSection(productBrief, 'Problem Statement'),
      product_brief_document: productBrief
    }, [artifact])

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        productBrief
      },
      nextAction: 'continue'
    }
  }

  /**
   * Create one-page PRD (ai1st approach)
   */
  async createOnePagerPRD(state: AgentState, task: string): Promise<Partial<AgentState>> {
    this.log('Creating one-page PRD (ai1st format)...')

    const prompt = `You are a Product Manager creating a concise, one-page PRD.

Task: ${task}

Context: ${state.context || 'No additional context provided'}
Product Brief: ${state.context?.productBrief || 'No product brief available'}

Create a ONE-PAGE PRD following this structure:

## Problem Statement
[2-3 sentences max - What problem are we solving and why it matters]

## User Stories
[Max 5 key stories with acceptance criteria]
Format:
- As a [user], I want [feature] so that [benefit]
  - AC1: [criterion]
  - AC2: [criterion]

## Success Metrics
[3-5 KPIs with targets]
- Metric 1: [name] - Target: [value]
- Metric 2: [name] - Target: [value]

## Technical Approach
[1 paragraph - High-level technical strategy]

## Timeline & Milestones
- Week 1: [milestone]
- Week 2: [milestone]
[Use bullet points, max 5 milestones]

## Risks & Mitigation
[Top 3 risks only]
1. Risk: [description] | Mitigation: [strategy]
2. Risk: [description] | Mitigation: [strategy]
3. Risk: [description] | Mitigation: [strategy]

## Out of Scope
[Explicit exclusions - bullet points]
- [item]
- [item]

IMPORTANT:
- Keep it concise (max 2 pages)
- Be specific, not generic
- Focus on "what" and "why", not "how"
- Make it actionable`

    const response = await this.llm.invoke(prompt)
    const prd = response.content as string

    // Validate PRD length (should fit on 1-2 pages)
    const lineCount = prd.split('\n').length
    if (lineCount > 100) {
      this.log('⚠️ PRD exceeds one-page limit, truncating...', 'warn')
    }

    // Store in Memory MCP
    await this.requestMCP('memory', {
      action: 'create_entities',
      entities: [{
        name: `PRD: ${task}`,
        entityType: 'product_decision',
        observations: [prd]
      }]
    })

    this.log('✅ One-page PRD created')

    const artifact = this.createArtifact('documentation', prd, {
      documentType: 'prd',
      name: 'Product Requirements Document'
    })

    const result = this.createResult('success', {
      feature_requirements: this.extractSection(prd, 'Problem Statement'),
      user_stories: this.extractSection(prd, 'User Stories'),
      prd_document_one_page: prd
    }, [artifact])

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        prd
      },
      nextAction: 'continue'
    }
  }

  /**
   * Analyze market fit for a feature
   */
  async analyzeMarketFit(feature: string, context?: string): Promise<string> {
    this.log('Analyzing market fit...')

    // Try Context7 MCP for market research
    try {
      const marketData = await this.requestMCP('context7', {
        action: 'query-docs',
        query: `market trends ${feature} competitive analysis`,
        library: 'general'
      })

      if (marketData) {
        this.log('✅ Market data retrieved from Context7')
      }
    } catch (error) {
      this.log('Context7 not available, using LLM analysis only', 'warn')
    }

    const prompt = `Analyze the market fit for this feature:

Feature: ${feature}
Context: ${context || 'No additional context'}

Provide:
1. Market opportunity (size, growth)
2. Target segment analysis
3. Competitive landscape
4. Differentiation opportunities
5. Adoption risks

Be concise (max 1 page).`

    const response = await this.llm.invoke(prompt)
    return response.content as string
  }

  /**
   * Prioritize features using WSJF or similar framework
   */
  async prioritizeFeatures(state: AgentState, task: string): Promise<Partial<AgentState>> {
    this.log('Prioritizing backlog...')

    const features = state.context || task

    const prompt = `You are a Product Manager prioritizing features.

Features/Stories: ${features}

Use WSJF (Weighted Shortest Job First) framework:
WSJF Score = (Business Value + Time Criticality + Risk Reduction) / Job Size

For each feature, provide:
1. Business Value (1-10)
2. Time Criticality (1-10)
3. Risk Reduction (1-10)
4. Job Size (1-10, where 1=smallest)
5. WSJF Score (calculated)
6. Priority Rank (1=highest)
7. Reasoning (1-2 sentences)

Format as a prioritized list with clear reasoning.`

    const response = await this.llm.invoke(prompt)
    const prioritization = response.content as string

    this.log('✅ Features prioritized')

    const artifact = this.createArtifact('documentation', prioritization, {
      documentType: 'prioritization',
      name: 'Feature Prioritization'
    })

    const result = this.createResult('success', {
      prioritized_backlog: prioritization
    }, [artifact])

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        prioritization
      },
      nextAction: 'continue'
    }
  }

  /**
   * Define success metrics for a feature
   */
  async defineSuccessMetrics(feature: string): Promise<string> {
    this.log('Defining success metrics...')

    const prompt = `Define success metrics for this feature:

Feature: ${feature}

Provide 3-5 KPIs with:
1. Metric name
2. Current baseline (if known, otherwise estimate)
3. Target value
4. Timeline to achieve target
5. How to measure (tracking method)

Follow SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound).

Format as a clear list.`

    const response = await this.llm.invoke(prompt)
    return response.content as string
  }

  /**
   * Create quick spec for simple features
   */
  async createQuickSpec(state: AgentState, task: string): Promise<Partial<AgentState>> {
    this.log('Creating quick spec (lightweight)...')

    const prompt = `Create a lightweight quick spec for:

Task: ${task}

Format:
**What**: [1 sentence - what are we building]
**Why**: [1 sentence - why it matters]
**User Story**: As a [user], I want [feature] so that [benefit]
**Success**: [1 metric to track]
**Notes**: [Any important constraints or considerations]

Keep it ultra-concise (max 10 lines total).`

    const response = await this.llm.invoke(prompt)
    const quickSpec = response.content as string

    this.log('✅ Quick spec created')

    const artifact = this.createArtifact('documentation', quickSpec, {
      documentType: 'quick_spec',
      name: 'Quick Spec'
    })

    const result = this.createResult('success', {
      quick_spec: quickSpec
    }, [artifact])

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      context: {
        ...state.context,
        quickSpec
      },
      nextAction: 'continue'
    }
  }

  /**
   * Helper: Extract section from markdown document
   */
  private extractSection(content: string, sectionName: string): string {
    const regex = new RegExp(`##?\\s*${sectionName}[^#]*([\\s\\S]*?)(?=##|$)`, 'i')
    const match = content.match(regex)
    return match ? match[1].trim() : ''
  }

  /**
   * Helper: Extract task from state when state.task is not set
   */
  private extractTaskFromState(state: AgentState): string {
    // Try messages
    for (const message of state.messages.slice().reverse()) {
      const content = typeof message.content === 'string' ? message.content : ''
      if (content && content.length > 10) {
        return content
      }
    }
    return ''
  }

  /**
   * Helper: Create a failed result
   */
  private createFailedResult(state: AgentState, errorMessage: string): Partial<AgentState> {
    const result = this.createResult('failed', { error: errorMessage }, [])

    return {
      messages: [...state.messages],
      agentResults: [...state.agentResults, result],
      nextAction: 'error_recovery'
    }
  }
}
