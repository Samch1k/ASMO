import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"

/**
 * Test Architect Agent (TEA) - Testing Strategy and Quality Specialist
 *
 * Part of the TEA (Test Architect) module from BMAD methodology.
 *
 * Capabilities:
 * - Test strategy design
 * - Risk-based testing approach
 * - Quality gates definition
 * - Test automation planning
 * - Release readiness assessment
 * - Regression analysis
 * - Test maintenance planning
 *
 * MCP Integrations:
 * - Memory MCP: Store test strategies and quality metrics
 * - Filesystem MCP: Read codebase for test analysis
 * - GitHub MCP: Analyze test coverage and CI/CD
 */
export class TestArchitectAgent extends BaseAgent {
  constructor() {
    super('test-architect', [
      'test_strategy',
      'risk_based_testing',
      'quality_gates',
      'test_automation',
      'release_readiness',
      'regression_analysis',
      'test_maintenance',
      'coverage_analysis'
    ])
  }

  /**
   * Execute TEA workflow
   *
   * Process:
   * 1. Determine testing focus (strategy, risk, gates, etc.)
   * 2. Analyze codebase and requirements
   * 3. Generate testing artifacts
   * 4. Create quality recommendations
   */
  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🧪 Starting test architecture analysis...')

    try {
      const task = state.task
      const teaFocus = this.determineTEAFocus(task)

      this.log(`TEA Focus: ${teaFocus}`)

      // STEP 1: Gather context
      this.log('Gathering testing context...')
      const testHistory = await this.requestMCP('memory', {
        action: 'search_nodes',
        query: `test strategy ${task}`,
        type: 'test_strategy',
        limit: 3
      })

      // Build enriched context with test history
      const enrichedContext = {
        ...state.context,
        testHistory
      }

      // STEP 2: Execute based on focus
      let result
      switch (teaFocus) {
        case 'risk-assessment':
          result = await this.performRiskAssessment(task, enrichedContext)
          break
        case 'test-strategy':
          result = await this.createTestStrategy(task, enrichedContext)
          break
        case 'test-design':
          result = await this.designTests(task, enrichedContext)
          break
        case 'test-automation':
          result = await this.planTestAutomation(task, enrichedContext)
          break
        case 'quality-gates':
          result = await this.defineQualityGates(task, enrichedContext)
          break
        case 'release-readiness':
          result = await this.assessReleaseReadiness(task, enrichedContext)
          break
        case 'regression-analysis':
          result = await this.analyzeRegression(task, enrichedContext)
          break
        case 'test-maintenance':
          result = await this.planTestMaintenance(task, enrichedContext)
          break
        default:
          result = await this.createTestStrategy(task, state.context)
      }

      // STEP 3: Store in Memory MCP
      this.log('Storing test architecture...')
      await this.requestMCP('memory', {
        action: 'create_entities',
        entities: [{
          name: `TEA: ${task.substring(0, 50)}`,
          entityType: 'test_strategy',
          observations: [
            `Focus: ${teaFocus}`,
            `Risk level: ${result.riskLevel || 'medium'}`,
            `Test types: ${result.testTypes?.join(', ') || 'TBD'}`
          ]
        }]
      })

      // Create artifact
      const artifact = this.createArtifact(
        'test',
        result.document,
        {
          teaFocus,
          riskLevel: result.riskLevel,
          testTypes: result.testTypes
        }
      )

      const agentResult = this.createResult(
        'success',
        {
          teaFocus,
          summary: result.summary,
          riskLevel: result.riskLevel,
          recommendations: result.recommendations
        },
        [artifact]
      )

      this.log('✅ TEA analysis complete')

      return {
        agentResults: [...state.agentResults, agentResult],
        context: {
          ...state.context,
          testStrategy: result
        },
        nextAction: this.determineNextAction(teaFocus)
      }

    } catch (error: any) {
      this.log(`TEA analysis failed: ${error.message}`, 'error')

      const errorResult = this.createResult('failed', { error: error.message }, [])

      return {
        agentResults: [...state.agentResults, errorResult],
        nextAction: 'error_recovery'
      }
    }
  }

  private determineTEAFocus(task: string): string {
    const lower = task.toLowerCase()

    if (lower.includes('risk')) return 'risk-assessment'
    if (lower.includes('strategy')) return 'test-strategy'
    if (lower.includes('design') || lower.includes('test case')) return 'test-design'
    if (lower.includes('automation') || lower.includes('automate')) return 'test-automation'
    if (lower.includes('quality gate') || lower.includes('gate')) return 'quality-gates'
    if (lower.includes('release') || lower.includes('readiness')) return 'release-readiness'
    if (lower.includes('regression')) return 'regression-analysis'
    if (lower.includes('maintenance') || lower.includes('maintain')) return 'test-maintenance'

    return 'test-strategy'
  }

  private async performRiskAssessment(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Perform a risk-based testing assessment.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Analyze:
1. Business Risk Areas
   - Critical business functions
   - Revenue impact areas
   - Compliance requirements

2. Technical Risk Areas
   - Complex integrations
   - Performance-sensitive areas
   - Security vulnerabilities
   - Data integrity concerns

3. Risk Matrix
   For each risk: Likelihood x Impact = Priority

4. Risk-Based Test Prioritization
   - High priority test areas
   - Medium priority test areas
   - Low priority test areas

5. Risk Mitigation Strategies

Return as JSON:
{
  "summary": "Risk assessment summary",
  "riskLevel": "high/medium/low",
  "risks": [
    {"area": "name", "likelihood": "H/M/L", "impact": "H/M/L", "priority": 1}
  ],
  "testTypes": ["unit", "integration", "e2e"],
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown document"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async createTestStrategy(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Create a comprehensive test strategy.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Include:
1. Test Objectives
2. Scope (In/Out)
3. Test Types & Levels
   - Unit tests (coverage targets)
   - Integration tests
   - E2E tests
   - Performance tests
   - Security tests
4. Test Environment Requirements
5. Test Data Strategy
6. Entry/Exit Criteria
7. Test Metrics & KPIs
8. Risk Assessment Summary
9. Resource Requirements
10. Timeline & Milestones

Return as JSON:
{
  "summary": "Strategy summary",
  "riskLevel": "high/medium/low",
  "testTypes": ["unit", "integration", "e2e", "performance", "security"],
  "coverageTargets": {"unit": 80, "integration": 70, "e2e": 50},
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown test strategy"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async designTests(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Design test cases for the given requirements.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Create:
1. Test Scenarios (high-level)
2. Test Cases (detailed)
   - ID
   - Title
   - Preconditions
   - Steps
   - Expected Results
   - Priority
3. Test Data Requirements
4. Boundary Value Analysis
5. Equivalence Partitioning
6. Decision Table Tests
7. State Transition Tests (if applicable)

Return as JSON:
{
  "summary": "Test design summary",
  "riskLevel": "medium",
  "testTypes": ["functional", "boundary", "negative"],
  "testCases": [
    {"id": "TC-001", "title": "...", "priority": "high"}
  ],
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown test design document"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async planTestAutomation(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Plan test automation strategy.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Include:
1. Automation Scope
   - What to automate
   - What to keep manual
2. Tool Selection
   - Unit testing framework
   - Integration testing tools
   - E2E testing tools
   - Performance testing tools
3. Framework Architecture
4. Test Data Management
5. CI/CD Integration
6. Reporting & Dashboards
7. Maintenance Strategy
8. ROI Analysis
9. Implementation Roadmap

Return as JSON:
{
  "summary": "Automation plan summary",
  "riskLevel": "medium",
  "testTypes": ["automated-unit", "automated-integration", "automated-e2e"],
  "tools": ["jest", "playwright", "k6"],
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown automation plan"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async defineQualityGates(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Define quality gates for the development pipeline.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Define gates for each stage:
1. Code Commit Gate
   - Linting pass
   - Unit test pass
   - Coverage threshold

2. PR/Merge Gate
   - All tests pass
   - Code review approved
   - No critical vulnerabilities

3. Staging Gate
   - Integration tests pass
   - Performance benchmarks met
   - Security scan clean

4. Production Gate
   - All previous gates pass
   - Smoke tests pass
   - Rollback plan ready

For each gate:
- Criteria (must pass)
- Metrics (thresholds)
- Bypass conditions (if any)
- Escalation path

Return as JSON:
{
  "summary": "Quality gates summary",
  "riskLevel": "low",
  "testTypes": ["quality-gate"],
  "gates": [
    {"name": "Code Commit", "criteria": [], "thresholds": {}}
  ],
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown quality gates document"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async assessReleaseReadiness(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Assess release readiness.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Evaluate:
1. Feature Completeness
   - All features implemented
   - All acceptance criteria met

2. Quality Metrics
   - Test coverage
   - Defect density
   - Open defects (by severity)
   - Test pass rate

3. Performance Validation
   - Load test results
   - Performance benchmarks

4. Security Validation
   - Vulnerability scan results
   - Penetration test results

5. Documentation Status
   - User documentation
   - API documentation
   - Release notes

6. Operational Readiness
   - Monitoring in place
   - Runbooks ready
   - Rollback tested

7. Go/No-Go Recommendation

Return as JSON:
{
  "summary": "Release readiness assessment",
  "riskLevel": "high/medium/low",
  "testTypes": ["release-validation"],
  "readinessScore": 85,
  "blockers": ["blocker1"],
  "recommendations": ["rec1", "rec2"],
  "decision": "GO/NO-GO/CONDITIONAL",
  "document": "Full markdown readiness report"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async analyzeRegression(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Analyze regression testing needs.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Analyze:
1. Change Impact Analysis
   - Modified components
   - Affected areas
   - Downstream dependencies

2. Regression Test Selection
   - High-priority tests
   - Tests for affected areas
   - Smoke tests

3. Regression Risk Assessment
   - Areas with highest regression risk
   - Historical defect patterns

4. Test Optimization
   - Tests to add
   - Tests to remove/update
   - Parallelization opportunities

5. Regression Prevention
   - Root cause analysis
   - Prevention measures

Return as JSON:
{
  "summary": "Regression analysis summary",
  "riskLevel": "medium",
  "testTypes": ["regression"],
  "impactedAreas": ["area1", "area2"],
  "selectedTests": 45,
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown regression analysis"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private async planTestMaintenance(
    task: string,
    context: any
  ): Promise<TEAResult> {
    const prompt = `Plan test suite maintenance.

Task: ${task}

Context: ${JSON.stringify(context, null, 2)}

Address:
1. Test Suite Health Assessment
   - Flaky tests
   - Slow tests
   - Outdated tests
   - Duplicate coverage

2. Cleanup Recommendations
   - Tests to delete
   - Tests to refactor
   - Tests to merge

3. Optimization Plan
   - Execution time improvements
   - Reliability improvements
   - Coverage improvements

4. Maintenance Schedule
   - Regular review cadence
   - Ownership assignments
   - Metrics to track

5. Test Debt Reduction
   - Priority areas
   - Resource requirements
   - Timeline

Return as JSON:
{
  "summary": "Test maintenance plan",
  "riskLevel": "low",
  "testTypes": ["maintenance"],
  "healthScore": 72,
  "issues": {"flaky": 12, "slow": 8, "outdated": 23},
  "recommendations": ["rec1", "rec2"],
  "document": "Full markdown maintenance plan"
}`

    const response = await this.callLLM(prompt, {
      model: 'sonnet',
      temperature: 0.2,
      maxTokens: 6144
    })
    return this.parseResponse(response.content)
  }

  private parseResponse(content: any): TEAResult {
    const str = typeof content === 'string' ? content : JSON.stringify(content)
    const jsonMatch = str.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || 'TEA analysis complete',
          riskLevel: parsed.riskLevel || 'medium',
          testTypes: parsed.testTypes || [],
          recommendations: parsed.recommendations || [],
          document: parsed.document || str,
          ...parsed
        }
      } catch {
        // Fall through
      }
    }

    return {
      summary: 'TEA analysis complete',
      riskLevel: 'medium',
      testTypes: [],
      recommendations: [],
      document: str
    }
  }

  private determineNextAction(teaFocus: string): string {
    switch (teaFocus) {
      case 'risk-assessment':
        return 'test-strategy' // Continue to strategy
      case 'test-strategy':
        return 'developer' // Ready for implementation
      case 'release-readiness':
        return 'devops' // Ready for deployment
      default:
        return 'tester' // Hand to tester for execution
    }
  }
}

interface TEAResult {
  summary: string
  riskLevel: string
  testTypes: string[]
  recommendations: string[]
  document: string
  [key: string]: any
}
