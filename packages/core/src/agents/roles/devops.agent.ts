import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * DevOps Agent - Deployment, CI/CD, infrastructure management
 */
export class DevOpsAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('devops', [
      'deployment',
      'ci_cd',
      'infrastructure',
      'monitoring',
      'incident_response'
    ])
    
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.1,
      maxTokens: 4096
    })
  }

  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🚀 Starting DevOps workflow...')

    try {
      // Check deployment status
      const vercelStatus = await this.requestMCP('vercel', {
        action: 'get_deployment',
        deployment: 'latest'
      })

      const renderStatus = await this.requestMCP('render', {
        action: 'get_service_status'
      })

      const deploymentPlan = `# Deployment Plan: ${state.task}

## Status Check
- Vercel (Frontend): ${vercelStatus?.status || 'Unknown'}
- Render (Backend): ${renderStatus?.status || 'Unknown'}

## Deployment Steps
1. Run tests (CI/CD)
2. Build production bundle
3. Deploy to staging
4. Smoke test staging
5. Deploy to production
6. Monitor metrics

## Rollback Plan
If deployment fails:
- Automatic rollback to previous version
- Alert team via Slack/Email
- Investigate logs
`

      const result = this.createResult('success', deploymentPlan, [
        this.createArtifact('documentation', deploymentPlan)
      ])

      this.log('✅ Deployment plan ready')

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          deploymentPlan
        },
        nextAction: 'END'
      }
    } catch (error) {
      this.log(`DevOps error: ${error}`, 'error')
      
      return {
        agentResults: [...state.agentResults, this.createResult('failed', { error })],
        nextAction: 'END'
      }
    }
  }
}


