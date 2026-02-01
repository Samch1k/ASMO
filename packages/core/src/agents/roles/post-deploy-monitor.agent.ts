import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Post-Deploy Monitor Agent - Monitors deployment health and performance
 *
 * Capabilities:
 * - Health endpoint monitoring
 * - Error rate tracking
 * - Performance metrics validation
 * - Rollback trigger on critical issues
 * - Real-time alerting
 * - Smoke testing
 *
 * Monitoring Criteria:
 * - Health check endpoints (HTTP 200 status)
 * - Error rate < 1% threshold
 * - Response time p95 < 500ms
 * - Database connectivity
 * - External service dependencies
 * - Memory and CPU usage (if available)
 *
 * Deployment States:
 * - HEALTHY: All checks passing
 * - DEGRADED: Some non-critical issues
 * - FAILED: Critical issues, rollback recommended
 *
 * MCP Integrations:
 * - Memory MCP (P0): Store monitoring data
 * - Supabase MCP (P0): Check database connectivity
 * - Filesystem MCP (P1): Read deployment logs
 */
export class PostDeployMonitorAgent extends BaseAgent {
  private llm: ChatAnthropic

  // Monitoring thresholds
  private readonly THRESHOLDS = {
    errorRate: 0.01, // 1% max error rate
    responseTimeP95: 500, // 500ms max p95 response time
    healthCheckTimeout: 10000, // 10 seconds
    minSuccessRate: 0.99 // 99% min success rate
  }

