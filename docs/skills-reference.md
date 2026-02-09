# 📚 ASMO Skills Reference

Полный справочник всех 55 скилов в системе ASMO после оптимизации.

**Last updated:** 2025-02-09
**Version:** 3.0 (after refactoring)

---

## 📊 Обзор по категориям

| Категория | Количество | Скилы |
|-----------|------------|-------|
| **Development** | 7 | code_writing, feature_implementation, refactoring, integration, typescript_expert, business_logic |
| **Testing** | 6 | unit_testing, e2e_testing, test_coverage, bug_reproduction, system_testing |
| **Debugging** | 2 | debug_investigation, hotfix_generation |
| **Architecture** | 7 | system_design, architecture_decisions, adr_creation, data_modeling, scalability_planning, technology_evaluation, architecture_review |
| **Performance** | 6 | code_optimization, profiling, performance_analysis, bundle_optimization, caching_strategy, query_optimization |
| **UI/UX Design** | 4 | ui_styling, responsive_design, accessibility, wireframes |
| **UX Design** | 4 | user_flows, prototyping, usability, user_research, user_testing |
| **DevOps** | 5 | deployment, ci_cd, infrastructure, monitoring, incident_response |
| **Product** | 5 | requirements, user_stories, prioritization, roadmap, strategy, market_research |
| **Business** | 3 | business_logic, kpis, process_modeling |
| **Project Management** | 6 | coordination, sprint_planning, tracking, risk_management, resource_allocation, stakeholder_relations |

**Total:** 55 skills

---

## 🎯 Development Skills (7)

### code_writing
**Category:** development
**Complexity:** intermediate
**Time:** 30m

**Description:** Write production-quality code following best practices, clean code principles, and project conventions.

**Used by:**
- developer (required)
- integration (requires)
- hotfix_generation (requires)

**Works with:** typescript_expert, unit_testing

**When to use:**
- Writing new code
- Implementing features
- Creating functions/classes
- Code generation

---

### feature_implementation
**Category:** development
**Complexity:** advanced
**Time:** 2h

**Description:** Implement complete features from requirements to deployment, including code, tests, and documentation.

**Used by:**
- developer (required)

**Works with:** code_writing, typescript_expert, unit_testing, integration

**When to use:**
- Implementing new features
- Full feature development
- End-to-end implementation

---

### refactoring
**Category:** development
**Complexity:** intermediate
**Time:** 1h

**Description:** Restructure existing code to improve quality, maintainability, and performance without changing behavior.

**Used by:**
- developer (optional)

**Works with:** typescript_expert, unit_testing

**When to use:**
- Improving code quality
- Reducing technical debt
- Optimizing code structure
- Applying design patterns

---

### integration
**Category:** development
**Complexity:** advanced
**Time:** 1.5h

**Description:** Integrate components, services, APIs, and third-party systems.

**Used by:**
- developer (optional)

**Works with:** code_writing, unit_testing

**When to use:**
- API integration
- Service integration
- Third-party libraries
- System integration

---

### typescript_expert
**Category:** development
**Complexity:** expert
**Time:** N/A

**Description:** Expert-level TypeScript knowledge including advanced types, generics, decorators, and type-safe patterns.

**Used by:**
- developer (required)
- code_writing (requires)
- feature_implementation (requires)
- refactoring (requires)

**Works with:** All development skills

**When to use:**
- TypeScript development
- Type-safe code
- Complex type definitions
- Generic programming

---

### business_logic
**Category:** business
**Complexity:** advanced
**Time:** 1.5h

**Description:** Implement complex business rules, workflows, and domain logic.

**Used by:**
- business-analyst (required)

**Works with:** requirements, user_stories

**When to use:**
- Business rules implementation
- Workflow logic
- Domain modeling
- Business constraints

---

## 🧪 Testing Skills (6)

### unit_testing
**Category:** testing
**Complexity:** intermediate
**Time:** 30m

**Description:** Create unit tests with Jest/Vitest to verify individual components and functions.

**Used by:**
- developer (required)
- tester (required)
- test-architect (required)

