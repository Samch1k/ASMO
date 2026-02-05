# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-05 (@asmo/core)

### Added - Entry Point Refactoring

- **resolveInput() method**: New private method in WorkflowEngine for unified input resolution
  - 2-strategy resolution: Workflow ID → Natural language
  - Reuses existing `WorkflowSelector` and `ComplexityAnalyzer` (98% code reuse)
  - Comprehensive JSDoc documentation with resolution flow details

### Changed

- **WorkflowEngine.execute()**: Simplified from 92 to 20 lines (-78% complexity)
  - Delegates input resolution to `resolveInput()`
  - Delegates execution to existing `executeWorkflow()` method
  - Cleaner separation of concerns following Single Responsibility Principle
- **JSDoc Documentation**: Enhanced with detailed architecture notes
  - Entry point resolution strategies documented
  - Priority order and fallback logic explained
  - Type safety improved with TypeScript generics

### Removed

- **MenuCommandRouter class**: 333 lines deleted
  - No breaking changes - internal refactoring only
- **Duplicated logic**: Removed redundant input parsing code from execute()

### Technical

- **Net Code Reduction**: -290 lines (-400 removed, +110 added)
- **Test Coverage**: 29 new tests for resolveInput() method with 100% coverage
- **Build Status**: Zero TypeScript errors, all tests passing
- **Architecture**: Avoided creating 6th coordinator, kept system at 4 coordinators

### Migration Notes

- No API changes - this is an internal refactoring
- All existing code continues to work without modifications
- Menu commands, workflow IDs, and natural language input all supported as before

## [1.0.0] - 2025-02-02 (@asmo/core, @asmo/cli)

### Added - Library-First Architecture for npm Publication

- **Config Fallback Chain**: `.cursor/config` → `~/.asmo/config` → `bundled templates`
- **WorkflowEngine Fallback**: Automatically loads workflows from first available location
- **ConfigLoader Fallback**: Loads roles, skills, and schemas with fallback
- **Standalone Library Support**: Can be used without Claude Code environment
- **Bundled Templates**: Always available as final fallback in npm package

### Changed - CLI Refactoring

- **run command**: Now uses hybrid analysis (BMAD + ClaudeCodeAdapter)
- **workflow command**: Simplified to use WorkflowEngine and real agents from @asmo/core
- CLI is now thin wrapper around @asmo/core functionality

### Removed - Duplication Cleanup

- Deleted `asmo-skill.ts` (functionality merged into `run.ts`)
- Removed `SimpleCLIAgent` (85 lines of duplication)
- Removed `CLIAgentRegistry` (uses AgentRegistry from @asmo/core)
- Removed `AGENT_PROMPTS` dictionary (uses RoleManager from @asmo/core)
- Removed `BUILT_IN_WORKFLOWS` (uses WorkflowEngine)
- Eliminated all hardcoded `.cursor/config` dependencies

### Technical Details

- WorkflowEngine checks fallback paths in order until one succeeds
- Bundled templates path: `packages/core/templates/`
- Templates included in published package via `package.json` files field
- Backward compatible: existing `.cursor/config` setup continues to work
- Both @asmo/core and @asmo/cli ready for npm publication

## [3.0.0] - 2026-02-01

### Added

- **Dynamic Orchestrator v3.0**: Native TypeScript orchestration engine

#### Core Features

- **DynamicOrchestrator** (`getDynamicOrchestrator()`)
  - Native TypeScript replacement for external orchestration dependencies
  - Task routing, execution, and result aggregation
  - Workflow execution with multi-task support
  - Routing preview for cost estimation
  - Comprehensive statistics tracking

- **Intelligent Model Routing** (`TaskRouter`)
  - Automatic model selection: Haiku (0-30), Sonnet (31-70), Opus (71-100)
  - Task type overrides (quick_fix → Haiku, security_audit → Opus)
  - Keyword detection for smart routing
  - Configurable complexity thresholds
  - Alternative model suggestions

- **Dual Execution Modes** (`ExecutorFactory`)
  - **Session Mode** ($0): Uses Claude subscription for development
  - **API Mode** (pay-per-use): Direct Anthropic API for production
  - **Auto Mode**: Intelligent fallback between modes
  - Cost tracking and token usage metrics

- **AgentExecutor** with reliability features
  - Retry with exponential backoff
  - Configurable timeouts
  - Error categorization (retryable vs fatal)
  - Circuit breaker integration

