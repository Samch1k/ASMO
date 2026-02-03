# Bug Fix Workflow - Examples

## Example: Rating Widget Not Updating

**Diagnosis** (30min):
- Logs show no errors
- React DevTools: state not updating on click

**Reproduction** (15min):
- Minimal case: readonly prop is true when should be false

**Fix** (20min):
```typescript
// Before (bug):
<RatingWidget readonly={user.role === 'buyer'} />

// After (fix):
<RatingWidget readonly={!canUserRate(user, supplier)} />
```

**Verification** (45min):
- Unit tests added (3 new tests)
- Manual testing: works correctly
- Regression testing: no side effects

**Total**: 1.8 hours
