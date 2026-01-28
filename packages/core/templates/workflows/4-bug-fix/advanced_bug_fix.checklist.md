# Advanced Bug Fix Workflow Checklist

## Phase 1: Investigation (debugger)

### Before Starting
- [ ] Bug report with reproduction steps available
- [ ] Error logs and stack traces collected
- [ ] Environment and system state documented
- [ ] User impact assessed

### During Execution
- [ ] Root cause identified with evidence
- [ ] All related code areas examined
- [ ] System dependencies analyzed
- [ ] Similar issues in codebase identified
- [ ] Impact scope fully assessed

### Completion Criteria
- [ ] Root cause clearly documented
- [ ] System impact fully understood
- [ ] Reproduction steps verified
- [ ] Prevention opportunities identified

## Phase 2: Solution Design (architect)

### Before Starting
- [ ] Root cause analysis reviewed
- [ ] System architecture understood
- [ ] Prevention strategies considered

### During Execution
- [ ] Comprehensive fix approach designed
- [ ] Prevention measures defined
- [ ] Testing strategy planned
- [ ] Documentation needs identified

### Completion Criteria
- [ ] Fix design addresses root cause
- [ ] Prevention measures defined
- [ ] Testing strategy comprehensive
- [ ] Design approved by team

## Phase 3: Implementation (developer)

### Before Starting
- [ ] Fix design reviewed and understood
- [ ] Development environment ready
- [ ] Tests identified for validation

### During Execution
- [ ] Fix implemented following design
- [ ] Proper error handling added
- [ ] Logging and monitoring added
- [ ] Code follows standards
- [ ] Documentation updated

### Completion Criteria
- [ ] Code compiles without errors
- [ ] Fix addresses root cause
- [ ] Prevention measures implemented
- [ ] Tests written and passing
- [ ] Documentation updated

## Phase 4: Verification (tester)

### Before Starting
- [ ] Test cases prepared for all scenarios
- [ ] Test environment configured
- [ ] Performance metrics baseline established

### During Execution
- [ ] Bug reproduction verified as fixed
- [ ] Edge cases validated
- [ ] Regression testing performed
- [ ] Performance impact assessed
- [ ] Integration points tested

### Completion Criteria
- [ ] All test cases passing
- [ ] Bug verified as fixed
- [ ] No regressions detected
- [ ] Performance acceptable
- [ ] Edge cases handled

## Phase 5: Review (code-reviewer)

### Before Starting
- [ ] All previous phases completed
- [ ] Code changes documented

### During Execution
- [ ] Code quality reviewed
- [ ] Prevention measures validated
- [ ] Test coverage assessed
- [ ] Documentation reviewed
- [ ] Best practices verified

### Completion Criteria
- [ ] Code meets quality standards
- [ ] Prevention measures effective
- [ ] Test coverage adequate
- [ ] Documentation complete
- [ ] Approved for deployment

## Final Approval

- [ ] All phases completed successfully
- [ ] Fix tested in staging environment
- [ ] Rollback plan prepared
- [ ] Monitoring alerts configured
- [ ] Ready for production deployment
