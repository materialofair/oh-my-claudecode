# Agent Prefix Routing Fix (v4.5.7)

## Problem

Users were experiencing intermittent "Agent type 'oh-my-claudecode:architect' not found" errors when using OMC agent types with the `oh-my-claudecode:` prefix. The error message showed:

```
⏺ oh-my-claudecode:architect(...)
  ⎿  Initializing…
  ⎿  Error: Agent type 'oh-my-claudecode:architect' not found. Available agents: general-purpose,
     statusline-setup, Explore, Plan, claude-code-guide, code-simplifier:code-simplifier,
     superpowers:code-reviewer, api-reviewer, code-reviewer, scientist, qa-tester, writer, explore,
      build-fixer, security-reviewer, test-engineer, architect, debugger, designer, analyst,
     style-reviewer, code-simplifier, information-architect, executor, git-master, verifier,
     ux-researcher, researcher, deep-executor, critic, product-manager, performance-reviewer,
     vision, planner, quality-strategist, quality-reviewer, dependency-expert, document-specialist,
      product-analyst
```

## Root Cause

The issue occurred because:

1. OMC's CLAUDE.md instructs Claude to use agent types with the `oh-my-claudecode:` prefix (e.g., `oh-my-claudecode:architect`)
2. Claude Code's Agent tool only recognizes agent types without the prefix (e.g., `architect`)
3. The delegation enforcer in `src/features/delegation-enforcer.ts` strips the prefix, but it runs **after** Claude Code validates the tool call
4. The pre-tool-use hook didn't handle Agent/Task tool calls at all, so the prefix was never stripped before validation

## Solution

Updated the pre-tool-use hook (`templates/hooks/pre-tool-use.mjs` and `~/.claude/hooks/pre-tool-use.mjs`) to:

1. Detect Agent/Task tool calls
2. Strip the `oh-my-claudecode:` prefix from `subagent_type` parameter
3. Return the modified tool input with `modifiedInput` field

This ensures the prefix is removed **before** the tool call reaches Claude Code's validation layer.

## Changes

### Files Modified

1. **templates/hooks/pre-tool-use.mjs** - Added Agent/Task tool handling
2. **~/.claude/hooks/pre-tool-use.mjs** - Applied the same fix to installed hook
3. **src/__tests__/pre-tool-agent-prefix.test.ts** - Added comprehensive test coverage
4. **CHANGELOG.md** - Documented the fix
5. **package.json** - Bumped version to 4.5.7

### Code Changes

```javascript
// Handle Agent/Task tool - strip oh-my-claudecode: prefix from subagent_type
if (toolName === 'Agent' || toolName === 'Task' || toolName === 'agent' || toolName === 'task') {
  const toolInput = data.tool_input || data.toolInput || {};
  const subagentType = toolInput.subagent_type || toolInput.subagentType || '';

  // Strip oh-my-claudecode: prefix if present
  if (subagentType.startsWith('oh-my-claudecode:')) {
    const strippedType = subagentType.replace(/^oh-my-claudecode:/, '');
    const modifiedInput = {
      ...toolInput,
      subagent_type: strippedType
    };

    console.log(JSON.stringify({
      continue: true,
      modifiedInput: modifiedInput
    }));
    return;
  }

  // No prefix to strip, continue as-is
  console.log(JSON.stringify({ continue: true }));
  return;
}
```

## Testing

Created comprehensive test suite that verifies:

1. ✅ Prefix stripping works for Agent tool calls
2. ✅ Prefix stripping works for Task tool calls
3. ✅ Agent calls without prefix are not modified
4. ✅ All 21 OMC agent types are handled correctly
5. ✅ Other tool calls (Edit, Write, Read, Bash, Grep, Glob) are not affected

All tests pass successfully.

## Impact

- **Before**: Intermittent failures when using `oh-my-claudecode:` prefixed agent types
- **After**: All agent calls work reliably, regardless of prefix usage
- **Backward Compatibility**: Agent calls without prefix continue to work as before
- **Performance**: Minimal overhead - simple string check and replace operation

## Deployment

To apply this fix:

1. Run `npm install` to get version 4.5.7
2. Run `omc setup` to update the installed hooks
3. Or manually copy `templates/hooks/pre-tool-use.mjs` to `~/.claude/hooks/pre-tool-use.mjs`

The fix is automatically applied when users update to version 4.5.7 or later.
