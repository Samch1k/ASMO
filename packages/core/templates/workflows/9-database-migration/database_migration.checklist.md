# Database Migration Workflow Checklist

## Phase 1: Planning (architect)

### Before Starting
- [ ] Current schema documented
- [ ] Business requirements understood
- [ ] Data volume assessed
- [ ] Downtime constraints identified

### During Execution
- [ ] New schema designed
- [ ] Data mapping defined
- [ ] Migration strategy chosen (online/offline, blue-green, etc.)
- [ ] Rollback strategy defined
- [ ] Risk assessment completed
- [ ] Dependencies identified

### Completion Criteria
- [ ] Migration plan documented
- [ ] Schema design approved
- [ ] Data mapping complete
- [ ] Rollback strategy defined
- [ ] Stakeholders informed

## Phase 2: Script Development (developer)

### Before Starting
- [ ] Migration plan reviewed
- [ ] Development database ready
- [ ] Version control setup

### During Execution
- [ ] Forward migration scripts written
- [ ] Rollback scripts written
- [ ] Data validation scripts created
- [ ] Backup scripts prepared
- [ ] Error handling implemented
- [ ] Transaction management planned
- [ ] Scripts versioned and documented

### Completion Criteria
- [ ] All scripts written and reviewed
- [ ] Scripts tested on development database
- [ ] Idempotency verified
- [ ] Error handling tested
- [ ] Documentation complete

## Phase 3: Testing (tester)

### Before Starting
- [ ] Staging environment ready
- [ ] Production data snapshot available
- [ ] Test plan prepared

### During Execution
- [ ] Full backup created
- [ ] Migration executed on staging
- [ ] Data integrity verified
- [ ] Application functionality tested
- [ ] Performance measured
- [ ] Rollback tested
- [ ] Edge cases validated

### Completion Criteria
- [ ] Migration successful on staging
- [ ] No data loss or corruption
- [ ] Application functions correctly
- [ ] Performance acceptable
- [ ] Rollback verified working

## Phase 4: Execution Planning (devops)

### Before Starting
- [ ] Staging tests passed
- [ ] Production access confirmed
- [ ] Team availability confirmed

### During Execution
- [ ] Execution timeline defined
- [ ] Downtime window scheduled
- [ ] Stakeholder communication prepared
- [ ] Monitoring setup configured
- [ ] Rollback trigger criteria defined
- [ ] Team roles assigned

### Completion Criteria
- [ ] Execution plan approved
- [ ] Downtime communicated
- [ ] Monitoring ready
- [ ] Team briefed
- [ ] Go/no-go criteria established

## Phase 5: Execution (developer)

### Before Starting
- [ ] Final production backup completed
- [ ] All stakeholders notified
- [ ] Rollback plan ready
- [ ] Team on standby

### During Execution
- [ ] Application maintenance mode enabled
- [ ] Pre-migration checks executed
- [ ] Migration scripts executed
- [ ] Progress monitored
- [ ] Errors handled or rollback initiated
- [ ] Post-migration validation run
- [ ] Logs captured

### Completion Criteria
- [ ] Migration completed successfully
- [ ] No errors encountered or resolved
- [ ] Initial validation passed
- [ ] Execution log complete

## Phase 6: Validation (tester)

### Before Starting
- [ ] Migration execution completed
- [ ] Validation scripts ready

### During Execution
- [ ] Data integrity verified
- [ ] Row counts validated
- [ ] Relationships verified
- [ ] Application smoke tests executed
- [ ] Performance validated
- [ ] User acceptance testing performed

### Completion Criteria
- [ ] All data validated
- [ ] Application fully functional
- [ ] Performance acceptable
- [ ] No data corruption
- [ ] Post-migration report complete

## Final Approval

- [ ] All phases completed successfully
- [ ] Data integrity verified
- [ ] Application functioning correctly
- [ ] Performance meets requirements
- [ ] Backups secured
- [ ] Documentation updated
- [ ] Monitoring active
- [ ] Team debriefed
- [ ] Migration declared successful
