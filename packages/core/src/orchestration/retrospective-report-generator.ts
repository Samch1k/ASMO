/**
 * Retrospective Report Generator
 *
 * Generates human-readable markdown reports from retrospective analysis
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import type { RetrospectiveAnalysis } from './retrospective-agent'

export class RetrospectiveReportGenerator {
  private reportsDir: string

  constructor(reportsDir = 'docs/retrospectives') {
    this.reportsDir = reportsDir
  }

  /**
   * Generate and save retrospective report
   */
  async generateReport(retrospective: RetrospectiveAnalysis): Promise<string> {
    // Ensure reports directory exists
    await fs.mkdir(this.reportsDir, { recursive: true })

    // Generate filename: YYYY-MM-DD-workflow-name.md
    const date = this.formatDate(retrospective.generatedAt)
    const workflowSlug = this.slugify(retrospective.workflowName)
    const filename = `${date}-${workflowSlug}.md`
    const filepath = path.join(this.reportsDir, filename)

    // Generate markdown content
    const markdown = this.generateMarkdown(retrospective)

    // Save to file
    await fs.writeFile(filepath, markdown, 'utf-8')

    console.log(`📝 [RetrospectiveAgent] Report saved: ${filepath}`)

    return filepath
  }

  /**
   * Generate markdown content
   */
  private generateMarkdown(retro: RetrospectiveAnalysis): string {
    const lines: string[] = []

    // Header
    lines.push(`# Workflow Retrospective: ${retro.workflowName}`)
    lines.push('')
    lines.push(`**Date**: ${this.formatDate(retro.generatedAt)}`)
    lines.push(`**Duration**: ${this.formatDuration(retro.executionSummary.totalDuration)}`)
    lines.push(`**Status**: ${retro.executionSummary.success ? '✅ Success' : '❌ Failed'}`)
    lines.push(`**Overall Score**: ${retro.overallScore.toFixed(1)}/10`)
    lines.push(`**Confidence**: ${(retro.confidence * 100).toFixed(0)}%`)
    lines.push('')
    lines.push('---')
    lines.push('')

    // Executive Summary
    lines.push('## Executive Summary')
    lines.push('')
    lines.push(this.generateExecutiveSummary(retro))
    lines.push('')

    // Phase Performance
    lines.push('## Phase Performance')
    lines.push('')
    for (const phase of retro.phaseAnalysis) {
      lines.push(`### Phase: ${this.capitalizeFirst(phase.phase)}`)
      lines.push('')
      lines.push(`- **Duration**: ${this.formatDuration(phase.duration)} (${this.calculatePhasePercentage(phase.duration, retro.executionSummary.totalDuration)}% of total)`)
      lines.push(`- **Steps**: ${phase.stepCount}`)
      lines.push(`- **Success Rate**: ${phase.successRate.toFixed(0)}%`)
      lines.push(`- **Avg Confidence**: ${(phase.averageConfidence * 100).toFixed(0)}%`)
      lines.push('')

      if (phase.highlights.length > 0) {
        lines.push('**Highlights:**')
        for (const highlight of phase.highlights) {
          lines.push(`- ✅ ${highlight}`)
        }
        lines.push('')
      }

      if (phase.bottlenecks.length > 0) {
        lines.push('**Bottlenecks:**')
        for (const bottleneck of phase.bottlenecks) {
          lines.push(`- ⚠️  ${bottleneck}`)
        }
        lines.push('')
      }

      if (phase.issues.length > 0) {
        lines.push('**Issues:**')
        for (const issue of phase.issues) {
          lines.push(`- ❌ ${issue}`)
        }
        lines.push('')
      }
    }

    // Success Factors
    if (retro.successFactors.length > 0) {
      lines.push('## Success Factors')
      lines.push('')
      for (let i = 0; i < retro.successFactors.length; i++) {
        const factor = retro.successFactors[i]
        const impact = this.getImpactEmoji(factor.impact)
        const reproducible = factor.reproducible ? '🔄 Reproducible' : '⚡ One-time'
        lines.push(`${i + 1}. **${factor.factor}** ${impact}`)
        lines.push(`   - ${factor.description}`)
        lines.push(`   - ${reproducible}`)
        lines.push('')
      }
    }

    // Improvement Areas
    if (retro.improvementAreas.length > 0) {
      lines.push('## Improvement Areas')
      lines.push('')
      for (let i = 0; i < retro.improvementAreas.length; i++) {
        const area = retro.improvementAreas[i]
        const priority = this.getPriorityEmoji(area.priority)
        lines.push(`${i + 1}. **${area.area}** ${priority}`)
        lines.push(`   - **Current**: ${area.currentState}`)
        lines.push(`   - **Desired**: ${area.desiredState}`)
        lines.push(`   - **Gap**: ${area.gap}`)
        lines.push('')
      }
    }

    // Recommendations
    if (retro.recommendations.length > 0) {
      lines.push('## Recommendations')
      lines.push('')

      // Group by priority
      const critical = retro.recommendations.filter(r => r.priority === 'critical')
      const high = retro.recommendations.filter(r => r.priority === 'high')
      const medium = retro.recommendations.filter(r => r.priority === 'medium')
      const low = retro.recommendations.filter(r => r.priority === 'low')

      if (critical.length > 0) {
        lines.push('### 🔴 Critical Priority')
        lines.push('')
        lines.push(...this.formatRecommendations(critical))
      }

      if (high.length > 0) {
        lines.push('### 🟠 High Priority')
        lines.push('')
        lines.push(...this.formatRecommendations(high))
      }

      if (medium.length > 0) {
        lines.push('### 🟡 Medium Priority')
        lines.push('')
        lines.push(...this.formatRecommendations(medium))
      }

      if (low.length > 0) {
        lines.push('### 🟢 Low Priority')
        lines.push('')
        lines.push(...this.formatRecommendations(low))
      }
    }

    // Historical Comparison
    lines.push('## Historical Comparison')
    lines.push('')
    lines.push(`- **Total Runs**: ${retro.comparisonWithHistory.totalRuns}`)
    lines.push(`- **Performance Rank**: #${retro.comparisonWithHistory.rank} of ${retro.comparisonWithHistory.totalRuns}`)
    lines.push(`- **Duration Percentile**: ${retro.comparisonWithHistory.durationPercentile.toFixed(0)}th (lower is better)`)
    lines.push(`- **vs Average**: ${this.formatPerformanceVsAverage(retro.comparisonWithHistory.performanceVsAverage)}`)
    lines.push(`- **Success Rate Trend**: ${this.formatTrend(retro.comparisonWithHistory.successRateTrend)}`)
    lines.push('')

    // Footer
    lines.push('---')
    lines.push('')
    lines.push('*Generated by BMad RetrospectiveAgent*')
    lines.push('')

    return lines.join('\n')
  }

  /**
   * Generate executive summary paragraph
   */
  private generateExecutiveSummary(retro: RetrospectiveAnalysis): string {
    const parts: string[] = []

    // Success/failure
    if (retro.executionSummary.success) {
      parts.push(`Workflow executed successfully in ${this.formatDuration(retro.executionSummary.totalDuration)}`)
    } else {
      parts.push(`Workflow failed after ${this.formatDuration(retro.executionSummary.totalDuration)}`)
    }

    // Phases and steps
    parts.push(`across ${retro.executionSummary.phaseCount} phases and ${retro.executionSummary.stepCount} steps`)

    // Parallel execution
    if (retro.executionSummary.parallelStepsExecuted > 0) {
      parts.push(`with ${retro.executionSummary.parallelStepsExecuted} parallel optimizations applied`)
    }

    // Retries
    if (retro.executionSummary.retryCount > 0) {
      parts.push(`requiring ${retro.executionSummary.retryCount} retry attempts`)
    }

    // Performance vs average
    if (retro.comparisonWithHistory.performanceVsAverage > 10) {
      parts.push(`performing ${retro.comparisonWithHistory.performanceVsAverage.toFixed(0)}% faster than historical average`)
    } else if (retro.comparisonWithHistory.performanceVsAverage < -10) {
      parts.push(`performing ${Math.abs(retro.comparisonWithHistory.performanceVsAverage).toFixed(0)}% slower than historical average`)
    }

    return parts.join(', ') + '.'
  }

  /**
   * Format recommendations list
   */
  private formatRecommendations(recommendations: typeof RetrospectiveAnalysis.prototype.recommendations): string[] {
    const lines: string[] = []

    for (let i = 0; i < recommendations.length; i++) {
      const rec = recommendations[i]
      const effort = this.getEffortEmoji(rec.effort)
      const category = this.capitalizeFirst(rec.category)

      lines.push(`#### ${i + 1}. ${rec.title}`)
      lines.push('')
      lines.push(`**Category**: ${category} | **Effort**: ${effort} ${rec.effort}`)
      lines.push('')
      lines.push(rec.description)
      lines.push('')
      lines.push(`**Expected Impact**: ${rec.expectedImpact}`)

      if (rec.estimatedTimeReduction) {
        lines.push(`**Time Reduction**: ~${rec.estimatedTimeReduction}%`)
      }

      if (rec.dependencies.length > 0) {
        lines.push(`**Dependencies**: ${rec.dependencies.join(', ')}`)
      }

      lines.push('')
    }

    return lines
  }

  /**
   * Display top recommendations in console
   */
  displayTopRecommendations(retrospective: RetrospectiveAnalysis, limit = 3): void {
    const topRecs = retrospective.recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .slice(0, limit)

    if (topRecs.length === 0) {
      return
    }

    console.log('')
    console.log('💡 [RetrospectiveAgent] Top Recommendations:')
    for (let i = 0; i < topRecs.length; i++) {
      const rec = topRecs[i]
      const priority = rec.priority.toUpperCase()
      console.log(`   ${i + 1}. [${priority}] ${rec.title} (effort: ${rec.effort})`)
    }
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] // YYYY-MM-DD
  }

  private formatDuration(durationMs: number): string {
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    }
    return `${seconds}s`
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  private capitalizeFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  private calculatePhasePercentage(phaseDuration: number, totalDuration: number): number {
    return Math.round((phaseDuration / totalDuration) * 100)
  }

  private getImpactEmoji(impact: string): string {
    switch (impact) {
      case 'high': return '🔥'
      case 'medium': return '⚡'
      case 'low': return '💡'
      default: return ''
    }
  }

  private getPriorityEmoji(priority: string): string {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return ''
    }
  }

  private getEffortEmoji(effort: string): string {
    switch (effort) {
      case 'low': return '🟢'
      case 'medium': return '🟡'
      case 'high': return '🔴'
      default: return ''
    }
  }

  private formatPerformanceVsAverage(percentage: number): string {
    if (percentage > 0) {
      return `${percentage.toFixed(0)}% faster ⚡`
    } else if (percentage < 0) {
      return `${Math.abs(percentage).toFixed(0)}% slower 🐌`
    }
    return 'Same as average ⚖️'
  }

  private formatTrend(trend: string): string {
    switch (trend) {
      case 'improving': return '📈 Improving'
      case 'stable': return '➡️  Stable'
      case 'declining': return '📉 Declining'
      default: return trend
    }
  }
}
