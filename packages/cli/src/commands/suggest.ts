/**
 * suggest command - Fast hybrid analysis for Claude Code integration
 *
 * Returns JSON with recommendation whether to use ASMO.
 * Designed to be called from hooks with minimal latency.
 *
 * Uses lightweight analysis that doesn't require full config initialization.
 */

import { ComplexityAnalyzer } from '@asmo/core'

export interface SuggestResult {
  useAsmo: boolean
  confidence: number
  workflow: string | null
  agents: string[]
  skills: string[]
  complexity: {
    score: number
    level: string
  }
  reasoning: string
}

interface SuggestOptions {
  threshold?: string
  json?: boolean
}

/**
 * Keywords that indicate specialized work requiring ASMO
 */
const SPECIALIZED_KEYWORDS: Record<string, string[]> = {
  security: ['security', 'auth', 'authentication', 'authorization', 'oauth', 'jwt', 'csrf', 'xss', 'injection', 'vulnerability', 'audit'],
  performance: ['performance', 'optimize', 'optimization', 'profiling', 'bottleneck', 'latency', 'throughput', 'cache', 'caching'],
  architecture: ['architecture', 'design', 'refactor', 'restructure', 'migration', 'microservice', 'api design', 'system design'],
  database: ['database', 'migration', 'schema', 'query', 'index', 'postgresql', 'mysql', 'mongodb', 'redis'],
  testing: ['test', 'testing', 'e2e', 'integration test', 'unit test', 'coverage', 'tdd', 'bdd'],
  deployment: ['deploy', 'deployment', 'ci/cd', 'pipeline', 'docker', 'kubernetes', 'infrastructure']
}

/**
 * Keywords that indicate multi-agent work
 */
const MULTI_AGENT_KEYWORDS = [
  'implement', 'build', 'create', 'develop',
  'full', 'complete', 'entire', 'whole',
  'feature', 'module', 'system', 'service'
]

/**
 * Detect agents needed based on task keywords
 */
function detectAgents(task: string): string[] {
  const taskLower = task.toLowerCase()
  const agents: string[] = []

  // Map keywords to agents
  const agentKeywords: Record<string, string[]> = {
    architect: ['architecture', 'design', 'system', 'structure', 'api design'],
    developer: ['implement', 'build', 'create', 'code', 'develop', 'feature'],
    tester: ['test', 'testing', 'coverage', 'e2e', 'integration'],
    debugger: ['fix', 'bug', 'error', 'issue', 'debug', 'crash'],
    optimizer: ['optimize', 'performance', 'speed', 'memory', 'profil'],
    'security-specialist': ['security', 'auth', 'vulnerability', 'audit', 'penetration'],
    devops: ['deploy', 'ci/cd', 'docker', 'kubernetes', 'infrastructure']
  }

  for (const [agent, keywords] of Object.entries(agentKeywords)) {
    if (keywords.some(kw => taskLower.includes(kw))) {
      agents.push(agent)
    }
  }

  // Default to developer if nothing detected
  if (agents.length === 0) {
    agents.push('developer')
  }

  return agents
}

/**
 * Detect specialized skills needed
 */
function detectSkills(task: string): string[] {
  const taskLower = task.toLowerCase()
  const skills: string[] = []

  for (const [skill, keywords] of Object.entries(SPECIALIZED_KEYWORDS)) {
    if (keywords.some(kw => taskLower.includes(kw))) {
      skills.push(skill)
    }
  }

  return skills
}

/**
 * Check if task suggests multi-agent work
 */
function isMultiAgentTask(task: string): boolean {
  const taskLower = task.toLowerCase()
  return MULTI_AGENT_KEYWORDS.filter(kw => taskLower.includes(kw)).length >= 2
}

export async function suggestCommand(
  task: string,
  options: SuggestOptions
): Promise<void> {
  const threshold = parseInt(options.threshold || '40', 10)

  try {
    // Use ComplexityAnalyzer (doesn't require config files)
    const complexityAnalyzer = new ComplexityAnalyzer()
    const complexityResult = await complexityAnalyzer.analyzeTask(task)

    // Lightweight analysis
    const agents = detectAgents(task)
    const skills = detectSkills(task)
    const multiAgentTask = isMultiAgentTask(task)

    // Determine if ASMO should be used
    const hasHighComplexity = complexityResult.score >= threshold
    const hasSpecializedSkills = skills.length > 0
    const hasMultipleAgents = agents.length >= 2 || multiAgentTask

    const useAsmo = hasHighComplexity || hasSpecializedSkills || hasMultipleAgents

    // Calculate confidence
    let confidence = 0.4
    if (hasHighComplexity) confidence += 0.25
    if (hasSpecializedSkills) confidence += 0.2
    if (hasMultipleAgents) confidence += 0.15
    confidence = Math.min(confidence, 1.0)

    // Build reasoning
    const reasons: string[] = []
    if (hasHighComplexity) reasons.push(`complexity ${complexityResult.score}/${threshold}`)
    if (hasSpecializedSkills) reasons.push(`skills: ${skills.join(', ')}`)
    if (hasMultipleAgents) reasons.push(`${agents.length} agents: ${agents.join(', ')}`)
    if (reasons.length === 0) reasons.push('simple task')

    const result: SuggestResult = {
      useAsmo,
      confidence,
      workflow: complexityResult.recommendedWorkflow,
      agents,
      skills,
      complexity: {
        score: complexityResult.score,
        level: complexityResult.level
      },
      reasoning: reasons.join('; ')
    }

    // Output
    if (options.json !== false) {
      // Default to JSON for hook integration
      console.log(JSON.stringify(result))
    } else {
      // Human-readable format
      console.log('')
      if (useAsmo) {
        console.log(`\u2705 ASMO recommended (confidence: ${(confidence * 100).toFixed(0)}%)`)
        console.log(`   Workflow: ${result.workflow}`)
        console.log(`   Agents: ${result.agents.join(' \u2192 ')}`)
        console.log(`   Reason: ${result.reasoning}`)
      } else {
        console.log(`\u23ed\ufe0f  ASMO not needed for this task`)
        console.log(`   Complexity: ${result.complexity.level} (${result.complexity.score})`)
      }
      console.log('')
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (options.json !== false) {
      console.log(JSON.stringify({
        useAsmo: false,
        confidence: 0,
        workflow: null,
        agents: [],
        skills: [],
        complexity: { score: 0, level: 'unknown' },
        reasoning: `Error: ${errorMessage}`
      }))
    } else {
      console.error(`\u274c Analysis failed: ${errorMessage}`)
    }

    process.exit(1)
  }
}
