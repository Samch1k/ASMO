/**
 * TestEnforcementValidator - Amelia's Principle: 100% Test Passage
 *
 * Enforces strict test-passing requirements before marking steps complete.
 * This validator embodies Amelia's core principle: "I will not mark this
 * complete until 100% of tests pass."
 *
 * BMAD Phase 1.2: Test enforcement validator (strict blocking mode)
 */

import type { AgentState } from '../../agents/types'
import type { WorkflowStep, StepResult } from '../types'

// =============================================================================
// TYPES
// =============================================================================

/**
 * Test result data structure
 */
export interface TestResult {
  passed: number
  failed: number
  skipped: number
  total: number
  coverage?: number
  duration?: number
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// =============================================================================
// TEST ENFORCEMENT VALIDATOR
// =============================================================================

/**
 * TestEnforcementValidator - Enforce test-passing requirements
 *
 * Features:
 * - Checks for test_results in step output
 * - BLOCKS completion if any tests fail (strict mode)
 * - Optionally validates coverage thresholds
 * - Provides Amelia-style error messages
 *
 * Usage:
 * ```typescript
 * const validator = new TestEnforcementValidator()
 * const result = await validator.validateTestPassage(state, step, stepResult)
 * if (!result.valid) {
 *   throw new Error(`Step blocked: ${result.errors.join('; ')}`)
 * }
 * ```
 */
export class TestEnforcementValidator {
  /**
   * Validate test passage for a workflow step
   *
   * @param state - Current agent state
   * @param step - Workflow step being executed
   * @param stepResult - Result from step execution
   * @returns Validation result with errors/warnings
   */
  async validateTestPassage(
    _state: AgentState,
    step: WorkflowStep,
    stepResult: StepResult
  ): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // Check if this step requires test enforcement
    if (!this.requiresTestEnforcement(step)) {
      return { valid: true, errors: [], warnings: [] }
    }

    // Extract test results from step output
    const testResults = this.extractTestResults(stepResult.output)

    if (!testResults) {
      errors.push(
        '🚫 Amelia says: No test results found - tests must be run before completion'
      )
      errors.push(
        '   Expected: test_results in context or metadata with {passed, failed, total}'
      )
      return { valid: false, errors, warnings }
    }

    // ✨ BMAD: Amelia's Strict Rule - 100% passage
    if (testResults.failed > 0) {
      errors.push(
        `🚫 Amelia says: ${testResults.failed} test(s) failing - I will not mark this complete until 100% of tests pass`
      )
      errors.push(
        `   Tests: ${testResults.passed} passed, ${testResults.failed} failed, ${testResults.total} total`
      )
      errors.push(
        '   Action required: Fix failing tests before proceeding'
      )
    }

    // Check total tests > 0
    if (testResults.total === 0) {
      errors.push(
        '🚫 Amelia says: No tests were run - I require test coverage'
      )
      errors.push(
        '   Action required: Write and run tests for this implementation'
      )
    }

    // Check coverage threshold (if specified)
    const minCoverage = this.getMinCoverage(step)
    if (minCoverage > 0 && testResults.coverage !== undefined) {
      if (testResults.coverage < minCoverage) {
        errors.push(
          `⚠️  Coverage ${testResults.coverage.toFixed(1)}% below minimum ${minCoverage}%`
        )
        errors.push(
          '   Action required: Add tests to increase coverage'
        )
      }
    }

    // Check for skipped tests (warning only)
    if (testResults.skipped > 0) {
      warnings.push(
        `⚠️  ${testResults.skipped} test(s) skipped - consider enabling all tests`
      )
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Determine if a step requires test enforcement
   *
   * Test enforcement applies to:
   * - implementation phases
   * - feature_development phases
   * - bug_fix phases
   * - refactoring phases
   * - Steps with explicit test_enforcement metadata
   *
   * @param step - Workflow step to check
   * @returns true if test enforcement required
   */
  private requiresTestEnforcement(step: WorkflowStep): boolean {
    // Check explicit metadata flag
    const metadata = (step as any).metadata
    if (metadata?.test_enforcement === true) {
      return true
    }

    // Check if metadata explicitly disables test enforcement
    if (metadata?.test_enforcement === false) {
      return false
    }

    // Check phase name for test-requiring phases
    const testPhases = [
      'implementation',
      'feature_development',
      'bug_fix',
      'refactoring',
      'test_first',  // TDD Red phase
      'green'        // TDD Green phase (must pass tests)
    ]

    return testPhases.some(phase =>
      step.phase.toLowerCase().includes(phase.toLowerCase())
    )
  }

  /**
   * Extract test results from step output
   *
   * Looks for test results in:
   * 1. output.context.test_results
   * 2. output.context.tests
   * 3. output.metadata.test_results
   * 4. output.metadata.tests
   *
   * @param output - Step execution output
   * @returns Test result data or null if not found
   */
  private extractTestResults(output: Partial<AgentState>): TestResult | null {
    // Try context.test_results
    const contextTestResults = output.context?.test_results
    if (contextTestResults && this.isValidTestResult(contextTestResults)) {
      return this.normalizeTestResult(contextTestResults)
    }

    // Try context.tests
    const contextTests = output.context?.tests
    if (contextTests && this.isValidTestResult(contextTests)) {
      return this.normalizeTestResult(contextTests)
    }

    // Try metadata.test_results
    const metadataTestResults = (output as any).metadata?.test_results
    if (metadataTestResults && this.isValidTestResult(metadataTestResults)) {
      return this.normalizeTestResult(metadataTestResults)
    }

    // Try metadata.tests
    const metadataTests = (output as any).metadata?.tests
    if (metadataTests && this.isValidTestResult(metadataTests)) {
      return this.normalizeTestResult(metadataTests)
    }

    return null
  }

  /**
   * Check if object has valid test result structure
   */
  private isValidTestResult(obj: any): boolean {
    return (
      obj &&
      typeof obj === 'object' &&
      ('passed' in obj || 'failed' in obj || 'total' in obj)
    )
  }

  /**
   * Normalize test result to standard format
   */
  private normalizeTestResult(obj: any): TestResult {
    return {
      passed: obj.passed || 0,
      failed: obj.failed || 0,
      skipped: obj.skipped || 0,
      total: obj.total || (obj.passed || 0) + (obj.failed || 0) + (obj.skipped || 0),
      coverage: obj.coverage,
      duration: obj.duration
    }
  }

  /**
   * Get minimum coverage threshold for a step
   *
   * Checks step metadata for minCoverage or min_coverage.
   * Default: 0 (no coverage enforcement)
   *
   * @param step - Workflow step
   * @returns Minimum coverage percentage (0-100)
   */
  private getMinCoverage(step: WorkflowStep): number {
    const metadata = (step as any).metadata
    if (!metadata) {
      return 0
    }

    // Check minCoverage or min_coverage
    const minCoverage = metadata.minCoverage || metadata.min_coverage
    if (typeof minCoverage === 'number') {
      return Math.max(0, Math.min(100, minCoverage))
    }

    return 0
  }

  /**
   * Format validation result for logging
   *
   * @param result - Validation result
   * @returns Formatted string for console output
   */
  formatValidationResult(result: ValidationResult): string {
    const lines: string[] = []

    if (!result.valid) {
      lines.push('\n❌ Test Enforcement Failed (Amelia\'s Principle)')
      result.errors.forEach(err => lines.push(`   ${err}`))
    }

    if (result.warnings.length > 0) {
      result.warnings.forEach(warn => lines.push(`   ${warn}`))
    }

    return lines.join('\n')
  }
}