**Works with:** e2e_testing, test_coverage

**When to use:**
- Testing functions/classes
- TDD development
- Unit test coverage
- Component testing

---

### e2e_testing
**Category:** testing
**Complexity:** advanced
**Time:** 45m

**Description:** End-to-end testing with Playwright to verify complete user workflows.

**Used by:**
- tester (required)
- test-architect (required)

**Works with:** unit_testing, system_testing

**When to use:**
- User flow testing
- Integration testing
- Browser automation
- Acceptance testing

---

### test_coverage
**Category:** testing
**Complexity:** intermediate
**Time:** 20m

**Description:** Analyze and improve test coverage metrics, identify untested code paths.

**Used by:**
- tester (required)
- test-architect (required)

**Works with:** unit_testing, e2e_testing

**When to use:**
- Coverage analysis
- Identifying gaps
- Quality metrics
- Test completeness

---

### bug_reproduction
**Category:** testing
**Complexity:** intermediate
**Time:** 30m

**Description:** Reproduce bugs systematically to isolate root causes and verify fixes.

**Used by:**
- (currently unused - candidate for removal)

**Works with:** debug_investigation

**When to use:**
- Bug investigation
- Issue reproduction
- Test case creation

---

### system_testing ⭐ (Unified)
**Category:** testing
**Complexity:** intermediate
**Time:** 30m-1h

**Description:** **[UNIFIED]** End-to-end system testing including acceptance testing and smoke testing. Validates system behavior and user requirements.

**Replaces:** acceptance_testing, smoke_testing

**Used by:**
- tester (optional)
- test-architect (optional)

**Works with:** e2e_testing, unit_testing

**When to use:**
- Acceptance testing (UAT)
- Smoke testing after deployments
- System-level validation
- Integration verification

---

## 🐛 Debugging Skills (2)

### debug_investigation ⭐ (Unified)
**Category:** debugging
**Complexity:** advanced
**Time:** 30m-2h

**Description:** **[UNIFIED]** Comprehensive debugging including bug diagnosis, error investigation, root cause analysis, and log analysis. Systematically identify, analyze, and resolve software defects.

**Replaces:** bug_diagnosis, error_investigation, root_cause_analysis, log_analysis

**Used by:**
- debugger (required)

**Works with:** hotfix_generation

**When to use:**
- Investigating bugs
- Error analysis
- Root cause analysis
- Log analysis
- Production debugging
- Systematic problem solving

---

### hotfix_generation
**Category:** debugging
**Complexity:** advanced
**Time:** 30m

**Description:** Generate quick fixes for critical production issues with minimal risk.

**Used by:**
- debugger (optional)

**Works with:** debug_investigation, code_writing

**When to use:**
- Critical production bugs
- Emergency fixes
- Hotfix releases
- Urgent patches

---

## 🏗️ Architecture Skills (7)

### system_design
**Category:** architecture
**Complexity:** expert
**Time:** 1h

**Description:** Design system architecture, components, interfaces, and interactions.

**Used by:**
- architect (required)

**Works with:** architecture_decisions, data_modeling

**When to use:**
- System architecture
- Component design
- High-level design
- Technical planning

---

### architecture_decisions
**Category:** architecture
**Complexity:** expert
**Time:** 45m

**Description:** Make informed architectural decisions considering trade-offs, alternatives, and long-term impact.

**Used by:**
- architect (required)

**Works with:** adr_creation, technology_evaluation

**When to use:**
- Technology choices
- Architecture patterns
- Design decisions
- Trade-off analysis

---

### adr_creation
**Category:** architecture
**Complexity:** intermediate
**Time:** 30m

**Description:** Create Architecture Decision Records (ADRs) documenting important decisions, context, and consequences.

**Used by:**
- architect (required)

**Works with:** architecture_decisions

**When to use:**
- Documenting decisions
- Architecture records
- Decision context
- Team alignment

---

### data_modeling
**Category:** architecture
**Complexity:** advanced
**Time:** 1h

**Description:** Design data models, entity relationships, and database schemas.

**Used by:**
- architect (required)
- data-architect (required)

