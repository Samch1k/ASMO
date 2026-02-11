/**
 * CLI User Input Handler
 *
 * Provides interactive terminal prompts for user input during workflow execution.
 * Integrates with UserInputManager from @asmo/core to handle pause/resume flow.
 */

import inquirer from 'inquirer'
import chalk from 'chalk'
import {
  getUserInputManager,
  type UserInputRequest,
  type Question,
  type QuestionGroup,
  type Answer,
  createAnswerSet
} from '@asmo/core'

export interface CLIUserInputHandlerOptions {
  verbose?: boolean
}

/**
 * CLI User Input Handler
 *
 * Handles display and collection of user input in terminal.
 * Automatically listens to UserInputManager events and prompts user.
 */
export class CLIUserInputHandler {
  private isListening = false
  private activeRequestId: string | null = null
  private verbose: boolean

  constructor(options: CLIUserInputHandlerOptions = {}) {
    this.verbose = options.verbose ?? false
  }

  /**
   * Initialize handler and start listening for input requests
   */
  initialize(): void {
    if (this.isListening) {
      console.warn('[CLIUserInputHandler] Already initialized')
      return
    }

    const manager = getUserInputManager()

    // Listen for input requests
    manager.on('inputRequested', async (request: UserInputRequest) => {
      await this.handleInputRequest(request)
    })

    // Listen for cancellation (from external source)
    manager.on('inputCancelled', (requestId: string) => {
      if (this.activeRequestId === requestId) {
        console.log(chalk.yellow('\n⚠️  Input request cancelled'))
        this.activeRequestId = null
      }
    })

    // Listen for timeout
    manager.on('inputTimeout', (requestId: string) => {
      if (this.activeRequestId === requestId) {
        console.log(chalk.red('\n⏱️  Input request timed out'))
        this.activeRequestId = null
      }
    })

    this.isListening = true

    const listenerCount = manager.listenerCount('inputRequested')
    if (this.verbose) {
      console.log(`[UserInput] Handler initialized, ${listenerCount} listener(s) registered`)
    }
  }

  /**
   * Stop listening for input requests
   */
  shutdown(): void {
    const manager = getUserInputManager()
    manager.removeAllListeners('inputRequested')
    manager.removeAllListeners('inputCancelled')
    manager.removeAllListeners('inputTimeout')
    this.isListening = false
  }

  /**
   * Handle input request from agent
   */
  private async handleInputRequest(request: UserInputRequest): Promise<void> {
    this.activeRequestId = request.id

    if (this.verbose) {
      console.log(`[UserInput] Event received: ${request.id}`)
    }

    try {
      // Check if stdin is a TTY (interactive terminal)
      if (!process.stdin.isTTY) {
        console.warn('[UserInput] WARNING: stdin is not a TTY, cannot prompt interactively')
        console.log('[UserInput] Cancelling request, agent will use defaults')

        const manager = getUserInputManager()
        manager.cancelRequest(request.id)
        return
      }

      // Display header
      this.displayHeader(request)

      // Collect questions from groups and individual questions
      const allQuestions: Question[] = []

      // Add questions from groups
      for (const group of request.groups) {
        allQuestions.push(...group.questions)
      }

      // Add individual questions
      if (request.questions) {
        allQuestions.push(...request.questions)
      }

      if (this.verbose) {
        console.log(`[UserInput] Displaying ${allQuestions.length} questions from ${request.groups.length} groups`)
      }

      // Convert to inquirer prompts
      const prompts = this.convertToInquirerPrompts(allQuestions, request.groups)

      // Prompt user
      const answers = await inquirer.prompt(prompts)

      // Convert answers to AnswerSet
      const answerSet = this.convertToAnswerSet(request.agentId, allQuestions, answers)

      // Submit response
      const manager = getUserInputManager()
      manager.submitResponse(request.id, answerSet, false)

      // Display confirmation
      this.displayConfirmation(answerSet)
    } catch (error) {
      const manager = getUserInputManager()

      // Distinguish user cancellation (Ctrl+C / ExitPromptError) from real errors
      const isUserCancel = error instanceof Error && (
        error.message.includes('User force closed') ||
        error.constructor.name === 'ExitPromptError'
      )

      if (isUserCancel) {
        console.log(chalk.yellow('\n⚠️  Input cancelled by user'))
      } else {
        const errMsg = error instanceof Error ? error.message : String(error)
        console.error(chalk.red(`\n❌ User input error: ${errMsg}`))
        if (this.verbose && error instanceof Error && error.stack) {
          console.error(chalk.gray(error.stack))
        }
      }

      manager.cancelRequest(request.id)
    } finally {
      this.activeRequestId = null
    }
  }

  /**
   * Display request header
   */
  private displayHeader(request: UserInputRequest): void {
    console.log('\n' + chalk.cyan('═'.repeat(70)))
    console.log(chalk.cyan.bold(`⏸️  ${request.agentName || request.agentId} needs your input`))
    console.log(chalk.cyan('═'.repeat(70)))
    console.log('')
    console.log(chalk.white.bold('Context:'))
    console.log(chalk.gray(`  ${request.context}`))
    console.log('')

    if (request.timeout) {
      const timeoutSec = Math.round(request.timeout / 1000)
      console.log(chalk.yellow(`⏱️  Timeout: ${timeoutSec}s`))
      console.log('')
    }

    if (this.verbose) {
      const totalQuestions = request.groups.reduce((sum, g) => sum + g.questions.length, 0)
        + (request.questions?.length || 0)
      console.log(chalk.gray(`  [debug] Request ID: ${request.id}`))
      console.log(chalk.gray(`  [debug] Groups: ${request.groups.length}, Questions: ${totalQuestions}`))
      console.log('')
    }
  }