#### Reliability

- **Circuit Breaker** (`CircuitBreaker`, `getCircuitBreakerManager()`)
  - State machine: CLOSED → OPEN → HALF_OPEN → CLOSED
  - Configurable failure thresholds and recovery timeouts
  - Event-based monitoring
  - Named breakers for different services

- **Zod Validation** (`getInputValidator()`, `withValidation()`)
  - `TaskInputSchema` - Task input validation
  - `AgentStateSchema` - Agent state validation
  - `AgentOutputSchema` - Agent output validation
  - Validation middleware for type-safe functions

#### Configuration

- **YAML-based Configuration**
  - `agents.yaml` - Agent definitions with skills and model preferences
  - `models.yaml` - Model tiers, routing rules, cost estimation
  - `YamlConfigLoader` for TypeScript integration

#### Documentation

- `docs/en/concepts/dynamic-orchestrator.md`
- `docs/en/guides/model-routing.md`
- `docs/en/guides/execution-modes.md`
- `docs/en/guides/reliability.md`
- Russian translations in `docs/ru/`

#### Tests

- `dynamic-orchestrator.test.ts` (14 tests)
- `task-router.test.ts` (22 tests)
- `circuit-breaker.test.ts` (30 tests)
- `validation.test.ts` (28 tests)
- **Total: 94 new tests**

### Changed

- Replaced LangGraph StateGraph with native DynamicOrchestrator
- Updated README.md with v3.0 features and examples
- Extended exports in `index.ts`

### Removed

- `orchestrator.ts` - LangGraph-based orchestrator (replaced by DynamicOrchestrator)

### Technical

- Zero TypeScript errors
- Build output: core 1.35MB, CLI 10.15KB
- All 94 new tests passing

## [0.7.0] - 2026-02-01

### Added

- **BMAD Integration**: Full integration of BMAD Method features

#### Core Concepts

- **Adversarial Review** (`AdversarialReviewSession`)
  - Mandatory issue finding in code review
  - 3-level escalation with increasing scrutiny
  - Configurable minimum issues requirement
- **Advanced Elicitation** (`ElicitationManager`)
  - 5 techniques: First Principles, Red Team/Blue Team, Pre-mortem, Socratic, Devil's Advocate
  - Multi-technique application with insight deduplication
  - Configurable per-workflow application
- **Context Cascade** (`ContextCascade`)
  - Cascading context flow: Product Brief → PRD → Architecture → Epics → Stories
  - Automatic dependency resolution
  - Context chain building for workflows
- **Document Registry** (`DocumentRegistry`)
  - Centralized document storage and retrieval
  - Version tracking and metadata management
  - File system persistence in `_asmo-output/`
- **Document Sharding** (`DocumentSharder`)
  - Split large markdown files by headings
  - Configurable token limits per file
  - Automatic index generation with cross-references

#### New Agents (4)

- `AnalystAgent` - Strategic analysis, market research, brainstorming, SWOT analysis
- `TechWriterAgent` - Documentation specialist for API docs, user guides, READMEs
- `TestArchitectAgent` (TEA) - Test strategy, risk-based testing, quality gates
- `AdversarialReviewerAgent` - Critical code review that MUST find issues

#### New Workflows (18)

- **Planning Workflows (7)**:
  - `11-adversarial-review` - Critical code review with mandatory issue finding
  - `12-create-product-brief` - Strategic product vision document
  - `13-create-prd` - Product Requirements Document generation
  - `14-create-ux-design` - UX specifications and wireframes
  - `15-create-epics-and-stories` - Break down into work units
  - `16-check-implementation-readiness` - Gate validation
  - `17-sprint-planning` - Sprint initialization and task allocation
- **Implementation Workflows (3)**:
  - `18-correct-course` - Mid-sprint scope adjustments
  - `19-retrospective` - Post-epic lessons learned
  - `20-automate-tests` - Generate test suites for existing features
- **TEA Testing Workflows (8)**:
  - `tea-1-risk-assessment` - Identify testing risks and priorities
  - `tea-2-test-strategy` - Define comprehensive test approach
  - `tea-3-test-design` - Design test cases and scenarios
  - `tea-4-test-automation` - Automation framework and scripts
  - `tea-5-quality-gates` - Define quality criteria and gates
  - `tea-6-release-readiness` - Validate release criteria
  - `tea-7-regression-analysis` - Analyze regression impact
  - `tea-8-test-maintenance` - Test suite maintenance and optimization

