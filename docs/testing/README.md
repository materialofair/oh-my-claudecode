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

- **Automatic tech stack detection**: Identifies React, Vue, Svelte, Node.js, Python, Go, Rust, and more
- **Complexity analysis**: Determines if code is simple or complex with cyclomatic complexity metrics
- **Smart test generation**: Creates appropriate tests based on code patterns
- **Coverage analysis**: Identifies missing test scenarios and generates supplementary tests
- **Multi-language support**: Node.js, Python (pytest), Go (testing), Rust (cargo test)
- **Contract testing**: Generate API contract tests from OpenAPI specs
- **Framework support**: Vitest, Jest, React Testing Library, pytest, unittest, Go testing, cargo test
- **UltraQA integration**: Automatic test generation in QA cycles

## Phase 2 Features (NEW)

Phase 2 adds advanced capabilities:

- **Coverage Analysis**: Identify and fill coverage gaps
- **Multi-Language**: Python, Go, Rust support
- **Complexity Analysis**: Smart classification of code complexity
- **Contract Testing**: API contract tests from OpenAPI specs
- **Enhanced Agent**: Test-engineer with enriched context
- **UltraQA Integration**: Automatic test generation in QA cycles

See [Phase 2 Documentation](./PHASE2.md) for details.

## Architecture

```
src/testing/
├── index.ts              # Main module exports
├── types.ts              # TypeScript interfaces
├── analyzers/
│   ├── coverage.ts       # Coverage analysis
│   ├── complexity.ts     # Complexity analysis
│   └── types.ts          # Analyzer types
├── cli/
│   ├── commands.ts       # CLI command implementations
│   ├── agent-integration.ts  # Test-engineer integration
│   └── ultraqa-integration.ts  # UltraQA integration
├── detectors/
│   ├── index.ts          # Multi-language detection orchestrator
│   ├── package-json.ts   # package.json parser (Node.js)
│   ├── python.ts         # Python detection (requirements.txt/pyproject.toml)
│   ├── go.ts             # Go detection (go.mod)
│   └── rust.ts           # Rust detection (Cargo.toml)
└── generators/
    ├── react.ts          # React component test generator
    ├── nodejs.ts         # Node.js function test generator
    ├── python.ts         # Python pytest/unittest test generator
    ├── go.ts             # Go table-driven test generator
    ├── rust.ts           # Rust cargo test generator
    └── contract.ts       # API contract test generator
```

## CLI Commands

### Generate Tests

```bash
omc test gen <file> [--output <path>]
```

Generates tests for the specified file. Supports `.ts`, `.tsx`, `.js`, `.jsx`, `.py`, `.go`, and `.rs` files.

**Options:**
- `--output <path>`: Specify custom output path for test file

**Examples:**
```bash
# Generate test for React component
omc test gen src/components/Button.tsx

# Generate test with custom output path
omc test gen src/utils/math.ts --output tests/utils/math.test.ts

# Generate Python test
omc test gen src/utils/math.py

# Generate Go test
omc test gen pkg/math/math.go

# Generate Rust test
omc test gen src/math.rs
```

### Detect Tech Stack

```bash
omc test detect-stack
```

Displays the detected tech stack for the current project.

**Output includes:**
- Frontend framework (React/Vue/Svelte)
- Backend language (Node.js/Python/Go/Rust)
- Test frameworks (Vitest/Jest/pytest/Go testing/cargo test)
- Databases (PostgreSQL/MySQL/MongoDB)
- API types (REST/GraphQL/gRPC)

### Analyze Coverage

```bash
omc test analyze
```

Analyzes test coverage and identifies gaps in the current project.

**Output includes:**
- Overall, line, function, and branch coverage percentages
- List of coverage gaps with file, line range, and reason
- Option to generate supplementary tests for gaps

### Contract Testing

```bash
omc test contract <spec-file> [--framework <pact|supertest|msw>]
```

Generates API contract tests from an OpenAPI specification.

**Options:**
- `--framework <name>`: Choose contract test framework (default: `supertest`)

**Examples:**
```bash
# Generate Pact contract tests
omc test contract api/openapi.yaml --framework=pact

# Generate Supertest contract tests
omc test contract api/openapi.yaml --framework=supertest
```

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
  - Coming in Phase 3

- **Svelte** (with Vitest)
  - Coming in Phase 3

### Backend
- **Node.js** (with Vitest or Jest)
  - Function unit tests
  - Express/Fastify route tests
  - Async function tests

- **Python** (with pytest or unittest)
  - Function and class tests
  - Async test support (pytest-asyncio)
  - Auto-detection via requirements.txt/pyproject.toml

- **Go** (with testing package)
  - Table-driven tests
  - Struct method tests
  - Auto-detection via go.mod

- **Rust** (with cargo test)
  - #[test] attribute tests
  - Struct impl tests
  - Auto-detection via Cargo.toml

