# 🏗️ Architecture

7 skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
| **ADR Creation** | 🟡 Intermediate | 30m | 90% |
| **Architecture Decisions** | 🔴 Expert | 45m | 85% |
| **Architecture Review** | 🔴 Expert | 4-8h | 80% |
| **Data Modeling** | 🟠 Advanced | 1h | 85% |
| **Scalability Planning** | 🔴 Expert | 1.5h | 75% |
| **System Design** | 🔴 Expert | 1h | 80% |
| **Technology Evaluation** | 🟠 Advanced | 2h | 80% |


## 🟡 Intermediate Skills


### ADR Creation

Create Architecture Decision Records (ADRs) to document important architectural decisions, context, alternatives considered, and consequences. Maintains architectural knowledge.

| Property | Value |
|----------|-------|
| ID | `adr_creation` |
| Time | 30m |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |

**Requires:** `architecture_decisions`
**Composable with:** `architecture_decisions`
**Aliases:** adr, decision record, architecture documentation


## 🟠 Advanced Skills


### Data Modeling

Design database schemas, entity relationships, and data structures. Includes normalization, indexing strategies, and ensuring data integrity.

| Property | Value |
|----------|-------|
| ID | `data_modeling` |
| Time | 1h |
| Confidence Threshold | 0.85 |
| Difficulty | 7/10 |


**Composable with:** `system_design`
**Aliases:** database design, schema, data structure


### Technology Evaluation

Evaluate new technologies, frameworks, libraries, and tools for adoption. Includes proof-of-concept development, comparison analysis, and recommendation reports.

| Property | Value |
|----------|-------|
| ID | `technology_evaluation` |
| Time | 2h |
| Confidence Threshold | 0.85 |
| Difficulty | 7/10 |


**Composable with:** `architecture_decisions`
**Aliases:** tech eval, evaluation, technology assessment


## 🔴 Expert Skills


### Architecture Decisions

Make informed decisions about technology choices, architectural patterns, and design trade-offs. Evaluate alternatives and document decisions with rationale.

| Property | Value |
|----------|-------|
| ID | `architecture_decisions` |
| Time | 45m |
| Confidence Threshold | 0.9 |
| Difficulty | 9/10 |

**Requires:** `system_design`
**Composable with:** `adr_creation`, `technology_evaluation`
**Aliases:** decisions, tech choices, architectural decisions


### Architecture Review

Comprehensive system architecture review combining design decisions, technology evaluation, and documentation. Reviews architecture decisions, system design, technology choices, and creates ADRs. Use when: reviewing system architecture, evaluating design decisions, conducting architecture audits. Keywords: architecture, review, ADR, design decisions

| Property | Value |
|----------|-------|
| ID | `architecture_review` |
| Time | 4-8h |
| Confidence Threshold | 0.85 |
| Difficulty | 9/10 |






### Scalability Planning

Plan for system growth and performance under increased load. Includes capacity planning, load testing strategies, and designing for horizontal/vertical scaling.

| Property | Value |
|----------|-------|
| ID | `scalability_planning` |
| Time | 1.5h |
| Confidence Threshold | 0.9 |
| Difficulty | 9/10 |

**Requires:** `system_design`
**Composable with:** `performance_analysis`
**Aliases:** scalability, scale, growth planning


### System Design

Design system architecture, define component boundaries, establish data flows, and plan scalability. Includes creating high-level architecture diagrams and technical specifications.

| Property | Value |
|----------|-------|
| ID | `system_design` |
| Time | 1h |
| Confidence Threshold | 0.85 |
| Difficulty | 9/10 |


**Composable with:** `architecture_decisions`, `data_modeling`
**Aliases:** design, architecture, system architecture


---

[← Back to Skills Catalog](./index.md)
