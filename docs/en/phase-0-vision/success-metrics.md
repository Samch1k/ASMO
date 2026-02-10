# Success Metrics

Metrics are organized into four categories, each with a 6-month target horizon from initial public release.

## 1. Product Adoption

| Metric | Target (6 months) | Measurement |
|---|---|---|
| npm downloads | 1,000 / month | npm registry stats |
| GitHub stars | 500 | GitHub repository |
| Active users | 100 | CLI telemetry (opt-in) |
| Community contributions | 20 PRs merged | GitHub pull requests |

**Rationale:** These thresholds represent a healthy early-stage open-source project with organic growth. The 1,000 downloads/month target accounts for both direct installs and CI/CD pipeline usage.

## 2. Performance

| Metric | Target | Baseline |
|---|---|---|
| Workflow execution time | -20% vs. manual orchestration | Measured against equivalent manual multi-step prompting |
| LLM cost reduction | -30% via Session provider | Compared to pure API-mode execution of the same tasks |
| Task analysis latency | < 5 seconds | ComplexityAnalyzer end-to-end |
| Workflow selection latency | < 2 seconds | WorkflowSelector end-to-end |

**Rationale:** The Session provider ($0 cost) is the primary lever for cost reduction. Execution time improvements come from eliminating manual coordination overhead and enabling parallel agent execution.

## 3. Quality

| Metric | Target | Measurement |
|---|---|---|
| Bug report rate | < 5 / week | GitHub issues labeled `bug` |
| Test coverage | >= 80% | Jest coverage report |
| User satisfaction | >= 4.5 / 5 | Post-workflow survey (opt-in) |
| Workflow success rate | >= 90% | Completed without circuit breaker trips |
| Classification accuracy | >= 77% | ComplexityAnalyzer vs. human labels |

**Rationale:** The 77% classification accuracy target reflects the current LLM-based analysis capability. The 80% test coverage target aligns with the NFR for maintainability.

## 4. Developer Experience

| Metric | Target | Measurement |
|---|---|---|
| Documentation completeness | 100% | All public APIs documented |
| Time-to-first-workflow | < 5 minutes | From `npm install` to first successful `asmo run` |
| Issue resolution time | < 48 hours | Median time from issue open to fix merged |
| CLI error message clarity | >= 90% actionable | User feedback on error messages |

**Rationale:** Developer experience metrics ensure ASMO remains accessible. The 5-minute onboarding target means a developer can install, authenticate, and run their first workflow without reading extensive documentation.

## Tracking and Review

- Metrics are reviewed monthly during the first 6 months post-release.
- Dashboard: GitHub Insights + npm stats + internal MetricsCollector data.
- Course corrections are triggered when any metric falls below 70% of its target for two consecutive months.
