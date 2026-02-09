/**
 * Stats Command
 *
 * Analyzes usage statistics for agents, workflows, and skills.
 * Helps make data-driven decisions about simplification.
 */

import { ConfigLoader } from '@asmo/core'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface StatsOptions {
  type?: 'agents' | 'workflows' | 'skills' | 'all'
  format?: 'table' | 'json' | 'csv'
}

interface SkillUsage {
  id: string
  name: string
  agentReferences: number
  agentsList: string[]
  category: string
  complexity: string
  status: 'core' | 'moderate' | 'rare'
}

interface WorkflowInfo {
  id: string
  name: string
  path: string
  hasConfig: boolean
  estimatedAgents: string[]
}

interface AgentInfo {
  id: string
  name: string
  category: string
  roleType: string
  skillsCount: number
  skills: string[]
  canModifyCode: boolean
}

export async function statsCommand(options: StatsOptions = {}): Promise<void> {
  const type = options.type || 'all'
  const format = options.format || 'table'

  try {
    const stats = await gatherStats()

    if (format === 'json') {
      console.log(JSON.stringify(stats, null, 2))
      return
    }

    if (format === 'csv') {
      printCSV(stats, type)
      return
    }

    // Table format (default)
    printTable(stats, type)
  } catch (error) {
    console.error('❌ Failed to gather stats:', error)
    process.exit(1)
  }
}

async function gatherStats() {
  // Find templates path using fallback chain
  const templatesPath = await findTemplatesPath()

  const configLoader = new ConfigLoader(templatesPath)
  await configLoader.initialize()

  // Load all roles
  const allRoles = await configLoader.loadRoles()

  // Build skill usage map
  const skillUsageMap = new Map<string, SkillUsage>()

  for (const role of allRoles) {
    const allSkills = [...(role.required_skills || []), ...(role.optional_skills || [])]

    for (const skillId of allSkills) {
      if (!skillUsageMap.has(skillId)) {
        skillUsageMap.set(skillId, {
          id: skillId,
          name: formatSkillName(skillId),
          agentReferences: 0,
          agentsList: [],
          category: 'unknown',
          complexity: 'unknown',
          status: 'rare'
        })
      }

      const usage = skillUsageMap.get(skillId)!
      usage.agentReferences++
      usage.agentsList.push(role.id)
    }
  }

  // Categorize skills by usage
  for (const usage of skillUsageMap.values()) {
    if (usage.agentReferences >= 3) {
      usage.status = 'core'
    } else if (usage.agentReferences >= 1) {
      usage.status = 'moderate'
    } else {
      usage.status = 'rare'
    }
  }

  // Load skill metadata if available
  try {
    const skillsPath = await findTemplatesPath()
    const skillDirs = await fs.readdir(path.join(skillsPath, 'skills'))

    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsPath, 'skills', skillDir, 'SKILL.md')
      try {
        const content = await fs.readFile(skillPath, 'utf-8')
        const metadata = parseSkillMD(content)

        if (skillUsageMap.has(skillDir)) {
          const usage = skillUsageMap.get(skillDir)!
          usage.category = metadata.category || 'unknown'
          usage.complexity = metadata.complexity || 'unknown'
        }
      } catch {
        // Skill MD not found, skip
      }
    }
  } catch {
    // Skills directory not accessible
  }

  // Gather workflow info
  const workflows = await gatherWorkflows()

  // Build agent info
  const agents: AgentInfo[] = allRoles.map(role => ({
    id: role.id,
    name: role.name,
    category: role.category || 'unknown',
    roleType: role.role_type || 'unknown',
    skillsCount: (role.required_skills?.length || 0) + (role.optional_skills?.length || 0),
    skills: [...(role.required_skills || []), ...(role.optional_skills || [])],
    canModifyCode: role.can_modify_code || false
  }))

  return {
    skills: Array.from(skillUsageMap.values()).sort((a, b) => b.agentReferences - a.agentReferences),
    workflows,
    agents: agents.sort((a, b) => a.category.localeCompare(b.category))
  }
}

