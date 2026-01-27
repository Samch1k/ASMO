import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Architect Agent - Responsible for system design and architecture decisions
 * 
 * Capabilities:
 * - System design and architecture planning
 * - Technology evaluation and selection
 * - Creating Architecture Decision Records (ADRs)
 * - Database schema design
 * - API contract definition
 * 
 * MCP Integrations:
 * - Memory MCP (P0): Store and retrieve architecture decisions
 * - Supabase MCP (P0): Analyze current database schema
 * - Context7 MCP (P1): Research best practices and patterns
 * - GitHub MCP (P2): Create ADR issues
 */
export class ArchitectAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('architect', [
      'system_design',
      'architecture_decisions',
      'design_brainstorming_workflow', // Superpowers design brainstorming workflow
      'implementation_planning_workflow', // Superpowers implementation planning workflow
      'adr_creation',
      'technology_evaluation',
      'data_modeling',
      'scalability_planning'
    ])
    
    // Initialize Claude LLM
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1, // Low temperature for consistent architectural decisions
      maxTokens: 4096
    })
  }

  /**
   * Execute architect workflow
   * 
   * Process:
   * 1. Check Memory MCP for past architectural decisions
   * 2. Analyze current system state via Supabase MCP
   * 3. Research best practices via Context7 MCP
   * 4. Generate architectural decision using LLM
   * 5. Create ADR (Architecture Decision Record)
   * 6. Store ADR in Memory MCP
   * 7. Handoff to Developer for implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🏗️  Analyzing architecture requirements...')

    try {
      // STEP 1: Check Memory MCP for past decisions
      this.log('Checking past architectural decisions...')
      const pastDecisions = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: state.task,
        type: 'architecture_decision'
      })

      // STEP 2: Analyze current schema via Supabase MCP
      this.log('Analyzing current database schema...')
      const currentSchema = await this.requestMCP('supabase', {
        action: 'list_tables',
        project_id: process.env.SUPABASE_PROJECT_ID
      })

      // STEP 3: Research best practices via Context7 MCP
      this.log('Researching architecture patterns and best practices...')
      const bestPractices = await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/anthropics/prompt-eng-interactive-tutorial',
        topic: `${state.task} architecture patterns`,
        tokens: 3000
      })

      // STEP 4: Generate architectural decision using LLM
      this.log('Generating architectural decision...')
      const decision = await this.generateDecision(state, {
        pastDecisions,
        currentSchema,
        bestPractices
      })

      // STEP 5: Create ADR artifact
      const adr = this.createArtifact(
        'adr',
        this.formatADR(state.task, decision),
        {
          taskType: state.taskType,
          timestamp: new Date().toISOString()
        }
      )

      // STEP 6: Store in Memory MCP
      this.log('Storing ADR in Memory MCP...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `ADR: ${state.task}`,
          entityType: 'architecture_decision',
          observations: [adr.content]
        }]
      })

      // STEP 7: Create result and determine handoff
      const result = this.createResult('needs_handoff', decision, [adr])
      result.handoffTo = 'developer'
      result.confidence = 0.9

      this.log('✅ Architecture analysis complete, handing off to Developer')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          architectureDecision: decision,
          adr
        },
        nextAction: 'developer'
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
   * Generate architectural decision using Claude LLM
   */
  private async generateDecision(
    state: AgentState,
    context: {
      pastDecisions: any
      currentSchema: any
      bestPractices: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the System Architect for your project, a application platform for meat products.

TECHNOLOGY STACK:
Frontend:
- React 19 with TypeScript (strict mode)
- Tailwind CSS v4 (CSS-only approach)
- Radix UI primitives
- React Query for server state
- Wouter for routing

Backend:
- Express.js with TypeScript
- Node.js 20+
- PostgreSQL via Supabase
- Drizzle ORM (NOT Prisma)
- Socket.IO for real-time

Deployment:
- Vercel (frontend - serverless)
- Render (backend - containerized)
- Supabase (database + storage)

DOMAIN CONTEXT:
- B2B two-sided marketplace (users and Suppliers)
- RFQ (Request for Quote) workflow system
- Trust & verification critical
- Performance-sensitive (100ms p95 target)

PAST DECISIONS:
${JSON.stringify(context.pastDecisions, null, 2)}

CURRENT SCHEMA:
${JSON.stringify(context.currentSchema, null, 2)}

BEST PRACTICES RESEARCH:
${JSON.stringify(context.bestPractices, null, 2)}

YOUR TASK:
${state.task}

PROVIDE:
1. Problem Analysis
   - What exactly needs to be designed?
   - Who is affected? (users, Suppliers, Admins)
   - What are the constraints?

2. Three Alternative Solutions
   Option A: [Name]
   - Description
   - Pros (3+)
   - Cons (3+)
   - Complexity: [Low/Medium/High]
   
   Option B: [Name]
   - Description
   - Pros (3+)
   - Cons (3+)
   - Complexity: [Low/Medium/High]
   
   Option C: [Name]
   - Description
   - Pros (3+)
   - Cons (3+)
   - Complexity: [Low/Medium/High]

3. Recommended Approach
   - Selected option with clear rationale
   - Why this over alternatives?
   - Implementation complexity estimate

4. Implementation Plan
   - Step-by-step approach
   - Database changes needed
   - API endpoints to create/modify
   - Frontend components affected

5. Risks & Mitigation
   - Technical risks
   - Business risks
   - Mitigation strategies

6. Success Metrics
   - How to measure success?
   - Performance targets
   - Acceptance criteria

Format as clear, actionable documentation.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    return typeof response.content === 'string' 
      ? response.content 
      : JSON.stringify(response.content)
  }

  /**
   * Format ADR (Architecture Decision Record)
   */
  private formatADR(title: string, decision: string): string {
    const timestamp = new Date().toISOString().split('T')[0]
    
    return `# ADR: ${title}

**Date**: ${timestamp}
**Status**: Proposed
**Deciders**: Architect Agent
**Context**: your project Architecture Decision

---

## Decision

${decision}

---

**Created by**: Architect Agent (LangGraph Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}
`
  }
}


