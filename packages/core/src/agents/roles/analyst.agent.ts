import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Analyst Agent - Strategic Analysis and Research Specialist
 *
 * Capabilities:
 * - Market research and competitive analysis
 * - Brainstorming and ideation sessions
 * - Strategic analysis and recommendations
 * - Product brief creation
 * - Trend analysis and forecasting
 * - SWOT analysis
 *
 * MCP Integrations:
 * - Memory MCP: Store insights and analysis results
 * - Context7 MCP: Research market data and best practices
 * - Filesystem MCP: Read and write analysis documents
 */
export class AnalystAgent extends BaseAgent {
  constructor() {
    super('analyst', [
      'analysis',
      'research',
      'brainstorming',
      'market_analysis',
      'competitive_analysis',
      'strategic_planning',
      'product_brief_creation',
      'trend_analysis'
    ])
  }

  /**
   * Execute analysis workflow
   *
   * Process:
   * 1. Determine analysis type from task
   * 2. Gather relevant context and data
   * 3. Perform analysis using appropriate methodology
   * 4. Generate insights and recommendations
   * 5. Create analysis artifact
   * 6. Store results in Memory MCP
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔍 Starting strategic analysis...')

    try {
      const task = state.task
      const analysisType = this.determineAnalysisType(task)

      this.log(`Analysis type: ${analysisType}`)

      // STEP 1: Gather context from Memory MCP
      this.log('Gathering relevant context...')
      const historicalData = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: task,
        type: 'analysis',
        limit: 5
      })

      // STEP 2: Research via Context7 MCP
      this.log('Researching market data and best practices...')
      const researchData = await this.requestMCP('context7', {
        action: 'get-library-docs',
        libraryId: '/analysis',
        topic: `${analysisType} ${task}`,
        tokens: 4000
      })

      // STEP 3: Perform analysis based on type
      let analysisResult
      switch (analysisType) {
        case 'market':
          analysisResult = await this.performMarketAnalysis(task, historicalData, researchData)
          break
        case 'competitive':
          analysisResult = await this.performCompetitiveAnalysis(task, historicalData, researchData)
          break
        case 'brainstorm':
          analysisResult = await this.performBrainstorming(task, state.context)
          break
        case 'product-brief':
          analysisResult = await this.createProductBrief(task, state.context)
          break
        case 'swot':
          analysisResult = await this.performSWOTAnalysis(task, state.context)
          break
        default:
          analysisResult = await this.performGeneralAnalysis(task, historicalData, researchData)
      }

      // STEP 4: Store in Memory MCP
      this.log('Storing analysis results...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Analysis: ${task.substring(0, 50)}`,
          entityType: 'analysis',
          observations: [
            `Type: ${analysisType}`,
            `Key findings: ${analysisResult.keyFindings?.length || 0}`,
            `Recommendations: ${analysisResult.recommendations?.length || 0}`
          ]
        }]
      })

      // STEP 5: Create artifact
      const artifact = this.createArtifact(
        'documentation',
        analysisResult.document,
        {
          analysisType,
          findingsCount: analysisResult.keyFindings?.length || 0,
          recommendationsCount: analysisResult.recommendations?.length || 0
        }
      )

      const result = this.createResult(
        'success',
        {
          analysisType,
          summary: analysisResult.summary,
          keyFindings: analysisResult.keyFindings,
          recommendations: analysisResult.recommendations
        },
        [artifact]
      )

      this.log('✅ Analysis complete')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          analysis: analysisResult
        },
        nextAction: this.determineNextAction(analysisType)
      }

    } catch (error: any) {
      this.log(`Analysis failed: ${error.message}`, 'error')

      const errorResult = this.createResult('failed', { error: error.message }, [])

      return {
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  private determineAnalysisType(task: string): string {
    const lower = task.toLowerCase()

    if (lower.includes('market') || lower.includes('рынок')) return 'market'
    if (lower.includes('competitive') || lower.includes('competitor') || lower.includes('конкурент')) return 'competitive'
    if (lower.includes('brainstorm') || lower.includes('идеи') || lower.includes('мозговой')) return 'brainstorm'
    if (lower.includes('product brief') || lower.includes('product-brief') || lower.includes('brief')) return 'product-brief'
    if (lower.includes('swot')) return 'swot'

    return 'general'
  }

  private async performMarketAnalysis(
    task: string,
    historicalData: any,
    researchData: any
  ): Promise<AnalysisResult> {
    const prompt = `Perform a comprehensive market analysis.

Task: ${task}

Historical Context: ${JSON.stringify(historicalData, null, 2)}
Research Data: ${JSON.stringify(researchData, null, 2)}

Provide analysis covering:
1. Market Size and Growth
2. Target Segments
3. Market Trends
4. Key Success Factors
5. Entry Barriers
6. Revenue Model Opportunities

Format as structured JSON:
{
  "summary": "Executive summary",
  "keyFindings": ["finding1", "finding2"],
  "marketSize": "Estimated market size",
  "targetSegments": ["segment1", "segment2"],
  "trends": ["trend1", "trend2"],
  "recommendations": ["rec1", "rec2"],
  "risks": ["risk1", "risk2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatMarketAnalysisDocument(task, parsed)
    }
  }

  private async performCompetitiveAnalysis(
    task: string,
    historicalData: any,
    researchData: any
  ): Promise<AnalysisResult> {
    const prompt = `Perform a competitive analysis.

Task: ${task}

Historical Context: ${JSON.stringify(historicalData, null, 2)}
Research Data: ${JSON.stringify(researchData, null, 2)}

Analyze:
1. Direct Competitors
2. Indirect Competitors
3. Competitive Advantages
4. Market Positioning
5. Pricing Strategies
6. Differentiation Opportunities

Format as structured JSON:
{
  "summary": "Executive summary",
  "keyFindings": ["finding1", "finding2"],
  "competitors": [
    {"name": "Competitor", "strengths": [], "weaknesses": []}
  ],
  "ourAdvantages": ["advantage1", "advantage2"],
  "recommendations": ["rec1", "rec2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatCompetitiveAnalysisDocument(task, parsed)
    }
  }

  private async performBrainstorming(
    task: string,
    context: any
  ): Promise<AnalysisResult> {
    const prompt = `Conduct a creative brainstorming session.

Topic: ${task}

Context: ${JSON.stringify(context, null, 2)}

Generate:
1. At least 10 creative ideas
2. For each idea: brief description, potential impact, feasibility
3. Group ideas into categories
4. Identify the top 3 most promising ideas
5. Next steps for exploration

Format as structured JSON:
{
  "summary": "Session summary",
  "keyFindings": ["insight1", "insight2"],
  "ideas": [
    {
      "id": "IDEA-001",
      "title": "Idea title",
      "description": "Description",
      "impact": "High/Medium/Low",
      "feasibility": "High/Medium/Low",
      "category": "Category"
    }
  ],
  "topIdeas": ["IDEA-001", "IDEA-002", "IDEA-003"],
  "recommendations": ["next step 1", "next step 2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatBrainstormDocument(task, parsed)
    }
  }

  private async createProductBrief(
    task: string,
    context: any
  ): Promise<AnalysisResult> {
    const prompt = `Create a Product Brief document.

Product/Feature: ${task}

Context: ${JSON.stringify(context, null, 2)}

Generate a comprehensive product brief covering:
1. Vision Statement
2. Problem Statement
3. Target Users
4. Key Value Propositions
5. Success Metrics
6. Scope (In/Out)
7. Assumptions & Risks
8. Dependencies

Format as structured JSON:
{
  "summary": "Executive summary",
  "keyFindings": ["finding1", "finding2"],
  "vision": "Vision statement",
  "problem": "Problem being solved",
  "targetUsers": ["user1", "user2"],
  "valuePropositions": ["value1", "value2"],
  "successMetrics": ["metric1", "metric2"],
  "inScope": ["feature1", "feature2"],
  "outOfScope": ["not included1", "not included2"],
  "assumptions": ["assumption1", "assumption2"],
  "risks": ["risk1", "risk2"],
  "recommendations": ["next step 1", "next step 2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatProductBriefDocument(task, parsed)
    }
  }

  private async performSWOTAnalysis(
    task: string,
    context: any
  ): Promise<AnalysisResult> {
    const prompt = `Perform a SWOT analysis.

Subject: ${task}

Context: ${JSON.stringify(context, null, 2)}

Analyze:
1. Strengths (Internal, Positive)
2. Weaknesses (Internal, Negative)
3. Opportunities (External, Positive)
4. Threats (External, Negative)

For each item, provide description and strategic implications.

Format as structured JSON:
{
  "summary": "Executive summary",
  "keyFindings": ["finding1", "finding2"],
  "strengths": [{"item": "strength", "implication": "how to leverage"}],
  "weaknesses": [{"item": "weakness", "implication": "how to address"}],
  "opportunities": [{"item": "opportunity", "implication": "how to capitalize"}],
  "threats": [{"item": "threat", "implication": "how to mitigate"}],
  "recommendations": ["strategy1", "strategy2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatSWOTDocument(task, parsed)
    }
  }

  private async performGeneralAnalysis(
    task: string,
    historicalData: any,
    researchData: any
  ): Promise<AnalysisResult> {
    const prompt = `Perform a strategic analysis.

Task: ${task}

Historical Context: ${JSON.stringify(historicalData, null, 2)}
Research Data: ${JSON.stringify(researchData, null, 2)}

Provide:
1. Current State Assessment
2. Key Insights
3. Opportunities
4. Challenges
5. Recommendations

Format as structured JSON:
{
  "summary": "Executive summary",
  "keyFindings": ["finding1", "finding2"],
  "currentState": "Assessment",
  "opportunities": ["opp1", "opp2"],
  "challenges": ["challenge1", "challenge2"],
  "recommendations": ["rec1", "rec2"]
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.4,
      maxTokens: 6144
    })
    const content = response.content

    const parsed = this.parseAnalysisResponse(content)

    return {
      ...parsed,
      document: this.formatGeneralAnalysisDocument(task, parsed)
    }
  }

  private parseAnalysisResponse(content: string): any {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        // Fall through to default
      }
    }

    return {
      summary: 'Analysis completed',
      keyFindings: ['See document for details'],
      recommendations: ['Review full analysis']
    }
  }

  private formatMarketAnalysisDocument(task: string, data: any): string {
    return `# Market Analysis: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: Analyst Agent

## Executive Summary

${data.summary || 'Analysis summary'}

## Market Size & Growth

${data.marketSize || 'To be determined'}

## Target Segments

${(data.targetSegments || []).map((s: string) => `- ${s}`).join('\n') || '- To be identified'}

## Market Trends

${(data.trends || []).map((t: string) => `- ${t}`).join('\n') || '- To be analyzed'}

## Key Findings

${(data.keyFindings || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Recommendations

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

## Risks

${(data.risks || []).map((r: string) => `- ${r}`).join('\n') || '- To be assessed'}

---
*Generated by Analyst Agent*
`
  }

  private formatCompetitiveAnalysisDocument(task: string, data: any): string {
    return `# Competitive Analysis: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: Analyst Agent

## Executive Summary

${data.summary || 'Analysis summary'}

## Competitor Overview

${(data.competitors || []).map((c: any) => `
### ${c.name}

**Strengths:**
${(c.strengths || []).map((s: string) => `- ${s}`).join('\n')}

**Weaknesses:**
${(c.weaknesses || []).map((w: string) => `- ${w}`).join('\n')}
`).join('\n')}

## Our Competitive Advantages

${(data.ourAdvantages || []).map((a: string) => `- ${a}`).join('\n')}

## Key Findings

${(data.keyFindings || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Recommendations

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---
*Generated by Analyst Agent*
`
  }

  private formatBrainstormDocument(task: string, data: any): string {
    return `# Brainstorming Session: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Facilitator**: Analyst Agent

## Session Summary

${data.summary || 'Session summary'}

## Generated Ideas

${(data.ideas || []).map((idea: any) => `
### ${idea.id}: ${idea.title}

**Description**: ${idea.description}
**Impact**: ${idea.impact} | **Feasibility**: ${idea.feasibility}
**Category**: ${idea.category}
`).join('\n')}

## Top 3 Most Promising Ideas

${(data.topIdeas || []).map((id: string, i: number) => `${i + 1}. ${id}`).join('\n')}

## Key Insights

${(data.keyFindings || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Next Steps

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---
*Generated by Analyst Agent*
`
  }

  private formatProductBriefDocument(task: string, data: any): string {
    return `# Product Brief: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Author**: Analyst Agent
**Status**: Draft

## Vision

${data.vision || 'To be defined'}

## Problem Statement

${data.problem || 'Problem description'}

## Target Users

${(data.targetUsers || []).map((u: string) => `- ${u}`).join('\n')}

## Value Propositions

${(data.valuePropositions || []).map((v: string, i: number) => `${i + 1}. ${v}`).join('\n')}

## Success Metrics

${(data.successMetrics || []).map((m: string) => `- ${m}`).join('\n')}

## Scope

### In Scope
${(data.inScope || []).map((s: string) => `- ${s}`).join('\n')}

### Out of Scope
${(data.outOfScope || []).map((s: string) => `- ${s}`).join('\n')}

## Assumptions

${(data.assumptions || []).map((a: string) => `- ${a}`).join('\n')}

## Risks

${(data.risks || []).map((r: string) => `- ${r}`).join('\n')}

## Next Steps

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---
*Generated by Analyst Agent*
`
  }

  private formatSWOTDocument(task: string, data: any): string {
    return `# SWOT Analysis: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: Analyst Agent

## Executive Summary

${data.summary || 'SWOT analysis summary'}

## Strengths (Internal, Positive)

${(data.strengths || []).map((s: any) => `
### ${s.item}
**Strategic Implication**: ${s.implication}
`).join('\n')}

## Weaknesses (Internal, Negative)

${(data.weaknesses || []).map((w: any) => `
### ${w.item}
**Strategic Implication**: ${w.implication}
`).join('\n')}

## Opportunities (External, Positive)

${(data.opportunities || []).map((o: any) => `
### ${o.item}
**Strategic Implication**: ${o.implication}
`).join('\n')}

## Threats (External, Negative)

${(data.threats || []).map((t: any) => `
### ${t.item}
**Strategic Implication**: ${t.implication}
`).join('\n')}

## Strategic Recommendations

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---
*Generated by Analyst Agent*
`
  }

  private formatGeneralAnalysisDocument(task: string, data: any): string {
    return `# Strategic Analysis: ${task}

**Date**: ${new Date().toISOString().split('T')[0]}
**Analyst**: Analyst Agent

## Executive Summary

${data.summary || 'Analysis summary'}

## Current State Assessment

${data.currentState || 'Assessment pending'}

## Key Findings

${(data.keyFindings || []).map((f: string, i: number) => `${i + 1}. ${f}`).join('\n')}

## Opportunities

${(data.opportunities || []).map((o: string) => `- ${o}`).join('\n')}

## Challenges

${(data.challenges || []).map((c: string) => `- ${c}`).join('\n')}

## Recommendations

${(data.recommendations || []).map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---
*Generated by Analyst Agent*
`
  }

  private determineNextAction(analysisType: string): string {
    switch (analysisType) {
      case 'product-brief':
        return 'product-manager' // Hand to PM for PRD creation
      case 'brainstorm':
        return 'architect' // Hand to architect for feasibility
      case 'market':
      case 'competitive':
        return 'product-owner' // Hand to PO for strategy
      default:
        return 'business-analyst' // Hand to BA for requirements
    }
  }
}

interface AnalysisResult {
  summary?: string
  keyFindings?: string[]
  recommendations?: string[]
  document: string
  [key: string]: any
}