async function gatherWorkflows(): Promise<WorkflowInfo[]> {
  const workflows: WorkflowInfo[] = []

  try {
    const templatesPath = await findTemplatesPath()
    const workflowsPath = path.join(templatesPath, 'workflows')
    const entries = await fs.readdir(workflowsPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const workflowPath = path.join(workflowsPath, entry.name)

        // Check for workflow.json
        let hasConfig = false
        try {
          await fs.access(path.join(workflowPath, 'workflow.json'))
          hasConfig = true
        } catch {
          // No workflow.json
        }

        // Try to estimate agents from directory name or README
        const estimatedAgents: string[] = []

        workflows.push({
          id: entry.name,
          name: formatWorkflowName(entry.name),
          path: workflowPath,
          hasConfig,
          estimatedAgents
        })
      }
    }

    // Handle TEA sub-workflows
    const teaPath = path.join(workflowsPath, 'tea')
    try {
      const teaEntries = await fs.readdir(teaPath, { withFileTypes: true })
      for (const teaEntry of teaEntries) {
        if (teaEntry.isDirectory()) {
          workflows.push({
            id: `tea/${teaEntry.name}`,
            name: `TEA: ${formatWorkflowName(teaEntry.name)}`,
            path: path.join(teaPath, teaEntry.name),
            hasConfig: false,
            estimatedAgents: ['test-architect', 'tester']
          })
        }
      }
    } catch {
      // TEA directory not found
    }
  } catch (error) {
    console.warn('⚠️  Could not load workflows:', error)
  }

  return workflows.sort((a, b) => a.id.localeCompare(b.id))
}

async function findTemplatesPath(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'packages/core/templates'),
    path.join(process.cwd(), 'templates'),
    path.join(__dirname, '../../templates'),
    path.join(__dirname, '../../../templates')
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      continue
    }
  }

  throw new Error('Templates directory not found')
}

function parseSkillMD(content: string): { category?: string; complexity?: string } {
  const categoryMatch = content.match(/\*\*Category:\*\*\s*(.+)/i)
  const complexityMatch = content.match(/\*\*Complexity:\*\*\s*(.+)/i)

  return {
    category: categoryMatch ? categoryMatch[1].trim() : undefined,
    complexity: complexityMatch ? complexityMatch[1].trim() : undefined
  }
}

