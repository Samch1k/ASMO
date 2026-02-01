# 🏗️ Архитектура

7 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **ADR Creation** | 🟡 Средний | 30m | 90% |
| **Architecture Decisions** | 🔴 Экспертный | 45m | 85% |
| **Architecture Review** | 🔴 Экспертный | 4-8h | 80% |
| **Data Modeling** | 🟠 Продвинутый | 1h | 85% |
| **Scalability Planning** | 🔴 Экспертный | 1.5h | 75% |
| **System Design** | 🔴 Экспертный | 1h | 80% |
| **Technology Evaluation** | 🟠 Продвинутый | 2h | 80% |


## 🟡 Средний навыки


### ADR Creation

Create Architecture Decision Records (ADRs) to document important architectural decisions, context, alternatives considered, and consequences. Maintains architectural knowledge.

| Параметр | Значение |
|----------|----------|
| ID | `adr_creation` |
| Время | 30m |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |

**Требует:** `architecture_decisions`
**Комбинируется с:** `architecture_decisions`
**Алиасы:** adr, decision record, architecture documentation


## 🟠 Продвинутый навыки


### Data Modeling

Design database schemas, entity relationships, and data structures. Includes normalization, indexing strategies, and ensuring data integrity.

| Параметр | Значение |
|----------|----------|
| ID | `data_modeling` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `system_design`
**Алиасы:** database design, schema, data structure


### Technology Evaluation

Evaluate new technologies, frameworks, libraries, and tools for adoption. Includes proof-of-concept development, comparison analysis, and recommendation reports.

| Параметр | Значение |
|----------|----------|
| ID | `technology_evaluation` |
| Время | 2h |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |


**Комбинируется с:** `architecture_decisions`
**Алиасы:** tech eval, evaluation, technology assessment


## 🔴 Экспертный навыки


### Architecture Decisions

Make informed decisions about technology choices, architectural patterns, and design trade-offs. Evaluate alternatives and document decisions with rationale.

| Параметр | Значение |
|----------|----------|
| ID | `architecture_decisions` |
| Время | 45m |
| Порог уверенности | 0.9 |
| Сложность | 9/10 |

**Требует:** `system_design`
**Комбинируется с:** `adr_creation`, `technology_evaluation`
**Алиасы:** decisions, tech choices, architectural decisions


### Architecture Review

Comprehensive system architecture review combining design decisions, technology evaluation, and documentation. Reviews architecture decisions, system design, technology choices, and creates ADRs. Use when: reviewing system architecture, evaluating design decisions, conducting architecture audits. Keywords: architecture, review, ADR, design decisions

| Параметр | Значение |
|----------|----------|
| ID | `architecture_review` |
| Время | 4-8h |
| Порог уверенности | 0.85 |
| Сложность | 9/10 |






### Scalability Planning

Plan for system growth and performance under increased load. Includes capacity planning, load testing strategies, and designing for horizontal/vertical scaling.

| Параметр | Значение |
|----------|----------|
| ID | `scalability_planning` |
| Время | 1.5h |
| Порог уверенности | 0.9 |
| Сложность | 9/10 |

**Требует:** `system_design`
**Комбинируется с:** `performance_analysis`
**Алиасы:** scalability, scale, growth planning


### System Design

Design system architecture, define component boundaries, establish data flows, and plan scalability. Includes creating high-level architecture diagrams and technical specifications.

| Параметр | Значение |
|----------|----------|
| ID | `system_design` |
| Время | 1h |
| Порог уверенности | 0.85 |
| Сложность | 9/10 |


**Комбинируется с:** `architecture_decisions`, `data_modeling`
**Алиасы:** design, architecture, system architecture


---

[← Назад к каталогу навыков](./index.md)
