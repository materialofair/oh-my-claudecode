#!/bin/bash
# OMC Keyword Detector Hook (Bash)
# Detects magic keywords and invokes skill tools
# Linux/macOS compatible
#
# Supported keywords (in priority order):
# 1. cancel: Stop active modes
# 2. ralph: Persistence mode until task completion
# 3. autopilot: Full autonomous execution
# 4. ultrapilot: Parallel autopilot
# 5. ultrawork/ulw: Maximum parallel execution
# 6. ecomode/eco: Token-efficient execution
# 7. swarm: N coordinated agents
# 8. pipeline: Sequential agent chaining
# 9. ralplan: Iterative planning with consensus
# 10. plan: Planning interview mode
# 11. tdd: Test-driven development
# 12. research: Research orchestration
# 13. ultrathink/think: Extended reasoning
# 14. deepsearch: Codebase search (restricted patterns)
# 15. analyze: Analysis mode (restricted patterns)

# Read stdin (JSON input from Claude Code)
INPUT=$(cat)

# Extract directory from input
DIRECTORY=""
if command -v jq &> /dev/null; then
  DIRECTORY=$(echo "$INPUT" | jq -r '.directory // ""' 2>/dev/null)
fi
if [ -z "$DIRECTORY" ] || [ "$DIRECTORY" = "null" ]; then
  DIRECTORY=$(pwd)
fi

