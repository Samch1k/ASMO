/**
 * Task Command
 *
 * Task management commands for the ASMO Framework.
 */

import { getTaskManager, type TaskStatus, type TaskPriority } from '@asmo/core'

interface CreateOptions {
  description?: string
  priority?: TaskPriority
  assign?: string
}

interface ListOptions {
  status?: TaskStatus
  agent?: string
  limit?: string
}

interface StartOptions {
  agent?: string
}

interface CompleteOptions {
  output?: string
}

interface FailOptions {
  reason?: string
}

async function create(title: string, options: CreateOptions): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    const task = await manager.createTask({
      title,
      description: options.description,
      priority: options.priority || 'medium',
      assignedAgent: options.assign
    })

    console.log('\n✅ Task Created')
    console.log('═'.repeat(50))
    console.log(`📋 ID: ${task.id}`)
    console.log(`📝 Title: ${task.title}`)
    console.log(`📊 Status: ${task.status}`)
    console.log(`⚡ Priority: ${task.priority}`)
    if (task.assignedAgent) {
      console.log(`👤 Assigned: ${task.assignedAgent}`)
    }
    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Failed to create task:', error)
    process.exit(1)
  }
}

async function list(options: ListOptions): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    const tasks = await manager.queryTasks({
      status: options.status,
      assignedAgent: options.agent,
      limit: parseInt(options.limit || '20', 10)
    })

    console.log('\n📋 Tasks')
    console.log('═'.repeat(70))

    if (tasks.length === 0) {
      console.log('No tasks found.')
    } else {
      tasks.forEach(task => {
        const status = getStatusIcon(task.status)
        const priority = getPriorityBadge(task.priority)
        console.log(`${status} [${task.id.slice(0, 8)}] ${task.title} ${priority}`)
        if (task.assignedAgent) {
          console.log(`   └─ Assigned: ${task.assignedAgent}`)
        }
      })
    }

    console.log('═'.repeat(70))
    console.log(`Total: ${tasks.length} tasks\n`)
  } catch (error) {
    console.error('❌ Failed to list tasks:', error)
    process.exit(1)
  }
}

async function show(id: string): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    const task = await manager.getTask(id)

    if (!task) {
      console.error(`❌ Task not found: ${id}`)
      process.exit(1)
    }

    console.log('\n📋 Task Details')
    console.log('═'.repeat(50))
    console.log(`ID: ${task.id}`)
    console.log(`Title: ${task.title}`)
    console.log(`Description: ${task.description || 'N/A'}`)
    console.log(`Status: ${task.status}`)
    console.log(`Priority: ${task.priority}`)
    console.log(`Complexity: ${task.complexityScore || 'N/A'} (${task.complexityLevel || 'unknown'})`)
    console.log(`Assigned: ${task.assignedAgent || 'Unassigned'}`)
    console.log(`Workflow: ${task.workflowId || 'N/A'}`)
    console.log(`Created: ${task.createdAt.toISOString()}`)
    if (task.completedAt) {
      console.log(`Completed: ${task.completedAt.toISOString()}`)
    }
    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Failed to show task:', error)
    process.exit(1)
  }
}

async function start(id: string, options: StartOptions): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    const { task, execution } = await manager.startTask(id, options.agent)

    console.log('\n🚀 Task Started')
    console.log('═'.repeat(50))
    console.log(`📋 Task: ${task.title}`)
    console.log(`📊 Status: ${task.status}`)
    console.log(`🔢 Execution ID: ${execution.id}`)
    console.log(`👤 Agent: ${execution.agentId}`)
    console.log(`⏱️  Started: ${execution.startedAt.toISOString()}`)
    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Failed to start task:', error)
    process.exit(1)
  }
}

async function complete(id: string, options: CompleteOptions): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    let output = undefined
    if (options.output) {
      try {
        output = JSON.parse(options.output)
      } catch {
        output = { result: options.output }
      }
    }

    const task = await manager.completeTask(id, output)

    console.log('\n✅ Task Completed')
    console.log('═'.repeat(50))
    console.log(`📋 Task: ${task.title}`)
    console.log(`📊 Status: ${task.status}`)
    console.log(`⏱️  Completed: ${task.completedAt?.toISOString()}`)
    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Failed to complete task:', error)
    process.exit(1)
  }
}

async function fail(id: string, options: FailOptions): Promise<void> {
  const manager = getTaskManager()
  await manager.initialize()

  try {
    const task = await manager.failTask(id, options.reason || 'Task failed')

    console.log('\n❌ Task Failed')
    console.log('═'.repeat(50))
    console.log(`📋 Task: ${task.title}`)
    console.log(`📊 Status: ${task.status}`)
    console.log(`💥 Reason: ${options.reason || 'Task failed'}`)
    console.log(`⏱️  Failed: ${task.completedAt?.toISOString()}`)
    console.log('═'.repeat(50) + '\n')
  } catch (error) {
    console.error('❌ Failed to mark task as failed:', error)
    process.exit(1)
  }
}

// Helper functions
function getStatusIcon(status: TaskStatus): string {
  const icons: Record<TaskStatus, string> = {
    created: '⬜',
    assigned: '🔵',
    in_progress: '🟡',
    blocked: '🔴',
    review: '🟣',
    completed: '✅',
    failed: '❌',
    cancelled: '⚫'
  }
  return icons[status] || '❓'
}

function getPriorityBadge(priority: TaskPriority): string {
  const badges: Record<TaskPriority, string> = {
    critical: '🔥 CRITICAL',
    high: '🔴 HIGH',
    medium: '🟡 MEDIUM',
    low: '🟢 LOW'
  }
  return badges[priority] || ''
}

// Export all commands
export const taskCommand = {
  create,
  list,
  show,
  start,
  complete,
  fail
}
