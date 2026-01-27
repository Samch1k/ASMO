# Agent Instruction Files

This directory contains markdown-based instruction files that guide agent behavior during workflow execution.

## Overview

AI1st uses a **Priority 2 feature** called the **Instruction Manager** that loads context-specific instructions for agents based on:
- Agent role (architect, developer, tester, etc.)
- Current workflow phase (design, implementation, testing, etc.)

This provides agents with:
- **Technology stack context** - What tools and frameworks are used
- **Role-specific responsibilities** - What each agent is expected to do
- **Phase-specific guidance** - How to approach each workflow phase
- **Quality standards** - What deliverables are expected
- **Communication style** - How to interact with other agents and users

## Directory Structure

```
instructions/
├── architect/
│   ├── system-prompt.md           # Core architect responsibilities
│   └── phases/
│       └── design.md              # Design phase guidance
├── developer/
│   ├── system-prompt.md           # Core developer responsibilities
│   └── phases/
│       └── implementation.md      # Implementation phase guidance
├── tester/
│   └── system-prompt.md           # Core tester responsibilities
├── ui-developer/
│   └── system-prompt.md           # Core UI developer responsibilities
├── ux-designer/
│   ├── system-prompt.md           # Core UX designer responsibilities
│   └── phases/
│       └── design.md              # UX design phase guidance
└── devops/
    └── system-prompt.md           # Core DevOps responsibilities
```

## How It Works

### Instruction Loading

The **InstructionManager** (`packages/core/src/orchestration/instruction-manager.ts`) automatically loads instructions based on the current context:

```typescript
import { InstructionManager } from '@ai1st/core'

const instructionManager = new InstructionManager('.ai1st/instructions')

// Load system prompt for a specific agent
const architectInstructions = await instructionManager.getSystemPrompt('architect')

// Load phase-specific instructions
const designPhaseInstructions = await instructionManager.getPhaseInstructions('architect', 'design')

// Get combined instructions (system + phase)
const fullInstructions = await instructionManager.getCombinedInstructions('architect', 'design')
```

### Workflow Integration

Instructions are automatically injected into agent prompts during workflow execution:

```typescript
// In workflow-engine.ts
const agent = agentRegistry.getAgent(step.role)
const instructions = await instructionManager.getCombinedInstructions(step.role, step.phase)

// Agent receives both system prompt and phase-specific guidance
await agent.execute({
  task,
  context: { ...context, instructions }
})
```

## Customizing Instructions

### 1. For Your Project

Copy this template directory to your project's `.ai1st/instructions/` folder:

```bash
cp -r packages/core/templates/instructions/ .ai1st/instructions/
```

### 2. Customize Technology Stack

Update `system-prompt.md` files to reflect your specific technology choices:

**Example: Updating developer instructions for your stack**

```markdown
# Original (generic)
**ORM**: Your chosen ORM (Prisma, Drizzle, TypeORM, etc.)

# Customized for your project
**ORM**: Drizzle ORM with PostgreSQL
```

### 3. Add Domain-Specific Context

Add your business domain context to system prompts:

**Example: E-commerce domain**

```markdown
## Business Domain Context

**E-commerce Platform:**
- Product catalog with variants (size, color)
- Shopping cart and checkout flow
- Payment processing (Stripe)
- Order fulfillment and tracking
- Customer accounts and wish lists
- Inventory management across warehouses
```

### 4. Define Your Standards

Update coding standards, performance targets, and quality metrics:

```markdown
## Performance Standards

- **API Response Time**: < 100ms for reads, < 500ms for writes
- **Page Load**: First Contentful Paint < 1s
- **Database Queries**: < 50ms for indexed queries
- **Test Coverage**: 90%+ for critical paths
```

### 5. Add Phase-Specific Instructions

Create additional phase files for your workflow phases:

```bash
# Example: Add testing phase for tester agent
mkdir -p .ai1st/instructions/tester/phases
touch .ai1st/instructions/tester/phases/testing.md
```

### 6. Create Project-Specific Agents

If you have project-specific agents (from `project-roles.json`), create instruction files for them:

```bash
# Example: Product catalog specialist agent
mkdir -p .ai1st/instructions/product-catalog-specialist
touch .ai1st/instructions/product-catalog-specialist/system-prompt.md
```

## Instruction File Format

### System Prompt Structure

Every `system-prompt.md` should follow this structure:

```markdown
# System Prompt: [Role Name]

## Role Description
Brief description of the agent's primary responsibility

## Technology Stack Context
Specific tools, frameworks, and technologies this agent uses

## Core Responsibilities
1-4 main areas of responsibility with bullet points

## General Constraints
Important rules, limits, and requirements

## Deliverables
What this agent produces when completing work

## Communication Style
How this agent should communicate with others
```

### Phase Instruction Structure

Phase-specific instruction files should follow this structure:

```markdown
# Phase Instructions: [Phase Name]

## Focus Areas
What to prioritize during this phase

## Constraints
Phase-specific rules and limits

## Deliverables
What must be produced in this phase

## Quality Checklist
Checklist of items to verify before completing phase
```

