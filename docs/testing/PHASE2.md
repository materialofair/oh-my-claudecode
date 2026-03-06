# LLM Testing System - Phase 2 Features

Phase 2 extends the testing system with advanced features including coverage analysis, multi-language support, complexity analysis, contract testing, and workflow integration.

## New Features

### 1. Coverage Analysis

Analyze test coverage and identify gaps:

```bash
omc test analyze
```

Features:
- Parse c8/nyc coverage reports
- Identify uncovered code ranges
- Analyze reasons for gaps (error handling, branches, etc.)
- Generate supplementary tests for gaps

### 2. Multi-Language Support

Generate tests for Python, Go, and Rust:

```bash
# Python (pytest)
omc test gen src/utils/math.py

# Go (testing package)
omc test gen pkg/math/math.go

# Rust (cargo test)
omc test gen src/math.rs
```

Supported frameworks:
- **Python**: pytest, unittest
- **Go**: testing package with table-driven tests
- **Rust**: cargo test with #[test] attributes

### 3. Complexity Analysis

Automatically classify code as simple or complex:

```typescript
const analysis = await analyzeComplexity({ code, filePath });
// Returns: { complexity: 'simple' | 'complex', metrics, reasons }
```

Metrics:
- Lines of code
- Cyclomatic complexity
- Nesting levels
- External dependencies

Complexity indicators:
- Payment/auth logic
- Database transactions
- External API calls
- Multiple async operations

### 4. Contract Testing

Generate API contract tests from OpenAPI specs:

```bash
omc test contract api/openapi.yaml
```

Supported frameworks:
- **Pact**: Consumer-driven contract testing
- **Supertest**: REST API contract tests
- **MSW**: Mock Service Worker handlers

### 5. Enhanced Test-Engineer Agent

The test-engineer agent now receives enriched context:

- Tech stack detection
- Complexity analysis
- Suggested approach (auto/guided/manual)
- Pre-generated questions for complex code

### 6. UltraQA Integration

UltraQA now includes automatic test generation:

```bash
/ultraqa
```

Workflow:
1. Identify files needing tests
2. Generate missing tests
3. Run tests and analyze coverage
4. Generate supplementary tests for gaps
5. Repeat until coverage threshold met

## Usage Examples

### Example 1: Python Test Generation

```bash
omc test gen src/calculator.py
```

Output:
```
Detected: Python + pytest
Generated: tests/test_calculator.py

Tests include:
- test_add
- test_subtract
- test_multiply
- test_divide
```

### Example 2: Coverage Analysis

```bash
omc test analyze
```

Output:
```
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

### Example 3: Contract Testing

```bash
omc test contract api/openapi.yaml --framework=pact
```

Output:
```
Generated: tests/contract/frontend-backend.pact.test.ts

Contract tests:
- GET /users/{id}
- POST /users
- PUT /users/{id}
- DELETE /users/{id}
```

### Example 4: Complex Code with Test-Engineer

```bash
/test-gen src/services/payment.ts
```

Output:
```
Agent: Detecting tech stack...
Detected: Node.js + Express + PostgreSQL + Vitest

Agent: Analyzing complexity...
Complex code detected:
- Payment processing logic
- External Stripe API calls
- Database transactions
- Multiple async operations

Agent: Delegating to test-engineer for detailed test cases...

Test-Engineer: I'll need some information:
1. What are the expected payment flows? (success, failure, retry)
2. Should I mock Stripe API calls?
3. What database states should I test?
4. Are there specific edge cases to cover?

[User provides details]

Test-Engineer: Generating comprehensive test suite...
Generated 12 test cases covering:
- Happy path payment processing
- Stripe API failure scenarios
- Database transaction rollbacks
- Idempotency checks
- Concurrent payment handling
```

## Configuration

Add to `.omc/project-config.json`:

```json
{
  "testing": {
    "coverageThreshold": 80,
    "complexityThresholds": {
      "lines": 50,
      "cyclomaticComplexity": 10,
      "nestingLevel": 3
    },
    "autoGenerateTests": true,
    "languages": ["nodejs", "python", "go", "rust"]
  }
}
```

## Architecture

```
src/testing/
├── analyzers/
│   ├── coverage.ts       # Coverage analysis
│   ├── complexity.ts     # Complexity analysis
│   └── types.ts          # Analyzer types
├── generators/
│   ├── react.ts          # React component tests
│   ├── nodejs.ts         # Node.js function tests
│   ├── python.ts         # Python pytest tests
│   ├── go.ts             # Go table-driven tests
│   ├── rust.ts           # Rust cargo tests
│   └── contract.ts       # API contract tests
├── detectors/
│   ├── index.ts          # Multi-language detection
│   ├── package-json.ts   # Node.js detection
│   ├── python.ts         # Python detection
│   ├── go.ts             # Go detection
│   └── rust.ts           # Rust detection
└── cli/
    ├── commands.ts       # CLI command implementations
    ├── agent-integration.ts  # Test-engineer integration
    └── ultraqa-integration.ts  # UltraQA integration
```

## Next Steps (Phase 3)

- Giskard integration for behavior testing
- E2E test generation with Playwright
- CI/CD integration
- Ralph mode test loops
- Autopilot automatic testing
- Performance optimization

## Success Metrics

Phase 2 Achievements:
- Multi-language support (Python, Go, Rust)
- Coverage analysis and gap identification
- Complexity analysis for smart test generation
- Contract testing for APIs
- Enhanced test-engineer agent
- UltraQA integration

Target Metrics:
- Test coverage: 80%+
- Test generation time: < 30 seconds/file
- Multi-language support: 4 languages
- Complexity classification accuracy: > 90%
