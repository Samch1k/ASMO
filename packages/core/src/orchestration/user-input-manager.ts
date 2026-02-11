/**
 * User Input Manager
 *
 * Manages interactive user input during workflow execution.
 * Handles pausing/resuming workflows while waiting for user responses.
 */

import {
  UserInputRequest,
  UserInputResponse,
  UserInputSession,
  QuestionGroup,
  Question,
  AnswerSet,
  Answer
} from './user-input-types'
import { EventEmitter } from 'events'

/**
 * User Input Manager
 *
 * Singleton class that coordinates user input requests between agents and CLI/UI
 */
export class UserInputManager extends EventEmitter {
  private static instance: UserInputManager | null = null

  private currentSession: UserInputSession
  private pendingPromises: Map<string, {
    resolve: (response: UserInputResponse) => void
    reject: (error: Error) => void
    timeout?: NodeJS.Timeout
  }> = new Map()

  private requestCounter = 0

  private constructor() {
    super()
    this.currentSession = {
      activeRequest: null,
      history: [],
      isPaused: false
    }
  }

  /**
   * Get singleton instance
   */
  static getInstance(): UserInputManager {
    if (!UserInputManager.instance) {
      UserInputManager.instance = new UserInputManager()
    }
    return UserInputManager.instance
  }

  /**
   * Reset manager (for testing)
   */
  static reset(): void {
    if (UserInputManager.instance) {
      UserInputManager.instance.clearAll()
    }
    UserInputManager.instance = null
  }

  /**
   * Request user input with structured questions
   *
   * @param agentId - Agent requesting input
   * @param agentName - Human-readable agent name
   * @param context - Context/reason for asking
   * @param groups - Question groups
   * @param questions - Individual questions (if not grouped)
   * @param timeout - Optional timeout in milliseconds
   * @param blocking - Whether to pause workflow execution
   * @returns Promise that resolves with user's answers
   */
  async requestInput(
    agentId: string,
    agentName: string,
    context: string,
    groups: QuestionGroup[] = [],
    questions: Question[] = [],
    timeout?: number,
    blocking: boolean = true
  ): Promise<UserInputResponse> {
    const requestId = this.generateRequestId()

    const request: UserInputRequest = {
      id: requestId,
      agentId,
      agentName,
      context,
      groups,
      questions,
      timeout,
      blocking
    }

    // Add to history
    this.currentSession.history.push({
      request,
      response: null,
      status: 'pending'
    })

    // Set as active request
    this.currentSession.activeRequest = request

    if (blocking) {
      this.currentSession.isPaused = true
    }

    // Create promise FIRST (before emit, so handlers can call submitResponse immediately)
    const promise = new Promise<UserInputResponse>((resolve, reject) => {
      this.pendingPromises.set(requestId, { resolve, reject })

      // Set timeout if specified
      if (timeout) {
        const timeoutHandle = setTimeout(() => {
          this.handleTimeout(requestId)
        }, timeout)

        const pending = this.pendingPromises.get(requestId)
        if (pending) {
          pending.timeout = timeoutHandle
        }
      }
    })

    // Verify listeners exist before emitting
    const listenerCount = this.listenerCount('inputRequested')
    if (listenerCount === 0) {
      console.warn('[UserInputManager] WARNING: No listeners for inputRequested! CLI handler may not be initialized.')
    }

    const totalQuestions = groups.reduce((sum, g) => sum + g.questions.length, 0) + questions.length
    console.log(`[UserInputManager] Input requested: ${requestId}, ${groups.length} groups, ${totalQuestions} questions, ${listenerCount} listener(s)`)

    // Emit event for CLI/UI to handle (handlers can now call submitResponse)
    this.emit('inputRequested', request)

    return promise
  }

