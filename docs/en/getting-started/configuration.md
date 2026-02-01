# Configuration

AI1st uses a 3-tier configuration system that allows flexible customization at different levels.

## Configuration Hierarchy

1. **Built-in Defaults** - Sensible defaults included with AI1st
2. **Configuration Files** - Project-specific settings in `.ai1st/config/`
3. **Environment Variables** - Runtime overrides

Higher tiers override lower tiers.

## Configuration Files

Create a `.ai1st/config/` directory in your project root for configuration files.

### Orchestration Configuration

```typescript
// .ai1st/config/orchestration.config.ts
export default {
  // Agent timeouts in milliseconds
  timeouts: {
    architect: 300000,    // 5 minutes
    developer: 900000,    // 15 minutes
    tester: 480000,       // 8 minutes
    devops: 600000,       // 10 minutes
    default: 300000       // 5 minutes default
  },

  // Parallel execution settings
  parallel: {
    maxAgents: 3,         // Max concurrent agents
    enabled: true         // Enable/disable parallel execution
  },

  // Approval settings
  approvalRequired: true,  // Require approval at checkpoints

  // Learning and metrics
  learningEnabled: true,   // Track and learn from executions
  metricsEnabled: true     // Collect performance metrics
}
```

### Workflow Configuration

```typescript
// .ai1st/config/workflows.config.ts
export default {
  // Default workflow for different complexity levels
  defaultWorkflows: {
    trivial: 'bug_fix_workflow',
    simple: 'bug_fix_workflow',
    medium: 'feature_implementation_full',
    complex: 'architecture_design',
    enterprise: 'architecture_design'
  },

  // YOLO mode settings
  yoloMode: {
    enabled: true,
    complexityThreshold: 30,  // Auto-approve tasks below this score
    excludedWorkflows: ['security_audit', 'database_migration']
  },

  // Adaptive selection settings
  adaptiveSelection: {
    enabled: true,
    confidenceThreshold: 0.7,
    fallbackWorkflow: 'feature_implementation_full'
  }
}
```

### Agent Configuration

```typescript
// .ai1st/config/agents.config.ts
export default {
  // LLM settings per agent
  llm: {
    default: {
      temperature: 0.2,
      maxTokens: 8192
    },
    architect: {
      temperature: 0.3,
      maxTokens: 8192
    },
    developer: {
      temperature: 0.2,
      maxTokens: 8192
    }
  },

  // MCP server access per agent
  mcpAccess: {
    developer: ['filesystem', 'github', 'context7'],
    devops: ['vercel', 'render', 'github'],
    tester: ['playwright', 'filesystem']
  }
}
```

## Environment Variables

Override any configuration at runtime using environment variables:

### Core Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `AI1ST_LOG_LEVEL` | Logging verbosity (debug, info, warn, error) | `info` |
| `AI1ST_CONFIG_PATH` | Path to configuration directory | `.ai1st/config` |

### YOLO Mode

| Variable | Description | Default |
|----------|-------------|---------|
| `AI1ST_YOLO_ENABLED` | Enable YOLO mode | `true` |
| `AI1ST_YOLO_THRESHOLD` | Complexity threshold for YOLO | `30` |
| `AI1ST_YOLO_AUDIT` | Enable audit trail | `true` |

### Database

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `AI1ST_CACHE_SIZE` | LRU cache size | `1000` |
| `AI1ST_CACHE_TTL` | Cache TTL in seconds | `300` |

### LLM

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key | - |
| `AI1ST_LLM_MODEL` | Default LLM model | `claude-3-sonnet` |
| `AI1ST_LLM_TEMPERATURE` | Default temperature | `0.2` |

## Programmatic Configuration

You can also configure AI1st programmatically:

```typescript
import { WorkflowEngine, AgentRegistry, ConfigManager } from '@ai1st/core'

// Get the config manager
const config = ConfigManager.getInstance()

// Set configuration options
config.set('yoloMode.enabled', true)
config.set('yoloMode.complexityThreshold', 25)
config.set('parallel.maxAgents', 5)

// Initialize with custom config
const registry = new AgentRegistry()
const engine = new WorkflowEngine(registry, {
  config: {
    timeouts: {
      default: 600000  // 10 minutes
    }
  }
})

await engine.initialize()
```

## Configuration Validation

AI1st validates configuration on startup. Invalid configurations will throw errors:

```typescript
try {
  await engine.initialize()
} catch (error) {
  if (error.name === 'ConfigurationError') {
    console.error('Invalid configuration:', error.message)
    console.error('Invalid fields:', error.invalidFields)
  }
}
```

## Configuration Schema

Full configuration schema for reference:

```typescript
interface AI1stConfig {
  timeouts: {
    [agentId: string]: number
    default: number
  }
  parallel: {
    maxAgents: number
    enabled: boolean
  }
  yoloMode: {
    enabled: boolean
    complexityThreshold: number
    excludedWorkflows: string[]
    auditEnabled: boolean
  }
  adaptiveSelection: {
    enabled: boolean
    confidenceThreshold: number
    fallbackWorkflow: string
  }
  llm: {
    [agentId: string]: {
      temperature: number
      maxTokens: number
    }
  }
  database: {
    url: string
    cacheSize: number
    cacheTTL: number
    maxConnections: number
  }
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
    format: 'json' | 'pretty'
  }
}
```

## Best Practices

1. **Use Environment Variables for Secrets** - Never commit API keys or database URLs
2. **Start with Defaults** - Only override what you need
3. **Use Project Config for Team Settings** - Commit `.ai1st/config/` to version control
4. **Test Configuration Changes** - Validate before deploying

## Next Steps

- [Concepts](../concepts/index.md) - Understand how AI1st works
- [YOLO Mode](../guides/yolo-mode.md) - Configure automatic approvals
- [Custom Agents](../guides/custom-agents.md) - Create your own agents
