#!/bin/bash
# ASMO Suggest Hook - Analyzes user prompt and suggests ASMO if beneficial
#
# This hook is called on UserPromptSubmit and outputs a recommendation
# to stderr (non-blocking) if ASMO would be beneficial for the task.

# Get the user prompt from stdin (Claude Code passes it as JSON)
read -r INPUT

# Extract the prompt from JSON using multiple methods
PROMPT=""

# Method 1: Try jq if available
if command -v jq &> /dev/null; then
  PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty' 2>/dev/null)
fi

# Method 2: Fallback to grep/sed
if [ -z "$PROMPT" ]; then
  PROMPT=$(echo "$INPUT" | grep -o '"prompt"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/"prompt"[[:space:]]*:[[:space:]]*"//' | sed 's/"$//' | head -1)
fi

# Method 3: Use raw input if nothing extracted
if [ -z "$PROMPT" ]; then
  PROMPT="$INPUT"
fi

# Skip if prompt is too short
if [ ${#PROMPT} -lt 20 ]; then
  exit 0
fi

# Skip simple questions and commands
if echo "$PROMPT" | grep -qiE '^(what|where|how|why|can you|could you|is there|are there|show me|list|find|search|read|look|/|git |npm |pnpm )'; then
  exit 0
fi

# Get script directory and find ASMO CLI
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ASMO_PATH="$SCRIPT_DIR/../../packages/cli/bin/asmo.js"

if [ ! -f "$ASMO_PATH" ]; then
  exit 0
fi

# Run ASMO suggest and capture output (node is fast, no timeout needed)
OUTPUT=$(node "$ASMO_PATH" suggest "$PROMPT" 2>&1)

# Extract JSON from output
RESULT=$(echo "$OUTPUT" | grep -o '{.*}' | head -1)

if [ -z "$RESULT" ]; then
  exit 0
fi

# Parse JSON result
USE_ASMO=$(echo "$RESULT" | grep -o '"useAsmo"[[:space:]]*:[[:space:]]*[a-z]*' | grep -o 'true\|false')
CONFIDENCE=$(echo "$RESULT" | grep -o '"confidence"[[:space:]]*:[[:space:]]*[0-9.]*' | grep -oE '[0-9.]+')
WORKFLOW=$(echo "$RESULT" | grep -o '"workflow"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)".*/\1/')
REASONING=$(echo "$RESULT" | grep -o '"reasoning"[[:space:]]*:[[:space:]]*"[^"]*"' | sed 's/.*:.*"\([^"]*\)".*/\1/')

if [ "$USE_ASMO" = "true" ]; then
  # Convert confidence to percentage (handle floating point)
  if command -v bc &> /dev/null; then
    CONF_PCT=$(echo "$CONFIDENCE * 100" | bc 2>/dev/null | cut -d. -f1)
  else
    # Fallback: extract integer part and multiply by 100
    CONF_PCT=$(echo "$CONFIDENCE" | awk '{printf "%.0f", $1 * 100}' 2>/dev/null)
  fi

  if [ -z "$CONF_PCT" ] || [ "$CONF_PCT" = "0" ]; then
    CONF_PCT="70"
  fi

  # Output suggestion to stderr (visible in Claude Code)
  echo "" >&2
  echo "ASMO Suggestion (${CONF_PCT}% confidence):" >&2
  echo "   Consider: asmo run \"$(echo "$PROMPT" | head -c 50)...\"" >&2
  echo "   Workflow: $WORKFLOW" >&2
  echo "   Reason: $REASONING" >&2
  echo "" >&2
fi

exit 0
