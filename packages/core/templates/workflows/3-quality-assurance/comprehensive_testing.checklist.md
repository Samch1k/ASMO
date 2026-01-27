# Comprehensive Testing Checklist

## Phase 1: Unit Testing (tester - unit focus)

### Before Starting
- [ ] Unit test framework configured
- [ ] Test data prepared
- [ ] Coverage requirements defined

### During Execution
- [ ] All unit tests executed
- [ ] Test coverage measured
- [ ] Failed tests investigated
- [ ] Code coverage meets threshold

### Completion Criteria
- [ ] All unit tests passing
- [ ] Coverage ≥ 80% (or project standard)
- [ ] No skipped tests
- [ ] Fast execution time (<2min)

## Phase 2: E2E Testing (tester - e2e focus)

### Before Starting
- [ ] E2E test environment ready
- [ ] Test scenarios documented
- [ ] Browser matrix defined

### During Execution
- [ ] Critical user flows tested
- [ ] Cross-browser tests run
- [ ] Mobile viewport tested
- [ ] Error scenarios validated

### Completion Criteria
- [ ] All E2E tests passing
- [ ] No UI regressions
- [ ] All browsers supported
- [ ] User flows working

## Phase 3: Performance Testing (tester - performance focus)

### Before Starting
- [ ] Performance baselines set
- [ ] Load testing tools configured
- [ ] Metrics defined

### During Execution
- [ ] Load tests executed
- [ ] Response times measured
- [ ] Memory usage checked
- [ ] Database queries profiled

### Completion Criteria
- [ ] Response times acceptable
- [ ] No memory leaks detected
- [ ] Database queries optimized
- [ ] System stable under load

## Phase 4: Deployment Validation (deployer)

### Before Starting
- [ ] All tests passed
- [ ] Deployment environment ready
- [ ] Rollback plan prepared

### During Execution
- [ ] Deploy to staging
- [ ] Smoke tests performed
- [ ] Integration validated
- [ ] Monitoring checked

### Completion Criteria
- [ ] Staging deployment successful
- [ ] All smoke tests pass
- [ ] No errors in logs
- [ ] Ready for production

## Final Approval

- [ ] All test phases completed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Ready for release
