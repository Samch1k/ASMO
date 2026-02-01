# 🏢 Проектные

6 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **Award Process** | 🟠 Продвинутый | 1h | 85% |
| **Compliance Management** | 🔴 Экспертный | 1.5h | 80% |
| **Supplier Onboarding** | 🟠 Продвинутый | 1.5h | 80% |
| **Supplier Ratings** | 🟡 Средний | 45m | 85% |
| **Supplier Relationship Management** | 🟠 Продвинутый | varies | 80% |
| **Supplier Verification** | 🟠 Продвинутый | 1h | 85% |


## 🟡 Средний навыки


### Supplier Ratings

Manage supplier rating system in MeatConnect: collecting feedback, calculating ratings, displaying ratings, and using ratings for supplier matching.

| Параметр | Значение |
|----------|----------|
| ID | `ratings` |
| Время | 45m |
| Порог уверенности | 0.8 |
| Сложность | 6/10 |

**Требует:** `business_logic`
**Комбинируется с:** `supplier_matching`, `verification`
**Алиасы:** supplier ratings, rating system, supplier feedback


## 🟠 Продвинутый навыки


### Award Process

Manage the award process in MeatConnect: evaluating bids, selecting winners, sending award notifications, and initiating contracts. Ensure compliance with procurement policies.

| Параметр | Значение |
|----------|----------|
| ID | `award_process` |
| Время | 1h |
| Порог уверенности | 0.9 |
| Сложность | 8/10 |

**Требует:** `business_logic`, `compliance`
**Комбинируется с:** `bid_management`, `rfq_workflow`
**Алиасы:** award, contract award, winner selection


### Supplier Onboarding

Manage supplier onboarding process in MeatConnect: registration, document submission, verification, profile setup, and activation.

| Параметр | Значение |
|----------|----------|
| ID | `onboarding` |
| Время | 1.5h |
| Порог уверенности | 0.85 |
| Сложность | 7/10 |

**Требует:** `business_logic`, `verification`
**Комбинируется с:** `verification`, `compliance`
**Алиасы:** supplier onboarding, onboard supplier, supplier registration


### Supplier Relationship Management

Manage ongoing relationships with suppliers: communication, issue resolution, performance reviews, and partnership development.

| Параметр | Значение |
|----------|----------|
| ID | `relationship_management` |
| Время | varies |
| Порог уверенности | 0.8 |
| Сложность | 7/10 |

**Требует:** `stakeholder_management`
**Комбинируется с:** `ratings`, `supplier_analytics`
**Алиасы:** supplier relations, supplier management, vendor relations


### Supplier Verification

Verify supplier credentials, licenses, certifications, and compliance documentation. Ensure suppliers meet MeatConnect's standards before onboarding.

| Параметр | Значение |
|----------|----------|
| ID | `verification` |
| Время | 1h |
| Порог уверенности | 0.9 |
| Сложность | 7/10 |

**Требует:** `compliance`
**Комбинируется с:** `onboarding`, `compliance`
**Алиасы:** supplier verification, verify supplier, credential check


## 🔴 Экспертный навыки


### Compliance Management

Ensure supplier compliance with regulatory requirements, food safety standards, and MeatConnect policies. Monitor compliance status and handle violations.

| Параметр | Значение |
|----------|----------|
| ID | `compliance` |
| Время | 1.5h |
| Порог уверенности | 0.95 |
| Сложность | 9/10 |

**Требует:** `business_logic`
**Комбинируется с:** `verification`, `onboarding`
**Алиасы:** compliance, regulatory compliance, compliance check


---

[← Назад к каталогу навыков](./index.md)
