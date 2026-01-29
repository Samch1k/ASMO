import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Performance Engineer Agent - Profiling, optimization, performance analysis
 *
 * Capabilities:
 * - Performance profiling and bottleneck analysis
 * - Frontend performance optimization (LCP, FID, CLS)
 * - Backend API performance tuning
 * - Database query optimization
 * - Caching strategy implementation
 * - Load testing and capacity planning
 * - Performance monitoring and alerting
 *
 * MCP Integrations:
 * - Sentry MCP (P0): Analyze performance metrics and traces
 * - Supabase MCP (P0): Analyze database query performance
 * - GitHub MCP (P1): Review code for performance issues
 * - Memory MCP (P2): Store performance optimization results
 */
export class PerformanceEngineerAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('performance-engineer', [
      'performance_profiling',
      'optimization',
      'load_testing',
      'database_tuning',
      'caching_strategy',
      'frontend_performance',
      'backend_performance',
      'capacity_planning',
      'monitoring_setup'
    ])

    // Initialize Claude LLM
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1, // Low temperature for consistent technical analysis
      maxTokens: 4096
    })
  }

  /**
   * Execute Performance Engineer workflow
   *
   * Process:
   * 1. Analyze performance metrics via Sentry MCP
   * 2. Profile database queries via Supabase MCP
   * 3. Review code for performance issues via GitHub MCP
   * 4. Identify bottlenecks and optimization opportunities
   * 5. Generate performance optimization plan
   * 6. Store findings in Memory MCP
   * 7. Handoff to Developer for implementation
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('⚡ Starting Performance analysis...')

    try {
      // STEP 1: Analyze performance metrics via Sentry
      this.log('Analyzing performance metrics...')
      const performanceMetrics = await this.requestMCP('sentry', {
        action: 'search_events',
        query: 'transaction.duration:>1s',
        limit: 100
      })

      // STEP 2: Profile database queries via Supabase
      this.log('Profiling database performance...')
      const slowQueries = await this.requestMCP('supabase', {
        action: 'execute_sql',
        query: `
          SELECT
            query,
            calls,
            mean_exec_time,
            max_exec_time
          FROM pg_stat_statements
          WHERE mean_exec_time > 100
          ORDER BY mean_exec_time DESC
          LIMIT 20
        `
      })

      // STEP 3: Review code for performance issues
      this.log('Reviewing code for performance issues...')
      const codeIssues = await this.requestMCP('github', {
        action: 'search_code',
        query: 'TODO: performance bottleneck slow optimization',
        repo: process.env.GITHUB_REPO
      })

      // STEP 4: Perform performance analysis
      this.log('Analyzing bottlenecks and generating optimization plan...')
      const optimizationPlan = await this.analyzePerformance(state, {
        performanceMetrics,
        slowQueries,
        codeIssues
      })

      // STEP 5: Create optimization report artifact
      const optimizationReport = this.createArtifact(
        'documentation',
        this.formatOptimizationReport(optimizationPlan),
        {
          reportType: 'performance_optimization',
          targetMetrics: this.extractTargetMetrics(optimizationPlan),
          timestamp: new Date().toISOString()
        }
      )

      // STEP 6: Store in Memory MCP
      this.log('Storing performance analysis...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Performance Analysis: ${state.task}`,
          entityType: 'performance_analysis',
          observations: [optimizationReport.content]
        }]
      })

      // STEP 7: Create result and handoff
      const result = this.createResult('needs_handoff', optimizationPlan, [optimizationReport])
      result.handoffTo = 'developer'
      result.confidence = 0.85

      this.log('✅ Performance analysis complete, handing off to Developer')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          optimizationPlan,
          optimizationReport
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
   * Analyze performance and generate optimization plan using Claude LLM
   */
  private async analyzePerformance(
    state: AgentState,
    context: {
      performanceMetrics: any
      slowQueries: any
      codeIssues: any
    }
  ): Promise<string> {
    const systemPrompt = `You are the Performance Engineer for MeatConnect, a B2B marketplace platform.

TECHNOLOGY STACK:
Frontend:
- React 19 with TypeScript (strict mode)
- Tailwind CSS v4
- Radix UI primitives
- React Query for server state (caching enabled)
- Wouter for routing

Backend:
- Express.js with TypeScript
- Node.js 20+
- PostgreSQL via Supabase
- Drizzle ORM (with connection pooling)
- Socket.IO for real-time
- Redis for caching (if available)

Deployment:
- Vercel (frontend - serverless, edge functions)
- Render (backend - containerized, auto-scaling)
- Supabase (database + storage, connection pooling)

PERFORMANCE TARGETS:
- Page Load (LCP): < 2.5s (target: < 1.5s)
- First Input Delay (FID): < 100ms (target: < 50ms)
- Cumulative Layout Shift (CLS): < 0.1 (target: < 0.05)
- API Response Time (p95): < 500ms (target: < 200ms)
- Database Queries: < 100ms average (target: < 50ms)
- Time to Interactive (TTI): < 3.5s (target: < 2s)

CURRENT PERFORMANCE METRICS (from Sentry):
${JSON.stringify(context.performanceMetrics, null, 2)}

SLOW DATABASE QUERIES (from Supabase):
${JSON.stringify(context.slowQueries, null, 2)}

CODE PERFORMANCE ISSUES (from GitHub):
${JSON.stringify(context.codeIssues, null, 2)}

TASK:
${state.task}

PERFORM COMPREHENSIVE PERFORMANCE ANALYSIS:

1. **Bottleneck Identification**
   For each bottleneck found:
   - Component: Frontend / Backend / Database / Network
   - Issue: Clear description of the problem
   - Impact: Critical / High / Medium / Low
   - Current Metric: Actual performance measurement
   - Target Metric: Desired performance after optimization
   - Root Cause: Why this bottleneck exists

2. **Frontend Optimization**
   - Code splitting and lazy loading opportunities
   - Bundle size reduction strategies
   - Image optimization (WebP, lazy load, responsive)
   - React rendering optimization (memo, useMemo, useCallback)
   - React Query optimization (stale time, cache time)
   - CSS optimization (remove unused, critical CSS)
   - Web Vitals improvements (LCP, FID, CLS)

3. **Backend Optimization**
   - API endpoint response time improvements
   - Request batching opportunities
   - Rate limiting and throttling
   - Connection pooling optimization
   - Worker threads for CPU-intensive tasks
   - Async/await optimization

4. **Database Optimization**
   - Query optimization (indexes, joins, subqueries)
   - N+1 query elimination
   - Connection pooling tuning
   - Database indexes to add/optimize
   - Materialized views for complex queries
   - Partitioning strategies for large tables
   - Query caching opportunities

5. **Caching Strategy**
   - Browser caching (service workers, Cache-Control headers)
   - CDN caching (Vercel Edge Network)
   - Application-level caching (React Query, Redis)
   - Database query result caching
   - API response caching (with invalidation strategy)

6. **Load Testing & Capacity Planning**
   - Current capacity vs expected load
   - Scaling recommendations (horizontal / vertical)
   - Auto-scaling configuration
   - Resource bottlenecks (CPU, memory, database connections)

7. **Monitoring & Alerting**
   - Performance monitoring setup (Sentry, Vercel Analytics)
   - Custom performance alerts
   - Real User Monitoring (RUM) configuration
   - Performance budget enforcement

8. **Optimization Priority List**
   QUICK WINS (implement immediately, low effort, high impact):
   - [List quick win optimizations]

   CRITICAL (fix this sprint, high impact):
   - [List critical optimizations]

   HIGH (plan for next sprint, medium-high impact):
   - [List high priority optimizations]

   MEDIUM (backlog, medium impact):
   - [List medium priority optimizations]

9. **Implementation Plan**
   For top 3 optimizations:
   - Optimization: [Description]
   - Implementation Steps: [Specific technical steps]
   - Expected Impact: [Quantified improvement]
   - Effort Estimate: [Hours/days]
   - Dependencies: [Prerequisites]
   - Testing Strategy: [How to verify improvement]

Format as a clear, actionable performance optimization plan with specific metrics and implementation steps.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)
  }

  /**
   * Extract target performance metrics from optimization plan
   */
  private extractTargetMetrics(plan: string): Record<string, string> {
    const metrics: Record<string, string> = {}

    // Extract target metrics using regex patterns
    const metricPatterns = [
      /LCP:?\s*<?(\d+\.?\d*[sm]s?)/gi,
      /FID:?\s*<?(\d+\.?\d*[sm]s?)/gi,
      /CLS:?\s*<?(\d+\.?\d*)/gi,
      /API.*?:?\s*<?(\d+\.?\d*[sm]s?)/gi,
      /Database.*?:?\s*<?(\d+\.?\d*[sm]s?)/gi,
      /TTI:?\s*<?(\d+\.?\d*[sm]s?)/gi
    ]

    for (const pattern of metricPatterns) {
      const matches = plan.match(pattern)
      if (matches) {
        metrics[matches[0].split(':')[0].trim()] = matches[1]
      }
    }

    return metrics
  }

  /**
   * Format performance optimization report
   */
  private formatOptimizationReport(plan: string): string {
    const timestamp = new Date().toISOString().split('T')[0]

    return `# Performance Optimization Report

**Date**: ${timestamp}
**Engineer**: Performance Engineer Agent
**Platform**: MeatConnect B2B Marketplace
**Scope**: Full-Stack Performance Analysis

---

## Executive Summary

This performance analysis identifies bottlenecks across frontend, backend, and database layers, providing actionable optimization strategies to meet our performance targets.

**Key Performance Indicators**:
- LCP (Largest Contentful Paint): Target < 1.5s
- FID (First Input Delay): Target < 50ms
- CLS (Cumulative Layout Shift): Target < 0.05
- API Response Time (p95): Target < 200ms
- Database Query Time (avg): Target < 50ms

---

## Detailed Analysis & Recommendations

${plan}

---

## Performance Monitoring

After implementing optimizations, monitor these metrics:
- Vercel Analytics (Web Vitals)
- Sentry Performance Monitoring (API response times, database queries)
- Supabase Dashboard (database performance)
- Custom alerts for performance regressions

---

**Generated by**: Performance Engineer Agent (LangGraph Multi-Agent System)
**Timestamp**: ${new Date().toISOString()}

**Next Steps**:
1. Review and prioritize optimizations
2. Implement quick wins immediately
3. Schedule critical optimizations for current sprint
4. Set up performance monitoring and alerts
5. Re-run analysis after optimizations
`
  }
}
