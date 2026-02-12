/**
 * CLI User Input Handler
 *
 * Provides interactive terminal prompts for user input during workflow execution.
 * Integrates with UserInputManager from @asmo/core to handle pause/resume flow.
 */

import * as fs from 'fs'
import * as tty from 'tty'
import inquirer from 'inquirer'
import chalk from 'chalk'
import {
  getUserInputManager,
  type UserInputRequest,
  type Question,
  type QuestionGroup,
  type Answer,
  createAnswerSet,
  InputRequiredError
} from '@asmo/core'

export interface CLIUserInputHandlerOptions {
  verbose?: boolean
  preferences?: Record<string, any>
  useDefaults?: boolean
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
  private preferences: Record<string, any> | undefined
  private useDefaults: boolean

  constructor(options: CLIUserInputHandlerOptions = {}) {
    this.verbose = options.verbose ?? false
    this.preferences = options.preferences
    this.useDefaults = options.useDefaults ?? false
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
   * Try to get TTY streams for interactive prompts.
   * When stdin is piped (e.g., spawned from Claude Code), opens /dev/tty directly.
   */
  private openTTY(): { input: NodeJS.ReadableStream; output: NodeJS.WritableStream; cleanup: () => void } | null {
    // stdin is already a TTY — use standard streams
    if (process.stdin.isTTY) {
      return { input: process.stdin, output: process.stdout, cleanup: () => {} }
    }

    // Try /dev/tty — direct access to the controlling terminal (macOS/Linux)
    try {
      const fd = fs.openSync('/dev/tty', 'r+')
      const input = new tty.ReadStream(fd)
      const output = new tty.WriteStream(fd)

      if (this.verbose) {
        console.log('[UserInput] stdin is not TTY, opened /dev/tty for interactive prompts')
      }

      return {
        input,
        output,
        cleanup: () => {
          input.destroy()
          output.destroy()
          fs.closeSync(fd)
        }
      }
    } catch (err) {
      if (this.verbose) {
        console.log(`[UserInput] /dev/tty not available: ${err instanceof Error ? err.message : err}`)
      }
      return null
    }
  }

  /**
   * Handle input request from agent
   */
  private async handleInputRequest(request: UserInputRequest): Promise<void> {
    this.activeRequestId = request.id

    if (this.verbose) {
      console.log(`[UserInput] Event received: ${request.id}`)
    }

    // Collect all questions
    const allQuestions: Question[] = []
    for (const group of request.groups) {
      allQuestions.push(...group.questions)
    }
    if (request.questions) {
      allQuestions.push(...request.questions)
    }

    // Try to get interactive TTY (either stdin or /dev/tty)
    const ttyStreams = this.openTTY()

    // No TTY available at all
    if (!ttyStreams) {
      try {
        if (this.preferences || this.useDefaults) {
          // Explicit preferences or --defaults flag: use non-interactive mode
          this.submitNonInteractive(request, allQuestions)
        } else {
          // No explicit opt-in: show questions and wait for answers via file
          await this.waitForInputViaFile(request, allQuestions)
        }
      } finally {
        this.activeRequestId = null
      }
      return
    }

    try {
      // Display header (use tty output if not stdout)
      this.displayHeader(request, ttyStreams.output)

      if (this.verbose) {
        console.log(`[UserInput] Displaying ${allQuestions.length} questions from ${request.groups.length} groups`)
      }

      // Convert to inquirer prompts
      const prompts = this.convertToInquirerPrompts(allQuestions, request.groups)

      // Create custom prompt module with TTY streams
      const customPrompt = inquirer.createPromptModule({
        input: ttyStreams.input as NodeJS.ReadableStream,
        output: ttyStreams.output as NodeJS.WritableStream
      })

      // Prompt user interactively
      const answers = await customPrompt(prompts)

      // Cleanup TTY streams
      ttyStreams.cleanup()

      // Convert answers to AnswerSet
      const answerSet = this.convertToAnswerSet(request.agentId, allQuestions, answers)

      // Submit response
      const manager = getUserInputManager()
      manager.submitResponse(request.id, answerSet, false)

      // Display confirmation
      this.displayConfirmation(answerSet)
    } catch (error) {
      // Cleanup TTY streams on error
      ttyStreams.cleanup()

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
   * Display questions and wait for answers via file (non-TTY mode).
   *
   * Flow:
   * 1. Print questions to stdout (human-readable + machine-readable JSON)
   * 2. Write questions to /tmp/asmo-questions-<id>.json
   * 3. Poll for /tmp/asmo-answers-<id>.json every 2s (timeout: 10min)
   * 4. When answers file appears → read, validate, submit to UserInputManager
   * 5. If timeout → cancel request (workflow stops, NO defaults)
   */
  private async waitForInputViaFile(request: UserInputRequest, allQuestions: Question[]): Promise<void> {
    const questionsFile = `/tmp/asmo-questions-${request.id}.json`
    const answersFile = `/tmp/asmo-answers-${request.id}.json`

    // ── Header ──────────────────────────────────────────────────────
    console.log('\n' + chalk.cyan('═'.repeat(70)))
    console.log(chalk.cyan.bold(`  ⏸️  ${request.agentName || request.agentId} needs your input`))
    console.log(chalk.cyan('═'.repeat(70)))
    console.log('')
    console.log(chalk.white.bold('  Context:'))
    console.log(chalk.gray(`  ${request.context}`))
    console.log('')

    // ── Display questions ───────────────────────────────────────────
    const groupMap = new Map<string, QuestionGroup>()
    for (const group of request.groups) {
      for (const q of group.questions) groupMap.set(q.id, group)
    }

    let currentGroup = ''
    const defaults: Record<string, any> = {}

    for (const q of allQuestions) {
      const group = groupMap.get(q.id)
      if (group && group.title !== currentGroup) {
        currentGroup = group.title
        console.log(chalk.bold.blue(`  [${group.title}]`))
      }

      const defaultVal = this.getDefaultForQuestion(q)
      defaults[q.id] = defaultVal

      let qStr = `    ${chalk.white(q.id)}: ${q.text}`
      if (q.options?.length) {
        const optStr = q.options.map(o =>
          o.recommended ? chalk.green.bold(o.id) : chalk.white(o.id)
        ).join(' | ')
        qStr += `\n      Options: ${optStr}`
      }
      if (defaultVal !== undefined && defaultVal !== '') {
        qStr += chalk.gray(`  [default: ${JSON.stringify(defaultVal)}]`)
      }
      console.log(qStr)
    }

    // ── Write questions JSON ────────────────────────────────────────
    const questionsData = {
      requestId: request.id,
      agent: request.agentName || request.agentId,
      context: request.context,
      answersFile,
      questions: allQuestions.map(q => ({
        id: q.id,
        text: q.text,
        type: q.type,
        options: q.options?.map(o => ({
          id: o.id,
          label: o.label,
          description: o.description,
          recommended: o.recommended
        })),
        defaultValue: this.getDefaultForQuestion(q)
      })),
      defaults
    }

    try {
      fs.writeFileSync(questionsFile, JSON.stringify(questionsData, null, 2))
    } catch {
      // Non-critical: temp file write failure doesn't block the waiting
    }

    // ── Inline JSON for programmatic parsing ────────────────────────
    console.log('')
    console.log('<!-- ASMO_QUESTIONS_START -->')
    console.log(JSON.stringify(questionsData, null, 2))
    console.log('<!-- ASMO_QUESTIONS_END -->')
    console.log('')

    // ── Instructions ────────────────────────────────────────────────
    console.log(chalk.yellow('⏳ Waiting for your answers...'))
    console.log(chalk.white(`   Write answers as JSON to: ${chalk.bold(answersFile)}`))
    console.log(chalk.gray(`   Format: {"question-id": "value", ...}`))
    console.log(chalk.gray(`   Example with defaults:`))
    console.log(chalk.gray(`   echo '${JSON.stringify(defaults)}' > ${answersFile}`))
    console.log(chalk.gray(`   Timeout: 10 minutes`))
    console.log('')

    // ── Poll for answers file ───────────────────────────────────────
    const TIMEOUT_MS = 600_000  // 10 minutes
    const POLL_MS = 2_000       // 2 seconds
    const startTime = Date.now()

    while (Date.now() - startTime < TIMEOUT_MS) {
      if (fs.existsSync(answersFile)) {
        try {
          const raw = fs.readFileSync(answersFile, 'utf-8').trim()
          if (!raw) {
            // File exists but empty — still being written, wait
            await new Promise(resolve => setTimeout(resolve, POLL_MS))
            continue
          }

          const answers = JSON.parse(raw)

          // Submit answers to UserInputManager
          const manager = getUserInputManager()
          const answerSet = createAnswerSet(request.agentId, answers)
          manager.submitResponse(request.id, answerSet, false)

          const count = Object.keys(answers).length
          console.log(chalk.green(`✅ Answers received (${count} values) from ${answersFile}`))

          // Clean up temp files
          try { fs.unlinkSync(answersFile) } catch {}
          try { fs.unlinkSync(questionsFile) } catch {}

          return
        } catch (err) {
          // File exists but invalid JSON — maybe still being written
          if (this.verbose) {
            console.log(chalk.gray(`[UserInput] Waiting for valid JSON in ${answersFile}...`))
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, POLL_MS))
    }

    // ── Timeout — cancel (DO NOT use defaults) ──────────────────────
    console.log(chalk.red('\n⏱️  Timeout: no answers received in 10 minutes.'))
    console.log(chalk.yellow('   Workflow cancelled. Re-run with --preferences or --defaults.'))

    // Clean up questions file
    try { fs.unlinkSync(questionsFile) } catch {}

    // Clear activeRequestId BEFORE cancelRequest to prevent duplicate
    // output from the inputCancelled event listener
    this.activeRequestId = null

    const manager = getUserInputManager()
    manager.cancelRequest(
      request.id,
      new InputRequiredError('No answers received within 10 minutes. User input is required.')
    )
  }

  /**
   * Submit answers non-interactively (preferences → defaults fallback)
   */
  private submitNonInteractive(request: UserInputRequest, allQuestions: Question[]): void {
    const answers: Record<string, any> = {}
    const fromPrefs: string[] = []
    const fromDefaults: string[] = []

    for (const q of allQuestions) {
      if (this.preferences && q.id in this.preferences) {
        answers[q.id] = this.preferences[q.id]
        fromPrefs.push(q.id)
      } else {
        answers[q.id] = this.getDefaultForQuestion(q)
        fromDefaults.push(q.id)
      }
    }

    const source = this.preferences
      ? `${fromPrefs.length} from --preferences, ${fromDefaults.length} defaults`
      : 'recommended defaults (use --preferences to customize)'
    console.log(`[UserInput] Non-interactive mode (no TTY): ${source}`)

    if (this.verbose) {
      for (const [id, val] of Object.entries(answers)) {
        const tag = fromPrefs.includes(id) ? 'pref' : 'default'
        console.log(`  ${id}: ${JSON.stringify(val)} [${tag}]`)
      }
    }

    const manager = getUserInputManager()
    const answerSet = createAnswerSet(request.agentId, answers)
    manager.submitResponse(request.id, answerSet, false)
    console.log(`[UserInput] ✅ Answers submitted (${allQuestions.length} total)`)
  }

  /**
   * Display request header
   */
  private displayHeader(request: UserInputRequest, output?: NodeJS.WritableStream): void {
    const write = (text: string) => {
      if (output && output !== process.stdout) {
        output.write(text + '\n')
      } else {
        console.log(text)
      }
    }

    write('\n' + chalk.cyan('═'.repeat(70)))
    write(chalk.cyan.bold(`⏸️  ${request.agentName || request.agentId} needs your input`))
    write(chalk.cyan('═'.repeat(70)))
    write('')
    write(chalk.white.bold('Context:'))
    write(chalk.gray(`  ${request.context}`))
    write('')

    if (request.timeout) {
      const timeoutSec = Math.round(request.timeout / 1000)
      write(chalk.yellow(`⏱️  Timeout: ${timeoutSec}s`))
      write('')
    }

    if (this.verbose) {
      const totalQuestions = request.groups.reduce((sum, g) => sum + g.questions.length, 0)
        + (request.questions?.length || 0)
      write(chalk.gray(`  [debug] Request ID: ${request.id}`))
      write(chalk.gray(`  [debug] Groups: ${request.groups.length}, Questions: ${totalQuestions}`))
      write('')
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
   * Get default value for a question (used in non-TTY mode)
   */
  private getDefaultForQuestion(question: Question): any {
    // Explicit default takes priority
    if (question.defaultValue !== undefined) {
      return question.defaultValue
    }

    switch (question.type) {
      case 'single_choice': {
        // Use recommended option, or first option
        const recommended = question.options?.find(o => o.recommended)
        return recommended?.id ?? question.options?.[0]?.id ?? ''
      }
      case 'multiple_choice': {
        // Select recommended options, or empty array
        const recommended = question.options?.filter(o => o.recommended).map(o => o.id) ?? []
        return recommended.length > 0 ? recommended : []
      }
      case 'boolean':
        return true
      case 'number':
        return question.validation?.min ?? 0
      case 'text':
        return ''
      case 'date':
        return new Date().toISOString().split('T')[0]
      default:
        return ''
    }
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
