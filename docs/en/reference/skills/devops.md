# 🚀 DevOps

6 skills in this category.

## Overview

| Skill | Complexity | Time | Success Rate |
|-------|------------|------|--------------|
| **CI/CD Pipeline Management** | 🟠 Advanced | 20m | 85% |
| **Deployment** | 🟠 Advanced | 15m | 90% |
| **Deployment Pipeline** | 🟠 Advanced | 2-8h | 80% |
| **Incident Response** | 🟠 Advanced | varies | 75% |
| **Infrastructure Management** | 🟠 Advanced | 30m | 80% |
| **Monitoring** | 🟡 Intermediate | 20m | 85% |


## 🟡 Intermediate Skills


### Monitoring

Monitor application health, performance metrics, error rates, and service availability. Includes setting up alerts, dashboards, and responding to monitoring signals.

| Property | Value |
|----------|-------|
| ID | `monitoring` |
| Time | 20m |
| Confidence Threshold | 0.85 |
| Difficulty | 6/10 |


**Composable with:** `deployment`, `incident_response`
**Aliases:** monitoring, metrics, observability


## 🟠 Advanced Skills


### CI/CD Pipeline Management

Manage continuous integration and deployment pipelines using GitHub Actions. Includes pipeline configuration, automated testing, build optimization, and deployment automation.

| Property | Value |
|----------|-------|
| ID | `ci_cd` |
| Time | 20m |
| Confidence Threshold | 0.9 |
| Difficulty | 7/10 |


**Composable with:** `deployment`, `monitoring`
**Aliases:** ci/cd, pipeline, automation


### Deployment

Deploy applications to production environments (Vercel for frontend, Render for backend). Includes build process, environment configuration, rollback procedures, and deployment verification.

| Property | Value |
|----------|-------|
| ID | `deployment` |
| Time | 15m |
| Confidence Threshold | 0.95 |
| Difficulty | 8/10 |

**Requires:** `ci_cd`, `infrastructure`
**Composable with:** `monitoring`
**Aliases:** deploy, release, production


### Deployment Pipeline

Complete CI/CD deployment pipeline from build through monitoring. Includes continuous integration, deployment automation, and post-deploy monitoring. Use when: deploying applications, setting up CI/CD, automating deployments. Keywords: deployment, CI/CD, pipeline, automation

| Property | Value |
|----------|-------|
| ID | `deployment_pipeline` |
| Time | 2-8h |
| Confidence Threshold | 0.85 |
| Difficulty | 8/10 |






### Incident Response

Respond to production incidents, perform root cause analysis, implement hotfixes, and restore service availability. Includes incident communication and post-mortem analysis.

| Property | Value |
|----------|-------|
| ID | `incident_response` |
| Time | varies |
| Confidence Threshold | 0.9 |
| Difficulty | 9/10 |

**Requires:** `monitoring`, `debugging`
**Composable with:** `monitoring`, `hotfix_generation`
**Aliases:** incident, emergency, production issue


### Infrastructure Management

Manage cloud infrastructure, server configuration, database setup, and service provisioning. Includes infrastructure as code, resource optimization, and environment management.

| Property | Value |
|----------|-------|
| ID | `infrastructure` |
| Time | 30m |
| Confidence Threshold | 0.9 |
| Difficulty | 8/10 |


**Composable with:** `deployment`, `monitoring`
**Aliases:** infra, cloud, servers


---

[← Back to Skills Catalog](./index.md)