function formatSkillName(skillId: string): string {
  return skillId
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatWorkflowName(workflowId: string): string {
  return workflowId
    .replace(/^\d+-/, '') // Remove number prefix
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function printTable(stats: any, type: string) {
  if (type === 'all' || type === 'skills') {
    console.log('\n📚 Skills Usage Statistics')
    console.log('═'.repeat(80))
    console.log(
      'Skill'.padEnd(40) +
      'Refs'.padEnd(8) +
      'Status'.padEnd(12) +
      'Category'.padEnd(20)
    )
    console.log('─'.repeat(80))

    const skills = stats.skills as SkillUsage[]
    const coreSkills = skills.filter(s => s.status === 'core')
    const moderateSkills = skills.filter(s => s.status === 'moderate')
    const rareSkills = skills.filter(s => s.status === 'rare')

    console.log(`\n✅ CORE (${coreSkills.length} skills - 3+ references):`)
    for (const skill of coreSkills.slice(0, 10)) {
      console.log(
        `  ${skill.name.padEnd(38)}` +
        `${skill.agentReferences.toString().padEnd(8)}` +
        `${skill.status.padEnd(12)}` +
        `${skill.category.padEnd(20)}`
      )
    }
    if (coreSkills.length > 10) {
      console.log(`  ... and ${coreSkills.length - 10} more`)
    }

    console.log(`\n⚠️  MODERATE (${moderateSkills.length} skills - 1-2 references):`)
    for (const skill of moderateSkills.slice(0, 5)) {
      console.log(
        `  ${skill.name.padEnd(38)}` +
        `${skill.agentReferences.toString().padEnd(8)}` +
        `${skill.status.padEnd(12)}` +
        `${skill.category.padEnd(20)}`
      )
    }
    if (moderateSkills.length > 5) {
      console.log(`  ... and ${moderateSkills.length - 5} more`)
    }

    console.log(`\n❌ RARE (${rareSkills.length} skills - 0 references):`)
    for (const skill of rareSkills.slice(0, 5)) {
      console.log(
        `  ${skill.name.padEnd(38)}` +
        `${skill.agentReferences.toString().padEnd(8)}` +
        `${skill.status.padEnd(12)}` +
        `${skill.category.padEnd(20)}`
      )
    }
    if (rareSkills.length > 5) {
      console.log(`  ... and ${rareSkills.length - 5} more`)
    }

    console.log('\n📊 Summary:')
    console.log(`  Total skills: ${skills.length}`)
    console.log(`  Core (keep): ${coreSkills.length}`)
    console.log(`  Moderate (review): ${moderateSkills.length}`)
    console.log(`  Rare (consider removing): ${rareSkills.length}`)
    console.log('═'.repeat(80))
  }

  if (type === 'all' || type === 'workflows') {
    console.log('\n🔄 Workflows')
    console.log('═'.repeat(80))
    console.log('ID'.padEnd(35) + 'Name'.padEnd(45))
    console.log('─'.repeat(80))

    const workflows = stats.workflows as WorkflowInfo[]
    for (const workflow of workflows) {
      console.log(`  ${workflow.id.padEnd(33)}${workflow.name.padEnd(45)}`)
    }

    console.log(`\n📊 Total workflows: ${workflows.length}`)
    console.log('═'.repeat(80))
  }

  if (type === 'all' || type === 'agents') {
    console.log('\n👥 Agents by Category')
    console.log('═'.repeat(80))

    const agents = stats.agents as AgentInfo[]
    const byCategory = new Map<string, AgentInfo[]>()

    for (const agent of agents) {
      if (!byCategory.has(agent.category)) {
        byCategory.set(agent.category, [])
      }
      byCategory.get(agent.category)!.push(agent)
    }

    for (const [category, categoryAgents] of byCategory) {
      console.log(`\n${category.toUpperCase()} (${categoryAgents.length} agents):`)
      for (const agent of categoryAgents) {
        console.log(
          `  ${agent.name.padEnd(25)}` +
          `[${agent.roleType.padEnd(10)}]` +
          ` ${agent.skillsCount} skills` +
          (agent.canModifyCode ? ' 🔧' : '')
        )
      }
    }

    console.log(`\n📊 Total agents: ${agents.length}`)
    console.log('═'.repeat(80))
  }
}

function printCSV(stats: any, type: string) {
  if (type === 'all' || type === 'skills') {
    console.log('skill_id,skill_name,agent_references,status,category,agents')
    const skills = stats.skills as SkillUsage[]
    for (const skill of skills) {
      console.log(
        `"${skill.id}","${skill.name}",${skill.agentReferences},"${skill.status}","${skill.category}","${skill.agentsList.join(';')}"`
      )
    }
  }

  if (type === 'workflows') {
    console.log('workflow_id,workflow_name,has_config')
    const workflows = stats.workflows as WorkflowInfo[]
    for (const workflow of workflows) {
      console.log(`"${workflow.id}","${workflow.name}",${workflow.hasConfig}`)
    }
  }

  if (type === 'agents') {
    console.log('agent_id,agent_name,category,role_type,skills_count,can_modify_code')
    const agents = stats.agents as AgentInfo[]
    for (const agent of agents) {
      console.log(
        `"${agent.id}","${agent.name}","${agent.category}","${agent.roleType}",${agent.skillsCount},${agent.canModifyCode}`
      )
    }
  }
}