**Works with:** system_design

**When to use:**
- Database design
- Entity modeling
- Data architecture
- Schema design

---

### scalability_planning
**Category:** architecture
**Complexity:** expert
**Time:** 1.5h

**Description:** Plan system scalability, capacity, and growth strategies.

**Used by:**
- architect (optional)

**Works with:** system_design, performance_analysis

**When to use:**
- Scalability design
- Capacity planning
- Growth strategy
- Performance planning

---

### technology_evaluation
**Category:** architecture
**Complexity:** advanced
**Time:** 2h

**Description:** Evaluate technologies, frameworks, and tools for project fit.

**Used by:**
- architect (optional)

**Works with:** architecture_decisions

**When to use:**
- Technology selection
- Framework evaluation
- Tool comparison
- Tech stack decisions

---

### architecture_review
**Category:** architecture
**Complexity:** expert
**Time:** 4-8h

**Description:** Comprehensive architecture review covering design, technology, and documentation.

**Used by:**
- (workflow skill)

**When to use:**
- Architecture audits
- Design reviews
- System assessment

---

## ⚡ Performance Skills (6)

### code_optimization
**Category:** performance
**Complexity:** advanced
**Time:** 1h

**Description:** Optimize code for better performance, efficiency, and resource usage.

**Used by:**
- optimizer (required)

**Works with:** profiling, performance_analysis

**When to use:**
- Performance optimization
- Code efficiency
- Resource optimization
- Speed improvements

---

### profiling
**Category:** performance
**Complexity:** advanced
**Time:** 30m

**Description:** Profile application performance to identify bottlenecks and hot spots.

**Used by:**
- optimizer (required)

**Works with:** code_optimization, performance_analysis

**When to use:**
- Performance profiling
- Bottleneck identification
- Performance analysis
- Resource monitoring

---

### performance_analysis
**Category:** performance
**Complexity:** advanced
**Time:** 1h

**Description:** Analyze application performance metrics and identify optimization opportunities.

**Used by:**
- optimizer (required)

**Works with:** profiling, code_optimization

**When to use:**
- Performance assessment
- Metrics analysis
- Optimization planning
- Benchmark analysis

---

### bundle_optimization
**Category:** performance
**Complexity:** advanced
**Time:** 45m

**Description:** Optimize JavaScript bundles for size and loading performance.

**Used by:**
- (currently unused)

**Works with:** code_optimization

**When to use:**
- Bundle size reduction
- Loading optimization
- Tree shaking
- Code splitting

---

### caching_strategy
**Category:** performance
**Complexity:** advanced
**Time:** 1h

**Description:** Design and implement caching strategies for performance improvement.

**Used by:**
- optimizer (optional)

**Works with:** performance_analysis

**When to use:**
- Cache design
- Performance caching
- Data caching
- API caching

---

### query_optimization
**Category:** performance
**Complexity:** advanced
**Time:** 45m

**Description:** Optimize database queries for better performance and efficiency.

**Used by:**
- optimizer (optional)

**Works with:** performance_analysis

**When to use:**
- SQL optimization
- Query performance
- Database tuning
- Index optimization

---

## 🎨 UI/UX Design Skills (8)

### ui_styling ⭐ (Unified)
**Category:** ui_design
**Complexity:** intermediate
**Time:** 30m-2h

**Description:** **[UNIFIED]** Component styling with Tailwind CSS, animations, CSS optimization, and modern styling techniques. Comprehensive UI development skill.

**Replaces:** component_styling, animation, css_optimization, tailwind_css

**Used by:**
- ui-developer (required)

**Works with:** responsive_design, accessibility

**When to use:**
- Component styling
- Tailwind CSS
- CSS animations
- Style optimization
- Design systems
- UI libraries

---

### responsive_design
**Category:** ui_design
**Complexity:** intermediate
**Time:** 45m

**Description:** Create responsive layouts that work across devices and screen sizes.

**Used by:**
- ui-developer (required)

**Works with:** ui_styling, accessibility

**When to use:**
- Mobile-first design
- Responsive layouts
- Multi-device support
- Breakpoint design

