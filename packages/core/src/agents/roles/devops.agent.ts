import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * DevOps Agent - Deployment, CI/CD, infrastructure management
 *
 * Capabilities:
 * - Deployment plan generation (LLM-based)
 * - CI/CD configuration analysis
 * - Rollback strategy design
 * - Health check verification
 * - Infrastructure status monitoring
 *
 * MCP Integrations:
 * - Vercel MCP: Frontend deployment status
 * - Render MCP: Backend service status
 * - Filesystem MCP: Read CI/CD configs and Dockerfiles
 */
export class DevOpsAgent extends BaseAgent {
  constructor() {
    super('devops', [
      'deployment',
      'ci_cd',
      'infrastructure',
      'monitoring',
      'incident_response'
    ])
  }

  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('Starting DevOps workflow...')
    this.setExecutionContext(state)

    try {
      // STEP 1: Gather infrastructure status
      this.log('Checking infrastructure status...')
      const infraStatus = await this.gatherInfraStatus()

      // STEP 2: Read CI/CD configuration
      this.log('Analyzing CI/CD configuration...')
      const cicdConfig = await this.readCICDConfig()

      // STEP 3: Generate deployment plan via LLM
      this.log('Generating deployment plan...')
      const deployPlan = await this.generateDeployPlan(state, infraStatus, cicdConfig)

      // STEP 4: Generate rollback strategy
      this.log('Designing rollback strategy...')
      const rollbackStrategy = await this.generateRollbackStrategy(state, deployPlan)

      // STEP 5: Generate health check plan
      this.log('Creating health check plan...')
      const healthChecks = await this.generateHealthChecks(state, deployPlan)

      // STEP 6: Compile final report
      const report = this.compileReport(state.task, deployPlan, rollbackStrategy, healthChecks, infraStatus)

      // Create artifacts
      const planArtifact = this.createArtifact('documentation', report, {
        type: 'deployment_plan'
      })

      const rollbackArtifact = this.createArtifact('documentation', rollbackStrategy, {
        type: 'rollback_strategy'
      })

      const result = this.createResult(
        'success',
        { deployPlan, rollbackStrategy, healthChecks },
        [planArtifact, rollbackArtifact]
      )

      this.log(`DevOps workflow complete - deployment plan ready`)

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          deploymentPlan: report,
          rollbackStrategy,
          healthChecks,
          infraStatus
        },
        nextAction: 'END'
      }
    } catch (error) {
      this.log(`DevOps error: ${error}`, 'error')

      return {
        agentResults: [...state.agentResults, this.createResult('failed', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })],
        nextAction: 'END'
      }
    }
  }

  /**
   * Gather current infrastructure status from MCP providers
   */
  private async gatherInfraStatus(): Promise<{
    vercel: string
    render: string
    details: Record<string, unknown>
  }> {
    const [vercelStatus, renderStatus] = await Promise.all([
      this.requestMCP('vercel', {
        action: 'get_deployment',
        deployment: 'latest'
      }),
      this.requestMCP('render', {
        action: 'get_service_status'
      })
    ])

    return {
      vercel: vercelStatus?.status || 'unavailable',
      render: renderStatus?.status || 'unavailable',
      details: {
        vercel: vercelStatus,
        render: renderStatus
      }
    }
  }

  /**
   * Read CI/CD configuration files
   */
  private async readCICDConfig(): Promise<string> {
    const configFiles = [
      '.github/workflows/ci.yml',
      '.github/workflows/deploy.yml',
      'Dockerfile',
      'docker-compose.yml',
      'vercel.json',
      'render.yaml'
    ]

    const configs = await this.requestMCP('filesystem', {
      action: 'read_multiple_files',
      paths: configFiles
    })

    return JSON.stringify(configs || {}, null, 2)
  }

  /**
   * Generate deployment plan using LLM
   */
  private async generateDeployPlan(
    state: AgentState,
    infraStatus: { vercel: string; render: string; details: Record<string, unknown> },
    cicdConfig: string
  ): Promise<string> {
    const systemPrompt = `You are a DevOps engineer creating a deployment plan.

TASK: ${state.task}

CURRENT INFRASTRUCTURE STATUS:
- Vercel (Frontend): ${infraStatus.vercel}
- Render (Backend): ${infraStatus.render}

CI/CD CONFIGURATION:
${cicdConfig}

Create a detailed deployment plan including:
1. Pre-deployment checks (dependencies, env vars, database migrations)
2. Build and test steps
3. Staging deployment with smoke tests
4. Production deployment strategy (rolling, blue-green, or canary)
5. Post-deployment verification
6. Monitoring and alerting setup

Format as a clear, actionable markdown document.
Include specific commands where applicable.
Consider zero-downtime deployment strategies.`

    const response = await this.callLLM(state.task, {
      model: 'sonnet',
      temperature: 0.3,
      maxTokens: 4096,
      systemPrompt
    })

    return response.content
  }

  /**
   * Generate rollback strategy using LLM
   */
  private async generateRollbackStrategy(
    state: AgentState,
    deployPlan: string
  ): Promise<string> {
    const systemPrompt = `You are a DevOps engineer designing a rollback strategy.

DEPLOYMENT PLAN:
${deployPlan.slice(0, 3000)}

TASK: ${state.task}

Design a comprehensive rollback strategy:
1. Automated rollback triggers (error rate thresholds, health check failures)
2. Manual rollback procedure (step-by-step)
3. Database rollback considerations (migration reversal)
4. DNS/traffic switching procedure
5. Communication plan (team notifications)
6. Post-rollback verification steps

Format as actionable markdown with specific commands and thresholds.`

    const response = await this.callLLM(state.task, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 2048,
      systemPrompt
    })

    return response.content
  }

  /**
   * Generate health check plan using LLM
   */
  private async generateHealthChecks(
    state: AgentState,
    deployPlan: string
  ): Promise<string> {
    const systemPrompt = `You are a DevOps engineer defining health checks for a deployment.

DEPLOYMENT PLAN:
${deployPlan.slice(0, 2000)}

TASK: ${state.task}

Define health checks for post-deployment verification:
1. HTTP endpoint checks (paths, expected status codes, response time thresholds)
2. Database connectivity checks
3. External service dependency checks
4. Performance baseline comparisons
5. Error rate monitoring thresholds
6. Resource utilization checks (CPU, memory, disk)

Provide specific check definitions with:
- Check name and type
- Expected values / thresholds
- Frequency / interval
- Alert severity levels

Format as structured markdown.`

    const response = await this.callLLM(state.task, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 2048,
      systemPrompt
    })

    return response.content
  }

  /**
   * Compile final deployment report
   */
  private compileReport(
    task: string,
    deployPlan: string,
    rollbackStrategy: string,
    healthChecks: string,
    infraStatus: { vercel: string; render: string }
  ): string {
    const timestamp = new Date().toISOString()

    return `# Deployment Report: ${task}

**Generated**: ${timestamp}
**Agent**: DevOps Agent (ASMO)

---

## Infrastructure Status

| Service | Platform | Status |
|---------|----------|--------|
| Frontend | Vercel | ${infraStatus.vercel} |
| Backend | Render | ${infraStatus.render} |

---

## Deployment Plan

${deployPlan}

---

## Rollback Strategy

${rollbackStrategy}

---

## Health Checks

${healthChecks}

---

## Checklist

- [ ] Pre-deployment checks passed
- [ ] Database migrations applied
- [ ] Staging deployment verified
- [ ] Production deployment completed
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] Rollback procedure tested
- [ ] Team notified

---

*Generated by DevOps Agent (ASMO Multi-Agent System) at ${timestamp}*
`
  }
}
