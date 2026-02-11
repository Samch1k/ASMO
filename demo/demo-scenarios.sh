#!/bin/bash
# ASMO Tech Demo — Executable Scenarios
# Run each scenario to demonstrate ASMO capabilities

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function print_header() {
  echo -e "\n${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}\n"
}

function print_step() {
  echo -e "${GREEN}► $1${NC}"
}

function print_note() {
  echo -e "${YELLOW}ℹ  $1${NC}"
}

function pause() {
  echo -e "\n${YELLOW}Press ENTER to continue...${NC}"
  read
}

# =============================================================================
# SCENARIO 1: YOLO Mode — Zero Friction for Trivial Tasks
# =============================================================================

function scenario_1() {
  print_header "SCENARIO 1: YOLO Mode — Zero Friction for Trivial Tasks"

  print_note "Goal: Show that ASMO doesn't add overhead for simple tasks"
  print_note "Expected: Complexity < 30 → auto-approve, completes in < 60s"
  pause

  # Step 1: Get recommendation
  print_step "Step 1: Check ASMO recommendation"
  echo "Command: asmo suggest \"Fix typo in README\""
  asmo suggest "Fix typo in README"
  pause

  # Step 2: Execute with timing
  print_step "Step 2: Execute task (watch for YOLO bypass)"
  echo "Command: time asmo run \"Fix typo in README\" --verbose"
  print_note "Watch for: 'YOLO mode activated - auto-approving' message"
  time asmo run "Fix typo in README" --verbose
  pause

  print_header "SCENARIO 1 COMPLETE ✓"
  print_note "Key takeaways:"
  echo "  • Complexity score < 30 triggers YOLO mode"
  echo "  • No approval checkpoint — immediate execution"
  echo "  • Completes in < 60 seconds"
  echo "  • Eliminates approval fatigue for ~20% of tasks"
  pause
}

# =============================================================================
# SCENARIO 2: Context Cascade — No Context Loss Between Phases
# =============================================================================

function scenario_2() {
  print_header "SCENARIO 2: Context Cascade — No Context Loss Between Phases"

  print_note "Goal: Show architect → developer → tester context flow"
  print_note "Expected: Each agent builds on previous work, no duplication"
  pause

  # Step 1: Dry run preview
  print_step "Step 1: Preview execution plan (dry run)"
  echo "Command: asmo run \"Add email validation to signup form\" --dry-run"
  asmo run "Add email validation to signup form" --dry-run
  pause

  # Step 2: Execute with verbose
  print_step "Step 2: Execute with verbose logging"
  echo "Command: asmo run \"Add email validation to signup form\" --verbose"
  print_note "Watch for context being passed between phases:"
  echo "  • Phase 1 (Architect): Creates validation strategy"
  echo "  • Phase 2 (Developer): Receives strategy, implements"
  echo "  • Phase 3 (Tester): Receives strategy + implementation, tests both"
  pause

  asmo run "Add email validation to signup form" --verbose
  pause

  print_header "SCENARIO 2 COMPLETE ✓"
  print_note "Key takeaways:"
  echo "  • ContextCascade automatically passes Phase N → Phase N+1"
  echo "  • No context loss between agents"
  echo "  • Each agent builds on previous work (no repetition)"
  echo "  • Phase 3 sees full history: decisions + implementation"
  pause
}

# =============================================================================
# SCENARIO 3: Party Mode — Parallel Multi-Agent Collaboration
# =============================================================================

