# ASMO -- UX Concept

## Overview

ASMO (AI System for Multiagent Orchestration) is a **CLI-first tool** with no graphical user interface. Every interaction happens through the `asmo` command and its subcommands. This design choice is deliberate: ASMO targets developers who already live in the terminal, and a CLI integrates directly into existing shell workflows, scripts, and CI pipelines.

## Primary Interface

The CLI exposes six top-level subcommands:

| Command | Purpose |
|---|---|
| `asmo run <task>` | Analyze a task and execute the selected workflow |
| `asmo suggest <task>` | Return a quick JSON recommendation (no execution) |
| `asmo analyze <task>` | Deep complexity analysis |
| `asmo workflow [name]` | List all workflows or execute a specific one |
| `asmo task <command>` | Manage tasks (create, list, start, complete, fail) |
| `asmo stats` | Show usage statistics for agents, workflows, and skills |

Each subcommand supports flags for progressive disclosure -- simple invocations produce clean, focused output, while `--verbose`, `--dry-run`, and `--json` unlock increasingly detailed information for power users.

## Bilingual Support (EN + RU)

ASMO auto-detects the user's language by scanning the task string for Cyrillic characters. If Cyrillic is found, output switches to Russian; otherwise English is used. No configuration flags are needed. This approach was chosen because the core team is bilingual and Cyrillic detection is a trivial, zero-dependency check.

## Progressive Disclosure

The UX follows a layered model:

1. **Layer 0 -- Minimal.** `asmo run "fix the bug"` produces a concise summary: workflow chosen, phases completed, result.
2. **Layer 1 -- Detailed.** `asmo run "fix the bug" --verbose` shows each agent step, LLM calls, and timing.
3. **Layer 2 -- Analysis only.** `asmo run "fix the bug" --dry-run` shows the full execution plan without performing any work.
4. **Layer 3 -- Machine-readable.** `asmo suggest "fix the bug"` returns structured JSON for programmatic consumption.

## Agent Personalities (BMAD)

ASMO agents are not generic executors. Under the BMAD methodology, key agents carry distinct personalities that influence their behavior and output:

| Agent | Personality | Role |
|---|---|---|
| **Amelia** | Exacting, blocks on failing tests | Quality Assurance |
| **Winston** | Methodical, insists on architecture review | Architect |
| **Bob** | Blunt, blocks on ambiguity | Product Owner |
| **John** | Pragmatic, favors working code | Developer |

These personalities make interactions memorable and, more importantly, enforce quality principles naturally -- Amelia will not sign off on untested code, and Bob will reject vague requirements.

## Output Design

CLI output uses emoji indicators for quick visual parsing:

- `...` -- work in progress (spinner/phase indicator)
- Checkmarks and crosses -- success/failure per phase
- Analysis sections -- structured key-value pairs
- Progress -- phase-based (`Phase 1/3: Investigation`) rather than raw log streams

Results are structured into clear sections: analysis, execution progress, and final summary with metrics (duration, files modified, test results).

## Zero-Config Philosophy

ASMO works out of the box. The `@asmo/core` package bundles all 27 workflow definitions, 25 role files, and 55 skill templates. No configuration files need to be created before first use. For customization, ASMO supports a three-tier configuration hierarchy (project, user home, bundled defaults) where overrides cascade naturally.

## System Scale

| Resource | Count |
|---|---|
| Agents | 25 |
| Workflows | 27 |
| Skills | 55 |
| Roles | 25 (6 core + 15 specialized + 4 validation) |
| Packages | `@asmo/core` + `@asmo/cli` |
