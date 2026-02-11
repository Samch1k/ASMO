# ASMO Flow 1.0: Create Desk Booking System

> Full execution flow for `asmo run "создать систему бронирования столов"`

---

## Phase 0: CLI -> WorkflowEngine

```
CLI: asmo run "создать систему бронирования столов"
  |
  +- 1. Commander.js parses command -> runCommand(task, options)
  +- 2. WorkflowEngine initializes:
  |     +- Loads 25 roles from JSON
  |     +- Auto-registers 25 agents from roles
  |     +- Loads 24 workflows from templates/workflows/
  |     +- Registers workflows in ComplexityAnalyzer + WorkflowSelector
  +- 3. CLIUserInputHandler initializes (listens to inputRequested)
  +- 4. selectWorkflowAdaptively("создать систему бронирования столов")
```

## Phase 1: Complexity Analysis + Workflow Selection

```
ComplexityAnalyzer.analyzeTask("создать систему бронирования столов")
  |
  +- PromptValidator: input validation (UTF-8, length, sanitization)
  +- LLM call (Session $0 -> API -> Heuristics fallback):
  |     -> Returns JSON: { score: 75, level: "complex", factors: {...} }
  |
  +- recommendWorkflow():
        +- taskDescription = "создать систему бронирования столов"
        +- Regex: /(создать|создай|...)/ -> isCreation = true
        +- Level = "complex" + isCreation = true
        +- findWorkflowByKeyword("architecture") -> FOUND: architecture_design
        +- RESULT: recommendedWorkflow = "architecture_design"

WorkflowSelector returns:
  +- workflow: architecture_design
  +- complexity: complex (75/100)
  +- confidence: 95%
  +- reasoning: "Full lifecycle: design -> review -> implementation -> testing"
```

## Phase 2: Execution Preparation

```
resolveInput("создать систему бронирования столов")
  |
  +- isWorkflowId("создать...") -> false (natural language, not ID)
  +- selectWorkflowAdaptively() -> architecture_design
  +- buildState() -> AgentState:
  |     +- task: "создать систему бронирования столов"
  |     +- taskType: "feature"
  |     +- context: {}
  |     +- artifacts: []
  |     +- agentResults: []
  |
  +- executeWorkflow(architecture_design, state)
```

## Phase 3: Workflow Execution

Workflow `architecture_design` has 5 steps grouped by `order`:

```
groupStepsByOrder():
  Group 1: [architect]           <- sequential
  Group 2: [code-reviewer]       <- sequential
  Group 3: [developer, ui-dev]   <- PARALLEL
  Group 4: [tester]              <- sequential
```

### Step 1: ArchitectAgent (design phase)

```
executeStep(step={role_id:"architect", phase:"design"}, state)
  |
  +- agentRegistry.getAgentsByRole("architect") -> [ArchitectAgent]
  +- CircuitBreaker: check state -> CLOSED (OK)
  +- Timeout: 60m
  +- IterationManager: max 3 retries
  |
  +- ArchitectAgent.execute(state):
        |
        +- 1. requestMCP("memory") -> search past ADRs (may be empty)
        |
        +- 2. needsUserInput("создать систему бронирования столов")
        |     +- /(создать|создай)/ -> MATCH
        |     +- /(исправить|fix)/ -> NO MATCH
        |     +- return TRUE -> user input required
        |
        +- 3. buildQuestionGroups() -> 4 question groups:
        |     +- [scale]      App type? (fullstack/spa/api/monolith), Scope? (mvp/prod/enterprise)
        |     +- [tech-stack]  Frontend? Backend? Database? TypeScript?
        |     +- [features]    Features? (auth/admin/api/realtime), Auth type?
        |     +- [preferences] UI language? (en/ru/both)
        |
        +- 4. askUser(context, groups):
        |     +- getUserInputManager().requestInput(...)
        |     +- Promise created -> pendingPromises.set()
        |     +- emit('inputRequested', request) <- CLI receives event
        |     |
        |     |  +-------- CLIUserInputHandler --------+
        |     |  | ================================     |
        |     |  | Architect needs your input           |
        |     |  | ================================     |
        |     |  |                                      |
        |     |  | [Application Scale]                  |
        |     |  | What type of application?            |
        |     |  | > Full-Stack (recommended)           |
        |     |  |   Frontend SPA Only                  |
        |     |  |   Backend API Only                   |
        |     |  |                                      |
        |     |  | [Technology Stack]                   |
        |     |  | Frontend? > React                    |
        |     |  | Backend?  > Express.js               |
        |     |  | Database? > PostgreSQL               |
        |     |  | TypeScript? Y                        |
        |     |  |                                      |
        |     |  | [Features]                           |
        |     |  | [x] Authentication  [x] REST API    |
        |     |  | Auth method? > JWT                   |
        |     |  |                                      |
        |     |  | [Preferences]                        |
        |     |  | Language? > English                  |
        |     |  |                                      |
        |     |  | 9 answers submitted                  |
        |     |  +--------------------------------------+
        |     |
        |     +- submitResponse(requestId, answers) -> promise resolves
        |     +- userAnswers = { app-type: "fullstack", frontend: "react", ... }
        |
        +- 5. generateDecision(state, {pastDecisions, schema, bestPractices, userAnswers}):
        |     +- buildSystemPrompt() -> dynamic prompt with chosen stack:
        |     |   "TECHNOLOGY STACK (chosen by user):
        |     |    Frontend: React 19 with TypeScript
        |     |    Backend: Express.js with TypeScript
        |     |    Database: PostgreSQL"
        |     +- callLLM(task, {systemPrompt}) -> architecture decision (string)
        |
        +- 6. createArtifact("adr", formatADR(task, decision))
        |     -> Artifact { type:"adr", content:"# ADR: ...", metadata:{createdBy:"architect"} }
        |
        +- 7. requestMCP("memory", { action:"create_entities", entities:[ADR] })
        |
        +- 8. return {
                agentResults: [result],     <- confidence: 0.95 (user input)
                context: {
                  architectureDecision,     <- string from LLM
                  userAnswers,              <- user answers
                  adr                       <- ADR artifact
                },
                nextAction: "developer"
              }

mergeStepResult():
  state.artifacts = [adr]                     <- ADR artifact preserved
  state.context.architectureDecision = "..."   <- architecture available to all
  state.context.userAnswers = {...}            <- stack choice available to all
```