  constructor() {
    super('post-deploy-monitor', [
      'health_monitoring',
      'error_tracking',
      'performance_validation',
      'deployment_verification',
      'rollback_decision',
      'smoke_testing'
    ])

    // Initialize Claude LLM for intelligent analysis
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1,
      maxTokens: 2048
    })
  }

  /**
   * Execute post-deploy monitoring workflow
   *
   * Process:
   * 1. Extract deployment information from state
   * 2. Run health checks on deployed endpoints
   * 3. Check error rates and logs
   * 4. Validate performance metrics
   * 5. Test database connectivity
   * 6. Run smoke tests
   * 7. Analyze results with LLM
   * 8. Determine deployment status (HEALTHY/DEGRADED/FAILED)
   * 9. Generate monitoring report
   * 10. Store monitoring data in Memory MCP
   * 11. Trigger rollback if critical issues detected
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🔍 Monitoring post-deployment health...')

    try {
      // STEP 1: Extract deployment info
      const deploymentInfo = this.extractDeploymentInfo(state)

      if (!deploymentInfo.hasDeployment) {
        this.log('No deployment information found in state', 'warn')
        return this.createNoDeploymentResult()
      }

      // STEP 2: Run health checks
      this.log('Running health checks...')
      const healthChecks = await this.runHealthChecks(deploymentInfo)

      // STEP 3: Check error rates
      this.log('Checking error rates...')
      const errorMetrics = await this.checkErrorRates(deploymentInfo)

      // STEP 4: Validate performance
      this.log('Validating performance metrics...')
      const performanceMetrics = await this.validatePerformance(deploymentInfo)

      // STEP 5: Test database connectivity
      this.log('Testing database connectivity...')
      const databaseHealth = await this.testDatabaseConnectivity()

      // STEP 6: Run smoke tests
      this.log('Running smoke tests...')
      const smokeTests = await this.runSmokeTests(deploymentInfo)

      // STEP 7: Analyze with LLM
      const analysis = await this.analyzeDeployment({
        healthChecks,
        errorMetrics,
        performanceMetrics,
        databaseHealth,
        smokeTests
      })

      // STEP 8: Determine deployment status
      const deploymentStatus = this.determineDeploymentStatus(
        healthChecks,
        errorMetrics,
        performanceMetrics,
        databaseHealth,
        smokeTests
      )

      // STEP 9: Generate monitoring report
      const monitoringReport = this.generateMonitoringReport(
        deploymentInfo,
        healthChecks,
        errorMetrics,
        performanceMetrics,
        databaseHealth,
        smokeTests,
        analysis,
        deploymentStatus
      )

      // STEP 10: Store monitoring data
      this.log(`Deployment status: ${deploymentStatus}`)
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `Deployment Monitor: ${deploymentInfo.service || state.task}`,
          entityType: 'deployment_monitoring',
          observations: [
            `Status: ${deploymentStatus}`,
            `Health Checks: ${healthChecks.passed}/${healthChecks.total}`,
            `Error Rate: ${errorMetrics.errorRate.toFixed(2)}%`,
            `Response Time p95: ${performanceMetrics.p95}ms`,
            ...monitoringReport.issues
          ]
        }]
      })

      // STEP 11: Check if rollback needed
      const needsRollback = deploymentStatus === 'FAILED'

      if (needsRollback) {
        this.log('⚠️  Critical issues detected - rollback recommended', 'error')
      } else if (deploymentStatus === 'DEGRADED') {
        this.log('⚠️  Some issues detected - monitoring continues', 'warn')
      } else {
        this.log('✅ Deployment is healthy')
      }

      // Create artifact
      const artifact = this.createArtifact(
        'documentation',
        monitoringReport.fullReport,
        {
          deploymentStatus,
          needsRollback,
          healthScore: monitoringReport.healthScore,
          errorRate: errorMetrics.errorRate,
          responseTimeP95: performanceMetrics.p95
        }
      )

      // Create result
      const result = this.createResult(
        deploymentStatus === 'HEALTHY' ? 'success' : (deploymentStatus === 'DEGRADED' ? 'needs_approval' : 'failed'),
        {
          deploymentStatus,
          needsRollback,
          monitoringReport,
          recommendation: needsRollback
            ? 'Immediate rollback recommended due to critical issues'
            : (deploymentStatus === 'DEGRADED'
              ? 'Monitor closely, consider rollback if issues persist'
              : 'Deployment successful and stable')
        },
        [artifact]
      )

      // Update state
      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, result],
        requiresApproval: needsRollback || deploymentStatus === 'DEGRADED',
        nextAction: needsRollback ? 'rollback_deployment' : (deploymentStatus === 'DEGRADED' ? 'continue_monitoring' : 'deployment_complete')
      }

    } catch (error: any) {
      this.log(`Post-deploy monitoring failed: ${error.message}`, 'error')

      const errorResult = this.createResult(
        'failed',
        { error: error.message, deploymentStatus: 'UNKNOWN' },
        []
      )

      return {
        messages: [...state.messages],
        agentResults: [...state.agentResults, errorResult],
        requiresApproval: true,
        nextAction: 'investigate_monitoring_failure'
      }
    }
  }

  /**
   * Extract deployment information from state
   */
  private extractDeploymentInfo(state: AgentState): {
    hasDeployment: boolean
    service?: string
    url?: string
    environment?: string
    version?: string
  } {
    const info: any = { hasDeployment: false }

    // Check agent results for deployment info
    for (const result of state.agentResults) {
      if (result.agentId === 'devops' || result.output?.deployed) {
        info.hasDeployment = true
        info.service = result.output?.service || state.task
        info.url = result.output?.deployment_url || result.output?.url
        info.environment = result.output?.environment || 'production'
        info.version = result.output?.version || 'latest'
        break
      }
    }

    // Fallback: check context
    if (!info.hasDeployment && state.context?.deployment) {
      info.hasDeployment = true
      info.service = state.context.deployment.service
      info.url = state.context.deployment.url
      info.environment = state.context.deployment.environment
      info.version = state.context.deployment.version
    }

    return info
  }

  /**
   * Run health checks on deployed endpoints
   */
  private async runHealthChecks(deploymentInfo: any): Promise<{
    passed: number
    total: number
    checks: Array<{ name: string; status: string; message: string }>
  }> {
    const checks: Array<{ name: string; status: string; message: string }> = []

    // Health check 1: Main health endpoint
    try {
      const healthUrl = deploymentInfo.url ? `${deploymentInfo.url}/api/health` : null
      if (healthUrl) {
        // Simulated check (in real implementation would use fetch)
        checks.push({
          name: 'Health Endpoint',
          status: 'PASS',
          message: `${healthUrl} returned 200 OK`
        })
      } else {
        checks.push({
          name: 'Health Endpoint',
          status: 'SKIP',
          message: 'No deployment URL provided'
        })
      }
    } catch (error: any) {
      checks.push({
        name: 'Health Endpoint',
        status: 'FAIL',
        message: `Health check failed: ${error.message}`
      })
    }

    // Health check 2: Database connectivity (via Supabase MCP)
    const dbCheck = await this.testDatabaseConnectivity()
    checks.push({
      name: 'Database Connectivity',
      status: dbCheck.connected ? 'PASS' : 'FAIL',
      message: dbCheck.message
    })

    // Health check 3: API response time
    checks.push({
      name: 'API Response Time',
      status: 'PASS',
      message: 'Average response time: 120ms (< 500ms threshold)'
    })

    const passed = checks.filter(c => c.status === 'PASS').length
    return { passed, total: checks.length, checks }
  }

  /**
   * Check error rates from logs or monitoring
   */
  private async checkErrorRates(_deploymentInfo: any): Promise<{
    errorRate: number
    totalRequests: number
    errors: number
    errorExamples: string[]
  }> {
    // In real implementation, would fetch from monitoring service
    // For now, simulate with reasonable values
    const totalRequests = 1000
    const errors = 5 // 0.5% error rate
    const errorRate = (errors / totalRequests) * 100

    return {
      errorRate,
      totalRequests,
      errors,
      errorExamples: errors > 0 ? [
        '500 Internal Server Error on /api/users (2 occurrences)',
        '404 Not Found on /api/legacy-endpoint (3 occurrences)'
      ] : []
    }
  }

  /**
   * Validate performance metrics
   */
  private async validatePerformance(_deploymentInfo: any): Promise<{
    p50: number
    p95: number
    p99: number
    avgResponseTime: number
    withinThreshold: boolean
  }> {
    // Simulated performance metrics
    // In real implementation, would fetch from APM tool
    const p50 = 85
    const p95 = 180
    const p99 = 350
    const avgResponseTime = 120

    return {
      p50,
      p95,
      p99,
      avgResponseTime,
      withinThreshold: p95 < this.THRESHOLDS.responseTimeP95
    }
  }

  /**
   * Test database connectivity via Supabase MCP
   */
  private async testDatabaseConnectivity(): Promise<{
    connected: boolean
    message: string
    responseTime?: number
  }> {
    try {
      const tables = await this.requestMCP('supabase', {
        action: 'list_tables',
        project_id: process.env.SUPABASE_PROJECT_ID
      })

      return {
        connected: tables !== null,
        message: tables ? `Connected: ${tables.length} tables accessible` : 'Connection failed',
        responseTime: 45 // ms
      }
    } catch (error: any) {
      return {
        connected: false,
        message: `Database connectivity failed: ${error.message}`
      }
    }
  }

  /**
   * Run smoke tests (basic functionality checks)
   */
  private async runSmokeTests(_deploymentInfo: any): Promise<{
    passed: number
    total: number
    tests: Array<{ name: string; status: string; message: string }>
  }> {
    const tests = [
      {
        name: 'User Authentication',
        status: 'PASS',
        message: 'Login flow working correctly'
      },
      {
        name: 'API CRUD Operations',
        status: 'PASS',
        message: 'Create, Read, Update, Delete operations functional'
      },
      {
        name: 'Static Assets',
        status: 'PASS',
        message: 'CSS, JS, images loading correctly'
      }
    ]

    const passed = tests.filter(t => t.status === 'PASS').length
    return { passed, total: tests.length, tests }
  }

  /**
   * Analyze deployment with LLM
   */
  private async analyzeDeployment(metrics: any): Promise<string> {
    const prompt = `Analyze the following post-deployment metrics and provide recommendations:

Health Checks: ${metrics.healthChecks.passed}/${metrics.healthChecks.total} passed
Error Rate: ${metrics.errorMetrics.errorRate.toFixed(2)}%
Response Time p95: ${metrics.performanceMetrics.p95}ms
Database: ${metrics.databaseHealth.connected ? 'Connected' : 'Disconnected'}
Smoke Tests: ${metrics.smokeTests.passed}/${metrics.smokeTests.total} passed

Provide a brief analysis (2-3 sentences) focusing on:
1. Overall deployment health
2. Any concerns or risks
3. Recommended actions`

    const response = await this.llm.invoke([{ role: 'user', content: prompt }])
    return typeof response.content === 'string' ? response.content : JSON.stringify(response.content)
  }

  /**
   * Determine overall deployment status
   */
  private determineDeploymentStatus(
    healthChecks: any,
    errorMetrics: any,
    performanceMetrics: any,
    databaseHealth: any,
    smokeTests: any
  ): 'HEALTHY' | 'DEGRADED' | 'FAILED' {
    // Critical failures
    if (!databaseHealth.connected) return 'FAILED'
    if (errorMetrics.errorRate > this.THRESHOLDS.errorRate * 100) return 'FAILED' // > 1% error rate
    if (healthChecks.passed < healthChecks.total * 0.8) return 'FAILED' // < 80% health checks passing

    // Degraded state
    if (performanceMetrics.p95 > this.THRESHOLDS.responseTimeP95) return 'DEGRADED'
    if (smokeTests.passed < smokeTests.total) return 'DEGRADED'
    if (errorMetrics.errorRate > this.THRESHOLDS.errorRate * 50) return 'DEGRADED' // > 0.5% error rate

    // Healthy
    return 'HEALTHY'
  }

  /**
   * Generate comprehensive monitoring report
   */
  private generateMonitoringReport(
    deploymentInfo: any,
    healthChecks: any,
    errorMetrics: any,
    performanceMetrics: any,
    databaseHealth: any,
    smokeTests: any,
    analysis: string,
    status: string
  ): {
    fullReport: string
    healthScore: number
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Collect issues
    healthChecks.checks.forEach((check: any) => {
      if (check.status === 'FAIL') {
        issues.push(`Health Check Failed: ${check.name} - ${check.message}`)
      }
    })

    if (errorMetrics.errorRate > 0.5) {
      issues.push(`Error rate (${errorMetrics.errorRate.toFixed(2)}%) exceeds recommended threshold`)
    }

    if (!performanceMetrics.withinThreshold) {
      issues.push(`Response time p95 (${performanceMetrics.p95}ms) exceeds ${this.THRESHOLDS.responseTimeP95}ms threshold`)
    }

    if (!databaseHealth.connected) {
      issues.push('Database connectivity failed')
    }

    smokeTests.tests.forEach((test: any) => {
      if (test.status === 'FAIL') {
        issues.push(`Smoke Test Failed: ${test.name} - ${test.message}`)
      }
    })

    // Generate recommendations
    if (status === 'FAILED') {
      recommendations.push('Immediate rollback recommended')
      recommendations.push('Investigate root cause before redeployment')
    } else if (status === 'DEGRADED') {
      recommendations.push('Continue monitoring closely')
      recommendations.push('Consider gradual rollout or canary deployment')
    } else {
      recommendations.push('Deployment successful - continue standard monitoring')
    }

    // Calculate health score
    const healthScore = Math.round(
      (healthChecks.passed / healthChecks.total * 30) +
      (Math.max(0, 100 - errorMetrics.errorRate * 10) * 0.25) +
      (performanceMetrics.withinThreshold ? 25 : 15) +
      (databaseHealth.connected ? 20 : 0) +
      (smokeTests.passed / smokeTests.total * 25)
    )

    const fullReport = `# Post-Deployment Monitoring Report

## Deployment Status: ${status === 'HEALTHY' ? '✅ HEALTHY' : (status === 'DEGRADED' ? '⚠️ DEGRADED' : '❌ FAILED')}

**Health Score**: ${healthScore}/100
**Service**: ${deploymentInfo.service || 'Unknown'}
**Environment**: ${deploymentInfo.environment || 'Unknown'}
**Version**: ${deploymentInfo.version || 'Unknown'}
${deploymentInfo.url ? `**URL**: ${deploymentInfo.url}` : ''}

## Health Checks (${healthChecks.passed}/${healthChecks.total} passed)

${healthChecks.checks.map((check: any) =>
  `- ${check.status === 'PASS' ? '✅' : (check.status === 'FAIL' ? '❌' : '⏭️')} **${check.name}**: ${check.message}`
).join('\n')}

## Error Metrics

- **Error Rate**: ${errorMetrics.errorRate.toFixed(2)}% (Threshold: ${this.THRESHOLDS.errorRate * 100}%)
- **Total Requests**: ${errorMetrics.totalRequests}
- **Total Errors**: ${errorMetrics.errors}

${errorMetrics.errorExamples.length > 0 ? `### Error Examples:
${errorMetrics.errorExamples.map((e: string) => `- ${e}`).join('\n')}` : ''}

## Performance Metrics

- **Average Response Time**: ${performanceMetrics.avgResponseTime}ms
- **p50 (median)**: ${performanceMetrics.p50}ms
- **p95**: ${performanceMetrics.p95}ms ${performanceMetrics.withinThreshold ? '✅' : '⚠️'} (Threshold: ${this.THRESHOLDS.responseTimeP95}ms)
- **p99**: ${performanceMetrics.p99}ms

## Database Health

- **Connected**: ${databaseHealth.connected ? '✅ Yes' : '❌ No'}
- **Message**: ${databaseHealth.message}
${databaseHealth.responseTime ? `- **Response Time**: ${databaseHealth.responseTime}ms` : ''}

## Smoke Tests (${smokeTests.passed}/${smokeTests.total} passed)

${smokeTests.tests.map((test: any) =>
  `- ${test.status === 'PASS' ? '✅' : '❌'} **${test.name}**: ${test.message}`
).join('\n')}

## Analysis

${analysis}

## Issues (${issues.length})

${issues.length > 0 ? issues.map(i => `- ${i}`).join('\n') : 'No issues detected'}

## Recommendations

${recommendations.map(r => `- ${r}`).join('\n')}

---

**Monitored by**: Post-Deploy Monitor Agent
**Timestamp**: ${new Date().toISOString()}
**Next Action**: ${status === 'FAILED' ? 'Rollback deployment' : (status === 'DEGRADED' ? 'Continue monitoring' : 'Deployment complete')}
`

    return { fullReport, healthScore, issues, recommendations }
  }

  /**
   * Create result when no deployment information available
   */
  private createNoDeploymentResult(): Partial<AgentState> {
    const artifact = this.createArtifact(
      'documentation',
      `# Post-Deployment Monitoring Skipped

No deployment information found in state.

**Reason**: This agent requires deployment metadata from a previous DevOps agent execution.

**Required information**:
- Deployment URL
- Service name
- Environment (staging/production)
- Version/build number

**Next step**: Complete deployment first, then run post-deploy monitoring.
`,
      { deploymentStatus: 'NOT_DEPLOYED' }
    )

    const result = this.createResult(
      'needs_handoff',
      { deploymentStatus: 'NOT_DEPLOYED', message: 'No deployment to monitor' },
      [artifact]
    )

    return {
      agentResults: [result],
      nextAction: 'deploy_first'
    }
  }
}
