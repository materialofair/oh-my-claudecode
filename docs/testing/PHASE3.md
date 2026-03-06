# Phase 3: Advanced Testing Features

Phase 3 completes the OMC testing ecosystem with advanced integrations for LLM prompt testing, behavioral testing, E2E test generation, CI/CD automation, and test quality scoring.

## Overview

Phase 3 adds:
- **Promptfoo Integration**: LLM prompt testing and evaluation
- **Giskard Behavioral Tests**: Robustness and perturbation testing
- **Playwright E2E Generation**: User flow to test automation
- **CI/CD Templates**: GitHub Actions workflow generation
- **Test Quality Scoring**: Automated test quality assessment
- **Ralph/Autopilot Integration**: Automated testing loops

## Features

### 1. Promptfoo Integration

Generate Promptfoo configurations for testing LLM prompts with multiple providers and test cases.

**Command:**
```bash
omc test promptfoo <prompt-file> [options]
```

**Options:**
- `-p, --provider <provider>`: LLM provider (default: `anthropic:claude-3-5-sonnet-20241022`)
- `-o, --output <path>`: Output config file path (default: `./promptfoo.config.yaml`)

**Example:**
```bash
# Generate Promptfoo config for a code review prompt
omc test promptfoo src/prompts/code-review.txt

# Use a different provider
omc test promptfoo src/prompts/summarize.txt -p openai:gpt-4

# Custom output path
omc test promptfoo src/prompts/analyze.txt -o config/promptfoo.yaml
```

**Generated Config:**
```yaml
prompts:
  - file://src/prompts/code-review.txt
providers:
  - anthropic:claude-3-5-sonnet-20241022
tests: []
outputPath: ./promptfoo-results.json
```

**Usage:**
1. Generate config: `omc test promptfoo <prompt-file>`
2. Add test cases to the generated YAML
3. Run tests: `npx promptfoo eval`
4. View results: `npx promptfoo view`

### 2. E2E Test Generation

Generate Playwright E2E tests from natural language user flow descriptions.

**Command:**
```bash
omc test e2e <flow-description> [options]
```

**Options:**
- `-b, --base-url <url>`: Base URL (default: `http://localhost:3000`)
- `-n, --test-name <name>`: Test name (default: `User flow test`)
- `-o, --output <path>`: Output file (default: `./tests/e2e/user-flow.spec.ts`)

**Example:**
```bash
# Generate E2E test from flow description
omc test e2e "User logs in, navigates to dashboard, clicks on settings"

# Custom base URL and test name
omc test e2e "Admin creates new user" \
  -b https://app.example.com \
  -n "Admin user creation flow"

# Custom output path
omc test e2e "Checkout flow" -o tests/e2e/checkout.spec.ts
```

**Generated Test:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('E2E Tests', () => {
  test('User flow test', async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.goto('http://localhost:3000/dashboard');
    await page.click('a[href="/settings"]');
  });
});
```

### 3. Giskard Behavioral Tests

Generate behavioral tests for robustness and perturbation testing.

**Command:**
```bash
omc test giskard <file> [options]
```

**Options:**
- `-t, --test-type <type>`: Test type - `perturbation` or `robustness` (default: `perturbation`)
- `-o, --output <path>`: Output file (default: `./tests/behavioral/perturbation.test.ts`)

**Example:**
```bash
# Generate perturbation tests
omc test giskard src/models/classifier.ts

# Generate robustness tests
omc test giskard src/models/sentiment.ts -t robustness

# Custom output
omc test giskard src/llm/prompt.ts -o tests/behavioral/prompt-robustness.test.ts
```

**Test Types:**

**Perturbation Tests**: Test model behavior under input variations
- Typos
- Negations
- Synonyms
- Case changes

**Robustness Tests**: Test model stability
- Case sensitivity
- Whitespace handling
- Special characters
- Input length variations

**Generated Test:**
```typescript
// Generated Giskard behavioral tests
import { describe, it, expect } from 'vitest';

describe('Behavioral Tests', () => {
  it('should still classify as expected', async () => {
    // Original: sample input
    // Perturbed (typo): smaple input
    // TODO: Add test implementation
  });

  it('should still classify as expected', async () => {
    // Original: sample input
    // Perturbed (negation): not sample input
    // TODO: Add test implementation
  });
});
```

### 4. CI/CD Workflow Generation

Generate GitHub Actions workflows for automated testing.

**Command:**
```bash
omc test cicd [options]
```

**Options:**
- `-l, --language <lang>`: Primary language - `nodejs`, `python`, `go`, `rust` (default: `nodejs`)
- `-o, --output <path>`: Output file (default: `./.github/workflows/test.yml`)

**Example:**
```bash
# Generate Node.js workflow
omc test cicd