### Step 2: CodeReviewerAgent (review phase)

```
executeStep(step={role_id:"code-reviewer", phase:"review"}, state)
  |
  +- CodeReviewerAgent.execute(state):
        +- Reads state.context.architectureDecision
        +- Reviews: quality, scalability, maintainability
        +- callLLM() -> review report
        +- return {
              context: { review: "approved", riskAssessment: ... },
              artifacts: [reviewReport]
            }

mergeStepResult():
  state.artifacts = [adr, reviewReport]
  state.context.review = "approved"
```

### Step 3: DeveloperAgent + UIDeveloperAgent (PARALLEL, implementation phase)

```
executeParallelSteps([developer, ui-developer], state)
  |
  +- Promise.allSettled([
  |     executeStep("developer", state),
  |     executeStep("ui-developer", state)
  |   ])
  |
  |  +- DeveloperAgent.execute(state): ---------------------------------+
  |  |  +- Reads state.context.architectureDecision <- from Architect   |
  |  |  +- Reads state.context.userAnswers <- stack choice              |
  |  |  +- buildTechStackSection(userAnswers):                          |
  |  |  |   "- TypeScript (strict mode)                                 |
  |  |  |    - Frontend: React 19                                       |
  |  |  |    - Backend: Express.js (Node.js)                            |
  |  |  |    - Database: PostgreSQL"                                    |
  |  |  +- selectLibraryForTask(task, userAnswers):                     |
  |  |  |   userAnswers.backend = "express" -> "/expressjs/express"     |
  |  |  +- requestMCP("context7", {library:"/expressjs/express"})       |
  |  |  +- generateImplementation() -> backend code                     |
  |  |  +- generateTests() -> unit tests                                |
  |  |  +- runTests() -> { passed:5, failed:0, coverage:89% }          |
  |  |  +- return {                                                     |
  |  |        artifacts: [codeArtifact, testArtifact],                  |
  |  |        context: { implementation, tests, test_results }          |
  |  |      }                                                           |
  |  +------------------------------------------------------------------+
  |
  |  +- UIDeveloperAgent.execute(state): -------------------------------+
  |  |  +- Reads state.context.architectureDecision                     |
  |  |  +- Generates React components                                   |
  |  |  +- return {                                                     |
  |  |        artifacts: [frontendCodeArtifact],                        |
  |  |        context: { frontendCode: "..." }                          |
  |  |      }                                                           |
  |  +------------------------------------------------------------------+
  |
  +- mergeParallelResults():
        state.artifacts = [adr, reviewReport, backendCode, tests, frontendCode]
        state.context.implementation = "..."       <- from Developer
        state.context.frontendCode = "..."         <- from UI Developer
        state.context["developer_implementation_findings"] = {...}     <- namespace
        state.context["ui-developer_implementation_findings"] = {...}  <- namespace
```

### Step 4: TesterAgent (testing phase)

