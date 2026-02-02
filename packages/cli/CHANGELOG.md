# @asmo/cli Changelog

All notable changes to @asmo/cli will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-02-02

### Added - Library-First CLI
- CLI now uses @asmo/core v1.0.0 as foundation
- Adaptive workflow selection in `run` command
- Real agents from @asmo/core (no more SimpleCLIAgent)
- Config fallback support (works with or without `.cursor/config`)

### Changed - Simplified Architecture
- **run command**: Now uses WorkflowEngine for all operations
  - Automatic workflow selection based on task complexity
  - Uses WorkflowEngine.selectWorkflowAdaptively() for analysis
  - Uses WorkflowEngine.execute() for execution

- **workflow command**: Simplified to ~195 lines (was 613)
  - Loads workflows from WorkflowEngine (with fallback)
  - Uses real agents from AgentRegistry
  - No more hardcoded workflow definitions

### Removed - Duplication Eliminated
- **skill command**: Deleted (functionality merged into `run`)
- **SimpleCLIAgent class**: 85 lines removed
- **CLIAgentRegistry class**: Removed
- **AGENT_PROMPTS dictionary**: Removed (uses RoleManager)
- **BUILT_IN_WORKFLOWS**: Removed (uses WorkflowEngine)
- All Claude Code-specific hardcoded paths

### Migration from 0.x
If upgrading from 0.x versions:

**Before:**
```bash
asmo skill "Add authentication"  # Separate command
```

**After:**
```bash
asmo run "Add authentication"    # Now uses adaptive workflow selection automatically
```

The `run` command now includes all adaptive analysis features that were in `skill`.

## [0.1.0] - 2025-01-XX

### Initial Development
- Basic CLI commands (run, analyze, workflow, task)
- SimpleCLIAgent for quick prototyping
- Integration with Claude Code
