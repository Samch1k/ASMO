# Каталог агентов

AI1st включает **20 агентов**, организованных в три категории.

## Обзор

| Категория | Количество | Описание |
|-----------|------------|----------|
| [Core](#core-агенты) | 6 | Базовые агенты разработки |
| [Specialized](#специализированные-агенты) | 14 | Специализированные роли |
| [Validation](#агенты-валидации) | 0 | Агенты проверки и контроля |

## Core агенты

Базовые агенты для стандартных задач разработки.

| Агент | Описание | Тип |
|-------|----------|-----|
| [🏗️ Architect](./core/architect.md) | System architecture and design decisions. Creates architectu... | Аналитический |
| [👨‍💻 Developer](./core/developer.md) | Feature implementation and code generation. Writes productio... | Исполнительный |
| [🐛 Debugger](./core/debugger.md) | Bug investigation and root cause analysis. Diagnoses errors,... | Гибридный |
| [⚡ Optimizer](./core/optimizer.md) | Performance analysis and optimization. Profiles code perform... | Гибридный |
| [🧪 Tester](./core/tester.md) | Test creation and quality assurance. Creates unit tests, int... | Исполнительный |
| [🚀 DevOps](./core/devops.md) | Deployment, CI/CD, and infrastructure management. Handles de... | Исполнительный |

## Специализированные агенты

Агенты для специфических доменов и задач.

| Агент | Описание | Домен |
|-------|----------|-------|
| [🎨 UI Developer](./specialized/ui-developer.md) | Frontend and UI component development specialist. ... | UI/Frontend Development |
| [🎭 UX Designer](./specialized/ux-designer.md) | User experience design and prototyping specialist.... | UX Design |
| [📊 Business Analyst](./specialized/business-analyst.md) | Requirements gathering and business analysis speci... | Business Analysis |
| [📋 Project Manager](./specialized/project-manager.md) | Project planning and coordination specialist. Plan... | Project Management |
| [🎯 Product Owner](./specialized/product-owner.md) | Product vision and prioritization specialist. Defi... | Product Management |
| [🔄 Scrum Master](./specialized/scrum-master.md) | Agile ceremonies and sprint management specialist.... | Agile/Scrum Management |
| [🔒 Security Specialist](./specialized/security-specialist.md) | Security audit and vulnerability assessment specia... | Security & Compliance |
| [📈 Performance Engineer](./specialized/performance-engineer.md) | Performance profiling and optimization specialist.... | Performance Engineering |
| [💾 Data Architect](./specialized/data-architect.md) | Database schema design and data migration speciali... | Database Architecture |
| [🔌 API Designer](./specialized/api-designer.md) | RESTful API and OpenAPI specification specialist. ... | API Design |
| [✅ Design Validator](./specialized/design-validator.md) | Architecture and API design validation specialist.... | System Architecture Validation |
| [🔀 Merge Coordinator](./specialized/merge-coordinator.md) | Parallel agent output consolidation specialist. Me... | Parallel Output Consolidation |
| [👁️ Post-Deploy Monitor](./specialized/post-deploy-monitor.md) | Deployment health and smoke testing specialist. Mo... | Deployment Monitoring |
| [📝 Requirements Validator](./specialized/requirements-validator.md) | Requirements quality assurance specialist. Validat... | Requirements Quality Assurance |

## Агенты валидации

Агенты для проверки качества и контроля.

| Агент | Описание | Тип |
|-------|----------|-----|


## Типы ролей

- **Аналитический (reasoning)** - Агенты, которые анализируют и принимают решения
- **Исполнительный (execution)** - Агенты, которые выполняют конкретные действия
- **Гибридный (hybrid)** - Комбинация анализа и исполнения

## См. также

- [Концепция агентов](../../concepts/agents.md)
- [Создание custom агентов](../../guides/custom-agents.md)