```
executeStep(step={role_id:"tester", phase:"testing"}, state)
  |
  +- TesterAgent.execute(state):
        +- Reads state.context.implementation <- from Developer
        +- getArtifactsByType(state, "code") -> [backendCode, frontendCode]
        +- getArtifactsByType(state, "adr") -> [adr]
        +- getArtifactsByType(state, "test") -> [unitTests]
        +- buildArtifactContext():
        |   "ARCHITECTURE DECISION (from Architect): # ADR: ..."
        |   "CODE ARTIFACTS: [typescript] by developer, [typescript] by ui-developer"
        |   "EXISTING UNIT TESTS (framework: vitest): 1 artifact(s)"
        +- generateTestPlan() -> { scenarios: [...], edgeCases: [...] }
        +- generateE2ETests() -> Playwright tests
        +- return {
              artifacts: [e2eTestArtifact, testReportArtifact],
              context: { testPlan, e2eTests }
            }

mergeStepResult():
  state.artifacts = [adr, reviewReport, backendCode, tests, frontendCode, e2eTests, report]
```

## Phase 4: Finalization

```
WorkflowEngine.executeWorkflow() completes:
  |
  +- Total duration calculated
  +- finalizeAndPersistMetrics():
  |     +- Persist metrics to DB
  |     +- MetricsOptimizer: learning loop analysis
  |     +- RetrospectiveAgent: generate retrospective report
  |
  +- return WorkflowExecutionResult:
        +- success: true
        +- duration: "~25 min"
        +- steps: 5 (4 sequential groups)
        +- artifacts: 7 (adr, review, 2x code, tests, e2e, report)
        +- finalState.context: {
              architectureDecision,    <- from Architect
              userAnswers,             <- from User
              review,                  <- from Code-Reviewer
              implementation,          <- from Developer
              frontendCode,            <- from UI-Developer
              testPlan,                <- from Tester
              e2eTests                 <- from Tester
            }
```

---

## Data Flow Summary

```
User -> CLI -> WorkflowEngine
               |
               +- [1] Architect:     task + userAnswers -> ADR + architectureDecision
               +- [2] Code-Reviewer: architectureDecision -> review report
               +- [3] Developer:     architectureDecision + userAnswers -> backend code + tests
               +- [3] UI-Developer:  architectureDecision -> frontend code      <- PARALLEL
               +- [4] Tester:        all artifacts + implementation -> E2E tests + report
```

## Artifact Pipeline

```
Step 1 (Architect):
  state.artifacts = [adr]

Step 2 (Code-Reviewer):
  state.artifacts = [adr, reviewReport]

Step 3 (Developer + UI-Dev, parallel):
  state.artifacts = [adr, reviewReport, backendCode, unitTests, frontendCode]

Step 4 (Tester):
  state.artifacts = [adr, reviewReport, backendCode, unitTests, frontendCode, e2eTests, testReport]
```

## Key Infrastructure

| Layer | Component | Purpose |
|-------|-----------|---------|
| Resilience | CircuitBreaker | Prevents cascading agent failures |
| Resilience | IterationManager | Up to 3 retries with exponential backoff |
| Resilience | Timeout | Per-step timeout (parseTimeout: "60m" -> ms) |
| Quality | TestEnforcementValidator | Blocks step if tests fail |
| Quality | PrincipleValidator | Validates BMAD principles (zero_ambiguity, etc.) |
| Quality | ApprovalCheckpoint | Human approval gate + YOLO mode bypass |
| Observability | MetricsCollector | Duration, success rate, phase timing |
| Observability | PhaseManager | Phase transition tracking |
| Learning | MetricsOptimizer | Post-run analysis and optimization |
| Learning | RetrospectiveAgent | Generates retrospective report |

## LLM Provider Fallback

```
1. Session mode ($0, Claude CLI)  -> preferred
2. API mode (ANTHROPIC_API_KEY)   -> fallback
3. Heuristics (~65% accuracy)     -> last resort
```

## Russian Language Support

| Component | Pattern | Example |
|-----------|---------|---------|
| ComplexityAnalyzer | `/(создать\|создай\|разработать\|...)/` | "создать" -> isCreation=true |
| ArchitectAgent | `/(создать\|построить\|новый сервис\|...)/` | needsUserInput=true |
| WorkflowEngine | `/[а-яА-ЯёЁ]/` | Language detection -> 'ru' |
| Trigger keywords | `"создать сервис", "новый сервис"` | Workflow trigger matching |

---

**Version**: 1.0
**Date**: 2026-02-11
**Workflow**: architecture_design (5 steps, 4 phases)
**Test coverage**: 656 tests, 39 suites
