# 🐛 Отладка

7 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **Bug Diagnosis** | 🟠 Продвинутый | 45m | 80% |
| **Bug Fix Workflow** | 🟡 Средний | 1-4h | 80% |
| **Error Investigation** | 🟡 Средний | 30m | 85% |
| **Hotfix Generation** | 🟠 Продвинутый | 30m | 80% |
| **Log Analysis** | 🟡 Средний | 30m | 85% |
| **Performance Debugging** | 🟠 Продвинутый | 1h | 75% |
| **Root Cause Analysis** | 🔴 Экспертный | 1h | 75% |


## 🟡 Средний навыки


### Bug Fix Workflow

Complete bug fixing workflow from diagnosis through verification. Includes bug diagnosis, reproduction, hotfix generation, and verification testing. Use when: fixing bugs, handling production issues, resolving defects. Keywords: bug, fix, hotfix, debugging

| Параметр | Значение |
|----------|----------|
| ID | `bug_fix_workflow` |
| Время | 1-4h |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |






### Error Investigation

Investigate error messages, stack traces, and failure patterns to understand what went wrong. Includes log analysis, error tracking, and correlation of related issues.

| Параметр | Значение |
|----------|----------|
| ID | `error_investigation` |
| Время | 30m |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |


**Комбинируется с:** `log_analysis`, `bug_diagnosis`
**Алиасы:** investigate error, error analysis, failure investigation


### Log Analysis

Analyze application logs from Render and Vercel to identify patterns, errors, and performance issues. Includes log querying, filtering, and correlation.

| Параметр | Значение |
|----------|----------|
| ID | `log_analysis` |
| Время | 30m |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |


**Комбинируется с:** `error_investigation`, `monitoring`
**Алиасы:** logs, log investigation, analyze logs


## 🟠 Продвинутый навыки


### Bug Diagnosis

Investigate and diagnose bugs by analyzing symptoms, reproducing issues, examining logs, and identifying root causes. Systematic debugging approach to understand failures.

| Параметр | Значение |
|----------|----------|
| ID | `bug_diagnosis` |
| Время | 45m |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `root_cause_analysis`, `error_investigation`
**Алиасы:** debug, diagnose, investigate bug


### Hotfix Generation

Quickly create and deploy critical fixes for production issues. Includes minimal code changes, expedited testing, and emergency deployment procedures.

| Параметр | Значение |
|----------|----------|
| ID | `hotfix_generation` |
| Время | 30m |
| Порог уверенности | 0.9 |
| Сложность | 8/10 |

**Требует:** `code_writing`, `bug_diagnosis`
**Комбинируется с:** `incident_response`
**Алиасы:** hotfix, emergency fix, critical fix


### Performance Debugging

Debug performance issues by profiling code, identifying bottlenecks, analyzing slow queries, and optimizing hot paths. Systematic approach to finding performance problems.

| Параметр | Значение |
|----------|----------|
| ID | `performance_debugging` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |

**Требует:** `profiling`
**Комбинируется с:** `performance_analysis`, `profiling`
**Алиасы:** perf debugging, performance issues, slow performance


## 🔴 Экспертный навыки


### Root Cause Analysis

Perform deep analysis to identify the fundamental cause of problems, not just symptoms. Includes systematic investigation, hypothesis testing, and documentation of findings.

| Параметр | Значение |
|----------|----------|
| ID | `root_cause_analysis` |
| Время | 1h |
| Порог уверенности | 0.9 |
| Сложность | 8/10 |

**Требует:** `bug_diagnosis`
**Комбинируется с:** `bug_diagnosis`, `error_investigation`
**Алиасы:** rca, root cause, analysis


---

[← Назад к каталогу навыков](./index.md)
