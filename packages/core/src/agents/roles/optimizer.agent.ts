import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Optimizer Agent - Responsible for performance optimization and analysis
 * 
 * Capabilities:
 * - Performance analysis and profiling
 * - Query optimization (database)
 * - Code optimization
 * - Caching strategy design
 * - Bundle size optimization
 * 
 * MCP Integrations:
 * - Vercel MCP (P0): Frontend performance metrics
 * - Supabase MCP (P0): Database query performance
 * - Filesystem MCP (P1): Read code for optimization
 * - Context7 MCP (P1): Research optimization patterns
 */
export class OptimizerAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('optimizer', [
      'performance_analysis',
      'query_optimization',
      'code_optimization',
      'caching_strategy',
      'bundle_optimization',
      'profiling'
    ])
    
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2,
      maxTokens: 8192
    })
  }

  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('⚡ Starting performance optimization analysis...')

    try {
      // STEP 1: Gather performance metrics from Vercel (P0)
      this.log('📊 Gathering Vercel performance metrics...')
      const vercelMetrics = await this.requestMCP('vercel', {
        action: 'get_deployment',
        deployment: 'latest'
      })

      // STEP 2: Analyze database performance (P0)
      this.log('📊 Analyzing database query performance...')
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
            max_exec_time,
            rows
          FROM pg_stat_statements 
          WHERE query NOT LIKE '%pg_stat_statements%'
            AND query NOT LIKE '%pg_catalog%'
          ORDER BY total_exec_time DESC 
          LIMIT 20
        `
      })

      // STEP 3: Check for slow queries
      const slowQueries = await this.requestMCP('supabase', {
        action: 'execute_sql',
        project_id: process.env.SUPABASE_PROJECT_ID,
        query: `
          SELECT 
            schemaname,
            tablename,
            indexname,
            idx_scan,
            idx_tup_read,
            idx_tup_fetch
          FROM pg_stat_user_indexes
          WHERE idx_scan = 0
          ORDER BY schemaname, tablename
        `
      })

      // STEP 4: Read relevant code for optimization
      this.log('📖 Reading relevant code files...')
      const relevantFiles = this.identifyPerformanceFiles(state.task)
      const codeFiles = await this.requestMCP('filesystem', {
        action: 'read_multiple_files',
        paths: relevantFiles
      })

      // STEP 5: Research optimization patterns
      this.log('🔍 Researching optimization best practices...')
      const optimizationPatterns = await this.requestMCP('context7', {
        action: 'get-library-docs',
        context7CompatibleLibraryID: '/vercel/react',
        topic: 'performance optimization react',
        tokens: 3000
      })

      // STEP 6: Generate optimization recommendations
      this.log('💡 Generating optimization recommendations...')
      const recommendations = await this.generateOptimizationPlan(state, {
        vercelMetrics,
        dbPerformance,
        slowQueries,
        codeFiles,
        optimizationPatterns
      })

      // STEP 7: Create optimization report artifact
      const optimizationReport = this.createArtifact(
        'documentation',
        this.formatOptimizationReport(state.task, recommendations),
        {
          category: 'performance',
          severity: this.determinePerformanceImpact(state.task)
        }
      )

      // STEP 8: Determine next action
      const needsImplementation = recommendations.requiresCodeChanges
      
      const result = this.createResult(
        needsImplementation ? 'needs_handoff' : 'success',
        recommendations,
        [optimizationReport]
      )

      if (needsImplementation) {
        result.handoffTo = 'developer'
        this.log('✅ Optimization analysis complete, handing off to Developer')
      } else {
        this.log('✅ Optimization recommendations provided (no code changes needed)')
      }

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          optimizationPlan: recommendations,
          performanceMetrics: {
            vercel: vercelMetrics,
            database: dbPerformance
          },
          optimizationReport
        },
        nextAction: needsImplementation ? 'developer' : 'END'
      }

    } catch (error) {
      this.log(`Error during optimization analysis: ${error}`, 'error')
      
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
   * Identify files relevant to performance optimization
   */
  private identifyPerformanceFiles(task: string): string[] {
    const taskLower = task.toLowerCase()
    const files: string[] = []

    // Frontend performance
    if (taskLower.includes('page') || taskLower.includes('component') || taskLower.includes('frontend')) {
      files.push(
        'client/src/pages/products/ProductList.tsx',
        'client/src/pages/requests/CreateRequest.tsx',
        'vite.config.ts'
      )
    }

    // Backend performance
    if (taskLower.includes('api') || taskLower.includes('backend') || taskLower.includes('slow')) {
      files.push(
        'server/storage/database.ts',
        'server/routes/products.ts',
        'server/routes/rfqs.ts'
      )
    }

    // Database performance
    if (taskLower.includes('query') || taskLower.includes('database')) {
      files.push(
        'server/storage/database.ts',
        'shared/schema/index.ts'
      )
    }

    // Default
    if (files.length === 0) {
      files.push('server/storage/database.ts')
    }

    return files
  }

  /**
   * Generate optimization plan using Claude
   */
  private async generateOptimizationPlan(
    state: AgentState,
    context: {
      vercelMetrics: any
      dbPerformance: any
      slowQueries: any
      codeFiles: any
      optimizationPatterns: any
    }
  ): Promise<{
    bottlenecks: string[]
    recommendations: string[]
    codeChanges: string[]
    requiresCodeChanges: boolean
    estimatedImprovement: string
  }> {
    const systemPrompt = `You are a Performance Optimization Expert for your project.

TECHNOLOGY STACK:
- Frontend: React 19, Vite, Tailwind CSS v4
- Backend: Express.js, Node.js 20+
- Database: PostgreSQL via Supabase, Drizzle ORM
- Deployment: Vercel (frontend), Render (backend)

PERFORMANCE DATA:

1. VERCEL METRICS:
${JSON.stringify(context.vercelMetrics, null, 2)}

2. DATABASE PERFORMANCE (Top 20 Slow Queries):
${JSON.stringify(context.dbPerformance, null, 2)}

3. UNUSED INDEXES:
${JSON.stringify(context.slowQueries, null, 2)}

4. CURRENT CODE:
${JSON.stringify(context.codeFiles, null, 2)}

5. OPTIMIZATION PATTERNS:
${JSON.stringify(context.optimizationPatterns, null, 2)}

PERFORMANCE ISSUE:
${state.task}

YOUR TASK:
Analyze the performance data and provide actionable optimization recommendations.

PROVIDE (as JSON):
{
  "bottlenecks": [
    "Specific bottleneck 1",
    "Specific bottleneck 2"
  ],
  "recommendations": [
    "Recommendation 1 with expected impact",
    "Recommendation 2 with expected impact"
  ],
  "codeChanges": [
    "Specific code change 1",
    "Specific code change 2"
  ],
  "requiresCodeChanges": true/false,
  "estimatedImprovement": "Expected % improvement or time saved"
}

FOCUS ON:
1. Database query optimization (indexes, query structure)
2. React component optimization (memoization, lazy loading)
3. API response time optimization
4. Bundle size reduction
5. Caching strategies

Provide ONLY valid JSON.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

    // Parse JSON response
    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      return {
        bottlenecks: [content],
        recommendations: ['See analysis above'],
        codeChanges: [],
        requiresCodeChanges: false,
        estimatedImprovement: 'Unknown'
      }
    } catch (parseError) {
      this.log('Failed to parse LLM response as JSON, using fallback', 'warn')
      return {
        bottlenecks: [content],
        recommendations: ['See analysis above'],
        codeChanges: [],
        requiresCodeChanges: false,
        estimatedImprovement: 'Unknown'
      }
    }
  }

  /**
   * Format optimization report
   */
  private formatOptimizationReport(issue: string, recommendations: any): string {
    const timestamp = new Date().toISOString()
    
    return `# Performance Optimization Report: ${issue}

**Timestamp**: ${timestamp}
**Severity**: ${this.determinePerformanceImpact(issue)}
**Status**: Analysis Complete

---

## Identified Bottlenecks

${recommendations.bottlenecks.map((b: string, i: number) => `${i + 1}. ${b}`).join('\n')}

---

## Optimization Recommendations

${recommendations.recommendations.map((r: string, i: number) => `${i + 1}. ${r}`).join('\n')}

---

## Code Changes Required

${recommendations.codeChanges.length > 0 
  ? recommendations.codeChanges.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')
  : 'No code changes required - configuration adjustments only'
}

---

## Estimated Improvement

${recommendations.estimatedImprovement}

---

## Implementation Priority

1. **High Priority**: Database optimizations (immediate impact)
2. **Medium Priority**: Frontend optimizations (user experience)
3. **Low Priority**: Configuration tuning (incremental gains)

---

**Analyzed by**: Optimizer Agent (LangGraph Multi-Agent System)
**Timestamp**: ${timestamp}
`
  }

  /**
   * Determine performance impact severity
   */
  private determinePerformanceImpact(issue: string): 'critical' | 'high' | 'medium' | 'low' {
    const issueLower = issue.toLowerCase()

    if (issueLower.includes('very slow') || issueLower.includes('timeout') || issueLower.includes('crash')) {
      return 'critical'
    }
    if (issueLower.includes('slow') || issueLower.includes('laggy')) {
      return 'high'
    }
    if (issueLower.includes('could be faster') || issueLower.includes('optimize')) {
      return 'medium'
    }
    
    return 'low'
  }
}


