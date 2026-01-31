/**
 * Analyze Command
 *
 * Analyzes task complexity and provides workflow recommendations.
 */

import { ComplexityAnalyzer } from '../../orchestration/complexity-analyzer.js'

interface AnalyzeOptions {
  context?: string
  json?: boolean
}

export async function analyzeCommand(task: string, options: AnalyzeOptions): Promise<void> {
  const analyzer = new ComplexityAnalyzer()

  try {
    const result = await analyzer.analyzeTask(task)

    if (options.json) {
      console.log(JSON.stringify(result, null, 2))
      return
    }

    // Pretty print the analysis
    console.log('\n🎯 Task Complexity Analysis')
    console.log('═'.repeat(50))
    console.log(`📝 Task: ${task}`)
    console.log(`📊 Complexity Score: ${result.score}/100`)
    console.log(`📈 Complexity Level: ${result.level}`)

    if (result.factors) {
      console.log('\n📋 Factors:')
      Object.entries(result.factors).forEach(([key, value]) => {
        console.log(`   • ${key}: ${value}`)
      })
    }

    if (result.recommendedAgents && result.recommendedAgents.length > 0) {
      console.log('\n👥 Recommended Agents:')
      result.recommendedAgents.forEach(agent => {
        console.log(`   • ${agent}`)
      })
    }

    if (result.recommendedWorkflow) {
      console.log(`\n🔄 Recommended Workflow: ${result.recommendedWorkflow}`)
    }

    // YOLO Mode eligibility
    const yoloEligible = result.score < 30
    console.log(`\n🚀 YOLO Mode Eligible: ${yoloEligible ? 'YES' : 'NO'}`)
    if (yoloEligible) {
      console.log('   (Task is simple enough to bypass approval checkpoints)')
    }

    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Analysis failed:', error)
    process.exit(1)
  }
}
