# LLM Provider Factory

ASMO uses a dual-provider architecture that allows agents to call LLMs through two modes: **Session** (free, uses Claude CLI) and **API** (pay-per-use, uses Anthropic SDK).

## Architecture Overview

```
Agent.callLLM()
    |
    v
getLLMProvider(mode?)
    |
    +-- 'auto' (default) --> Session available? --> SessionProvider ($0)
    |                                |
    |                                +--> No --> API key set? --> AnthropicProvider
    |                                                |
    |                                                +--> No --> Error
    +-- 'session'  --> SessionProvider
    +-- 'anthropic' --> AnthropicProvider
```

### Key Files

| File | Purpose |
|------|---------|
| `src/llm/provider-factory.ts` | Factory with auto-selection logic |
| `src/llm/session-provider.ts` | Claude CLI-based provider |
| `src/llm/anthropic-provider.ts` | Anthropic API-based provider |
| `src/llm/types.ts` | Shared interfaces (`ILLMProvider`, `LLMResponse`, etc.) |

## Provider Comparison

| Aspect | Session Mode | API Mode |
|--------|-------------|----------|
| Provider | Claude CLI (`claude -p`) | Anthropic SDK |
| Cost | **$0** (existing subscription) | Pay-per-token |
| Availability | `claude --version` check | `ANTHROPIC_API_KEY` env var |
| Default Model | sonnet | sonnet (configurable) |
| Token Tracking | Not available | Full usage metrics |
| Best For | Development, local testing | CI/CD, production, billing |

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | API mode only | Anthropic API key |

Session mode requires no configuration -- it uses the locally installed Claude CLI.

### Explicit Provider Selection

```typescript
import { getLLMProvider } from '@asmo/core'

// Auto-select (default): Session > API > Error
const provider = getLLMProvider()

// Force specific mode
const session = getLLMProvider('session')
const api = getLLMProvider('anthropic')
```

## Usage in Agents

Agents use `callLLM()` and `callLLMForJSON()` from `BaseAgent`, which internally use the factory:

```typescript
// Text response
const response = await this.callLLM('Analyze this code', {
  model: 'sonnet',
  temperature: 0.3
})

// Structured JSON response
const result = await this.callLLMForJSON<AnalysisResult>(prompt, {
  model: 'sonnet',
  temperature: 0.2
})
```

## Fallback Chain

When no LLM provider is available, components that depend on LLM gracefully degrade:

1. **ComplexityAnalyzer**: Falls back to keyword-based heuristic analysis
2. **PhaseDetector**: Falls back to first-phase strategy
3. **Agent execution**: Returns error result (no silent fallback)

## Cost Model

### Session Mode ($0)
Uses your existing Claude subscription. No additional cost.

### API Mode (Pay-Per-Token)

| Model | Input | Output |
|-------|-------|--------|
| opus | $15/MTok | $75/MTok |
| sonnet | $3/MTok | $15/MTok |
| haiku | $0.80/MTok | $4/MTok |

## Singleton Pattern

The factory follows the project-wide singleton pattern:

```typescript
import { getLLMProviderFactory } from '@asmo/core'

const factory = getLLMProviderFactory()       // Get or create singleton
const providers = factory.getAvailableProviders()  // Check availability
```
