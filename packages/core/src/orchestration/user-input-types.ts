/**
 * User Input System Types
 *
 * Provides structured question/answer mechanism for agents
 * to collect user input during workflow execution.
 */

/**
 * Question option for multiple choice questions
 */
export interface QuestionOption {
  /** Option identifier (e.g., 'A', 'B', '1', '2') */
  id: string
  /** Display label for the option */
  label: string
  /** Detailed description of what this option means */
  description?: string
  /** Recommended option indicator */
  recommended?: boolean
}

/**
 * Question types supported by the system
 */
export type QuestionType =
  | 'single_choice'   // One option from a list
  | 'multiple_choice' // Multiple options from a list
  | 'text'           // Free-form text input
  | 'number'         // Numeric input
  | 'boolean'        // Yes/No question
  | 'date'           // Date input

/**
 * Individual question definition
 */
export interface Question {
  /** Unique question identifier */
  id: string
  /** Question type */
  type: QuestionType
  /** Question text presented to user */
  text: string
  /** Additional context or explanation */
  context?: string
  /** Options for choice-type questions */
  options?: QuestionOption[]
  /** Default value */
  defaultValue?: any
  /** Whether this question is required */
  required?: boolean
  /** Validation rules */
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

/**
 * Group of related questions
 */
export interface QuestionGroup {
  /** Group identifier */
  id: string
  /** Group title */
  title: string
  /** Group description */
  description?: string
  /** Questions in this group */
  questions: Question[]
  /** Whether all questions in group are required */
  allRequired?: boolean
}

/**
 * Answer to a single question
 */
export interface Answer {
  /** Question ID this answer corresponds to */
  questionId: string
  /** Answer value (type depends on question type) */
  value: any
  /** Timestamp when answered */
  timestamp: Date
}

/**
 * Collection of answers from user
 */
export interface AnswerSet {
  /** Unique identifier for this answer set */
  id: string
  /** Agent that requested these answers */
  agentId: string
  /** Answers provided */
  answers: Answer[]
  /** When answers were submitted */
  submittedAt: Date
  /** Whether all required questions were answered */
  complete: boolean
}

/**
 * User input request sent to CLI/UI
 */
export interface UserInputRequest {
  /** Request identifier */
  id: string
  /** Agent requesting input */
  agentId: string
  /** Agent name (human-readable) */
  agentName?: string
  /** Context/reason for asking */
  context: string
  /** Question groups */
  groups: QuestionGroup[]
  /** Individual questions (if not grouped) */
  questions?: Question[]
  /** Timeout for response (ms) */
  timeout?: number
  /** Whether workflow is paused waiting for response */
  blocking: boolean
}

/**
 * User input response from CLI/UI
 */
export interface UserInputResponse {
  /** Request ID this responds to */
  requestId: string
  /** Answer set */
  answers: AnswerSet
  /** Whether request was cancelled */
  cancelled: boolean
  /** Response time in milliseconds */
  responseTime: number
}

/**
 * User input session state
 * Tracks pending questions and received answers
 */
export interface UserInputSession {
  /** Active request (null if none pending) */
  activeRequest: UserInputRequest | null
  /** History of all requests/responses in this session */
  history: Array<{
    request: UserInputRequest
    response: UserInputResponse | null
    status: 'pending' | 'completed' | 'timeout' | 'cancelled'
  }>
  /** Whether workflow is currently paused waiting for input */
  isPaused: boolean
}

/**
 * Helper function to create a single choice question
 */
export function createSingleChoiceQuestion(
  id: string,
  text: string,
  options: Array<{ id: string; label: string; description?: string; recommended?: boolean }>,
  context?: string
): Question {
  return {
    id,
    type: 'single_choice',
    text,
    context,
    options,
    required: true
  }
}

/**
 * Helper function to create a multiple choice question
 */
export function createMultipleChoiceQuestion(
  id: string,
  text: string,
  options: Array<{ id: string; label: string; description?: string }>,
  context?: string
): Question {
  return {
    id,
    type: 'multiple_choice',
    text,
    context,
    options,
    required: false
  }
}

/**
 * Helper function to create a text question
 */
export function createTextQuestion(
  id: string,
  text: string,
  required: boolean = true,
  defaultValue?: string,
  context?: string
): Question {
  return {
    id,
    type: 'text',
    text,
    context,
    defaultValue,
    required
  }
}

/**
 * Helper function to create a boolean (yes/no) question
 */
export function createBooleanQuestion(
  id: string,
  text: string,
  defaultValue?: boolean,
  context?: string
): Question {
  return {
    id,
    type: 'boolean',
    text,
    context,
    defaultValue,
    required: true
  }
}

/**
 * Helper to extract answer value by question ID
 */
export function getAnswer(answerSet: AnswerSet, questionId: string): any {
  const answer = answerSet.answers.find(a => a.questionId === questionId)
  return answer?.value
}

/**
 * Helper to check if all required questions were answered
 */
export function validateAnswers(
  questions: Question[],
  answerSet: AnswerSet
): { valid: boolean; missing: string[] } {
  const requiredQuestions = questions.filter(q => q.required)
  const answeredIds = new Set(answerSet.answers.map(a => a.questionId))

  const missing = requiredQuestions
    .filter(q => !answeredIds.has(q.id))
    .map(q => q.id)

  return {
    valid: missing.length === 0,
    missing
  }
}