  /**
   * Submit user's response to pending request
   *
   * @param requestId - ID of request being answered
   * @param answers - User's answers
   * @param cancelled - Whether request was cancelled
   */
  submitResponse(
    requestId: string,
    answers: AnswerSet,
    cancelled: boolean = false
  ): void {
    const pending = this.pendingPromises.get(requestId)

    if (!pending) {
      console.warn(`[UserInputManager] No pending request found: ${requestId}`)
      return
    }

    // Clear timeout if set
    if (pending.timeout) {
      clearTimeout(pending.timeout)
    }

    // Create response
    const response: UserInputResponse = {
      requestId,
      answers,
      cancelled,
      responseTime: Date.now() - (this.currentSession.activeRequest?.timeout || Date.now())
    }

    // Update history
    const historyEntry = this.currentSession.history.find(h => h.request.id === requestId)
    if (historyEntry) {
      historyEntry.response = response
      historyEntry.status = cancelled ? 'cancelled' : 'completed'
    }

    // Clear active request
    this.currentSession.activeRequest = null
    this.currentSession.isPaused = false

    // Resolve promise
    pending.resolve(response)
    this.pendingPromises.delete(requestId)

    // Emit event
    this.emit('inputReceived', response)
  }

  /**
   * Cancel pending request
   */
  cancelRequest(requestId: string): void {
    const pending = this.pendingPromises.get(requestId)

    if (!pending) {
      console.warn(`[UserInputManager] No pending request found: ${requestId}`)
      return
    }

    // Clear timeout if set
    if (pending.timeout) {
      clearTimeout(pending.timeout)
    }

    // Update history
    const historyEntry = this.currentSession.history.find(h => h.request.id === requestId)
    if (historyEntry) {
      historyEntry.status = 'cancelled'
    }

    // Clear active request
    this.currentSession.activeRequest = null
    this.currentSession.isPaused = false

    // Reject promise
    pending.reject(new Error('Request cancelled by user'))
    this.pendingPromises.delete(requestId)

    // Emit event
    this.emit('inputCancelled', requestId)
  }

  /**
   * Handle request timeout
   */
  private handleTimeout(requestId: string): void {
    const pending = this.pendingPromises.get(requestId)

    if (!pending) {
      return
    }

    // Update history
    const historyEntry = this.currentSession.history.find(h => h.request.id === requestId)
    if (historyEntry) {
      historyEntry.status = 'timeout'
    }

    // Clear active request
    this.currentSession.activeRequest = null
    this.currentSession.isPaused = false

    // Reject promise
    pending.reject(new Error('Request timeout'))
    this.pendingPromises.delete(requestId)

    // Emit event
    this.emit('inputTimeout', requestId)
  }

  /**
   * Get current session state
   */
  getSession(): UserInputSession {
    return this.currentSession
  }

  /**
   * Check if workflow is paused waiting for input
   */
  isPaused(): boolean {
    return this.currentSession.isPaused
  }

  /**
   * Get active request (if any)
   */
  getActiveRequest(): UserInputRequest | null {
    return this.currentSession.activeRequest
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    // Reject all pending promises
    for (const [, pending] of this.pendingPromises) {
      if (pending.timeout) {
        clearTimeout(pending.timeout)
      }
      pending.reject(new Error('Cleared by manager'))
    }

    this.pendingPromises.clear()
    this.currentSession = {
      activeRequest: null,
      history: [],
      isPaused: false
    }
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    const id = `input-${Date.now()}-${++this.requestCounter}`
    return id
  }
}

/**
 * Get singleton instance
 */
export function getUserInputManager(): UserInputManager {
  return UserInputManager.getInstance()
}

/**
 * Reset manager (for testing)
 */
export function resetUserInputManager(): void {
  UserInputManager.reset()
}

/**
 * Helper: Create answer set from simple key-value pairs
 */
export function createAnswerSet(
  agentId: string,
  answers: Record<string, any>
): AnswerSet {
  const answerArray: Answer[] = Object.entries(answers).map(([questionId, value]) => ({
    questionId,
    value,
    timestamp: new Date()
  }))

  return {
    id: `answers-${Date.now()}`,
    agentId,
    answers: answerArray,
    submittedAt: new Date(),
    complete: true
  }
}