---

### accessibility
**Category:** ui_design
**Complexity:** advanced
**Time:** 1h

**Description:** Ensure WCAG compliance, ARIA support, keyboard navigation, and screen reader compatibility.

**Used by:**
- ui-developer (optional)

**Works with:** ui_styling, responsive_design

**When to use:**
- WCAG compliance
- Accessibility audit
- ARIA implementation
- Inclusive design

---

### wireframes
**Category:** ux_design
**Complexity:** basic
**Time:** 45m

**Description:** Create wireframes and mockups for UI/UX design.

**Used by:**
- ux-designer (required)

**Works with:** user_flows, prototyping

**When to use:**
- UI mockups
- Wireframe creation
- Design planning
- Visual concepts

---

### user_flows
**Category:** ux_design
**Complexity:** intermediate
**Time:** 1h

**Description:** Design user flows and journey maps for optimal user experience.

**Used by:**
- ux-designer (required)

**Works with:** wireframes, usability

**When to use:**
- User journey mapping
- Flow design
- UX planning
- Interaction design

---

### prototyping
**Category:** ux_design
**Complexity:** intermediate
**Time:** 1.5h

**Description:** Create interactive prototypes for testing and validation.

**Used by:**
- ux-designer (optional)

**Works with:** wireframes, user_flows

**When to use:**
- Interactive prototypes
- Design validation
- User testing
- Concept demonstration

---

### usability
**Category:** ux_design
**Complexity:** advanced
**Time:** 1h

**Description:** Evaluate and improve usability through heuristics and user testing.

**Used by:**
- ux-designer (required)

**Works with:** user_flows, user_testing

**When to use:**
- Usability testing
- Heuristic evaluation
- UX improvement
- User experience audit

---

### user_research
**Category:** ux_design
**Complexity:** advanced
**Time:** 2h

**Description:** Conduct user research to understand needs, behaviors, and pain points.

**Used by:**
- ux-designer (optional)

**Works with:** user_testing, usability

**When to use:**
- User interviews
- Research studies
- Need analysis
- User insights

---

### user_testing
**Category:** ux_design
**Complexity:** advanced
**Time:** 2h

**Description:** Conduct user testing sessions to validate designs and gather feedback.

**Used by:**
- ux-designer (optional)

**Works with:** usability, user_research

**When to use:**
- Usability testing
- User feedback
- Design validation
- A/B testing

---

## 🚀 DevOps Skills (5)

### deployment
**Category:** devops
**Complexity:** advanced
**Time:** 15m

**Description:** Deploy applications to production and staging environments.

**Used by:**
- devops (required)

**Works with:** ci_cd, infrastructure, monitoring

**When to use:**
- Production deployment
- Staging deployment
- Release deployment
- Continuous deployment

---

### ci_cd
**Category:** devops
**Complexity:** advanced
**Time:** 20m

**Description:** Set up and maintain CI/CD pipelines for automated testing and deployment.

**Used by:**
- devops (required)

**Works with:** deployment, unit_testing, e2e_testing

**When to use:**
- Pipeline setup
- Automation
- Continuous integration
- Deployment automation

---

### infrastructure
**Category:** devops
**Complexity:** advanced
**Time:** 30m

**Description:** Manage infrastructure, containers, cloud resources, and configurations.

**Used by:**
- devops (required)

**Works with:** deployment, monitoring

**When to use:**
- Infrastructure setup
- Cloud configuration
- Container orchestration
- Resource management

---

### monitoring
**Category:** devops
**Complexity:** intermediate
**Time:** 20m

**Description:** Set up monitoring, alerting, and observability for applications.

**Used by:**
- devops (required)

**Works with:** infrastructure, incident_response

**When to use:**
- Monitoring setup
- Alerting configuration
- Observability
- Performance monitoring

---

### incident_response
**Category:** devops
**Complexity:** advanced
**Time:** varies

**Description:** Respond to production incidents, investigate issues, and coordinate resolution.

**Used by:**
- devops (optional)

**Works with:** monitoring, debug_investigation

