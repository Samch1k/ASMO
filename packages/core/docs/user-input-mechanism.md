# User Input Mechanism - Implementation Progress

**Priority**: HIGH (1.1)
**Status**: 🟡 In Progress (Core Complete, CLI Handler Remaining)
**Date**: 2026-02-11

## ✅ Completed

### 1. Type Definitions (`user-input-types.ts`)

Created comprehensive type system for structured Q&A:

```typescript
// Question types
- QuestionType: 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'boolean' | 'date'
- Question: Individual question with options, validation, defaults
- QuestionGroup: Related questions grouped together
- QuestionOption: Options for choice-type questions

// Answer types
- Answer: Single answer to a question
- AnswerSet: Collection of answers from user
- UserInputRequest: Request sent to CLI/UI
- UserInputResponse: Response from user

// Helper functions
- createSingleChoiceQuestion()
- createMultipleChoiceQuestion()
- createTextQuestion()
- createBooleanQuestion()
- getAnswer()
- validateAnswers()
```

**Files**: `packages/core/src/orchestration/user-input-types.ts`

### 2. User Input Manager (`user-input-manager.ts`)

Singleton manager for coordinating user input:

**Features**:
- ✅ Request/response lifecycle management
- ✅ Workflow pause/resume control
- ✅ Promise-based async waiting
- ✅ Timeout handling
- ✅ Request cancellation
- ✅ Event emitter for CLI/UI integration
- ✅ Session history tracking

**Key Methods**:
```typescript
async requestInput(
  agentId: string,
  agentName: string,
  context: string,
  groups: QuestionGroup[],
  questions: Question[],
  timeout?: number,
  blocking: boolean
): Promise<UserInputResponse>

submitResponse(requestId: string, answers: AnswerSet, cancelled: boolean): void
cancelRequest(requestId: string): void
isPaused(): boolean
getActiveRequest(): UserInputRequest | null
```

**Events**:
- `inputRequested` - New input request created
- `inputReceived` - User submitted answers
- `inputCancelled` - Request cancelled
- `inputTimeout` - Request timed out

**Files**: `packages/core/src/orchestration/user-input-manager.ts`

### 3. BaseAgent Integration

Added `askUser()` method to all agents:

```typescript
protected async askUser(
  context: string,
  groups: QuestionGroup[] = [],
  questions: Question[] = [],
  timeout?: number
): Promise<UserInputResponse>

protected getAnswer(answerSet: AnswerSet, questionId: string): any
```

**Behavior**:
- Pauses workflow execution (blocking=true)
- Logs request with context
- Waits for user response via UserInputManager
- Throws error if cancelled or timeout
- Returns UserInputResponse with answers

**Example Usage**:
```typescript
// In any agent:
const response = await this.askUser(
  'Need to clarify tech stack decisions',
  [
    {
      id: 'tech-stack',
      title: 'Technology Stack',
      questions: [
        {
          id: 'database',
          type: 'single_choice',
          text: 'Which database?',
          options: [
            { id: 'postgres', label: 'PostgreSQL', recommended: true },
            { id: 'mysql', label: 'MySQL' },
            { id: 'sqlite', label: 'SQLite' }
          ]
        }
      ]
    }
  ]
)

const database = this.getAnswer(response.answers, 'database')
console.log(`User selected: ${database}`) // 'postgres' | 'mysql' | 'sqlite'
```

**Files**: `packages/core/src/agents/base-agent.ts`

### 4. AgentState Update

Added UserInputSession to AgentContext:

```typescript
export interface AgentContext extends Record<string, any> {
  instructions?: string
  userInputSession?: UserInputSession  // NEW
}
```

**Files**: `packages/core/src/agents/types.ts`

### 5. Module Exports

Exported all new types and functions from core package:

```typescript
// From index.ts:
export {
  getUserInputManager,
  resetUserInputManager,
  createAnswerSet,
  UserInputManager
}

export type {
  Question,
  QuestionOption,
  QuestionType,
  QuestionGroup,
  Answer,
  AnswerSet,
  UserInputRequest,
  UserInputResponse,
  UserInputSession
}

export {
  createSingleChoiceQuestion,
  createMultipleChoiceQuestion,
  createTextQuestion,
  createBooleanQuestion,
  getAnswer,
  validateAnswers
}
```

**Files**: `packages/core/src/index.ts`

### 6. Build Verification

✅ All files compile without errors
✅ TypeScript types validated
✅ No runtime errors

## 🟡 In Progress

### 7. CLI Handler (Next Step)

Need to create CLI handler that:
- Listens to `inputRequested` event from UserInputManager
- Displays questions to user in terminal
- Collects user input (single/multiple choice, text, etc.)
- Submits response back to manager
- Handles cancellation (Ctrl+C)
- Shows progress/waiting state

**Implementation Plan**:
```typescript
// In packages/cli/src/utils/user-input-handler.ts

import { getUserInputManager, UserInputRequest } from '@asmo/core'
import inquirer from 'inquirer'

export class CLIUserInputHandler {
  initialize() {
    const manager = getUserInputManager()

    manager.on('inputRequested', async (request: UserInputRequest) => {
      console.log(`\n⏸️  ${request.agentName} is asking for your input:\n`)
      console.log(`📋 ${request.context}\n`)

      // Convert questions to inquirer format
      const answers = await this.promptUser(request)

      // Submit back to manager
      manager.submitResponse(request.id, answers, false)
    })
  }

  private async promptUser(request: UserInputRequest) {
    // Convert Question[] to inquirer prompts
    // Collect answers
    // Create AnswerSet
  }
}
```

