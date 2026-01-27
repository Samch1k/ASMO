# UI Component Library Workflow Checklist

## Phase 1: Design (ux-designer)

### Before Starting
- [ ] Component purpose and use cases defined
- [ ] User personas identified (warehouse manager, buyer, procurement)
- [ ] Existing component library reviewed for reusability
- [ ] Accessibility requirements (WCAG 2.1 AA) understood
- [ ] Device constraints known (tablet 768px+, desktop, mobile)

### During Execution
- [ ] User flows mapped for all component interactions
- [ ] Wireframes created for mobile, tablet, desktop breakpoints
- [ ] All component states designed (default, hover, active, disabled, loading, error)
- [ ] Keyboard navigation patterns defined
- [ ] Touch targets sized appropriately (44x44px minimum)
- [ ] Color contrast checked (4.5:1 for text)
- [ ] Focus indicators planned (3px outline)
- [ ] Empty states and error states designed
- [ ] Content guidelines written (labels, errors, help text)

### Completion Criteria
- [ ] User flows diagram completed
- [ ] Wireframes for all breakpoints approved
- [ ] Component specifications document all states and interactions
- [ ] Accessibility checklist completed (keyboard, screen reader, contrast)
- [ ] Handoff notes provided for developer

## Phase 2: Implementation (ui-developer)

### Before Starting
- [ ] UX specifications reviewed and understood
- [ ] Design tokens available (colors, spacing, typography)
- [ ] Component dependencies identified
- [ ] TypeScript types planned

### During Execution
- [ ] React component implemented with TypeScript
- [ ] All variants from UX spec implemented
- [ ] Responsive breakpoints working (mobile, tablet, desktop)
- [ ] All states implemented (hover, active, disabled, loading, error)
- [ ] Keyboard navigation working
- [ ] ARIA labels and roles added
- [ ] Focus management implemented
- [ ] Touch-friendly (44x44px targets)
- [ ] React Hook Form integration (if form component)
- [ ] Error boundaries added
- [ ] Loading states with skeletons
- [ ] Empty states rendered correctly
- [ ] Component properly typed (no `any` types)
- [ ] Props documented with JSDoc
- [ ] Unit tests written (React Testing Library)
- [ ] Storybook stories created for all variants

### Completion Criteria
- [ ] Component renders correctly on all breakpoints
- [ ] All UX specifications implemented
- [ ] Unit tests passing with 80%+ coverage
- [ ] No TypeScript errors or warnings
- [ ] ESLint and Prettier checks pass
- [ ] Storybook stories showcase all variants
- [ ] Performance optimized (React.memo if needed)
- [ ] Bundle size acceptable

## Phase 3: Testing (tester)

### Before Starting
- [ ] Component specification reviewed
- [ ] Test environment set up (browsers, devices)
- [ ] Accessibility testing tools ready (axe-core, screen reader)

### During Execution
- [ ] Accessibility tests run (axe-core automated)
- [ ] Manual keyboard navigation tested (Tab, Enter, Space, Escape, Arrow keys)
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] Color contrast verified (4.5:1 for text, 3:1 for UI)
- [ ] Focus indicators visible and clear
- [ ] Touch targets tested (44x44px minimum)
- [ ] Responsive behavior tested (320px to 1920px)
- [ ] Mobile breakpoint tested (768px tablet)
- [ ] Desktop breakpoint tested (1440px)
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)
- [ ] All component states tested (hover, active, disabled, error)
- [ ] Empty states validated
- [ ] Loading states validated
- [ ] Error handling tested

### Completion Criteria
- [ ] WCAG 2.1 AA compliance verified
- [ ] All keyboard shortcuts working
- [ ] Screen reader announces correctly
- [ ] Responsive on all breakpoints
- [ ] Cross-browser compatible
- [ ] All visual states correct
- [ ] Performance acceptable (no jank, smooth animations)
- [ ] No console errors or warnings

## Final Approval

- [ ] All phases completed successfully
- [ ] Component meets UX specifications
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Responsive and cross-browser compatible
- [ ] Unit tests and Storybook stories complete
- [ ] Code reviewed and approved
- [ ] Component documentation complete
- [ ] Ready for integration into component library
