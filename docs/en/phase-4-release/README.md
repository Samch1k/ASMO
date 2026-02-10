# ASMO v1.1.0 -- Release Overview

## Current Version

**Version:** 1.1.0
**Status:** In active development
**Packages:** `@asmo/core` + `@asmo/cli`

## Summary

ASMO (AI System for Multiagent Orchestration) is a production-ready multi-agent orchestration system that automatically routes tasks to specialized AI agents and workflows. All core features are implemented and operational.

## Core Features

| Feature | Description |
|---------|-------------|
| Task Analysis | LLM-powered complexity scoring and classification across 14 categories |
| Workflow Execution | 27 defined workflows covering development, testing, planning, and release |
| Multi-Agent Collaboration | 25 specialized agents with role-based coordination |
| Adaptive Phase Detection | LLM-powered phase joining -- workflows can be entered at any phase |
| Dual LLM Provider | Session ($0 via Claude CLI) / API (pay-per-use) / Heuristics (offline) |
| MCP Integration | 8 MCP servers for extended tool access |
| YOLO Mode | Auto-approve low-complexity tasks (score < 30) via ApprovalCheckpoint |

## System Inventory

| Resource | Count |
|----------|-------|
| Agents | 25 (6 core + 15 specialized + 4 validation) |
| Workflows | 27 |
| Skills | 55 (across 12 categories) |
| Roles | 25 |

## Key Changes in v1.1.0

- Phase detection metadata now recorded in state for observability
- 4 PRD audit gaps resolved: phase detection, `--workflow` flag, race condition, YOLO bypass
- IterationManager, CircuitBreaker, ContextCascade, and YOLO score wired into WorkflowEngine
- Project artifacts cleaned up, YAML dependency unified (`yaml` only, removed `js-yaml`)
- Skills system consolidated from 85 to 55 (-35%)
- TEA testing workflows consolidated from 8 to 3 (-62%)
- MetricsOptimizer learning loop wired into `WorkflowEngine.initialize()`

## Ready For

- **Development use** -- fully functional CLI for task orchestration
- **Evaluation** -- demo scripts and example tasks provided for assessment
- **Contribution** -- monorepo structure with clear package boundaries

## Further Reading

| Document | Description |
|----------|-------------|
| [Demo Script](./demo-script.md) | 3 guided scenarios to explore ASMO capabilities |
| [Demo Data](./demo-data.md) | 5 example tasks with expected behavior and outputs |
| [Feature Matrix](./feature-matrix.md) | Comprehensive status of all agents, workflows, skills, and features |
| [Known Issues](./known-issues.md) | Current limitations and roadmap |
| [Release Notes](./release-notes.md) | Detailed changelog for v1.1.0 and prior versions |
