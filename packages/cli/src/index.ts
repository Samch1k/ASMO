#!/usr/bin/env node
/**
 * AI1ST Framework CLI
 *
 * Command-line interface for the AI-First Software Development Framework.
 *
 * Commands:
 * - analyze <task>: Analyze task complexity
 * - workflow <name>: Run a workflow
 * - task: Task management commands
 */

import { program } from 'commander'
import { analyzeCommand } from './commands/analyze.js'
import { workflowCommand } from './commands/workflow.js'
import { taskCommand } from './commands/task.js'
import { VERSION } from '../index.js'

program
  .name('ai1st')
  .version(VERSION)
  .description('AI-First Software Development Framework CLI')

// Analyze command
program
  .command('analyze <task>')
  .description('Analyze task complexity and get workflow recommendation')
  .option('-c, --context <path>', 'Path to project context file')
  .option('-j, --json', 'Output as JSON')
  .action(analyzeCommand)

// Workflow command
program
  .command('workflow <name>')
  .description('Run a workflow')
  .option('-t, --task <task>', 'Task description')
  .option('-c, --config <path>', 'Path to workflow config')
  .option('-d, --dry-run', 'Dry run without executing')
  .action(workflowCommand)

// Task command group
const task = program
  .command('task')
  .description('Task management commands')

task
  .command('create <title>')
  .description('Create a new task')
  .option('-d, --description <desc>', 'Task description')
  .option('-p, --priority <priority>', 'Task priority (critical, high, medium, low)', 'medium')
  .option('-a, --assign <agent>', 'Assign to agent')
  .action(taskCommand.create)

task
  .command('list')
  .description('List tasks')
  .option('-s, --status <status>', 'Filter by status')
  .option('-a, --agent <agent>', 'Filter by assigned agent')
  .option('-l, --limit <n>', 'Limit results', '20')
  .action(taskCommand.list)

task
  .command('show <id>')
  .description('Show task details')
  .action(taskCommand.show)

task
  .command('start <id>')
  .description('Start a task')
  .option('-a, --agent <agent>', 'Agent to execute the task')
  .action(taskCommand.start)

task
  .command('complete <id>')
  .description('Complete a task')
  .option('-o, --output <json>', 'Output data as JSON')
  .action(taskCommand.complete)

task
  .command('fail <id>')
  .description('Mark a task as failed')
  .option('-r, --reason <reason>', 'Failure reason', 'Task failed')
  .action(taskCommand.fail)

// Parse arguments
program.parse()
