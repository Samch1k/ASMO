# YOLO Mode

YOLO (You Only Live Once) Mode enables automatic approval bypass for simple, low-risk tasks.

## Overview

For trivial tasks (complexity score < 30), YOLO Mode:

- **Bypasses approval checkpoints** - No confirmation needed
- **Speeds up execution** - Skip non-essential steps
- **Maintains audit trail** - All actions are logged
- **Reduces friction** - Simple tasks execute instantly

## When YOLO Mode Activates

```
Task Description → Complexity Analysis → Score < 30 → YOLO Mode
                                              ↓
                                     Execute without approvals
```

## Examples

### YOLO Enabled (Score: 15)

```typescript
const result = await engine.execute('Fix typo in README')
// Complexity: 15 (trivial)
// YOLO Mode: enabled
// Executes immediately without approval prompts
```

### YOLO Disabled (Score: 65)

```typescript
const result = await engine.execute('Add OAuth2 authentication')
// Complexity: 65 (complex)
// YOLO Mode: disabled
// Requires approval at checkpoints
```

## Configuration

### Environment Variables

```bash
# Enable/disable YOLO mode
export ASMO_YOLO_ENABLED=true

# Set complexity threshold (default: 30)
export ASMO_YOLO_THRESHOLD=30

# Enable audit trail
export ASMO_YOLO_AUDIT=true
```

### Configuration File

```typescript
// .asmo/config/workflows.config.ts
export default {
  yoloMode: {
    enabled: true,
    complexityThreshold: 30,
    auditEnabled: true,
    excludedWorkflows: ['security_audit', 'database_migration']
  }
}
```

### Programmatic

```typescript
import { ConfigManager } from '@asmo/core'

const config = ConfigManager.getInstance()
config.set('yoloMode.enabled', true)
config.set('yoloMode.complexityThreshold', 25)
```

## Excluded Workflows

Some workflows should never use YOLO Mode:

```typescript
excludedWorkflows: [
  'security_audit',      // Security requires review
  'database_migration',  // Data changes need approval
  'architecture_design'  // Major decisions need review
]
```

## Audit Trail

All YOLO executions are logged:

```typescript
interface YoloAuditRecord {
  taskId: string
  complexityScore: number
  timestamp: Date
  bypassedCheckpoints: string[]
  outcome: 'success' | 'failure' | 'pending'
}
```

### Accessing Audit History

```typescript
import { YoloModeManager } from '@asmo/core'

const yoloManager = new YoloModeManager()
const history = yoloManager.getAuditHistory(10)

for (const record of history) {
  console.log(`Task: ${record.taskId}`)
  console.log(`Score: ${record.complexityScore}`)
  console.log(`Bypassed: ${record.bypassedCheckpoints.join(', ')}`)
  console.log(`Outcome: ${record.outcome}`)
}
```

## How It Works

### Integration with ApprovalCheckpoint

```typescript
// In approval-checkpoint.ts
if (this.yoloModeManager.shouldEnableYolo(state.metadata?.complexityScore)) {
  this.config.skipCheckpoints = true
  this.yoloModeManager.recordYoloExecution({
    taskId: state.taskId,
    complexityScore: state.metadata.complexityScore,
    timestamp: new Date(),
    bypassedCheckpoints: ['definition', 'design', 'review'],
    outcome: 'pending'
  })
  return { approved: true, reason: 'yolo_mode' }
}
```

### Bypassed Checkpoints

Typical checkpoints that YOLO mode bypasses:

| Checkpoint | Normal | YOLO Mode |
|------------|--------|-----------|
| Definition Review | Required | Skipped |
| Design Approval | Required | Skipped |
| Code Review | Required | Skipped |
| Deployment Approval | Required | Skipped |

## Risk Considerations

### When YOLO is Safe

- Fix typos and text updates
- Simple bug fixes with clear solutions
- Adding console.logs for debugging
- Updating configuration values
- Minor style adjustments

### When YOLO is Risky

- Security-related changes
- Database modifications
- API contract changes
- Breaking changes
- Production deployments

## Adjusting Threshold

### Lower Threshold (Stricter)

```typescript
// Only very simple tasks bypass approval
config.set('yoloMode.complexityThreshold', 15)
```

### Higher Threshold (More Permissive)

```typescript
// More tasks bypass approval
config.set('yoloMode.complexityThreshold', 40)
```

## Monitoring YOLO Usage

### Success Rate

```typescript
const history = yoloManager.getAuditHistory(100)
const successRate = history.filter(r => r.outcome === 'success').length / history.length
console.log(`YOLO Success Rate: ${(successRate * 100).toFixed(1)}%`)
```

### Failure Analysis

```typescript
const failures = history.filter(r => r.outcome === 'failure')
for (const failure of failures) {
  console.log(`Failed Task: ${failure.taskId}`)
  console.log(`Score: ${failure.complexityScore}`)
  // Consider raising threshold if too many failures
}
```

## Best Practices

1. **Start Conservative** - Begin with default threshold (30)
2. **Monitor Outcomes** - Check audit trail regularly
3. **Exclude Critical Workflows** - Never YOLO security or data changes
4. **Adjust Based on Results** - Tune threshold based on success rate
5. **Review Failures** - Investigate any YOLO failures

## Disabling YOLO Mode

### Globally

```bash
export ASMO_YOLO_ENABLED=false
```

### Per Execution

```typescript
const result = await engine.execute(task, undefined, {
  yoloMode: false  // Force approvals
})
```

## See Also

- [Complexity Analysis](../concepts/complexity.md)
- [Adaptive Workflow](./adaptive-workflow.md)
- [Configuration](../getting-started/configuration.md)