**When to use:**
- Production incidents
- Outage response
- Emergency resolution
- Post-mortem analysis

---

## 📦 Product & Business Skills (8)

### requirements
**Category:** business
**Complexity:** intermediate
**Time:** 1.5h

**Description:** Gather, analyze, and document business requirements.

**Used by:**
- business-analyst (required)

**Works with:** user_stories, business_logic

**When to use:**
- Requirements gathering
- Business analysis
- Requirement documentation
- Stakeholder interviews

---

### user_stories
**Category:** business
**Complexity:** basic
**Time:** 30m

**Description:** Write user stories with acceptance criteria following agile practices.

**Used by:**
- business-analyst (required)

**Works with:** requirements, sprint_planning

**When to use:**
- Story writing
- Backlog creation
- Feature definition
- Agile planning

---

### kpis
**Category:** business
**Complexity:** intermediate
**Time:** 1h

**Description:** Define and track Key Performance Indicators for business success.

**Used by:**
- business-analyst (optional)

**Works with:** strategy, prioritization

**When to use:**
- KPI definition
- Metrics planning
- Success measurement
- Performance tracking

---

### process_modeling
**Category:** business
**Complexity:** advanced
**Time:** 1.5h

**Description:** Model business processes, workflows, and operational procedures.

**Used by:**
- business-analyst (optional)

**Works with:** requirements, business_logic

**When to use:**
- Process documentation
- Workflow modeling
- Business process design
- Process optimization

---

### market_research ⭐ (Unified)
**Category:** product
**Complexity:** advanced
**Time:** 1-2h

**Description:** **[UNIFIED]** Market and competitive analysis to identify opportunities and threats. Combined market analysis and competitive research.

**Replaces:** competitive_analysis, market_analysis

**Used by:**
- product-owner (optional)
- analyst (optional)

**Works with:** strategy, prioritization

**When to use:**
- Market analysis
- Competitive analysis
- Market opportunities
- Strategic planning
- Competitor research

---

### prioritization
**Category:** product
**Complexity:** advanced
**Time:** 1h

**Description:** Prioritize features, requirements, and backlog items based on value and impact.

**Used by:**
- product-owner (required)

**Works with:** roadmap, strategy

**When to use:**
- Feature prioritization
- Backlog prioritization
- Decision making
- Resource allocation

---

### roadmap
**Category:** product
**Complexity:** advanced
**Time:** 2h

**Description:** Create and maintain product roadmaps aligning features with strategy.

**Used by:**
- product-owner (required)

**Works with:** strategy, prioritization

**When to use:**
- Roadmap creation
- Strategic planning
- Feature planning
- Timeline planning

---

### strategy
**Category:** product
**Complexity:** expert
**Time:** 2h

**Description:** Define product strategy, vision, and long-term goals.

**Used by:**
- product-owner (required)

**Works with:** roadmap, prioritization

**When to use:**
- Strategy definition
- Vision setting
- Strategic planning
- Product direction

---

## 📋 Project Management Skills (6)

### coordination
**Category:** project_management
**Complexity:** intermediate
**Time:** varies

**Description:** Coordinate team activities, dependencies, and cross-functional work.

**Used by:**
- project-manager (required)

**Works with:** sprint_planning, tracking

**When to use:**
- Team coordination
- Dependency management
- Cross-team alignment
- Activity planning

---

### sprint_planning
**Category:** project_management
**Complexity:** intermediate
**Time:** 1h

**Description:** Plan sprints, estimate work, and allocate resources.

**Used by:**
- project-manager (required)

**Works with:** coordination, tracking

**When to use:**
- Sprint planning
- Capacity planning
- Work estimation
- Sprint goals

---

### tracking
**Category:** project_management
**Complexity:** basic
**Time:** 30m

**Description:** Track project progress, tasks, and deliverables.

**Used by:**
- project-manager (required)

**Works with:** sprint_planning, coordination

**When to use:**
- Progress tracking
- Status reporting
- Task management
- Milestone tracking

---

### risk_management
**Category:** project_management
**Complexity:** advanced
**Time:** 1h

