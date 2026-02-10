# Problem Statement

## Context

AI-assisted development has become mainstream, yet the tooling remains fundamentally single-threaded: one human, one assistant, one prompt at a time. As tasks grow in complexity -- spanning multiple files, concerns, and domains -- this model breaks down. Developers resort to ad-hoc prompt chains, manual agent coordination, and expensive API calls with no structured quality gates.

## Problems ASMO Addresses

### 1. High Cost of LLM API Calls

Every interaction with a cloud-hosted LLM incurs token costs. During iterative development -- debugging, refactoring, testing -- these costs accumulate rapidly. Most frameworks offer no cost-aware routing.

### 2. Lack of Structured Workflows for Complex Tasks

When a task requires architecture review, implementation, testing, and documentation, developers must manually orchestrate each step. There is no standard way to define, reuse, or adapt multi-step AI workflows.

### 3. Dependency on External Frameworks

Existing orchestration frameworks (LangGraph, CrewAI, AutoGen) require Python, introduce heavy dependency trees, and impose their own runtime models. TypeScript-native projects face a language boundary.

### 4. Manual Routing Between Specialized Agents

Deciding which agent or prompt to use for which subtask is left entirely to the developer. There is no automated complexity analysis or agent-to-task matching.

### 5. No Adaptive Complexity Analysis

All tasks are treated equally regardless of their actual complexity. A one-line typo fix gets the same heavyweight pipeline as a cross-service refactoring.

### 6. No Quality Gates or Principle Enforcement

Without structured checkpoints, AI-generated output bypasses review, testing, and architectural standards. Errors propagate unchecked through the development cycle.

## Problem-to-Solution Mapping

| Problem | ASMO Solution | Component |
|---|---|---|
| High LLM API costs | Dual LLM: Session ($0) -> API -> Heuristics | `LLMProviderFactory` |
| No structured workflows | 27 predefined workflows with phase management | `WorkflowEngine`, `PhaseManager` |
| External framework dependency | Native TypeScript, zero Python, minimal deps | Core architecture |
| Manual agent routing | Automated scoring and routing (0--100 scale) | `ComplexityAnalyzer`, `TaskRouter` |
| No complexity analysis | 5-level classification with keyword + LLM analysis | `ComplexityAnalyzer` |
| No quality gates | Approval checkpoints, adversarial review, circuit breakers | `ApprovalCheckpoint`, `CircuitBreaker` |
| Redundant work on partial tasks | Adaptive phase detection from existing artifacts | `PhaseDetector`, `ContextAnalyzer` |
| No cost visibility | Metrics collection and cost tracking per workflow | `MetricsCollector` |

## Who Is Affected

- **Individual developers** who pay for API usage out of pocket.
- **Engineering teams** that lack repeatable AI-assisted workflows.
- **Architects** who need structured multi-stakeholder design processes.
- **DevOps engineers** who want automated, auditable deployment pipelines.

## What Success Looks Like

A developer runs a single command -- `asmo run "implement OAuth2 with PKCE"` -- and the system automatically analyzes complexity, selects the appropriate workflow, routes work through the right agents, enforces quality gates, and produces tested, reviewed output. Total API cost: $0 in Session mode.
