# 🧪 Testing

7 skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
| **Acceptance Testing** | 🟡 Intermediate | 40m | 85% |
| **Bug Reproduction** | 🟡 Intermediate | 30m | 80% |
| **E2E Testing** | 🟠 Advanced | 45m | 80% |
| **Smoke Testing** | 🟢 Basic | 15m | 90% |
| **Test Coverage Analysis** | 🟡 Intermediate | 20m | 85% |
| **Test Suite Creation** | 🟡 Intermediate | 4-12h | 80% |
| **Unit Testing** | 🟡 Intermediate | 30m | 90% |


## 🟢 Basic Skills


### Smoke Testing

Perform quick sanity checks to verify critical functionality works after deployments or major changes. Basic validation that the system is stable enough for further testing.

| Property | Value |
|----------|-------|
| ID | `smoke_testing` |
| Time | 15m |
| Confidence Threshold | 0.7 |
| Difficulty | 3/10 |


**Composable with:** `e2e_testing`
**Aliases:** smoke test, sanity check, quick test


## 🟡 Intermediate Skills


### Acceptance Testing

Verify that implemented features meet business requirements and acceptance criteria. Ensures the solution satisfies stakeholder expectations.

| Property | Value |
|----------|-------|
| ID | `acceptance_testing` |
| Time | 40m |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |


**Composable with:** `e2e_testing`
**Aliases:** acceptance test, UAT, user acceptance


### Bug Reproduction

Reproduce reported bugs to understand the exact conditions that cause failures. Includes creating minimal reproducible examples and documenting steps to reproduce.

| Property | Value |
|----------|-------|
| ID | `bug_reproduction` |
| Time | 30m |
| Confidence Threshold | 0.85 |
| Difficulty | 6/10 |


**Composable with:** `bug_diagnosis`
**Aliases:** reproduce bug, replicate, reproduce issue


### Test Coverage Analysis

Analyze test coverage metrics, identify untested code paths, and improve overall test coverage to ensure code quality and reliability.

| Property | Value |
|----------|-------|
| ID | `test_coverage` |
| Time | 20m |
| Confidence Threshold | 0.8 |
| Difficulty | 5/10 |

**Requires:** `unit_testing`
**Composable with:** `unit_testing`, `e2e_testing`
**Aliases:** coverage, test coverage, coverage analysis


### Test Suite Creation

Create comprehensive test suite with unit tests, E2E tests, coverage analysis, and verification. Ensures thorough testing across all layers. Use when: setting up testing for new features, improving test coverage, creating test infrastructure. Keywords: testing, test suite, coverage, E2E

| Property | Value |
|----------|-------|
| ID | `test_suite_creation` |
| Time | 4-12h |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |






### Unit Testing

Write unit tests using Vitest to verify individual functions and components work correctly in isolation. Includes test setup, mocking, assertions, and achieving good test coverage.

| Property | Value |
|----------|-------|
| ID | `unit_testing` |
| Time | 30m |
| Confidence Threshold | 0.85 |
| Difficulty | 5/10 |


**Composable with:** `code_writing`, `e2e_testing`
**Aliases:** unit test, tests, testing


## 🟠 Advanced Skills


### E2E Testing

Create and run end-to-end tests with Playwright to verify full user workflows work correctly. Includes browser automation, page object patterns, and testing across different browsers.

| Property | Value |
|----------|-------|
| ID | `e2e_testing` |
| Time | 45m |
| Confidence Threshold | 0.85 |
| Difficulty | 7/10 |


**Composable with:** `unit_testing`
**Aliases:** e2e, end-to-end, integration test


---

[← Back to Skills Catalog](./index.md)