# Generate Python workflow
omc test cicd -l python

# Generate Go workflow with custom path
omc test cicd -l go -o .github/workflows/go-test.yml
```

**Generated Workflow:**
```yaml
name: Test

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results/
```

### 5. Test Quality Scoring

Analyze test quality and get actionable recommendations.

**Command:**
```bash
omc test quality <test-file> [options]
```

**Options:**
- `-t, --test-type <type>`: Test type - `unit`, `integration`, `e2e` (default: `unit`)

**Example:**
```bash
# Score a unit test
omc test quality tests/utils/parser.test.ts

# Score an integration test
omc test quality tests/api/users.test.ts -t integration

# Score an E2E test
omc test quality tests/e2e/checkout.spec.ts -t e2e
```

**Output:**
```
📊 Test Quality Score:
  Overall:      85/100
  Completeness: 90/100
  Assertions:   80/100
  Independence: 95/100
  Naming:       75/100
  Assertion Count: 12

💡 Recommendations:
  - Test edge cases like null, undefined, empty values, and boundary conditions
  - Use descriptive test names that explain what is being tested
  - Improve assertion quality with more specific matchers
```

**Scoring Metrics:**

1. **Completeness (35% weight)**
   - Has assertions
   - Assertion count
   - Tests edge cases
   - Uses mocks
   - Has setup/teardown

2. **Assertion Quality (25% weight)**
   - Uses specific assertions (toBe, toEqual)
   - Avoids generic truthy checks
   - Assertion-to-test ratio

3. **Independence (20% weight)**
   - No shared state
   - Proper test isolation
   - Uses beforeEach/afterEach

4. **Naming (20% weight)**
   - Descriptive test names
   - Uses "should" pattern
   - Clear intent

## Integration with Ralph/Autopilot

Phase 3 features integrate seamlessly with OMC's execution modes:

### Ralph Mode Testing Loop

```bash
# Ralph automatically runs test quality checks
omc ralph "implement user authentication with tests"
```

Ralph will:
1. Generate implementation
2. Generate tests
3. Run quality scoring
4. Fix issues based on recommendations
5. Loop until quality threshold met

### Autopilot Testing Phase

```bash
# Autopilot includes comprehensive testing
omc autopilot "build a REST API"
```

Autopilot will:
1. Generate code
2. Generate unit tests
3. Generate integration tests
4. Generate E2E tests
5. Generate CI/CD workflow
6. Run quality checks
7. Generate behavioral tests

## Workflows

### Complete Testing Workflow

```bash
# 1. Generate implementation tests
omc test gen src/utils/parser.ts

# 2. Score test quality
omc test quality tests/utils/parser.test.ts

# 3. Generate E2E tests
omc test e2e "User parses configuration file"

# 4. Generate behavioral tests
omc test giskard src/utils/parser.ts

# 5. Generate CI/CD workflow
omc test cicd

# 6. Generate Promptfoo config (if using LLM)
omc test promptfoo src/prompts/parse-config.txt
```

### LLM Prompt Testing Workflow

```bash
# 1. Create prompt file
echo "Analyze this code and suggest improvements" > prompts/code-review.txt

# 2. Generate Promptfoo config
omc test promptfoo prompts/code-review.txt

# 3. Edit config to add test cases
# Edit promptfoo.config.yaml

# 4. Run Promptfoo tests
npx promptfoo eval

# 5. View results
npx promptfoo view
```

### Behavioral Testing Workflow

```bash
# 1. Generate perturbation tests
omc test giskard src/models/classifier.ts

# 2. Implement test logic
# Edit tests/behavioral/perturbation.test.ts

# 3. Run tests
pnpm test tests/behavioral/

# 4. Generate robustness tests
omc test giskard src/models/classifier.ts -t robustness

