# 🧪 Тестирование

7 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **Acceptance Testing** | 🟡 Средний | 40m | 85% |
| **Bug Reproduction** | 🟡 Средний | 30m | 80% |
| **E2E Testing** | 🟠 Продвинутый | 45m | 80% |
| **Smoke Testing** | 🟢 Базовый | 15m | 90% |
| **Test Coverage Analysis** | 🟡 Средний | 20m | 85% |
| **Test Suite Creation** | 🟡 Средний | 4-12h | 80% |
| **Unit Testing** | 🟡 Средний | 30m | 90% |


## 🟢 Базовый навыки


### Smoke Testing

Perform quick sanity checks to verify critical functionality works after deployments or major changes. Basic validation that the system is stable enough for further testing.

| Параметр | Значение |
|----------|----------|
| ID | `smoke_testing` |
| Время | 15m |
| Порог уверенности | 0.7 |
| Сложность | 3/10 |


**Комбинируется с:** `e2e_testing`
**Алиасы:** smoke test, sanity check, quick test


## 🟡 Средний навыки


### Acceptance Testing

Verify that implemented features meet business requirements and acceptance criteria. Ensures the solution satisfies stakeholder expectations.

| Параметр | Значение |
|----------|----------|
| ID | `acceptance_testing` |
| Время | 40m |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |


**Комбинируется с:** `e2e_testing`
**Алиасы:** acceptance test, UAT, user acceptance


### Bug Reproduction

Reproduce reported bugs to understand the exact conditions that cause failures. Includes creating minimal reproducible examples and documenting steps to reproduce.

| Параметр | Значение |
|----------|----------|
| ID | `bug_reproduction` |
| Время | 30m |
| Порог уверенности | 0.85 |
| Сложность | 6/10 |


**Комбинируется с:** `bug_diagnosis`
**Алиасы:** reproduce bug, replicate, reproduce issue


### Test Coverage Analysis

Analyze test coverage metrics, identify untested code paths, and improve overall test coverage to ensure code quality and reliability.

| Параметр | Значение |
|----------|----------|
| ID | `test_coverage` |
| Время | 20m |
| Порог уверенности | 0.8 |
| Сложность | 5/10 |

**Требует:** `unit_testing`
**Комбинируется с:** `unit_testing`, `e2e_testing`
**Алиасы:** coverage, test coverage, coverage analysis


### Test Suite Creation

Create comprehensive test suite with unit tests, E2E tests, coverage analysis, and verification. Ensures thorough testing across all layers. Use when: setting up testing for new features, improving test coverage, creating test infrastructure. Keywords: testing, test suite, coverage, E2E

| Параметр | Значение |
|----------|----------|
| ID | `test_suite_creation` |
| Время | 4-12h |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |






### Unit Testing

Write unit tests using Vitest to verify individual functions and components work correctly in isolation. Includes test setup, mocking, assertions, and achieving good test coverage.

| Параметр | Значение |
|----------|----------|
| ID | `unit_testing` |
| Время | 30m |
| Порог уверенности | 0.85 |
| Сложность | 5/10 |


**Комбинируется с:** `code_writing`, `e2e_testing`
**Алиасы:** unit test, tests, testing


## 🟠 Продвинутый навыки


### E2E Testing

Create and run end-to-end tests with Playwright to verify full user workflows work correctly. Includes browser automation, page object patterns, and testing across different browsers.

| Параметр | Значение |
|----------|----------|
| ID | `e2e_testing` |
| Время | 45m |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `unit_testing`
**Алиасы:** e2e, end-to-end, integration test


---

[← Назад к каталогу навыков](./index.md)