**Files**:
- Create: `packages/cli/src/utils/user-input-handler.ts`
- Update: `packages/cli/src/commands/run.ts` (initialize handler)

### 8. ArchitectAgent Update (After CLI Handler)

Update ArchitectAgent to use `askUser()` instead of generating questions in LLM response:

**Current Behavior** (❌):
```typescript
// Generates questions in LLM, stores in ADR, never waits for answers
const decision = await this.callLLM(prompt)
// decision contains questions text, but user never sees them
```

**New Behavior** (✅):
```typescript
// Check if need to ask user
if (this.shouldAskUser(task)) {
  const questions = this.buildQuestions(task)
  const response = await this.askUser(
    'Clarifying architecture decisions before proceeding',
    questions
  )

  // Use answers to generate architecture
  const architecture = await this.generateArchitecture(task, response.answers)
}
```

**Files**: `packages/core/src/agents/implementations/architect-agent.ts`

## 📊 Impact Analysis

### Before (Current State)

```
ArchitectAgent.execute()
  ↓
Generate LLM prompt with questions
  ↓
LLM response contains questions ❌
  ↓
Store questions in ADR (Memory MCP)
  ↓
Workflow continues ❌ (no answers collected)
  ↓
Next phase runs without user input ❌
```

### After (With User Input Mechanism)

```
ArchitectAgent.execute()
  ↓
Check: Need user input?
  ↓ Yes
Build structured questions
  ↓
askUser(questions) → Pause workflow ⏸️
  ↓
UserInputManager.requestInput()
  ↓
Emit 'inputRequested' event
  ↓
CLI Handler displays questions ✅
  ↓
User provides answers ✅
  ↓
CLI Handler submits via submitResponse()
  ↓
askUser() promise resolves ✅
  ↓
Workflow resumes ▶️
  ↓
Agent uses answers to generate architecture ✅
  ↓
Next phase runs with proper context ✅
```

## 🧪 Testing Plan

### Unit Tests

```typescript
describe('UserInputManager', () => {
  it('should pause workflow on requestInput', async () => {
    const manager = getUserInputManager()
    const promise = manager.requestInput(...)
    expect(manager.isPaused()).toBe(true)
  })

  it('should resolve promise on submitResponse', async () => {
    const manager = getUserInputManager()
    const promise = manager.requestInput(...)
    manager.submitResponse(requestId, answers, false)
    const response = await promise
    expect(response.cancelled).toBe(false)
  })

  it('should timeout after specified duration', async () => {
    const manager = getUserInputManager()
    await expect(
      manager.requestInput(..., timeout: 1000)
    ).rejects.toThrow('Request timeout')
  })
})

describe('BaseAgent.askUser', () => {
  it('should pause and wait for user input', async () => {
    const agent = new TestAgent('test', [])
    const promise = agent.askUser('test', groups)
    // Simulate user response
    getUserInputManager().submitResponse(...)
    const response = await promise
    expect(response).toBeDefined()
  })
})
```

### Integration Tests

```typescript
describe('ArchitectAgent with User Input', () => {
  it('should ask user for tech stack decisions', async () => {
    const agent = new ArchitectAgent()
    const state = createTestState('Create a booking service')

    // Mock user response
    setTimeout(() => {
      getUserInputManager().submitResponse(...)
    }, 100)

    const result = await agent.execute(state)

    expect(result.artifacts).toContainEqual(
      expect.objectContaining({
        type: 'adr',
        content: expect.stringContaining('PostgreSQL') // User's choice
      })
    )
  })
})
```

## 📈 Next Steps

1. **Implement CLI Handler** (Priority 1)
   - Create `user-input-handler.ts`
   - Integrate inquirer.js for prompts
   - Handle single/multiple choice, text input
   - Add to run command initialization

2. **Update ArchitectAgent** (Priority 2)
   - Refactor to use askUser()
   - Remove LLM-generated questions
   - Use answers to drive architecture generation

3. **Test End-to-End** (Priority 3)
   - Run architecture_design workflow
   - Verify questions appear in terminal
   - Verify workflow pauses
   - Verify answers are used

4. **Documentation** (Priority 4)
   - Update ArchitectAgent docs
   - Add user input examples
   - Update workflow execution guide

## 🎯 Success Criteria

- ✅ Core mechanism complete
- ⏸️ CLI handler working (IN PROGRESS)
- ⏸️ ArchitectAgent using askUser() (NEXT)
- ⏸️ Questions display in terminal
- ⏸️ Workflow pauses correctly
- ⏸️ Answers flow to agents
- ⏸️ Architecture generated with user choices
- ⏸️ Tests passing

## 📝 Notes

- **Breaking Change**: This changes how ArchitectAgent works - from LLM-generating-questions to structured Q&A
- **Backwards Compat**: Old behavior preserved until ArchitectAgent updated
- **Future**: Can extend to other agents (DeveloperAgent, DevOpsAgent) to ask clarifying questions
- **Future**: Can add UI handler for web-based interface (same event system)
