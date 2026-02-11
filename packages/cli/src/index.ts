#!/usr/bin/env node
/**
 * ASMO Framework CLI
 *
 * Command-line interface for ASMO - AI System for Multiagent Orchestration.
 *
 * Commands:
 * - run <task>: Adaptive analysis and execution (uses WorkflowEngine)
 * - suggest <task>: Fast analysis for hooks (returns JSON)
 * - analyze <task>: Analyze task complexity
 * - stats: Show usage statistics for agents, workflows, and skills
 * - workflow <name>: Run a workflow
 * - task: Task management commands
 */

import { program } from 'commander'
import { analyzeCommand } from './commands/analyze.js'
import { workflowCommand } from './commands/workflow.js'
import { taskCommand } from './commands/task.js'
import { runCommand } from './commands/run.js'
import { suggestCommand } from './commands/suggest.js'
import { statsCommand } from './commands/stats.js'
import { version as VERSION } from '@asmo/core'

program
  .name('asmo')
  .version(VERSION)
  .description('ASMO - AI System for Multiagent Orchestration CLI')

// Run command - main entry point (auto-analyze + execute)
program
  .command('run <task>')
  .description('Analyze task and automatically execute appropriate workflow')
  .option('-v, --verbose', 'Verbose output')
  .option('-d, --dry-run', 'Dry run without executing')
  .option('-w, --workflow <name>', 'Override automatic workflow selection')
  .option('--use-api', 'Force API mode (requires ANTHROPIC_API_KEY)')
  .option('--no-llm', 'Disable LLM, use heuristics only')
  .option('--no-phase-detection', 'Disable adaptive phase detection')
  .action(runCommand)

// Suggest command - fast hybrid analysis for hooks
program
  .command('suggest <task>')
  .description('Quick hybrid analysis for Claude Code integration (returns JSON)')
  .option('-t, --threshold <score>', 'Complexity threshold for ASMO recommendation', '40')
  .option('--no-json', 'Human-readable output instead of JSON')
  .action(suggestCommand)

// Analyze command
program
  .command('analyze <task>')
  .description('Analyze task complexity and get workflow recommendation')
  .option('-c, --context <path>', 'Path to project context file')
  .option('-j, --json', 'Output as JSON')
  .action(analyzeCommand)

// Stats command
program
  .command('stats')
  .description('Show usage statistics for agents, workflows, and skills')
  .option('-t, --type <type>', 'Type to analyze: agents, workflows, skills, or all', 'all')
  .option('-f, --format <format>', 'Output format: table, json, or csv', 'table')
  .action(statsCommand)

// Workflow command
program
  .command('workflow [name]')
  .description('Run a workflow (use without name to list available workflows)')
  .option('-t, --task <task>', 'Task description')
  .option('-c, --config <path>', 'Path to workflow config')
  .option('-d, --dry-run', 'Dry run without executing')
  .option('-v, --verbose', 'Verbose output')
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
