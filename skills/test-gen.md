---
name: test-gen
description: Generate tests for code files using LLM-driven test generation. Detects tech stack, analyzes code complexity, and generates appropriate tests. Use when user asks to "generate tests", "add tests", "create test coverage", or explicitly invokes /test-gen.
---

# Test Generation Skill

Generate comprehensive tests for code files with automatic tech stack detection and complexity analysis.

## Usage

```
/test-gen <file-path>
/test-gen src/components/Button.tsx
/test-gen src/utils/math.ts --coverage-analysis
```

## Workflow

### Step 1: Detect Tech Stack

Use the `omc test detect-stack` command to identify:
- Frontend framework (React/Vue/Svelte)
- Backend language (Node.js/Python/Go/Rust)
- Test frameworks (Vitest/Jest/pytest)
- Databases and API types

### Step 2: Analyze Code Complexity

Determine if code is "simple" or "complex":

**Simple (auto-generate tests)**:
- Function lines < 50
- Cyclomatic complexity < 10
- Nesting level < 3
- No external dependencies

**Complex (generate framework + prompt for details)**:
- Payment/auth logic
- Multi-step workflows
- External service dependencies
- Async/concurrent scenarios

### Step 3: Generate Tests

For simple code:
- Call `omc test gen <file>` directly
- Review generated tests
- Commit

For complex code:
- Generate test framework with `omc test gen <file>`
- Delegate to enhanced `test-engineer` agent for detailed test cases
- Prompt user for business logic validation

### Step 4: Coverage Analysis (Optional)

If `--coverage-analysis` flag is provided:
- Run coverage tools
- Identify missing test scenarios
- Generate supplementary tests

## Integration with Other Skills

- Works with `/tdd` for test-first development
- Integrates with `/ultraqa` for test-verify-fix loops
- Called automatically by `/autopilot` when generating code

## Examples

### Example 1: Simple React Component

```
User: /test-gen src/components/Button.tsx
Agent: Detecting tech stack...
✅ Detected: React + Vitest

Agent: Analyzing complexity...
✅ Simple component (25 lines, no external deps)

Agent: Generating tests...
✅ Generated: src/components/Button.test.tsx

Tests include:
- Renders children correctly
- Handles onClick events
- Accessibility checks

Would you like me to commit these tests?
```

### Example 2: Complex Payment Service

```
User: /test-gen src/services/payment.ts

Agent: Detecting tech stack...
✅ Detected: Node.js + Express + PostgreSQL + Vitest

Agent: Analyzing complexity...
⚠️  Complex code detected:
- Payment processing logic
- External Stripe API calls
- Database transactions
- Error handling for multiple scenarios

Agent: Generating test framework...
✅ Generated: src/services/payment.test.ts (framework)

Agent: Delegating to test-engineer for detailed test cases...

Test-Engineer: I'll need some information:
1. What are the expected payment flows? (success, failure, retry)
2. Should I mock Stripe API calls?
3. What database states should I test?
4. Are there specific edge cases to cover?

[User provides details]

Test-Engineer: Generating comprehensive test suite...
✅ Generated 15 test cases covering:
- Happy path payment processing
- Stripe API failure scenarios
- Database transaction rollbacks
- Idempotency checks
- Concurrent payment handling

Would you like me to commit these tests?
```

### Example 3: Coverage Analysis

```
User: /test-gen src/utils/validation.ts --coverage-analysis

Agent: Generating initial tests...
✅ Generated: src/utils/validation.test.ts

Agent: Running coverage analysis...
📊 Current coverage: 65%

Missing coverage:
- Line 42-48: Error handling for invalid email formats
- Line 67-72: Edge case for international phone numbers
- Line 89: Null check branch

Agent: Generating supplementary tests...
✅ Added 5 additional test cases

Agent: Re-running coverage...
📊 New coverage: 92%

Would you like me to commit these tests?
```

## Integration Notes

### With Test-Engineer Agent

The `/test-gen` skill enhances the existing `test-engineer` agent by:

1. **Automatic invocation**: When user asks to "generate tests", invoke `/test-gen` instead of directly calling `test-engineer`
2. **Context enrichment**: Pass detected tech stack and complexity analysis to `test-engineer`
3. **Workflow guidance**: Provide structured workflow for test generation

Update `agents/test-engineer.md` to reference `/test-gen`:

```markdown
## When to Use

- User explicitly asks for test generation → Use `/test-gen` skill first
- User asks for test strategy/planning → Use test-engineer directly
- User asks for test debugging → Use test-engineer directly
```

### With Autopilot

Update `skills/autopilot.md` to include test generation:

```markdown
## Phase 4: Testing

After implementation:
1. Run `/test-gen` on all new source files
2. Verify tests pass
3. Check coverage meets threshold (default: 80%)
```

### With TDD Skill

Update `skills/tdd.md` to integrate:

```markdown
## Red Phase

Instead of manually writing tests, use:
```
/test-gen <file> --tdd-mode
```

This generates failing tests based on function signatures.
```

## Success Criteria

- [ ] Tech stack detection works for React + Node.js projects
- [ ] Test generation produces valid, runnable tests
- [ ] CLI commands (`omc test gen`, `omc test detect-stack`) work correctly
- [ ] `/test-gen` skill integrates with existing agent workflows
- [ ] All tests pass: `pnpm test tests/testing/**`
- [ ] Documentation is complete and accurate
