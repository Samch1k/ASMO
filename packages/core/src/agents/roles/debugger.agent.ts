import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Debugger Agent - Responsible for bug diagnosis and root cause analysis
 * 
 * Capabilities:
 * - Bug diagnosis and investigation
 * - Root cause analysis
 * - Error log analysis
 * - Hotfix generation
 * - Performance debugging
 * 
 * MCP Integrations (Priority Order):
 * - Render MCP (P0): Backend logs analysis
 * - Vercel MCP (P0): Frontend logs and errors
 * - Supabase MCP (P0): Database query logs and performance
 * - Playwright MCP (P1): Bug reproduction
 * - Filesystem MCP (P1): Read error-related code
 * - GitHub MCP (P2): Check recent changes
 * - Memory MCP (P2): Check for similar past bugs
 */
export class DebuggerAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('debugger', [
      'bug_diagnosis',
      'root_cause_analysis',
      'systematic_debugging_workflow', // Superpowers systematic debugging workflow
      'error_investigation',
      'hotfix_generation',
      'performance_debugging',
      'log_analysis'
    ])
    
    // Low temperature for precise debugging
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1,
      maxTokens: 8192
    })
  }

  /**
   * Execute debugger workflow
   * 
   * Process:
   * 1. Analyze bug report from task description
   * 2. Check backend logs (Render MCP) - P0
   * 3. Check frontend logs (Vercel MCP) - P0
   * 4. Check database performance (Supabase MCP) - P0
   * 5. Check for similar past bugs (Memory MCP) - P2
   * 6. Analyze logs and identify root cause using LLM
   * 7. Generate diagnosis report
   * 8. Handoff to Developer for fix implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🐛 Starting bug investigation...')

    try {
      // STEP 1: Parse bug report
      const bugDescription = state.task
      this.log(`Bug: ${bugDescription}`)

      // STEP 2: Check backend logs (P0 - CRITICAL)
      this.log('📊 Checking Render backend logs...')
      const renderLogs = await this.requestMCP('render', {
        action: 'get_logs',
        service: 'backend',
        timeRange: '1h',
        level: 'error'
      })

      // STEP 3: Check frontend logs (P0 - CRITICAL)
      this.log('📊 Checking Vercel frontend logs...')
      const vercelLogs = await this.requestMCP('vercel', {
        action: 'get_logs',
        deployment: 'latest',
        level: 'error'
      })

      // STEP 4: Check database performance (P0 - CRITICAL)
      this.log('📊 Analyzing database performance...')
      const dbPerformance = await this.requestMCP('supabase', {
        action: 'execute_sql',
        project_id: process.env.SUPABASE_PROJECT_ID,
        query: `
          SELECT 
            queryid,
            query,
            calls,
            total_exec_time,
            mean_exec_time,
            rows
          FROM pg_stat_statements 
          WHERE query NOT LIKE '%pg_stat_statements%'
          ORDER BY total_exec_time DESC 
          LIMIT 10
        `
      })

      // STEP 5: Check for similar past bugs (P2 - OPTIONAL)
      this.log('🔍 Checking for similar past bugs...')
      const pastBugs = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: bugDescription,
        type: 'bug_fix'
      })

      // STEP 6: Analyze and diagnose using LLM
      this.log('🔬 Analyzing logs and performing root cause analysis...')
      const diagnosis = await this.performDiagnosis(state, {
        renderLogs,
        vercelLogs,
        dbPerformance,
        pastBugs
      })

      // STEP 7: Create bug report artifact
      const bugReport = this.createArtifact(
        'documentation',
        this.formatBugReport(bugDescription, diagnosis),
        {
          severity: this.determineSeverity(bugDescription),
          category: this.categorizeBug(bugDescription)
        }
      )

      // STEP 8: Store bug and fix in Memory MCP for future reference
      this.log('💾 Storing bug report in Memory MCP...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Bug: ${bugDescription}`,
          entityType: 'bug_fix',
          observations: [diagnosis.rootCause, diagnosis.proposedFix]
        }]
      })

      // STEP 9: Create result and handoff to Developer
      const result = this.createResult('needs_handoff', diagnosis, [bugReport])
      result.handoffTo = 'developer'
      result.confidence = diagnosis.confidence || 0.85

      this.log('✅ Bug diagnosis complete, handing off to Developer for fix')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          rootCause: diagnosis.rootCause,
          proposedFix: diagnosis.proposedFix,
          bugReport
        },
        nextAction: 'developer'
      }

    } catch (error) {
      this.log(`Error during debugging: ${error}`, 'error')
      
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
   * Perform root cause analysis using Claude LLM
   */
  private async performDiagnosis(
    state: AgentState,
    context: {
      renderLogs: any
      vercelLogs: any
      dbPerformance: any
      pastBugs: any
    }
  ): Promise<{
    rootCause: string
    evidence: string[]
    proposedFix: string
    testStrategy: string
    confidence: number
  }> {
    const systemPrompt = `You are a Senior Debugger for your project application.

BUG REPORT:
${state.task}

AVAILABLE DATA:

1. BACKEND LOGS (Render):
${JSON.stringify(context.renderLogs, null, 2)}

2. FRONTEND LOGS (Vercel):
${JSON.stringify(context.vercelLogs, null, 2)}

3. DATABASE PERFORMANCE (Supabase):
${JSON.stringify(context.dbPerformance, null, 2)}

4. SIMILAR PAST BUGS:
${JSON.stringify(context.pastBugs, null, 2)}

SYSTEM CONTEXT:
- Tech Stack: React 19, Express, PostgreSQL, Drizzle ORM
- Architecture: Frontend (Vercel), Backend (Render), DB (Supabase)
- Domain: application with RFQ workflow

YOUR TASK:
Perform systematic root cause analysis following this methodology:

1. ROOT CAUSE ANALYSIS
   - Identify the exact root cause
   - Explain the chain of events leading to the bug
   - Distinguish between symptoms and root cause

2. EVIDENCE CHAIN
   - List all evidence supporting your diagnosis
   - Quote specific log entries
   - Reference performance metrics

3. PROPOSED FIX
   - Exact steps to fix the issue
   - Code changes needed (be specific)
   - Database changes if required

4. TEST STRATEGY
   - How to reproduce the bug
   - Test cases to prevent recurrence
   - Acceptance criteria

5. CONFIDENCE SCORE
   - Rate your confidence (0.0 - 1.0)
   - Explain confidence level

OUTPUT FORMAT:
{
  "rootCause": "Clear, concise explanation of root cause",
  "evidence": ["Evidence 1", "Evidence 2", "Evidence 3"],
  "proposedFix": "Step-by-step fix instructions",
  "testStrategy": "How to test the fix",
  "confidence": 0.85
}

Provide ONLY valid JSON.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

    // Try to parse JSON response
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      // Fallback: return structured response
      return {
        rootCause: content,
        evidence: [],
        proposedFix: 'See root cause analysis',
        testStrategy: 'Manual testing required',
        confidence: 0.7
      }
    } catch (parseError) {
      this.log('Failed to parse LLM response as JSON, using fallback', 'warn')
      return {
        rootCause: content,
        evidence: [],
        proposedFix: 'See root cause analysis',
        testStrategy: 'Manual testing required',
        confidence: 0.7
      }
    }
  }

  /**
   * Format bug report for documentation
   */
  private formatBugReport(bugDescription: string, diagnosis: any): string {
    const timestamp = new Date().toISOString()
    
    return `# Bug Report: ${bugDescription}

**Timestamp**: ${timestamp}
**Severity**: ${this.determineSeverity(bugDescription)}
**Status**: Diagnosed
**Assigned to**: Developer Agent

---

## Root Cause

${diagnosis.rootCause}

---

## Evidence Chain

${diagnosis.evidence.map((e: string, i: number) => `${i + 1}. ${e}`).join('\n')}

---

## Proposed Fix

${diagnosis.proposedFix}

---

## Test Strategy

${diagnosis.testStrategy}

---

## Confidence Score

${(diagnosis.confidence * 100).toFixed(0)}%

---

**Diagnosed by**: Debugger Agent (LangGraph Multi-Agent System)
**Timestamp**: ${timestamp}
`
  }

  /**
   * Determine bug severity based on description
   */
  private determineSeverity(bugDescription: string): 'P0' | 'P1' | 'P2' | 'P3' {
    const desc = bugDescription.toLowerCase()

    // P0: Critical - Production down, data loss, security
    if (desc.includes('production') && (desc.includes('down') || desc.includes('crash'))) {
      return 'P0'
    }
    if (desc.includes('security') || desc.includes('breach') || desc.includes('data loss')) {
      return 'P0'
    }

    // P1: High - Major feature broken, performance degradation
    if (desc.includes('broken') || desc.includes('fails') || desc.includes('500 error')) {
      return 'P1'
    }
    if (desc.includes('slow') || desc.includes('performance')) {
      return 'P1'
    }

    // P2: Medium - Minor feature issues
    if (desc.includes('ui') || desc.includes('display')) {
      return 'P2'
    }

    // P3: Low - Cosmetic issues
    return 'P3'
  }

  /**
   * Categorize bug by type
   */
  private categorizeBug(bugDescription: string): string {
    const desc = bugDescription.toLowerCase()

    if (desc.includes('database') || desc.includes('query') || desc.includes('sql')) {
      return 'database'
    }
    if (desc.includes('api') || desc.includes('endpoint') || desc.includes('500')) {
      return 'backend'
    }
    if (desc.includes('ui') || desc.includes('component') || desc.includes('display')) {
      return 'frontend'
    }
    if (desc.includes('performance') || desc.includes('slow')) {
      return 'performance'
    }
    if (desc.includes('auth') || desc.includes('login') || desc.includes('permission')) {
      return 'authentication'
    }

    return 'general'
  }
}


