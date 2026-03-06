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
/test-gen src/utils/math.py
/test-gen pkg/math/math.go
/test-gen src/math.rs
/test-gen api/openapi.yaml --contract
```

## Workflow

### Step 1: Detect Tech Stack

Use the `omc test detect-stack` command to identify:
- Frontend framework (React/Vue/Svelte)
- Backend language (Node.js/Python/Go/Rust)
- Test frameworks (Vitest/Jest/pytest/Go testing/cargo test)
- Databases and API types

Supported detection methods:
- **Node.js**: package.json parsing
- **Python**: requirements.txt / pyproject.toml
- **Go**: go.mod
- **Rust**: Cargo.toml

### Step 2: Analyze Code Complexity

Run complexity analysis to determine routing:

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
- Database transactions

Complexity metrics calculated:
- Lines of code
- Cyclomatic complexity (branches, loops, ternaries)
- Maximum nesting depth
- External dependency count

### Step 3: Route to Appropriate Generator

Based on detected language and complexity:

| Language | Simple | Complex |
|----------|--------|---------|
| Node.js/TypeScript | `omc test gen` -> Vitest/Jest tests | Delegate to `test-engineer` |
| React | `omc test gen` -> Component tests | Delegate to `test-engineer` |
| Python | `omc test gen` -> pytest/unittest tests | Delegate to `test-engineer` |
| Go | `omc test gen` -> Table-driven tests | Delegate to `test-engineer` |
| Rust | `omc test gen` -> #[test] module | Delegate to `test-engineer` |

### Step 4: Generate Tests

### Step 4: Generate Tests

For simple code:
- Call `omc test gen <file>` directly
- Routes to language-specific generator (Node.js, Python, Go, Rust)
- Review generated tests
- Commit

For complex code:
- Generate test framework with `omc test gen <file>`
- Delegate to enhanced `test-engineer` agent with enriched context (tech stack, complexity metrics, suggested approach)
- Prompt user for business logic validation

### Step 5: Coverage Analysis (Optional)

If `--coverage-analysis` flag is provided:
- Run coverage tools (c8/nyc for Node.js)
- Parse coverage reports and identify gaps
- Analyze reasons for uncovered code (error handling, branches, null checks)
- Generate supplementary tests targeting gaps
- Re-run coverage to verify improvement

### Step 6: Contract Testing (Optional)

If `--contract` flag is provided or file is an OpenAPI spec:
- Parse OpenAPI/Swagger specification
- Generate contract tests using Pact, Supertest, or MSW
- Create consumer-driven contract tests for each endpoint
- Include request/response validation

## Integration with Other Skills

- Works with `/tdd` for test-first development
- Integrates with `/ultraqa` for test-verify-fix loops
- Called automatically by `/autopilot` when generating code
- **Phase 3**: Integrates with `/ralph` for automated test-fix-verify loops

## Phase 3 Workflows

### Promptfoo LLM Testing

```
User: Generate Promptfoo config for my code review prompt
Agent: /test-gen prompts/code-review.txt --promptfoo

Agent: Generating Promptfoo configuration...
✅ Generated: promptfoo.config.yaml

Config includes:
- Prompt file: prompts/code-review.txt
- Provider: anthropic:claude-3-5-sonnet-20241022
- Test cases: Ready for customization

Next steps:
1. Add test cases to promptfoo.config.yaml
2. Run: npx promptfoo eval
3. View results: npx promptfoo view
```

### E2E Test Generation

```
User: Generate E2E tests for the login flow
Agent: /test-gen "User logs in, navigates to dashboard, clicks on settings" --e2e

Agent: Generating Playwright E2E tests...
✅ Generated: tests/e2e/user-flow.spec.ts

Test includes:
- Navigate to login page
- Navigate to dashboard
- Click settings link

Would you like me to:
1. Add more detailed assertions?
2. Generate additional E2E flows?
3. Set up Playwright config?
```

### Giskard Behavioral Testing

```
User: Generate behavioral tests for my classifier
Agent: /test-gen src/models/classifier.ts --giskard

Agent: Generating Giskard behavioral tests...
✅ Grated: tests/behavioral/perturbation.test.ts

Tests include:
- Typo perturbations
- Negation perturbations
- Synonym perturbations

Agent: These tests verify model robustness under input variations.
Would you like me to:
1. Add robustness tests?
2. Customize perturbation types?
3. Run the behavioral tests?
```

### CI/CD Workflow Generation

```
User: Set up CI/CD for testing
Agent: /test-gen --cicd

Agent: Generating GitHub Actions workflow...
✅ Generated: .github/workflows/test.yml

Workflow includes:
- Node.js setup with pnpm
- Test execution
- Coverage reporting (Codecov)
- Test artifact uploads

