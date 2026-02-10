# ASMO -- Vision / One-Pager

## What is ASMO?

**ASMO (AI System for Multiagent Orchestration)** transforms AI from a "helpful assistant" into an **autonomous team**. It is a multi-agent orchestration system built in TypeScript that implements the BMAD (Breakthrough Method of Agile AI Driven Development) methodology.

Instead of a single AI responding to prompts, ASMO coordinates **25 specialized agents** across **27 structured workflows**, drawing on **55 skills** and **25 roles** to deliver production-grade results.

## The Core Idea

Modern software tasks -- feature implementation, security audits, performance optimization -- are not single-step problems. They require planning, design, coding, testing, and review. ASMO models this reality by routing each task through the right combination of agents and workflows, just as a well-run engineering team would.

## Key Capabilities

| Capability | Description |
|---|---|
| **Adaptive Workflow Selection** | Automatically picks the best workflow for any given task |
| **Intelligent Task Routing** | Routes work to the most qualified agent(s) based on complexity and domain |
| **Automated Complexity Analysis** | Scores tasks 0--100 across five levels (trivial, low, medium, high, critical) |
| **Dual LLM Strategy** | Session mode ($0 via Claude CLI) -> API (pay-per-token) -> Heuristics (offline) |
| **Multi-Agent Collaboration** | Sequential, parallel, brainstorming (Party Mode), and adversarial patterns |

## Differentiators

- **YOLO Mode** -- Low-complexity tasks are auto-approved and executed without human intervention, reducing latency to under 60 seconds.
- **Party Mode** -- Multiple agents brainstorm simultaneously, producing richer architectural decisions and ADRs.
- **Adversarial Review** -- A dedicated reviewer agent challenges code with escalating severity, catching issues that conventional review misses.
- **Adaptive Phase Detection** -- Workflows can be joined at any phase based on existing artifacts, avoiding redundant work.
- **$0 Development Cost** -- The default Session provider uses the Claude CLI at no additional API cost.

## Architecture at a Glance

```
User Task
  |
  v
ComplexityAnalyzer --> WorkflowSelector --> PhaseDetector
                                              |
                                              v
                                        WorkflowEngine
                                         /    |    \
                                    Agent  Agent  Agent
                                     |       |       |
                                    LLM    LLM     MCP
```

## Design Principles

ASMO is grounded in BMAD methodology:

1. **Business-driven** -- Every workflow maps to a real business outcome.
2. **Multi-agent** -- Specialized agents collaborate rather than one generalist doing everything.
3. **Adaptive** -- The system adjusts to task complexity, existing artifacts, and available resources.
4. **Developer-first** -- Native TypeScript, zero heavy dependencies, CLI-native interface.

## Positioning

ASMO is a **lightweight, native TypeScript alternative** to frameworks like LangGraph, CrewAI, and AutoGen. Where those systems require Python runtimes, complex dependency graphs, or cloud infrastructure, ASMO runs locally from a single `asmo run` command.

## At a Glance

| Metric | Value |
|---|---|
| Agents | 25 |
| Workflows | 27 |
| Skills | 55 |
| Roles | 25 (6 core + 15 specialized + 4 validation) |
| Language | TypeScript (strict mode) |
| LLM Modes | Session ($0) / API / Heuristics |
| Package Manager | pnpm (monorepo) |
