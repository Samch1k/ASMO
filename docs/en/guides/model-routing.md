# Model Routing Guide

ASMO automatically selects the optimal Claude model (Opus, Sonnet, or Haiku) based on task characteristics.

## Model Tiers

| Model | Best For | Speed | Cost |
|-------|----------|-------|------|
| **Opus** | Complex reasoning, architecture, security | Slow | High |
| **Sonnet** | General development, code review, features | Medium | Medium |
| **Haiku** | Quick fixes, documentation, formatting | Fast | Low |

## Routing Rules

### 1. Complexity Score

Primary routing method based on task complexity:

```
Score 0-30   → Haiku   (trivial, simple)
Score 31-70  → Sonnet  (medium, complex)
Score 71-100 → Opus    (enterprise)
```

### 2. Task Type Override

Specific task types override complexity routing:

```typescript
// Always Haiku
'quick_fix', 'documentation', 'code_formatting', 'typo_fix'

// Always Sonnet
'feature', 'bug_fix', 'code_review', 'testing', 'refactoring'

// Always Opus
'architecture_design', 'security_audit', 'system_design'
```

### 3. Keyword Inference

When no explicit routing, keywords in description are analyzed:

**Opus keywords:** `architect`, `design system`, `security`, `enterprise`, `scalability`

**Haiku keywords:** `simple`, `quick`, `typo`, `trivial`, `minor fix`

## Configuration

### Custom Thresholds

```typescript
import { getTaskRouter } from '@asmo/core'

const router = getTaskRouter({
  complexityThresholds: {
    haiku: 20,   // More tasks to Haiku
    sonnet: 60   // More tasks to Opus
  }
})
```

### YAML Configuration

Configure in `models.yaml`:

```yaml
routing:
  default_model: sonnet

  complexity_thresholds:
    haiku_max: 30
    sonnet_max: 70

  task_type_overrides:
    quick_fix: haiku
    security_audit: opus

  keyword_inference:
    opus:
      - architect
      - security
    haiku:
      - simple
      - typo
```

## Usage Examples

### Explicit Complexity

```typescript
const task = {
  id: 'task-1',
  description: 'Implement user dashboard',
  complexity: { score: 45, level: 'medium' }
}

const routing = router.route(task)
// routing.model === 'sonnet'
```

### Task Type Override

```typescript
const task = {
  id: 'task-2',
  description: 'Review security implementation',
  taskType: 'security_audit'
}

const routing = router.route(task)
// routing.model === 'opus' (type override)
```

### Keyword Inference

```typescript
const task = {
  id: 'task-3',
  description: 'Fix a simple typo in README'
}

const routing = router.route(task)
// routing.model === 'haiku' (keyword: 'simple', 'typo')
```

### Model Override

Force a specific model:

```typescript
const task = {
  id: 'task-4',
  description: 'Quick analysis',
  preferredModel: 'opus'  // Override routing
}

const result = await orchestrator.executeTask(task)
// Uses Opus regardless of routing
```

## Cost Optimization

### Estimated Costs (per 1M tokens)

| Model | Input | Output |
|-------|-------|--------|
| Opus | $15 | $75 |
| Sonnet | $3 | $15 |
| Haiku | $0.25 | $1.25 |

### Cost Estimation

```typescript
import { getYamlConfigLoader } from '@asmo/core'

const config = getYamlConfigLoader()
const cost = config.estimateCost('sonnet', 1000, 500)

console.log(cost.total)  // Estimated cost
```

## Monitoring

### Routing Statistics

```typescript
import { getRoutingLogger } from '@asmo/core'

const logger = getRoutingLogger()
const stats = logger.getStats()

console.log(stats.byModel)
// { opus: 10, sonnet: 50, haiku: 40 }

console.log(stats.successRate)
// 0.95
```

### Recent Decisions

```typescript
const recent = logger.getRecentEntries(10)
for (const entry of recent) {
  console.log(entry.decision.selectedModel)
  console.log(entry.outcome?.success)
}
```

## Best Practices

1. **Start with complexity scores** - Most accurate routing
2. **Use task types** - For consistent routing by category
3. **Monitor usage** - Adjust thresholds based on actual patterns
4. **Override when needed** - `preferredModel` for special cases
5. **Consider cost** - Balance quality vs cost for your use case

## See Also

- [Dynamic Orchestrator](../concepts/dynamic-orchestrator.md)
- [YAML Configuration](../guides/yaml-config.md)
