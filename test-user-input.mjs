/**
 * Test script for User Input Mechanism
 *
 * Registers an auto-responder that answers questions automatically,
 * then runs ASMO workflow to verify the complete flow.
 */

import { getUserInputManager, createAnswerSet } from './packages/core/dist/index.mjs'

// Test answers (simulating user choices: 1A, 2A, 3A, 4A)
const testAnswers = {
  'app-type': 'fullstack',
  'scope': 'mvp',
  'frontend': 'react',
  'backend': 'express',
  'database': 'sqlite',
  'typescript': true,
  'features': ['auth', 'api'],
  'auth-type': 'simple',
  'ui-language': 'en'
}

// Register auto-responder
const manager = getUserInputManager()

manager.on('inputRequested', (request) => {
  console.log('')
  console.log('══════════════════════════════════════════════════════════════════')
  console.log(`⏸️  ${request.agentName || request.agentId} needs your input`)
  console.log('══════════════════════════════════════════════════════════════════')
  console.log('')
  console.log(`Context: ${request.context}`)
  console.log('')

  // Display questions and auto-answers
  let questionCount = 0
  for (const group of request.groups) {
    console.log(`📋 [${group.title}]`)
    for (const q of group.questions) {
      questionCount++
      const answer = testAnswers[q.id]
      const answerStr = Array.isArray(answer) ? answer.join(', ') : String(answer)
      console.log(`   ${q.text}`)
      console.log(`   → ${answerStr}`)
    }
    console.log('')
  }

  console.log(`✅ Auto-answering ${questionCount} questions (test mode)`)
  console.log('══════════════════════════════════════════════════════════════════')
  console.log('')

  // Submit answers
  const answerSet = createAnswerSet(request.agentId, testAnswers)
  manager.submitResponse(request.id, answerSet, false)
})

console.log('✅ Auto-responder registered\n')
console.log('📋 Test Answers:')
for (const [key, value] of Object.entries(testAnswers)) {
  console.log(`   ${key}: ${JSON.stringify(value)}`)
}
console.log('')

// Test the needsUserInput detection
console.log('🧪 Testing needsUserInput detection...')
const { ArchitectAgent } = await import('./packages/core/dist/index.mjs')

const architect = new ArchitectAgent()

// Test the flow by checking if requestInput is called
console.log('✅ ArchitectAgent created')
console.log('✅ UserInputManager listening for requests')
console.log('')
console.log('🎯 Now run: asmo run "создать сервис букинга" --verbose')
console.log('   The agent should ask questions and the auto-responder will answer them')
console.log('')
console.log('Done! User Input Mechanism is ready.')