function scenario_3() {
  print_header "SCENARIO 3: Party Mode — Parallel Multi-Agent Collaboration"

  print_note "Goal: Show parallel execution with consensus mechanism"
  print_note "Expected: Complexity ≥ 60 → Party mode, multiple rounds until convergence"
  pause

  # Step 1: Analyze complexity
  print_step "Step 1: Analyze task complexity"
  echo "Command: asmo analyze \"Implement OAuth2 authentication with security audit\""
  asmo analyze "Implement OAuth2 authentication with security audit"
  pause

  # Step 2: Execute with party mode
  print_step "Step 2: Execute (Party mode will activate automatically)"
  echo "Command: asmo run \"Implement OAuth2 authentication with security audit\" --verbose"
  print_note "Watch for:"
  echo "  • Party mode activation (complexity ≥ 60)"
  echo "  • Multiple agents working in parallel"
  echo "  • Convergence checks after each round"
  echo "  • Consensus reached when agreement > 80%"
  pause

  asmo run "Implement OAuth2 authentication with security audit" --verbose
  pause

  print_header "SCENARIO 3 COMPLETE ✓"
  print_note "Key takeaways:"
  echo "  • Agents work in parallel (not sequential)"
  echo "  • Convergence mechanism measures agreement"
  echo "  • Iterative refinement until consensus (max 5 rounds)"
  echo "  • Multiple perspectives reduce blind spots"
  pause
}

# =============================================================================
# BONUS: Adaptive Phase Detection
# =============================================================================

function scenario_bonus() {
  print_header "BONUS SCENARIO: Adaptive Phase Detection"

  print_note "Goal: Show workflow resuming from existing work"
  print_note "Setup: Create investigation report, then run bug_fix_workflow"
  pause

  # Create investigation report
  print_step "Step 1: Create existing investigation report"
  cat > investigation-report.md << 'EOF'
# Bug Investigation: Null Pointer in login.ts

## Root Cause
Missing null check on user object at line 42

## Trigger Condition
User object becomes undefined when session expires

## Proposed Fix
Add null check before accessing user.email property

## Files Affected
- src/auth/login.ts (line 42)

## Test Cases Required
1. Valid user object
2. Null user object (session expired)
3. Undefined user object (not authenticated)
EOF

  echo "Created: investigation-report.md"
  cat investigation-report.md
  pause

  # Run workflow
  print_step "Step 2: Run bug_fix_workflow (should skip Phase 1)"
  echo "Command: asmo run \"Fix null pointer in login handler\" --verbose"
  print_note "Watch for:"
  echo "  • PhaseDetector analyzing existing context"
  echo "  • Detection: investigation-report.md found"
  echo "  • Decision: Join workflow at Phase 2 (developer)"
  echo "  • Phase 1 (debugger) skipped — already complete"
  pause

  asmo run "Fix null pointer in login handler" --verbose
  pause

  # Cleanup
  rm -f investigation-report.md

  print_header "BONUS SCENARIO COMPLETE ✓"
  print_note "Key takeaways:"
  echo "  • PhaseDetector uses LLM to analyze existing work"
  echo "  • Skips unnecessary phases automatically"
  echo "  • Saves time and LLM tokens"
  echo "  • Useful for resuming interrupted work"
  pause
}

# =============================================================================
# Main Menu
# =============================================================================

function show_menu() {
  clear
  echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║       ASMO Tech Demo — Interactive Scenarios         ║${NC}"
  echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
  echo ""
  echo "Select a scenario to run:"
  echo ""
  echo "  1) Scenario 1: YOLO Mode (5 min)"
  echo "  2) Scenario 2: Context Cascade (10 min)"
  echo "  3) Scenario 3: Party Mode (10 min)"
  echo "  4) Bonus: Adaptive Phase Detection (5 min)"
  echo ""
  echo "  5) Run All Scenarios (30 min)"
  echo ""
  echo "  0) Exit"
  echo ""
  echo -n "Choice: "
}

# Main loop
while true; do
  show_menu
  read choice

  case $choice in
    1)
      scenario_1
      ;;
    2)
      scenario_2
      ;;
    3)
      scenario_3
      ;;
    4)
      scenario_bonus
      ;;
    5)
      scenario_1
      scenario_2
      scenario_3
      scenario_bonus
      echo -e "\n${GREEN}All scenarios complete! 🎉${NC}\n"
      break
      ;;
    0)
      echo "Exiting demo. Thanks!"
      exit 0
      ;;
    *)
      echo -e "${YELLOW}Invalid choice. Please select 0-5.${NC}"
      sleep 2
      ;;
  esac
done