# Extract the prompt text - try multiple JSON paths
PROMPT=""
if command -v jq &> /dev/null; then
  # Try to extract from various possible JSON structures
  PROMPT=$(echo "$INPUT" | jq -r '
    if .prompt then .prompt
    elif .message.content then .message.content
    elif .parts then ([.parts[] | select(.type == "text") | .text] | join(" "))
    else ""
    end
  ' 2>/dev/null)
fi

# Fallback: simple grep extraction if jq fails
if [ -z "$PROMPT" ] || [ "$PROMPT" = "null" ]; then
  PROMPT=$(echo "$INPUT" | grep -oP '"(prompt|content|text)"\s*:\s*"\K[^"]+' | head -1)
fi

# Exit if no prompt found
if [ -z "$PROMPT" ]; then
  echo '{"continue": true}'
  exit 0
fi

# Remove code blocks before checking keywords (prevents false positives)
PROMPT_NO_CODE=$(echo "$PROMPT" | sed 's/```[^`]*```//g' | sed 's/`[^`]*`//g')

# Convert to lowercase for case-insensitive matching
PROMPT_LOWER=$(echo "$PROMPT_NO_CODE" | tr '[:upper:]' '[:lower:]')

# Create a skill invocation message that tells Claude to use the Skill tool
create_skill_invocation() {
  local skill_name="$1"
  local original_prompt="$2"
  local args="$3"

  local args_section=""
  if [ -n "$args" ]; then
    args_section="\\nArguments: $args"
  fi

  local skill_upper=$(echo "$skill_name" | tr '[:lower:]' '[:upper:]')

  cat << EOF
[MAGIC KEYWORD: ${skill_upper}]

You MUST invoke the skill using the Skill tool:

Skill: oh-my-claudecode:${skill_name}${args_section}

User request:
${original_prompt}

IMPORTANT: Invoke the skill IMMEDIATELY. Do not proceed without loading the skill instructions.
EOF
}

# Clear state files for cancel operation
clear_state_files() {
  local directory="$1"
  local modes=("ralph" "autopilot" "ultrapilot" "ultrawork" "ecomode" "swarm" "pipeline")

  for mode in "${modes[@]}"; do
    rm -f "$directory/.omc/state/${mode}-state.json" 2>/dev/null
    rm -f "$HOME/.omc/state/${mode}-state.json" 2>/dev/null
  done
}

# Activate state for a mode
activate_state() {
  local directory="$1"
  local prompt="$2"
  local state_name="$3"

  # Create directories
  mkdir -p "$directory/.omc/state" 2>/dev/null
  mkdir -p "$HOME/.omc/state" 2>/dev/null

  # Escape prompt for JSON
  local prompt_escaped=$(echo "$prompt" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ')
  local timestamp=$(date -Iseconds 2>/dev/null || date +%Y-%m-%dT%H:%M:%S%z)

  local state_json="{
  \"active\": true,
  \"started_at\": \"$timestamp\",
  \"original_prompt\": \"$prompt_escaped\",
  \"reinforcement_count\": 0,
  \"last_checked_at\": \"$timestamp\"
}"

  # Write state to both local and global locations
  echo "$state_json" > "$directory/.omc/state/${state_name}-state.json" 2>/dev/null
  echo "$state_json" > "$HOME/.omc/state/${state_name}-state.json" 2>/dev/null
}

# Output JSON with skill invocation message
output_skill() {
  local skill_name="$1"
  local prompt="$2"
  local args="$3"

  local message=$(create_skill_invocation "$skill_name" "$prompt" "$args")
  # Escape for JSON: backslashes, quotes, and newlines
  local escaped_message=$(echo "$message" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

  echo "{\"continue\": true, \"message\": \"$escaped_message\"}"
}

# Priority 1: Cancel (BEFORE other modes - clears states)
if echo "$PROMPT_LOWER" | grep -qE '\b(stop|cancel|abort)\b'; then
  clear_state_files "$DIRECTORY"
  output_skill "cancel" "$PROMPT"
  exit 0
fi

# Priority 2: Ralph keywords
if echo "$PROMPT_LOWER" | grep -qE '\b(ralph|don'\''t stop|must complete|until done)\b'; then
  activate_state "$DIRECTORY" "$PROMPT" "ralph"
  activate_state "$DIRECTORY" "$PROMPT" "ultrawork"
  output_skill "ralph" "$PROMPT"
  exit 0
fi

# Priority 3: Autopilot keywords
if echo "$PROMPT_LOWER" | grep -qE '\b(autopilot|auto pilot|auto-pilot|autonomous|full auto|fullsend)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bbuild\s+me\s+' || \
   echo "$PROMPT_LOWER" | grep -qE '\bcreate\s+me\s+' || \
   echo "$PROMPT_LOWER" | grep -qE '\bmake\s+me\s+' || \
   echo "$PROMPT_LOWER" | grep -qE '\bi\s+want\s+a\s+' || \
   echo "$PROMPT_LOWER" | grep -qE '\bi\s+want\s+an\s+' || \
   echo "$PROMPT_LOWER" | grep -qE '\bhandle\s+it\s+all\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bend\s+to\s+end\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\be2e\s+this\b'; then
  activate_state "$DIRECTORY" "$PROMPT" "autopilot"
  output_skill "autopilot" "$PROMPT"
  exit 0
fi

# Priority 4: Ultrapilot
if echo "$PROMPT_LOWER" | grep -qE '\b(ultrapilot|ultra-pilot)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bparallel\s+build\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bswarm\s+build\b'; then
  activate_state "$DIRECTORY" "$PROMPT" "ultrapilot"
  output_skill "ultrapilot" "$PROMPT"
  exit 0
fi

# Priority 5: Ultrawork keywords
if echo "$PROMPT_LOWER" | grep -qE '\b(ultrawork|ulw|uw)\b'; then
  activate_state "$DIRECTORY" "$PROMPT" "ultrawork"
  output_skill "ultrawork" "$PROMPT"
  exit 0
fi

# Priority 6: Ecomode keywords
if echo "$PROMPT_LOWER" | grep -qE '\b(eco|ecomode|eco-mode|efficient|save-tokens|budget)\b'; then
  activate_state "$DIRECTORY" "$PROMPT" "ecomode"
  output_skill "ecomode" "$PROMPT"
  exit 0
fi

# Priority 7: Swarm - parse N from "swarm N agents"
SWARM_MATCH=$(echo "$PROMPT_LOWER" | grep -oE '\bswarm\s+[0-9]+\s+agents?\b' | grep -oE '[0-9]+')
if [ -n "$SWARM_MATCH" ]; then
  output_skill "swarm" "$PROMPT" "$SWARM_MATCH"
  exit 0
fi
if echo "$PROMPT_LOWER" | grep -qE '\bcoordinated\s+agents\b'; then
  output_skill "swarm" "$PROMPT" "3"
  exit 0
fi

# Priority 8: Pipeline
if echo "$PROMPT_LOWER" | grep -qE '\b(pipeline)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bchain\s+agents\b'; then
  output_skill "pipeline" "$PROMPT"
  exit 0
fi

# Priority 9: Ralplan keyword (before plan to avoid false match)
if echo "$PROMPT_LOWER" | grep -qE '\b(ralplan)\b'; then
  output_skill "ralplan" "$PROMPT"
  exit 0
fi

# Priority 10: Plan keywords
if echo "$PROMPT_LOWER" | grep -qE '\b(plan this|plan the)\b'; then
  output_skill "plan" "$PROMPT"
  exit 0
fi

# Priority 11: TDD
if echo "$PROMPT_LOWER" | grep -qE '\b(tdd)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\btest\s+first\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bred\s+green\b'; then
  output_skill "tdd" "$PROMPT"
  exit 0
fi

# Priority 12: Research
if echo "$PROMPT_LOWER" | grep -qE '\b(research)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\banalyze\s+data\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bstatistics\b'; then
  output_skill "research" "$PROMPT"
  exit 0
fi

# Priority 13: Ultrathink/think keywords (keep inline message)
if echo "$PROMPT_LOWER" | grep -qE '\b(ultrathink|think hard|think deeply)\b'; then
  cat << 'EOF'
{"continue": true, "message": "<think-mode>\n\n**ULTRATHINK MODE ENABLED** - Extended reasoning activated.\n\nYou are now in deep thinking mode. Take your time to:\n1. Thoroughly analyze the problem from multiple angles\n2. Consider edge cases and potential issues\n3. Think through the implications of each approach\n4. Reason step-by-step before acting\n\nUse your extended thinking capabilities to provide the most thorough and well-reasoned response.\n\n</think-mode>\n\n---\n"}
EOF
  exit 0
fi

# Priority 14: Deepsearch (RESTRICTED patterns)
if echo "$PROMPT_LOWER" | grep -qE '\b(deepsearch)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bsearch\s+(the\s+)?(codebase|code|files|project)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bfind\s+(in\s+)?(codebase|code|all\s+files)\b'; then
  output_skill "deepsearch" "$PROMPT"
  exit 0
fi

# Priority 15: Analyze (RESTRICTED patterns)
if echo "$PROMPT_LOWER" | grep -qE '\bdeep\s*analyze\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\binvestigate\s+(the|this|why)\b' || \
   echo "$PROMPT_LOWER" | grep -qE '\bdebug\s+(the|this|why)\b'; then
  output_skill "analyze" "$PROMPT"
  exit 0
fi

# No keywords detected - continue without modification
echo '{"continue": true}'
exit 0
