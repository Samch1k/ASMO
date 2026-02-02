# ASMO Core Library Tests

## Current Test Coverage

This directory contains tests for the `@asmo/core` library. Currently, we have **smoke tests** that verify basic functionality and API surface area.

### What's Tested

**Smoke Tests (Current):**
- ✅ Package exports are accessible
- ✅ Core classes can be instantiated
- ✅ Public API methods exist
- ✅ Basic error cases don't crash

**Coverage:** ~15% (smoke tests only)

### What Needs Testing

**High Priority (Critical Paths):**
- [ ] WorkflowEngine: Full workflow execution with steps
- [ ] WorkflowEngine: Error handling and recovery
- [ ] WorkflowEngine: Approval checkpoint behavior
- [ ] WorkflowEngine: Parallel step execution
- [ ] AgentRegistry: Agent registration and retrieval
- [ ] AgentRegistry: Role-based agent lookup
- [ ] SkillMatcher: Exact skill matching
- [ ] SkillMatcher: Confidence score calculation
- [ ] MetricsCollector: Workflow and agent metrics tracking
- [ ] MetricsPersister: Database persistence (with mocked DB)

**Medium Priority (Important Features):**
- [ ] PhaseManager: Phase transition logic
- [ ] IterationManager: Iteration tracking and limits
- [ ] ApprovalCheckpoint: User approval flow
- [ ] LearningLoop: Metrics-based optimization
- [ ] ConfigLoader: Configuration loading and validation
- [ ] RoleManager: Role assignment and permissions
- [ ] InstructionManager: Instruction file loading

**Low Priority (Helper Classes):**
- [ ] ChecklistManager: Checklist tracking
- [ ] TeamManager: Team composition
- [ ] MetricsOptimizer: Performance optimization suggestions
- [ ] RetrospectiveAgent: Retrospective generation
- [ ] RetrospectiveReportGenerator: Report formatting

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage

# Run specific test file
pnpm test workflow-engine.test.ts
```

## Writing Tests

### Test Structure

```typescript
import { ClassName } from '../../src/path/to/class'

describe('ClassName', () => {
  let instance: ClassName

  beforeEach(() => {
    instance = new ClassName()
  })

  describe('feature name', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test'

      // Act
      const result = instance.method(input)

      // Assert
      expect(result).toBe('expected')
    })
  })
})
```

### Mocking Dependencies

For classes with external dependencies (databases, APIs, file system):

```typescript
import { jest } from '@jest/globals'

// Mock the dependency
jest.mock('../../src/path/to/dependency', () => ({
  DependencyClass: jest.fn().mockImplementation(() => ({
    method: jest.fn().mockResolvedValue('mocked value')
  }))
}))

describe('ClassUnderTest', () => {
  it('should work with mocked dependency', async () => {
    const instance = new ClassUnderTest()
    const result = await instance.methodUsingDependency()

    expect(result).toBeDefined()
  })
})
```

### Testing Async Code

```typescript
it('should handle async operations', async () => {
  const promise = instance.asyncMethod()

  await expect(promise).resolves.toBe('expected')
})

it('should handle async errors', async () => {
  const promise = instance.failingAsyncMethod()

  await expect(promise).rejects.toThrow('Expected error')
})
```

## Test Coverage Goals

**Short-term (Phase 1 complete):**
- ✅ Smoke tests for all core classes
- ✅ Jest configuration working
- ✅ Tests run in CI/CD

**Medium-term (Before v1.0):**
- [ ] 80%+ coverage for WorkflowEngine
- [ ] 80%+ coverage for AgentRegistry
- [ ] 80%+ coverage for SkillMatcher
- [ ] 60%+ coverage for other orchestration classes

**Long-term (Production-ready):**
- [ ] 90%+ coverage for all critical paths
- [ ] Integration tests with real agent execution
- [ ] E2E tests with full workflows
- [ ] Performance benchmarks

## Contributing

When adding new features:

1. **Write tests first (TDD)** - Define expected behavior in tests
2. **Test edge cases** - Empty inputs, null values, errors
3. **Mock external dependencies** - Database, file system, APIs
4. **Keep tests fast** - Unit tests should run in < 5 seconds total
5. **Document TODO items** - Mark areas needing more tests

## Common Issues

### Issue: Import errors in tests

**Problem:** `Cannot find module '../../src/...'`

**Solution:** Check that:
- Path is relative to test file location
- File extension is correct (.ts)
- Module is exported from the file

### Issue: Tests fail with "Cannot find module"

**Problem:** Jest can't resolve module paths

**Solution:** Check `jest.config.js` `moduleNameMapper` setting

### Issue: Tests timeout

**Problem:** Async operations not completing

**Solution:**
- Use `async/await` properly
- Increase timeout: `jest.setTimeout(10000)`
- Mock slow operations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript with Jest](https://kulshekhar.github.io/ts-jest/)
- [Testing Best Practices](https://testingjavascript.com/)
