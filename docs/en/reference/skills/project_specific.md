# 🏢 Project Specific

6 skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
| **Award Process** | 🟠 Advanced | 1h | 85% |
| **Compliance Management** | 🔴 Expert | 1.5h | 80% |
| **Supplier Onboarding** | 🟠 Advanced | 1.5h | 80% |
| **Supplier Ratings** | 🟡 Intermediate | 45m | 85% |
| **Supplier Relationship Management** | 🟠 Advanced | varies | 80% |
| **Supplier Verification** | 🟠 Advanced | 1h | 85% |


## 🟡 Intermediate Skills


### Supplier Ratings

Manage supplier rating system in MeatConnect: collecting feedback, calculating ratings, displaying ratings, and using ratings for supplier matching.

| Property | Value |
|----------|-------|
| ID | `ratings` |
| Time | 45m |
| Confidence Threshold | 0.8 |
| Difficulty | 6/10 |

**Requires:** `business_logic`
**Composable with:** `supplier_matching`, `verification`
**Aliases:** supplier ratings, rating system, supplier feedback


## 🟠 Advanced Skills


### Award Process

Manage the award process in MeatConnect: evaluating bids, selecting winners, sending award notifications, and initiating contracts. Ensure compliance with procurement policies.

| Property | Value |
|----------|-------|
| ID | `award_process` |
| Time | 1h |
| Confidence Threshold | 0.9 |
| Difficulty | 8/10 |

**Requires:** `business_logic`, `compliance`
**Composable with:** `bid_management`, `rfq_workflow`
**Aliases:** award, contract award, winner selection


### Supplier Onboarding

Manage supplier onboarding process in MeatConnect: registration, document submission, verification, profile setup, and activation.

| Property | Value |
|----------|-------|
| ID | `onboarding` |
| Time | 1.5h |
| Confidence Threshold | 0.85 |
| Difficulty | 7/10 |

**Requires:** `business_logic`, `verification`
**Composable with:** `verification`, `compliance`
**Aliases:** supplier onboarding, onboard supplier, supplier registration


### Supplier Relationship Management

Manage ongoing relationships with suppliers: communication, issue resolution, performance reviews, and partnership development.

| Property | Value |
|----------|-------|
| ID | `relationship_management` |
| Time | varies |
| Confidence Threshold | 0.8 |
| Difficulty | 7/10 |

**Requires:** `stakeholder_management`
**Composable with:** `ratings`, `supplier_analytics`
**Aliases:** supplier relations, supplier management, vendor relations


### Supplier Verification

Verify supplier credentials, licenses, certifications, and compliance documentation. Ensure suppliers meet MeatConnect's standards before onboarding.

| Property | Value |
|----------|-------|
| ID | `verification` |
| Time | 1h |
| Confidence Threshold | 0.9 |
| Difficulty | 7/10 |

**Requires:** `compliance`
**Composable with:** `onboarding`, `compliance`
**Aliases:** supplier verification, verify supplier, credential check


## 🔴 Expert Skills


### Compliance Management

Ensure supplier compliance with regulatory requirements, food safety standards, and MeatConnect policies. Monitor compliance status and handle violations.

| Property | Value |
|----------|-------|
| ID | `compliance` |
| Time | 1.5h |
| Confidence Threshold | 0.95 |
| Difficulty | 9/10 |

**Requires:** `business_logic`
**Composable with:** `verification`, `onboarding`
**Aliases:** compliance, regulatory compliance, compliance check


---

[← Back to Skills Catalog](./index.md)
