# 🐛 Debugging

7 skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
| **Bug Diagnosis** | 🟠 Advanced | 45m | 80% |
| **Bug Fix Workflow** | 🟡 Intermediate | 1-4h | 80% |
| **Error Investigation** | 🟡 Intermediate | 30m | 85% |
| **Hotfix Generation** | 🟠 Advanced | 30m | 80% |
| **Log Analysis** | 🟡 Intermediate | 30m | 85% |
| **Performance Debugging** | 🟠 Advanced | 1h | 75% |
| **Root Cause Analysis** | 🔴 Expert | 1h | 75% |


## 🟡 Intermediate Skills


### Bug Fix Workflow

Complete bug fixing workflow from diagnosis through verification. Includes bug diagnosis, reproduction, hotfix generation, and verification testing. Use when: fixing bugs, handling production issues, resolving defects. Keywords: bug, fix, hotfix, debugging

| Property | Value |
|----------|-------|
| ID | `bug_fix_workflow` |
| Time | 1-4h |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |






### Error Investigation

Investigate error messages, stack traces, and failure patterns to understand what went wrong. Includes log analysis, error tracking, and correlation of related issues.

| Property | Value |
|----------|-------|
| ID | `error_investigation` |
| Time | 30m |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |


**Composable with:** `log_analysis`, `bug_diagnosis`
**Aliases:** investigate error, error analysis, failure investigation


### Log Analysis

Analyze application logs from Render and Vercel to identify patterns, errors, and performance issues. Includes log querying, filtering, and correlation.

| Property | Value |
|----------|-------|
| ID | `log_analysis` |
| Time | 30m |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |


**Composable with:** `error_investigation`, `monitoring`
**Aliases:** logs, log investigation, analyze logs


## 🟠 Advanced Skills


### Bug Diagnosis

Investigate and diagnose bugs by analyzing symptoms, reproducing issues, examining logs, and identifying root causes. Systematic debugging approach to understand failures.

| Property | Value |
|----------|-------|
| ID | `bug_diagnosis` |
| Time | 45m |
| Confidence Threshold | 0.85 |
| Difficulty | 7/10 |


**Composable with:** `root_cause_analysis`, `error_investigation`
**Aliases:** debug, diagnose, investigate bug


### Hotfix Generation

Quickly create and deploy critical fixes for production issues. Includes minimal code changes, expedited testing, and emergency deployment procedures.

| Property | Value |
|----------|-------|
| ID | `hotfix_generation` |
| Time | 30m |
| Confidence Threshold | 0.9 |
| Difficulty | 8/10 |

**Requires:** `code_writing`, `bug_diagnosis`
**Composable with:** `incident_response`
**Aliases:** hotfix, emergency fix, critical fix


### Performance Debugging

Debug performance issues by profiling code, identifying bottlenecks, analyzing slow queries, and optimizing hot paths. Systematic approach to finding performance problems.

| Property | Value |
|----------|-------|
| ID | `performance_debugging` |
| Time | 1h |
| Confidence Threshold | 0.85 |
| Difficulty | 8/10 |

**Requires:** `profiling`
**Composable with:** `performance_analysis`, `profiling`
**Aliases:** perf debugging, performance issues, slow performance


## 🔴 Expert Skills


### Root Cause Analysis

Perform deep analysis to identify the fundamental cause of problems, not just symptoms. Includes systematic investigation, hypothesis testing, and documentation of findings.

| Property | Value |
|----------|-------|
| ID | `root_cause_analysis` |
| Time | 1h |
| Confidence Threshold | 0.9 |
| Difficulty | 8/10 |

**Requires:** `bug_diagnosis`
**Composable with:** `bug_diagnosis`, `error_investigation`
**Aliases:** rca, root cause, analysis


---

[← Back to Skills Catalog](./index.md)