**Description:** Identify, assess, and mitigate project risks.

**Used by:**
- project-manager (optional)

**Works with:** coordination, sprint_planning

**When to use:**
- Risk assessment
- Risk mitigation
- Risk planning
- Issue management

---

### resource_allocation
**Category:** project_management
**Complexity:** advanced
**Time:** 1h

**Description:** Allocate and optimize team resources across projects.

**Used by:**
- project-manager (optional)

**Works with:** sprint_planning, coordination

**When to use:**
- Resource planning
- Capacity management
- Team allocation
- Workload balancing

---

### stakeholder_relations ⭐ (Unified)
**Category:** project_management
**Complexity:** advanced
**Time:** varies

**Description:** **[UNIFIED]** Stakeholder management and communication to build effective partnerships. Combines stakeholder management and communication.

**Replaces:** stakeholder_management, stakeholder_communication

**Used by:**
- project-manager (optional)
- business-analyst (optional)

**Works with:** coordination, sprint_planning

**When to use:**
- Stakeholder management
- Communication planning
- Expectation management
- Relationship building
- Status communication

---

## 🎓 Specialized Skills (3)

### bid_management
**Category:** project_specific
**Complexity:** advanced
**Time:** 2h

**Description:** Manage bid processes, RFQs, and vendor selection.

**Used by:**
- (project-specific - not in standard roles)

**When to use:**
- Bid management
- RFQ processing
- Vendor selection

---

## 📊 Usage Statistics

### Most Used Skills

**Top 10 most frequently used:**

1. **unit_testing** - 3 roles (developer, tester, test-architect)
2. **e2e_testing** - 3 roles (tester, test-architect)
3. **test_coverage** - 3 roles (tester, test-architect)
4. **code_writing** - 2 roles (developer, + dependencies)
5. **typescript_expert** - 2 roles (developer, + dependencies)
6. **system_design** - 1 role (architect)
7. **architecture_decisions** - 1 role (architect)
8. **ui_styling** - 1 role (ui-developer)
9. **debug_investigation** - 1 role (debugger)
10. **deployment** - 1 role (devops)

### Unified Skills ⭐

**5 unified skills that replaced 14 old skills:**

1. **ui_styling** → replaced 4 skills (35% reduction in UI)
2. **debug_investigation** → replaced 4 skills (57% reduction in debugging)
3. **system_testing** → replaced 2 skills
4. **market_research** → replaced 2 skills
5. **stakeholder_relations** → replaced 2 skills

### Unused Skills (Candidates for Removal)

1. **caching_strategy** - Not used in any role
2. **bug_reproduction** - Could be merged into debug_investigation

---

## 🔍 Quick Reference by Use Case

### "I need to implement a feature"
→ Use: **feature_implementation**, code_writing, typescript_expert, unit_testing

### "I need to fix a bug"
→ Use: **debug_investigation**, hotfix_generation

### "I need to optimize performance"
→ Use: **code_optimization**, profiling, performance_analysis

### "I need to design architecture"
→ Use: **system_design**, architecture_decisions, adr_creation

### "I need to style UI"
→ Use: **ui_styling**, responsive_design, accessibility

### "I need to test the system"
→ Use: **unit_testing**, e2e_testing, test_coverage, system_testing

### "I need to deploy"
→ Use: **deployment**, ci_cd, infrastructure, monitoring

### "I need to manage project"
→ Use: **sprint_planning**, coordination, tracking, stakeholder_relations

### "I need to plan product"
→ Use: **strategy**, roadmap, prioritization, requirements

---

## 📖 Legend

**⭐ Unified Skill** - Combines multiple old skills into one comprehensive skill

**Complexity Levels:**
- **basic** - Simple, straightforward tasks
- **intermediate** - Moderate complexity
- **advanced** - Complex, requires expertise
- **expert** - Very complex, high-level expertise

**Time Estimates:**
- Quick: <30m
- Short: 30m-1h
- Medium: 1-2h
- Long: 2-4h
- Very Long: 4h+

---

**Total: 55 Skills | 5 Unified | 35% Reduction | 100% Sync** ✅
