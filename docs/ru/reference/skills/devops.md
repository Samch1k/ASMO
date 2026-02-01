# 🚀 DevOps

6 навыков в этой категории.

## Обзор

| Навык | Сложность | Время | Успешность |
|-------|-----------|-------|------------|
| **CI/CD Pipeline Management** | 🟠 Продвинутый | 20m | 85% |
| **Deployment** | 🟠 Продвинутый | 15m | 90% |
| **Deployment Pipeline** | 🟠 Продвинутый | 2-8h | 80% |
| **Incident Response** | 🟠 Продвинутый | varies | 75% |
| **Infrastructure Management** | 🟠 Продвинутый | 30m | 80% |
| **Monitoring** | 🟡 Средний | 20m | 85% |


## 🟡 Средний навыки


### Monitoring

Monitor application health, performance metrics, error rates, and service availability. Includes setting up alerts, dashboards, and responding to monitoring signals.

| Параметр | Значение |
|----------|----------|
| ID | `monitoring` |
| Время | 20m |
| Порог уверенности | 0.85 |
| Сложность | 6/10 |


**Комбинируется с:** `deployment`, `incident_response`
**Алиасы:** monitoring, metrics, observability


## 🟠 Продвинутый навыки


### CI/CD Pipeline Management

Manage continuous integration and deployment pipelines using GitHub Actions. Includes pipeline configuration, automated testing, build optimization, and deployment automation.

| Параметр | Значение |
|----------|----------|
| ID | `ci_cd` |
| Время | 20m |
| Порог уверенности | 0.9 |
| Сложность | 7/10 |


**Комбинируется с:** `deployment`, `monitoring`
**Алиасы:** ci/cd, pipeline, automation


### Deployment

Deploy applications to production environments (Vercel for frontend, Render for backend). Includes build process, environment configuration, rollback procedures, and deployment verification.

| Параметр | Значение |
|----------|----------|
| ID | `deployment` |
| Время | 15m |
| Порог уверенности | 0.95 |
| Сложность | 8/10 |

**Требует:** `ci_cd`, `infrastructure`
**Комбинируется с:** `monitoring`
**Алиасы:** deploy, release, production


### Deployment Pipeline

Complete CI/CD deployment pipeline from build through monitoring. Includes continuous integration, deployment automation, and post-deploy monitoring. Use when: deploying applications, setting up CI/CD, automating deployments. Keywords: deployment, CI/CD, pipeline, automation

| Параметр | Значение |
|----------|----------|
| ID | `deployment_pipeline` |
| Время | 2-8h |
| Порог уверенности | 0.85 |
| Сложность | 8/10 |






### Incident Response

Respond to production incidents, perform root cause analysis, implement hotfixes, and restore service availability. Includes incident communication and post-mortem analysis.

| Параметр | Значение |
|----------|----------|
| ID | `incident_response` |
| Время | varies |
| Порог уверенности | 0.9 |
| Сложность | 9/10 |

**Требует:** `monitoring`, `debugging`
**Комбинируется с:** `monitoring`, `hotfix_generation`
**Алиасы:** incident, emergency, production issue


### Infrastructure Management

Manage cloud infrastructure, server configuration, database setup, and service provisioning. Includes infrastructure as code, resource optimization, and environment management.

| Параметр | Значение |
|----------|----------|
| ID | `infrastructure` |
| Время | 30m |
| Порог уверенности | 0.9 |
| Сложность | 8/10 |


**Комбинируется с:** `deployment`, `monitoring`
**Алиасы:** infra, cloud, servers


---

[← Назад к каталогу навыков](./index.md)
