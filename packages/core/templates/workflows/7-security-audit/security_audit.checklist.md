# Security Audit Workflow Checklist

## Phase 1: Threat Modeling (architect)

### Before Starting
- [ ] System architecture documented
- [ ] Data flow diagrams available
- [ ] Assets and boundaries identified
- [ ] Compliance requirements understood

### During Execution
- [ ] Threat model created (STRIDE/DREAD)
- [ ] Attack surface analyzed
- [ ] Entry points identified
- [ ] Security requirements defined
- [ ] Risk assessment completed

### Completion Criteria
- [ ] Threat model documented
- [ ] High-risk areas identified
- [ ] Security requirements defined
- [ ] Stakeholders informed

## Phase 2: Code Audit (code-reviewer)

### Before Starting
- [ ] Threat model reviewed
- [ ] Code scanning tools configured
- [ ] OWASP Top 10 checklist prepared

### During Execution
- [ ] Static code analysis performed
- [ ] SQL injection vulnerabilities checked
- [ ] XSS vulnerabilities checked
- [ ] Authentication/authorization reviewed
- [ ] Sensitive data handling reviewed
- [ ] Dependency vulnerabilities scanned
- [ ] OWASP Top 10 compliance verified

### Completion Criteria
- [ ] Code audit report complete
- [ ] All vulnerabilities documented
- [ ] Severity levels assigned
- [ ] Remediation recommendations provided

## Phase 3: Vulnerability Testing (tester)

### Before Starting
- [ ] Test environment configured
- [ ] Testing tools prepared
- [ ] Test scope defined

### During Execution
- [ ] Automated vulnerability scanning
- [ ] Manual penetration testing
- [ ] Authentication bypass attempts
- [ ] Authorization testing
- [ ] Input validation testing
- [ ] Session management testing
- [ ] API security testing

### Completion Criteria
- [ ] All planned tests executed
- [ ] Findings documented with evidence
- [ ] Reproducible attack scenarios provided
- [ ] Risk severity assigned

## Phase 4: Remediation (developer)

### Before Starting
- [ ] Vulnerability reports reviewed
- [ ] Remediation priorities established
- [ ] Development environment ready

### During Execution
- [ ] Critical vulnerabilities fixed first
- [ ] High-severity vulnerabilities addressed
- [ ] Security hardening applied
- [ ] Input validation improved
- [ ] Authentication/authorization strengthened
- [ ] Security tests added
- [ ] Code follows security best practices

### Completion Criteria
- [ ] All critical vulnerabilities fixed
- [ ] All high-severity vulnerabilities fixed
- [ ] Security improvements implemented
- [ ] Tests verify fixes
- [ ] Code reviewed

## Phase 5: Validation (tester)

### Before Starting
- [ ] Fixes deployed to test environment
- [ ] Retest plan prepared

### During Execution
- [ ] Fixed vulnerabilities retested
- [ ] Regression testing performed
- [ ] New security tests executed
- [ ] Compliance requirements verified
- [ ] Security best practices validated

### Completion Criteria
- [ ] All vulnerabilities verified as fixed
- [ ] No new vulnerabilities introduced
- [ ] Compliance requirements met
- [ ] Security posture improved
- [ ] Final report prepared

## Final Approval

- [ ] All phases completed successfully
- [ ] Critical and high-severity vulnerabilities fixed
- [ ] Medium/low vulnerabilities documented with plan
- [ ] Compliance requirements met
- [ ] Security monitoring configured
- [ ] Team trained on security practices
- [ ] Ready for production deployment