# 5. Run all behavioral tests
pnpm test tests/behavioral/
```

## Best Practices

### Promptfoo Testing

1. **Start with basic test cases**: Add simple inputs first
2. **Test edge cases**: Include boundary conditions
3. **Use multiple providers**: Compare outputs across models
4. **Version your prompts**: Track prompt changes over time
5. **Automate in CI**: Run Promptfoo tests in GitHub Actions

### E2E Testing

1. **Keep flows focused**: One user journey per test
2. **Use descriptive names**: Clear test intent
3. **Handle async properly**: Wait for elements
4. **Test critical paths**: Focus on core functionality
5. **Run in CI**: Automate E2E tests

### Behavioral Testing

1. **Test systematically**: Cover all perturbation types
2. **Set thresholds**: Define acceptable behavior ranges
3. **Monitor over time**: Track robustness metrics
4. **Fix regressions**: Address behavioral issues promptly
5. **Document expectations**: Clear behavior specifications

### Test Quality

1. **Aim for 80+ overall score**: Good quality baseline
2. **Address recommendations**: Fix issues systematically
3. **Review regularly**: Check quality on new tests
4. **Enforce in CI**: Fail builds on low quality
5. **Improve iteratively**: Gradual quality improvements

## Configuration

### Promptfoo Config

```yaml
# promptfoo.config.yaml
prompts:
  - file://prompts/code-review.txt
  - file://prompts/summarize.txt

providers:
  - anthropic:claude-3-5-sonnet-20241022
  - openai:gpt-4
  - openai:gpt-3.5-turbo

tests:
  - vars:
      code: "function add(a, b) { return a + b; }"
    assert:
      - type: contains
        value: "function"
      - type: contains
        value: "parameters"

  - vars:
      code: "const x = 1;"
    assert:
      - type: contains
        value: "variable"

defaultTest:
  assert:
    - type: llm-rubric
      value: "Output should be helpful and accurate"

outputPath: ./promptfoo-results.json
```

### Playwright Config

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
});
```

## Troubleshooting

### Promptfoo Issues

**Problem**: Config not found
```bash
# Solution: Check file path
ls -la promptfoo.config.yaml
```

**Problem**: Provider authentication
```bash
# Solution: Set API keys
export ANTHROPIC_API_KEY=your-key
export OPENAI_API_KEY=your-key
```

### E2E Test Issues

**Problem**: Selector not found
```typescript
// Solution: Use better selectors
await page.waitForSelector('[data-testid="login-button"]');
await page.click('[data-testid="login-button"]');
```

**Problem**: Flaky tests
```typescript
// Solution: Add explicit waits
await page.waitForLoadState('networkidle');
await expect(page.locator('.result')).toBeVisible();
```

### Quality Scoring Issues

**Problem**: Low scores
```bash
# Solution: Follow recommendations
omc test quality tests/file.test.ts
# Read and implement recommendations
```

**Problem**: False positives
```bash
# Solution: Review metrics manually
# Some patterns may not apply to your test style
```

## Next Steps

1. **Explore Phase 1**: Basic test generation - [Phase 1 Guide](./PHASE1.md)
2. **Explore Phase 2**: Advanced features - [Phase 2 Guide](./PHASE2.md)
3. **Read Testing Guide**: Complete overview - [Testing README](./README.md)
4. **Check Examples**: Sample tests - [Examples](../../examples/testing/)

## API Reference

### Promptfoo Config Generator

```typescript
import { generatePromptfooConfig } from '@/testing/integrations/promptfoo/config-generator';

const config = await generatePromptfooConfig({
  promptFile: 'prompts/code-review.txt',
  testCases: [
    { input: 'code sample', expected: 'contains:function' }
  ],
  provider: 'anthropic:claude-3-5-sonnet-20241022',
});
```

### E2E Test Generator

```typescript
import { generateFromUserFlow } from '@/testing/generators/e2e';

const result = await generateFromUserFlow({
  flowDescription: 'User logs in and views dashboard',
  baseUrl: 'http://localhost:3000',
  testName: 'Login flow',
});
```

### Behavioral Test Generator

```typescript
import { generatePerturbationTests } from '@/testing/integrations/giskard/behavioral-tests';

const suite = await generatePerturbationTests({
  testCases: [
    { input: 'sample', expectedOutput: 'result' }
  ],
  perturbations: ['typo', 'negation', 'synonym'],
});
```

### CI/CD Workflow Generator

```typescript
import { generateGitHubActionsWorkflow } from '@/testing/integrations/cicd';

const workflow = await generateGitHubActionsWorkflow({
  language: 'nodejs',
  coverage: true,
  artifacts: true,
});
```

### Test Quality Scorer

```typescript
import { scoreTestQuality } from '@/testing/analyzers/quality-scorer';

const score = await scoreTestQuality({
  testCode: testFileContent,
  testType: 'unit',
});
```

## Resources

- [Promptfoo Documentation](https://promptfoo.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Giskard Documentation](https://docs.giskard.ai/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [OMC Testing Guide](./README.md)
