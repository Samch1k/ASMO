# Phase Instructions: Design

## Focus Areas

During the design phase, your primary focus should be on:

1. **User Flows**
   - Map out step-by-step user journeys
   - Identify decision points and branches
   - Consider error paths and edge cases
   - Optimize for minimum steps to complete task
   - Plan for both new and returning users

2. **Wireframes & Layouts**
   - Create low-fidelity wireframes for key screens
   - Define information hierarchy (what's most important)
   - Plan responsive breakpoints (mobile, tablet, desktop)
   - Design for content flexibility (different data volumes)
   - Consider accessibility from the start (keyboard navigation, screen readers)

3. **Component Specifications**
   - Define all component states (default, hover, active, disabled, loading, error)
   - Document interaction patterns (click, hover, drag, keyboard)
   - Specify animations and transitions
   - Plan feedback mechanisms (success messages, errors, loading indicators)
   - Design empty states and data placeholders

4. **Content & Microcopy**
   - Write clear, actionable button labels
   - Create helpful error messages
   - Design informative empty states
   - Plan tooltips and help text
   - Use plain language (avoid jargon)

## Constraints

**Design Phase Specific:**
- **Mobile-responsive**: Tablets and mobile are common devices
- **Touch-first**: All interactive elements 44x44px minimum
- **Accessibility**: WCAG 2.1 AA compliance is mandatory
- **Consistency**: Follow your project's design system
- **Information density**: Show relevant data without overwhelming
- **Real-time updates**: Plan for live data changes (orders, inventory)

**Time Box:**
- UX design should take 10-20% of total feature time
- Focus on critical paths first
- Don't over-design edge cases
- Iterate based on developer and stakeholder feedback

## Deliverables

For the design phase, you must provide:

1. **User Flows**
   - Diagram showing step-by-step journey
   - Decision points and branches clearly marked
   - Error paths and recovery flows included
   - Annotations explaining key decisions

2. **Wireframes**
   - Key screens for mobile (768px), tablet (1024px), desktop (1440px)
   - Layout showing information hierarchy
   - Annotations for interactions and behaviors
   - Empty states and loading states included

3. **Component Specifications**
   - Detailed description of component behavior
   - All states documented (default, hover, active, disabled, error)
   - Interaction patterns (click, keyboard, touch)
   - ARIA labels and accessibility requirements
   - Responsive behavior notes

4. **Accessibility Checklist**
   - Keyboard navigation requirements
   - Screen reader labels (ARIA)
   - Color contrast verification (4.5:1 for text)
   - Focus indicators defined
   - Touch target sizes (44x44px minimum)

5. **Content Guidelines**
   - Button labels and CTAs
   - Error messages and validation text
   - Empty state messages
   - Help text and tooltips
   - Success confirmation messages

## Wireframe Format

**ASCII Wireframe Example:**
```
+------------------------------------------+
| Header: Order Management                  |
+------------------------------------------+
| [Search Orders...] [+ New Order]         |
+------------------------------------------+
|                                          |
| Order #12345 - Pending                   |
| Customer: ABC Company                    |
| Items: 5 | Total: $1,250.00             |
| [View Details] [Process Order]          |
|                                          |
|----------------------------------------- |
|                                          |
| Order #12344 - Completed                 |
| Customer: XYZ Corporation                |
| Items: 3 | Total: $875.00               |
| [View Details]                          |
|                                          |
+------------------------------------------+
| Pagination: < 1 2 3 >                   |
+------------------------------------------+

Interactions:
- Search: Real-time filter as user types
- New Order: Opens modal form
- View Details: Navigate to detail page
- Process Order: Opens confirmation modal
- Mobile: Cards stack vertically
- Keyboard: Tab through orders, Enter to select
```

## Accessibility Requirements

**Keyboard Navigation:**
- Tab order follows visual hierarchy
- Enter/Space to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for lists/menus
- Skip links to main content

**Screen Reader Support:**
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Proper heading hierarchy (h1, h2, h3)
- Alt text for informative images
- Form labels properly associated

**Visual Accessibility:**
- Text contrast 4.5:1 minimum (WCAG AA)
- Focus indicators visible (3px outline)
- Color not sole indicator (use icons + color)
- Text resizable to 200% without breaking
- No flashing content (seizure risk)

## Quality Checklist

Before completing the design phase:

- [ ] User flows mapped for all key scenarios
- [ ] Wireframes created for mobile, tablet, desktop
- [ ] All component states specified (default, hover, error, loading)
- [ ] Keyboard navigation patterns documented
- [ ] ARIA labels defined for all interactive elements
- [ ] Color contrast verified (4.5:1 for text)
- [ ] Touch targets are 44x44px minimum
- [ ] Error states and messages designed
- [ ] Empty states and loading states included
- [ ] Content guidelines provided (labels, messages, help text)
- [ ] Responsive breakpoints clearly indicated
- [ ] Animations and transitions specified
- [ ] Reviewed by product team for alignment with requirements
- [ ] Reviewed by developer for technical feasibility
- [ ] Accessibility checklist completed