## Examples

### Example 1: E-commerce Developer Instructions

```markdown
# System Prompt: E-commerce Backend Developer

## Role Description

You are a Backend Developer for an e-commerce platform handling product catalogs, shopping carts, orders, and payments.

## Technology Stack Context

**Backend Technologies:**
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js with REST APIs
- **ORM**: Drizzle ORM with PostgreSQL
- **Payment**: Stripe for payment processing
- **Email**: Resend for transactional emails
- **Storage**: AWS S3 for product images
- **Cache**: Redis for cart sessions

**E-commerce Domain:**
- Product catalog with variants (size, color, etc.)
- Shopping cart with session persistence
- Checkout flow with address validation
- Payment processing with Stripe
- Order fulfillment with status tracking
- Inventory management with stock alerts

## Core Responsibilities

1. **Product Catalog APIs**
   - CRUD operations for products and variants
   - Search and filtering with full-text search
   - Category hierarchy management
   - Product image upload and optimization

2. **Shopping Cart**
   - Session-based cart for anonymous users
   - Persistent cart for authenticated users
   - Real-time inventory checking
   - Discount code application

3. **Order Processing**
   - Checkout flow with address validation
   - Payment processing with Stripe webhooks
   - Order confirmation emails
   - Inventory deduction with rollback on failure

## General Constraints

- **Performance**: Product search < 100ms, checkout < 2s
- **Inventory**: Prevent overselling with pessimistic locking
- **Payments**: Idempotent payment processing
- **Security**: PCI DSS compliance for payment data
```

### Example 2: Mobile App UX Designer Instructions

```markdown
# System Prompt: Mobile App UX Designer

## Role Description

You are a UX Designer for a mobile-first application used primarily on iOS and Android devices.

## Platform Context

**Mobile-Specific:**
- Primary devices: iPhone 12+, Samsung Galaxy S21+
- Screen sizes: 375px - 428px width
- Touch-first interface (no hover states)
- Gesture navigation (swipe, pinch, long-press)
- Platform conventions (iOS vs Android)

## Core Responsibilities

1. **Mobile-First Design**
   - Design for thumb-friendly navigation zones
   - Use platform-specific patterns (bottom tabs iOS, navigation drawer Android)
   - Plan for pull-to-refresh and infinite scroll
   - Design gesture interactions

2. **Touch Interface**
   - Minimum touch target: 48x48px (iOS) / 44x44px (Android)
   - Swipe gestures for navigation and actions
   - Long-press for contextual menus
   - No hover states (use active/pressed instead)

## Deliverables

1. **Mobile Wireframes** - iOS (375px, 428px), Android (360px, 412px)
2. **Gesture Map** - Document all gesture interactions
3. **Platform-Specific Patterns** - iOS and Android variants
```

## Best Practices

### 1. Keep Instructions Focused

- System prompts: Core responsibilities and context
- Phase instructions: Phase-specific guidance only
- Avoid duplicating information across files

### 2. Use Clear Examples

Include code snippets and examples to illustrate patterns:

```typescript
// Good: Specific example
const query = await db
  .select()
  .from(products)
  .where(eq(products.organizationId, ctx.user.orgId))

// Bad: Vague instruction
"Always filter by organization ID"
```

### 3. Update Regularly

- After each project, review what worked and what didn't
- Update instructions based on learnings
- Remove outdated patterns and technologies

### 4. Version Control

- Keep instructions in git alongside code
- Review changes in pull requests
- Document breaking changes in commit messages

### 5. Test Instructions

- Run workflows with new instructions
- Verify agents follow guidance correctly
- Adjust based on agent behavior

## Troubleshooting

### Agent Ignoring Instructions

**Problem**: Agent not following instruction file guidance

**Solutions**:
1. Check file path: Instructions must be in `.ai1st/instructions/`
2. Verify file naming: Must match agent ID exactly
3. Check InstructionManager initialization in config
4. Review agent logs for instruction loading errors

### Instructions Too Generic

**Problem**: Agent output doesn't match project needs

**Solutions**:
1. Add specific technology stack details
2. Include domain-specific examples
3. Add project-specific constraints
4. Define concrete quality metrics

### Instructions Too Verbose

**Problem**: Agent context window fills up with instructions

**Solutions**:
1. Remove redundant information
2. Move general patterns to shared documentation
3. Focus phase instructions on phase-specific guidance only
4. Use examples instead of lengthy explanations

## Related Documentation

- **Configuration Guide**: `packages/core/templates/README.md`
- **Agent Development**: `packages/core/src/agents/README.md`
- **Workflow Engine**: `packages/core/src/orchestration/README.md`
- **Instruction Manager Source**: `packages/core/src/orchestration/instruction-manager.ts`

## Contributing

When creating new instruction files:

1. Follow the standard structure (system prompt + phases)
2. Include concrete examples
3. Define clear deliverables
4. Add quality checklists
5. Test with actual workflows
6. Document any non-obvious patterns
