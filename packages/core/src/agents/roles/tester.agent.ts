import { BaseAgent } from "../base-agent"
import { AgentState } from "../types"
import { ChatAnthropic } from "@langchain/anthropic"

/**
 * Tester Agent - Responsible for test creation and quality assurance
 * 
 * Capabilities:
 * - E2E test creation (Playwright)
 * - Unit test review
 * - Test coverage analysis
 * - Bug reproduction
 * - Smoke testing
 * 
 * MCP Integrations:
 * - Playwright MCP (P0): Browser automation and E2E testing
 * - Filesystem MCP (P1): Read implementation code
 * - GitHub MCP (P1): Create test reports
 */
export class TesterAgent extends BaseAgent {
  private llm: ChatAnthropic

  constructor() {
    super('tester', [
      'e2e_testing',
      'unit_testing',
      'test_coverage',
      'bug_reproduction',
      'smoke_testing',
      'acceptance_testing'
    ])
    
    this.llm = new ChatAnthropic({
      modelName: "claude-sonnet-4-20250514",
      temperature: 0.2,
      maxTokens: 8192
    })
  }

  async execute(state: AgentState): Promise<Partial<AgentState>> {
    this.log('🧪 Starting test creation and quality assurance...')

    try {
      // STEP 1: Get implementation context
      const implementation = state.context.implementation || state.task
      // codeArtifact is available in state.context for future use in test generation
      void state.context.codeArtifact

      this.log('📖 Analyzing implementation for test scenarios...')

      // STEP 2: Identify test files to read
      const testFiles = this.identifyTestFiles(state.task)
      const existingTests = await this.requestMCP('filesystem', {
        action: 'read_multiple_files',
        paths: testFiles
      })

      // STEP 3: Research testing best practices
      this.log('🔍 Researching testing patterns...')
      const testingPatterns = await this.requestMCP('context7', {
        action: 'get-library-docs',
        context7CompatibleLibraryID: '/microsoft/playwright',
        topic: 'e2e testing best practices',
        tokens: 3000
      })

      // STEP 4: Generate E2E test scenarios
      this.log('💡 Generating E2E test scenarios...')
      const testPlan = await this.generateTestPlan(state, {
        implementation,
        existingTests,
        testingPatterns
      })

      // STEP 5: Generate Playwright test code
      this.log('🎭 Generating Playwright test code...')
      const e2eTests = await this.generateE2ETests(state, testPlan)

      // STEP 6: Create test artifacts
      const testArtifact = this.createArtifact(
        'test',
        e2eTests,
        {
          testFramework: 'playwright',
          coverage: 'e2e',
          scenarios: testPlan.scenarios.length
        }
      )

      const testReportArtifact = this.createArtifact(
        'documentation',
        this.formatTestReport(state.task, testPlan),
        {
          type: 'test_plan'
        }
      )

      // STEP 7: Create result
      const result = this.createResult(
        'success',
        {
          testPlan,
          e2eTests,
          coverage: testPlan.estimatedCoverage
        },
        [testArtifact, testReportArtifact]
      )

      this.log(`✅ Test creation complete - ${testPlan.scenarios.length} scenarios, ~${testPlan.estimatedCoverage}% coverage`)

      return {
        agentResults: [...state.agentResults, result],
        context: {
          ...state.context,
          testPlan,
          e2eTests,
          testArtifact,
          testReportArtifact
        },
        nextAction: 'END'
      }

    } catch (error) {
      this.log(`Error during test creation: ${error}`, 'error')
      
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
   * Identify relevant test files
   */
  private identifyTestFiles(task: string): string[] {
    const taskLower = task.toLowerCase()
    const files: string[] = []

    if (taskLower.includes('rfq')) {
      files.push('tests/rfq.test.ts', 'tests/e2e/rfq-workflow.spec.ts')
    } else if (taskLower.includes('auth') || taskLower.includes('login')) {
      files.push('tests/auth.test.ts', 'tests/e2e/auth.spec.ts')
    } else if (taskLower.includes('product')) {
      files.push('tests/products.test.ts', 'tests/e2e/products.spec.ts')
    }

    // Default
    if (files.length === 0) {
      files.push('tests/e2e/basic.spec.ts')
    }

    return files
  }

  /**
   * Generate test plan using Claude
   */
  private async generateTestPlan(
    state: AgentState,
    context: {
      implementation: any
      existingTests: any
      testingPatterns: any
    }
  ): Promise<{
    scenarios: Array<{ name: string; description: string; steps: string[] }>
    edgeCases: string[]
    estimatedCoverage: number
  }> {
    const systemPrompt = `You are a QA Engineer for your project.

IMPLEMENTATION:
${JSON.stringify(context.implementation, null, 2)}

EXISTING TESTS:
${JSON.stringify(context.existingTests, null, 2)}

TESTING PATTERNS:
${JSON.stringify(context.testingPatterns, null, 2)}

FEATURE/FIX TO TEST:
${state.task}

CREATE A COMPREHENSIVE TEST PLAN:

Provide (as JSON):
{
  "scenarios": [
    {
      "name": "Happy path scenario",
      "description": "User successfully completes action",
      "steps": ["Step 1", "Step 2", "Step 3"]
    }
  ],
  "edgeCases": [
    "Edge case 1",
    "Edge case 2"
  ],
  "estimatedCoverage": 85
}

REQUIREMENTS:
1. Cover happy path (normal user flow)
2. Cover error scenarios (validation failures, network errors)
3. Cover edge cases (empty states, max limits, concurrent actions)
4. Test accessibility (keyboard navigation, screen readers)
5. Test responsiveness (mobile, tablet, desktop)

For your project B2B platform:
- Test users AND supplier flows
- Test RFQ workflow end-to-end
- Test real-time features (Socket.IO)
- Test authentication and authorization

Provide ONLY valid JSON.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    const content = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

    try {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                       content.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0]
        return JSON.parse(jsonStr)
      }

      return {
        scenarios: [{ name: 'Basic Test', description: content, steps: [] }],
        edgeCases: [],
        estimatedCoverage: 70
      }
    } catch (parseError) {
      this.log('Failed to parse test plan JSON, using fallback', 'warn')
      return {
        scenarios: [{ name: 'Basic Test', description: content, steps: [] }],
        edgeCases: [],
        estimatedCoverage: 70
      }
    }
  }

  /**
   * Generate Playwright E2E test code
   */
  private async generateE2ETests(
    state: AgentState,
    testPlan: any
  ): Promise<string> {
    const systemPrompt = `You are writing Playwright E2E tests for your project.

TEST PLAN:
${JSON.stringify(testPlan, null, 2)}

FEATURE TO TEST:
${state.task}

GENERATE PLAYWRIGHT TEST CODE:

Requirements:
1. Use Playwright test framework
2. Use Page Object Model pattern
3. Include proper waits and assertions
4. Handle authentication (login before tests)
5. Clean up test data after tests
6. Use descriptive test names

Example structure:
\`\`\`typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: login, navigate, etc.
  })

  test('should do something - happy path', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  })

  test('should handle error scenario', async ({ page }) => {
    // Test error handling
  })
})
\`\`\`

Generate complete, production-ready Playwright tests.
Include file path as comment at the top.`

    const response = await this.llm.invoke([
      { role: "user", content: systemPrompt }
    ])

    return typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)
  }

  /**
   * Format test report
   */
  private formatTestReport(feature: string, testPlan: any): string {
    const timestamp = new Date().toISOString()
    
    return `# Test Plan: ${feature}

**Date**: ${timestamp}
**Test Framework**: Playwright
**Estimated Coverage**: ${testPlan.estimatedCoverage}%

---

## Test Scenarios (${testPlan.scenarios.length} total)

${testPlan.scenarios.map((s: any, i: number) => `
### ${i + 1}. ${s.name}

**Description**: ${s.description}

**Steps**:
${s.steps.map((step: string, j: number) => `${j + 1}. ${step}`).join('\n')}
`).join('\n')}

---

## Edge Cases to Test

${testPlan.edgeCases.map((e: string, i: number) => `${i + 1}. ${e}`).join('\n')}

---

## Test Execution

### Manual Testing Checklist
- [ ] Test on Chrome
- [ ] Test on Firefox
- [ ] Test on Safari
- [ ] Test on mobile (iOS)
- [ ] Test on mobile (Android)
- [ ] Test with slow network
- [ ] Test with keyboard only
- [ ] Test with screen reader

### Automated E2E Tests
- Playwright test suite generated
- Can run with: \`pnpm test:e2e\`
- Tests cover ${testPlan.estimatedCoverage}% of scenarios

---

## Acceptance Criteria

All tests must pass before merging to main:
✅ Happy path scenarios (100% passing)
✅ Error scenarios (handled gracefully)
✅ Edge cases (no crashes)
✅ Accessibility (WCAG 2.1 AA compliant)
✅ Performance (< 3s page load)

---

**Created by**: Tester Agent (LangGraph Multi-Agent System)
**Timestamp**: ${timestamp}
`
  }
}


