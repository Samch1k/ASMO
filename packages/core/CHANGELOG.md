# @asmo/core Changelog

All notable changes to @asmo/core will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-02

### Added - Library-First Architecture
- Config fallback chain: `.cursor/config` → `~/.asmo/config` → `bundled templates`
- WorkflowEngine automatically loads from first available location
- ConfigLoader uses fallback for roles, skills, and schemas
- Bundled templates always available as final fallback
- Library can now be used standalone without Claude Code environment

### Changed - npm Publication Ready
- WorkflowEngine.initialize() now has fallback chain for workflows
- ConfigLoader.getConfigLoader() uses fallback for config paths
- SkillMDLoader derives skills path from configBasePath automatically
- All hardcoded `.cursor/config` paths replaced with fallback logic

### Removed - Duplication Cleanup
- No standalone WorkflowRegistry (WorkflowEngine already manages workflows)
- Hardcoded `.cursor/config` dependencies eliminated

### Technical Details
- Fallback locations checked in order until one succeeds
- Bundled templates path: `packages/core/templates/`
- Templates always included in published package via `package.json` files field
- Backward compatible: existing `.cursor/config` continues to work

## [0.1.0] - 2025-01-XX

### Initial Development
- BMAD (Buy-Make-Analyze-Develop) system implementation
- Dynamic orchestration with multi-agent collaboration
- Claude Code adapter for hybrid analysis
- Party Mode and brainstorming sessions
- MCP integration support
