# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive bilingual documentation (EN/RU)
- Documentation auto-generation scripts from JSON configs
- Agent catalog documentation (24 agents)
- Workflow catalog documentation (10 workflows)
- Skills catalog documentation (85 skills)

## [0.6.0] - 2026-01-XX

### Added
- **BMAD Phase 6**: Documentation & Templates
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