### Supported Languages

| Language | Test Framework | Detection | Status |
|----------|---------------|-----------|--------|
| Node.js/TypeScript | Vitest, Jest | package.json | Available |
| React | Vitest + Testing Library | package.json | Available |
| Python | pytest, unittest | requirements.txt, pyproject.toml | Available |
| Go | testing package | go.mod | Available |
| Rust | cargo test | Cargo.toml | Available |
| Vue | Vitest | package.json | Phase 3 |
| Svelte | Vitest | package.json | Phase 3 |

### Contract Testing
- **Pact**: Consumer-driven contract testing from OpenAPI specs
- **Supertest**: REST API contract tests
- **MSW**: Mock Service Worker handlers

### Coming Soon (Phase 3)
- Vue/Svelte component tests
- E2E tests (Playwright/Cypress)
- Giskard behavior testing

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

### Example 4: Python Test Generation

```bash
$ omc test gen src/calculator.py

Detected: Python + pytest
Generated: tests/test_calculator.py

Tests include:
- test_add
- test_subtract
- test_multiply
- test_divide
```

### Example 5: Go Test Generation

```bash
$ omc test gen pkg/math/math.go

Detected: Go + testing package
Generated: pkg/math/math_test.go

Tests include:
- TestAdd (table-driven)
- TestSubtract (table-driven)
- TestMultiply (table-driven)
```

### Example 6: Rust Test Generation

```bash
$ omc test gen src/math.rs

Detected: Rust + cargo test
Generated: test module in src/math.rs

Tests include:
- test_add
- test_subtract
- test_new (struct constructor)
```

### Example 7: Coverage Analysis

```bash
$ omc test analyze

Coverage Analysis:
- Overall: 75%
- Lines: 75%
- Functions: 90%
- Branches: 70%

Coverage Gaps:
1. src/utils/validation.ts (lines 42-48)
   Reason: Error handling not covered

2. src/services/payment.ts (lines 67-72)
   Reason: Edge case for retries

Generate tests for gaps? (y/n)
```

### Example 8: Contract Testing

```bash
$ omc test contract api/openapi.yaml --framework=pact

Generated: tests/contract/frontend-backend.pact.test.ts

Contract tests:
- GET /users/{id}
- POST /users
- PUT /users/{id}
- DELETE /users/{id}
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

UltraQA now includes automatic test generation and coverage-driven iteration:

```bash
# Generate tests and run QA cycle
/ultraqa src/api/users.ts
```

Enhanced workflow:
1. Identify files needing tests
2. Generate missing tests via `/test-gen`
3. Run tests and analyze coverage
4. Generate supplementary tests for coverage gaps
5. Repeat until coverage threshold met (default: 80%)

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
- File extension is supported (.tsx, .jsx, .ts, .js, .py, .go, .rs)
- Tech stack is detected correctly (`omc test detect-stack`)
- Project has the required config file (package.json, requirements.txt, go.mod, or Cargo.toml)

### Generated tests don't match project style

**Issue**: Generated tests use different patterns than existing tests

**Solution**: The generator uses heuristics. For complex projects:
- Use `/test-gen` skill instead of CLI (delegates to test-engineer)
- Manually adjust generated tests to match project conventions
- Consider contributing project-specific templates

### Coverage analysis not working

**Issue**: `omc test analyze` shows no results

**Solution**: Ensure that:
- A coverage report exists (run tests with coverage first, e.g., `npx c8 vitest run`)
- The project uses c8 or nyc for coverage reporting
- Coverage data is in a supported format (JSON summary)

### Multi-language detection fails

**Issue**: `omc test gen` doesn't detect the correct language

**Solution**: Ensure the project has the expected config files:
- Python: `requirements.txt` or `pyproject.toml`
- Go: `go.mod`
- Rust: `Cargo.toml`
- Node.js: `package.json`

## Roadmap

### Phase 1 (Complete)
- ✅ React component test generation
- ✅ Node.js function test generation
- ✅ Tech stack detection
- ✅ CLI commands
- ✅ `/test-gen` skill

### Phase 2 (Complete)
- ✅ Coverage analysis and gap identification
- ✅ Python test generation (pytest/unittest)
- ✅ Go test generation (table-driven tests)
- ✅ Rust test generation (cargo test)
- ✅ Complexity analysis with cyclomatic complexity metrics
- ✅ Contract testing from OpenAPI specs (Pact/Supertest/MSW)
- ✅ Enhanced test-engineer agent integration
- ✅ UltraQA integration with automatic test generation
- ✅ Multi-language CLI support with auto-detection

### Phase 3 (Planned)
- Giskard integration for behavior testing
- E2E test generation (Playwright/Cypress)
- CI/CD integration (GitHub Actions)
- Ralph mode test-fix-verify loops
- Autopilot automatic testing
- Performance optimization
- Vue/Svelte component test generation

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
