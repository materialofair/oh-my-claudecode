# LLM Testing System

Intelligent test generation system for oh-my-claudecode.

## Quick Start

Generate tests for a file:

```bash
omc test gen src/components/Button.tsx
```

Or use the skill:

```bash
/test-gen src/components/Button.tsx
```

## Features

- **Automatic tech stack detection**: Identifies React, Vue, Svelte, Node.js, and more
- **Complexity analysis**: Determines if code is simple or complex
- **Smart test generation**: Creates appropriate tests based on code patterns
- **Coverage analysis**: Identifies missing test scenarios
- **Framework support**: Vitest, Jest, React Testing Library

## Architecture

```
src/testing/
├── index.ts              # Main module exports
├── types.ts              # TypeScript interfaces
├── cli/
│   └── commands.ts       # CLI command implementations
├── detectors/
│   ├── index.ts          # Tech stack detection orchestrator
│   └── package-json.ts   # package.json parser
└── generators/
    ├── react.ts          # React component test generator
    └── nodejs.ts         # Node.js function test generator
```

## CLI Commands

### Generate Tests

```bash
omc test gen <file> [--output <path>]
```

Generates tests for the specified file.

**Options:**
- `--output <path>`: Specify custom output path for test file

**Examples:**
```bash
# Generate test for React component
omc test gen src/components/Button.tsx

# Generate test with custom output path
omc test gen src/utils/math.ts --output tests/utils/math.test.ts
```

### Detect Tech Stack

```bash
omc test detect-stack
```

Displays the detected tech stack for the current project.

**Output includes:**
- Frontend framework (React/Vue/Svelte)
- Backend language (Node.js)
- Test frameworks (Vitest/Jest)
- Databases (PostgreSQL/MySQL/MongoDB)
- API types (REST/GraphQL/gRPC)

## Skill Usage

The `/test-gen` skill provides a higher-level interface with automatic complexity analysis:

```bash
/test-gen src/components/Button.tsx
/test-gen src/services/payment.ts --coverage-analysis
```

### Simple vs Complex Code

**Simple code** (auto-generated tests):
- Function lines < 50
- Cyclomatic complexity < 10
- Nesting level < 3
- No external dependencies

**Complex code** (framework + test-engineer delegation):
- Payment/auth logic
- Multi-step workflows
- External service dependencies
- Async/concurrent scenarios

## Supported Tech Stacks

### Frontend
- **React** (with Vitest or Jest)
  - Component rendering tests
  - Event handler tests
  - Props validation
  - React Testing Library integration

- **Vue** (with Vitest)
  - Coming in Phase 2

- **Svelte** (with Vitest)
  - Coming in Phase 2

### Backend
- **Node.js** (with Vitest or Jest)
  - Function unit tests
  - Express/Fastify route tests
  - Async function tests

### Coming Soon (Phase 2)
- Python (pytest)
- Go (testing package)
- Rust (cargo test)
- Integration tests
- E2E tests (Playwright/Cypress)

## Examples

### Example 1: Simple React Component

```bash
$ /test-gen src/components/Button.tsx

Detecting tech stack...
✅ Detected: React + Vitest

Analyzing complexity...
✅ Simple component (25 lines, no external deps)

Generating tests...
✅ Generated: src/components/Button.test.tsx

Tests include:
- Renders children correctly
- Handles onClick events
- Accessibility checks

Would you like me to commit these tests?
```

### Example 2: Node.js Utility Function

```bash
$ omc test gen src/utils/math.ts

✅ Test generated: src/utils/math.test.ts

Generated tests:
- adds two numbers
- handles negative numbers
- handles zero values
```

### Example 3: Complex Service

```bash
$ /test-gen src/services/payment.ts

Detecting tech stack...
✅ Detected: Node.js + Express + PostgreSQL + Vitest

Analyzing complexity...
⚠️  Complex code detected:
- Payment processing logic
- External Stripe API calls
- Database transactions
- Error handling for multiple scenarios

Generating test framework...
✅ Generated: src/services/payment.test.ts (framework)

Delegating to test-engineer for detailed test cases...

Test-Engineer: I'll need some information:
1. What are the expected payment flows? (success, failure, retry)
2. Should I mock Stripe API calls?
3. What database states should I test?
4. Are there specific edge cases to cover?
```

## Integration with Other Skills

### With `/tdd` Skill

The test-gen skill integrates with TDD workflows:

```bash
# Generate failing tests first
/test-gen src/features/auth.ts --tdd-mode

# Then implement to make tests pass
```

### With `/autopilot` Skill

Autopilot automatically invokes test-gen after implementation:

```bash
autopilot: build a REST API for tasks

# Autopilot will:
# 1. Generate implementation
# 2. Run /test-gen on all new files
# 3. Verify tests pass
# 4. Check coverage meets threshold
```

### With `/ultraqa` Skill

Test-gen provides the initial test suite for QA cycling:

```bash
# Generate tests
/test-gen src/api/users.ts

# Run QA cycle
/ultraqa src/api/users.ts
```

## Development

### Run Tests

```bash
# Run all testing module tests
pnpm test tests/testing/**

# Run specific test suite
pnpm test tests/testing/detectors/package-json.test.ts
```

### Build

```bash
pnpm build
```

### Add New Generator

1. Create generator file in `src/testing/generators/`
2. Implement generator interface
3. Add tests in `tests/testing/generators/`
4. Update CLI commands to support new generator
5. Update documentation

## Troubleshooting

### Test generation fails

**Issue**: `omc test gen` fails with "Unsupported file type"

**Solution**: Check that:
- File extension is supported (.tsx, .jsx, .ts, .js)
- Tech stack is detected correctly (`omc test detect-stack`)
- package.json includes required test framework

### Generated tests don't match project style

**Issue**: Generated tests use different patterns than existing tests

**Solution**: The generator uses heuristics. For complex projects:
- Use `/test-gen` skill instead of CLI (delegates to test-engineer)
- Manually adjust generated tests to match project conventions
- Consider contributing project-specific templates

### Coverage analysis not working

**Issue**: `--coverage-analysis` flag has no effect

**Solution**: Coverage analysis is planned for Phase 2. Current version generates tests based on code analysis only.

## Roadmap

### Phase 1 (Current)
- ✅ React component test generation
- ✅ Node.js function test generation
- ✅ Tech stack detection
- ✅ CLI commands
- ✅ `/test-gen` skill

### Phase 2 (Planned)
- Python test generation (pytest)
- Go test generation (testing package)
- Rust test generation (cargo test)
- Integration test generation
- E2E test generation (Playwright/Cypress)
- Advanced complexity analysis with AST parsing
- LLM-powered test case suggestions
- Test quality scoring

### Phase 3 (Future)
- Promptfoo integration
- LLM evaluation test generation
- Regression test suite for prompts
- Performance benchmarking
- Multi-model comparison

## Contributing

See the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

### Adding Support for New Frameworks

1. Create detector in `src/testing/detectors/`
2. Create generator in `src/testing/generators/`
3. Add tests for both
4. Update types in `src/testing/types.ts`
5. Update this documentation

## License

MIT