Would you like me to:
1. Add matrix builds for multiple Node versions?
2. Add deployment steps?
3. Commit the workflow?
```

### Test Quality Scoring

```
User: Check the quality of my tests
Agent: /test-gen tests/utils/parser.test.ts --quality

Agent: Analyzing test quality...
📊 Test Quality Score: 85/100

Breakdown:
- Completeness: 90/100
- Assertions: 80/100
- Independence: 95/100
- Naming: 75/100

💡 Recommendations:
- Test edge cases like null, undefined, empty values
- Use descriptive test names that explain what is being tested
- Improve assertion quality with more specific matchers

Would you like me to:
1. Fix the identified issues?
2. Generate additional test cases?
3. Re-score after improvements?
```

### Ralph Mode Integration

```
User: ralph mode - implement authentication with comprehensive testing
Agent: Starting Ralph mode with testing integration...

Agent: Phase 1 - Implementation
✅ Generated: src/auth/authenticate.ts

Agent: Phase 2 - Test Generation
✅ Generated: src/auth/authenticate.test.ts

Agent: Phase 3 - Quality Check
📊 Test Quality Score: 72/100
⚠️  Below threshold (80)

Agent: Phase 4 - Test Improvement
✅ Added edge case tests
✅ Improved assertion specificity
✅ Added descriptive test names

Agent: Phase 5 - Re-verification
📊 Test Quality Score: 88/100
✅ Meets quality threshold

Agent: Phase 6 - E2E Tests
✅ Generated: tests/e2e/auth-flow.spec.ts

Agent: Phase 7 - Behavioral Tests
✅ Generated: tests/behavioral/auth-robustness.test.ts

Agent: Phase 8 - CI/CD Setup
✅ Generated: .github/workflows/test.yml

All tests passing. Quality threshold met. Ready to commit.
```

### Autopilot Testing Phase

```
User: autopilot - build a REST API for tasks
Agent: Starting Autopilot with comprehensive testing...

Agent: Phase 1 - Planning
✅ Architecture designed

Agent: Phase 2 - Implementation
✅ Generated API endpoints

Agent: Phase 3 - Unit Tests
✅ Generated unit tests for all endpoints

Agent: Phase 4 - Integration Tests
✅ Generated integration tests

Agent: Phase 5 - Contract Tests
✅ Generated contract tests from OpenAPI spec

Agent: Phase 6 - E2E Tests
✅ Generated E2E tests for critical flows

Agent: Phase 7 - Quality Scoring
📊 Average Test Quality: 86/100
✅ All tests meet quality threshold

Agent: Phase 8 - Behavioral Tests
✅ Generated robustness tests

Agent: Phase 9 - CI/CD Setup
✅ Generated GitHub Actions workflow

Agent: Phase 10 - Verification
✅ All tests passing
✅ Coverage: 92%
✅ Build successful

Ready for deployment.
```

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

### Example 4: Python Test Generation

```
User: /test-gen src/calculator.py

Agent: Detecting tech stack...
✅ Detected: Python + pytest

Agent: Analyzing complexity...
✅ Simple module (30 lines, no external deps)

Agent: Generating tests...
✅ Generated: tests/test_calculator.py

Tests include:
- test_add
- test_subtract
- test_multiply
- test_divide
- test_divide_by_zero

Would you like me to commit these tests?
```

### Example 5: Go Test Generation

```
User: /test-gen pkg/math/math.go

Agent: Detecting tech stack...
✅ Detected: Go + testing package

Agent: Analyzing complexity...
✅ Simple package (40 lines, no external deps)

Agent: Generating tests...
✅ Generated: pkg/math/math_test.go

Tests include:
- TestAdd (table-driven with 3 cases)
- TestSubtract (table-driven with 3 cases)
- TestMultiply (table-driven with 3 cases)

Would you like me to commit these tests?
```

### Example 6: Rust Test Generation

```
User: /test-gen src/math.rs

Agent: Detecting tech stack...
✅ Detected: Rust + cargo test

Agent: Analyzing complexity...
✅ Simple module (35 lines, no external deps)

Agent: Generating tests...
✅ Generated: test module appended to src/math.rs

Tests include:
- test_add
- test_subtract
- test_calculator_new

Would you like me to commit these tests?
```

### Example 7: Contract Testing

```
User: /test-gen api/openapi.yaml --contract

Agent: Parsing OpenAPI specification...
✅ Found 4 endpoints

Agent: Generating contract tests...
✅ Generated: tests/contract/api.pact.test.ts

Contract tests:
- GET /users/{id} -> 200 (User found)
- POST /users -> 201 (User created)
- PUT /users/{id} -> 200 (User updated)
- DELETE /users/{id} -> 204 (User deleted)

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