#### Configuration

- `adversarialReview`: enabled, minIssuesRequired, maxRetries
- `elicitation`: enabled, defaultTechniques, applyToWorkflows, maxInsightsPerTechnique
- `contextCascade`: enabled, outputDir, autoLoad
- `documentSharding`: enabled, maxTokensPerFile, splitLevel, minTokensPerSection
- `tea`: enabled, qualityGateThreshold

#### Tests

- `adversarial-review.test.ts` - Adversarial review session tests
- `context-cascade.test.ts` - Context cascade and document registry tests
- `elicitation.test.ts` - Elicitation manager and techniques tests
- `document-sharding.test.ts` - Document sharding utility tests
- `bmad-agents.test.ts` - New agent instantiation and capability tests

### Changed

- Updated agent count from 24 to 28
- Updated workflow count from 10 to 28
- Enhanced `specialized-roles.json` with 4 new role definitions
- Extended `OrchestrationConfig` with 5 new configuration sections

## [0.6.0] - 2026-01-XX

### Added

- **BMAD Phase 6**: Documentation & Templates
- Comprehensive bilingual documentation (EN/RU)
- Documentation auto-generation scripts from JSON configs
- Agent catalog documentation (24 agents)
- Workflow catalog documentation (10 workflows)
- Skills catalog documentation (85 skills)
- Full agent instruction files for all 24 agents
- Workflow checklists for all 10 workflows
- Project templates and configuration examples

### Changed

- Improved agent activation rules
- Enhanced workflow trigger conditions

## [0.5.0] - 2026-01-XX

### Added

- **BMAD Phase 5**: 8 new specialized agents (24 total)
- Security Specialist agent
- Performance Optimizer agent
- Database Specialist agent
- API Designer agent
- Documentation Specialist agent
- Accessibility Expert agent
- Internationalization Specialist agent
- Data Analyst agent

### Changed

- Reorganized agents into categories (core, specialized, validation, business)
- Improved skill matching algorithm

## [0.4.0] - 2026-01-XX

### Added

- **BMAD Phase 4**: Party Mode (Multi-Agent Collaboration)
- `executePartyMode()` method for collaborative sessions
- `createBrainstormingSession()` for structured decisions
- Consensus building with convergence scoring
- Conflict detection and resolution
- ADR (Architecture Decision Record) generation

### Changed

- Enhanced agent communication protocols
- Improved message passing between agents

## [0.3.0] - 2026-01-XX

### Added

- **BMAD Phase 3**: Intelligent Help System
- YOLO Mode for automatic approval bypass
- `YoloModeManager` for configuration and audit
- Complexity-based workflow shortcuts

### Changed

- Refined complexity thresholds
- Improved task analysis heuristics

## [0.2.0] - 2026-01-XX

### Added

- **BMAD Phase 2**: 7 new workflows (10 total)
- `4-bug-fix`: Advanced bug resolution with root cause analysis
- `5-refactoring`: Systematic code quality improvement
- `6-performance-optimization`: Performance analysis and improvement
- `7-security-audit`: Security assessment and mitigation
- `8-architecture-design`: System architecture design
- `9-database-migration`: Safe database schema changes
- `10-api-design`: REST/GraphQL API contract design

### Changed

- Workflow structure standardization
- Enhanced phase breakdown with deliverables

## [0.1.5] - 2026-01-XX

### Added

- **BMAD Phase 1.5**: WorkflowEngine Integration
- `selectWorkflowAdaptively()` method
- Unified `execute()` entry point
- Configuration support via ConfigManager

### Fixed

- 20+ pre-existing TypeScript errors
- Agent initialization race conditions

## [0.1.0] - 2026-01-XX

### Added

- **BMAD Phase 1**: Complexity Analysis
- `ComplexityAnalyzer` class with heuristic-based analysis
- `WorkflowSelector` for automatic workflow recommendation
- 5 complexity levels: trivial, simple, medium, complex, enterprise
- 30 comprehensive tests (77% accuracy)

### Added

- Initial release
- Core library with 37 TypeScript files (~23,000 LOC)
- Monorepo structure with pnpm + Turbo
- 85 generic skills across 12 categories
- 3 initial workflows
- 9 agent roles with instruction files
- Jest test infrastructure
- 3-tier configuration system

## Types of Changes

- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security vulnerability fixes
