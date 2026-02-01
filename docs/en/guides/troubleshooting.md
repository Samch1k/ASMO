# Troubleshooting

Solutions to common issues when using AI1st.

## Installation Issues

### Cannot find module '@ai1st/core'

**Cause:** Package not installed or Node.js version too old.

**Solution:**
```bash
# Check Node.js version (must be 18+)
node --version

# Reinstall package
pnpm install @ai1st/core

# Clear cache if needed
pnpm store prune
pnpm install
```

### TypeScript errors on import

**Cause:** TypeScript configuration issue.

**Solution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true
  }
}
```

### ESM/CommonJS conflict

**Cause:** Module system mismatch.

**Solution:**
```json
// package.json
{
  "type": "module"
}
```

Or use dynamic import:
```typescript
const { WorkflowEngine } = await import('@ai1st/core')
```

## Database Issues

### Database connection failed

**Cause:** PostgreSQL not running or wrong connection string.

**Solution:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Verify connection string format
# postgresql://user:password@host:port/database
```

### Migration errors

**Cause:** Tables don't exist.

**Solution:**
```bash
# Run migrations
psql $DATABASE_URL -f packages/core/migrations/095_add_task_master_tables.sql
```

### Cache issues

**Cause:** Stale cache data.

**Solution:**
```typescript
import { TaskPersister } from '@ai1st/core'

const persister = new TaskPersister(databaseUrl)
await persister.clearCache()
```

## Workflow Issues

### Workflow not found

**Cause:** Workflow not registered or wrong ID.

**Solution:**
```typescript
// List available workflows
const workflows = engine.getWorkflows()
console.log(workflows.map(w => w.id))

// Check registration
await engine.initialize()  // Loads built-in workflows
engine.registerWorkflow(customWorkflow)  // Add custom
```

### Workflow timeout

**Cause:** Step taking too long.

**Solution:**
```typescript
// Increase timeout in workflow definition
{
  "timeout": "60m"  // Increase from default
}

// Or globally
config.set('timeouts.default', 3600000)  // 1 hour
```

### Steps not executing in order

**Cause:** Parallel execution misconfiguration.

**Solution:**
```json
// Ensure order numbers are correct
{
  "steps": [
    { "order": 1, "role_id": "architect" },
    { "order": 2, "role_id": "developer" }  // Runs after order 1
  ]
}
```

## Agent Issues

### Agent not activated

**Cause:** Keywords don't match.

**Solution:**
```typescript
// Check activation rules
const agent = await registry.getAgent('developer')
console.log(agent.activation_rules.trigger_keywords)

// Force include agent
const result = await engine.execute(task, undefined, {
  includeAgents: ['developer']
})
```

### Agent execution failed

**Cause:** MCP server unavailable or permission issue.

**Solution:**
```typescript
// Check MCP access
const agent = await registry.getAgent('devops')
console.log(agent.allowed_mcps)

// Verify MCP servers are running
// Check agent has required permissions
```

### Custom agent not registered

**Cause:** Registration not complete.

**Solution:**
```typescript
// Register manually
import { AgentRegistry } from '@ai1st/core'
import { MyCustomAgent } from './my-agent'

const registry = new AgentRegistry()
registry.registerAgent(new MyCustomAgent())

// Verify
console.log(registry.getAgent('my-custom-agent'))
```

## Complexity Analysis Issues

### Always getting same complexity

**Cause:** Missing context.

**Solution:**
```typescript
// Provide project context
const selection = await engine.selectWorkflowAdaptively(task, {
  projectSize: 'large',
  techStack: ['React', 'Node.js'],
  hasTests: true
})
```

### Complexity seems wrong

**Cause:** Task description unclear.

**Solution:**
```typescript
// Be more specific
// Bad
'Fix bug'

// Good
'Fix authentication bug in login form that causes 500 error when password contains special characters'
```

### YOLO mode not activating

**Cause:** Threshold too low or disabled.

**Solution:**
```bash
# Check settings
export AI1ST_YOLO_ENABLED=true
export AI1ST_YOLO_THRESHOLD=30
```

```typescript
// Or programmatically
config.set('yoloMode.enabled', true)
config.set('yoloMode.complexityThreshold', 30)
```

## Party Mode Issues

### Low convergence

**Cause:** Agents disagree or too many agents.

**Solution:**
```typescript
// Reduce agents or increase rounds
const session = await engine.executePartyMode(
  task,
  ['architect', 'developer'],  // Fewer agents
  undefined,
  {
    maxRounds: 5,  // More rounds
    convergenceThreshold: 0.6  // Lower threshold
  }
)
```

### Session timeout

**Cause:** Rounds taking too long.

**Solution:**
```typescript
config.set('partyMode.roundTimeout', 300000)  // 5 minutes
```

### Conflicts not resolving

**Cause:** Fundamental disagreement.

**Solution:**
```typescript
// Check conflict log
const conflicts = session.state.conflictLog.filter(
  c => c.severity === 'Critical'
)

// May need human intervention
if (conflicts.length > 0) {
  console.log('Manual resolution needed:', conflicts)
}
```

## LLM Issues

### API key not found

**Cause:** Environment variable not set.

**Solution:**
```bash
export ANTHROPIC_API_KEY=your-api-key
```

### Rate limiting

**Cause:** Too many requests.

**Solution:**
```typescript
// Add delay between requests
config.set('llm.requestDelay', 1000)  // 1 second

// Or reduce parallel agents
config.set('parallel.maxAgents', 2)
```

### Unexpected responses

**Cause:** Temperature too high.

**Solution:**
```typescript
config.set('llm.temperature', 0.1)  // Lower = more deterministic
```

## Performance Issues

### Slow execution

**Cause:** No caching or too much logging.

**Solution:**
```bash
# Reduce logging
export AI1ST_LOG_LEVEL=warn

# Enable caching
export AI1ST_CACHE_SIZE=1000
export AI1ST_CACHE_TTL=300
```

### Memory issues

**Cause:** Large cache or many concurrent agents.

**Solution:**
```typescript
config.set('cache.maxSize', 500)
config.set('parallel.maxAgents', 3)
```

## Getting Help

If these solutions don't help:

1. **Check logs:** `export AI1ST_LOG_LEVEL=debug`
2. **Search issues:** [GitHub Issues](https://github.com/Samch1k/ai1st-orchestration/issues)
3. **Create issue:** Include error message, reproduction steps, and environment details

## See Also

- [Configuration](../getting-started/configuration.md)
- [Installation](../getting-started/installation.md)