  /**
   * Display confirmation after submission
   */
  private displayConfirmation(answerSet: any): void {
    console.log('')
    console.log(chalk.green('✅ Answers submitted successfully'))
    console.log(chalk.gray(`   ${answerSet.answers.length} question${answerSet.answers.length !== 1 ? 's' : ''} answered`))
    console.log(chalk.cyan('═'.repeat(70)))
    console.log('')
  }

  /**
   * Convert ASMO questions to inquirer prompts
   */
  private convertToInquirerPrompts(
    questions: Question[],
    groups: QuestionGroup[]
  ): any[] {
    const prompts: any[] = []

    // Track which questions belong to which group for better display
    const groupMap = new Map<string, QuestionGroup>()
    for (const group of groups) {
      for (const question of group.questions) {
        groupMap.set(question.id, group)
      }
    }

    for (const question of questions) {
      const group = groupMap.get(question.id)

      // Build message with group context
      let message = ''
      if (group) {
        message = chalk.bold.blue(`[${group.title}] `) + question.text
      } else {
        message = question.text
      }

      // Add context if available
      if (question.context) {
        message += '\n' + chalk.gray(`  ${question.context}`)
      }

      const prompt: any = {
        name: question.id,
        message,
        default: question.defaultValue
      }

      // Map question type to inquirer type
      switch (question.type) {
        case 'single_choice':
          prompt.type = 'list'
          prompt.choices = (question.options || []).map(opt => ({
            name: opt.recommended
              ? chalk.green(`${opt.label} ${chalk.gray('(recommended)')}`)
              : opt.label,
            value: opt.id,
            short: opt.label
          }))
          break

        case 'multiple_choice':
          prompt.type = 'checkbox'
          prompt.choices = (question.options || []).map(opt => ({
            name: opt.description
              ? `${opt.label} ${chalk.gray(`- ${opt.description}`)}`
              : opt.label,
            value: opt.id,
            short: opt.label,
            checked: false
          }))
          break

        case 'boolean':
          prompt.type = 'confirm'
          prompt.default = question.defaultValue !== undefined ? question.defaultValue : true
          break

        case 'number':
          prompt.type = 'number'
          if (question.validation) {
            prompt.validate = (input: number) => {
              if (question.validation!.min !== undefined && input < question.validation!.min) {
                return question.validation!.message || `Must be at least ${question.validation!.min}`
              }
              if (question.validation!.max !== undefined && input > question.validation!.max) {
                return question.validation!.message || `Must be at most ${question.validation!.max}`
              }
              return true
            }
          }
          break

        case 'date':
          prompt.type = 'input'
          prompt.validate = (input: string) => {
            const date = new Date(input)
            if (isNaN(date.getTime())) {
              return 'Please enter a valid date (YYYY-MM-DD)'
            }
            return true
          }
          break

        case 'text':
        default:
          prompt.type = 'input'
          if (question.validation?.pattern) {
            prompt.validate = (input: string) => {
              const regex = new RegExp(question.validation!.pattern!)
              if (!regex.test(input)) {
                return question.validation!.message || 'Invalid format'
              }
              return true
            }
          }
          break
      }

      // Add required validation
      if (question.required && prompt.type !== 'confirm') {
        const originalValidate = prompt.validate
        prompt.validate = (input: any) => {
          if (!input || (Array.isArray(input) && input.length === 0)) {
            return 'This question is required'
          }
          return originalValidate ? originalValidate(input) : true
        }
      }

      prompts.push(prompt)
    }

    return prompts
  }

  /**
   * Convert inquirer answers to ASMO AnswerSet
   */
  private convertToAnswerSet(
    agentId: string,
    questions: Question[],
    inquirerAnswers: Record<string, any>
  ): any {
    const answers: Answer[] = []

    for (const question of questions) {
      const value = inquirerAnswers[question.id]

      // Skip if not answered (and not required)
      if (value === undefined || value === null) {
        if (question.required) {
          console.warn(`Warning: Required question ${question.id} not answered`)
        }
        continue
      }

      answers.push({
        questionId: question.id,
        value,
        timestamp: new Date()
      })
    }

    return createAnswerSet(agentId, Object.fromEntries(
      answers.map(a => [a.questionId, a.value])
    ))
  }

  /**
   * Check if handler is listening
   */
  isActive(): boolean {
    return this.isListening
  }

  /**
   * Get active request ID (if any)
   */
  getActiveRequestId(): string | null {
    return this.activeRequestId
  }
}

/**
 * Singleton instance
 */
let handlerInstance: CLIUserInputHandler | null = null

/**
 * Get CLI user input handler instance
 */
export function getCLIUserInputHandler(options?: CLIUserInputHandlerOptions): CLIUserInputHandler {
  if (!handlerInstance) {
    handlerInstance = new CLIUserInputHandler(options)
  }
  return handlerInstance
}

/**
 * Reset handler (for testing)
 */
export function resetCLIUserInputHandler(): void {
  if (handlerInstance) {
    handlerInstance.shutdown()
  }
  handlerInstance = null
}
