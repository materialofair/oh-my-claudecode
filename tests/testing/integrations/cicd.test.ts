import { describe, it, expect } from 'vitest';
import { generateGitHubActionsWorkflow } from '../../../src/testing/integrations/cicd';

describe('CI/CD Integration - GitHub Actions', () => {
  it('should generate workflow for Node.js project', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'nodejs',
      testCommand: 'pnpm test',
      nodeVersion: '20',
    });

    expect(result).toContain('name: Test');
    expect(result).toContain('node-version: 20');
    expect(result).toContain('run: pnpm test');
    expect(result).toContain('actions/setup-node@v4');
  });

  it('should generate workflow for Python project', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'python',
      testCommand: 'pytest',
      pythonVersion: '3.11',
    });

    expect(result).toContain('name: Test');
    expect(result).toContain('python-version: 3.11');
    expect(result).toContain('run: pytest');
    expect(result).toContain('actions/setup-python@v5');
  });

  it('should generate workflow for Go project', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'go',
      testCommand: 'go test ./...',
      goVersion: '1.21',
    });

    expect(result).toContain('name: Test');
    expect(result).toContain('go-version: 1.21');
    expect(result).toContain('run: go test ./...');
    expect(result).toContain('actions/setup-go@v5');
  });

  it('should generate workflow for Rust project', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'rust',
      testCommand: 'cargo test',
      rustVersion: 'stable',
    });

    expect(result).toContain('name: Test');
    expect(result).toContain('toolchain: stable');
    expect(result).toContain('run: cargo test');
    expect(result).toContain('actions-rust-lang/setup-rust-toolchain@v1');
  });

  it('should generate workflow with coverage reporting', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'nodejs',
      testCommand: 'pnpm test',
      nodeVersion: '20',
      coverage: true,
      coverageProvider: 'codecov',
    });

    expect(result).toContain('run: pnpm test');
    expect(result).toContain('codecov/codecov-action@v4');
  });

  it('should generate workflow with test artifacts', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'nodejs',
      testCommand: 'pnpm test',
      nodeVersion: '20',
      artifacts: true,
      artifactPath: 'test-results/',
    });

    expect(result).toContain('actions/upload-artifact@v4');
    expect(result).toContain('path: test-results/');
  });

  it('should generate workflow with matrix builds', async () => {
    const result = await generateGitHubActionsWorkflow({
      language: 'nodejs',
      testCommand: 'pnpm test',
      matrix: {
        nodeVersion: ['18', '20', '22'],
        os: ['ubuntu-latest', 'macos-latest'],
      },
    });

    expect(result).toContain('strategy:');
    expect(result).toContain('matrix:');
    expect(result).toContain('node-version: [18, 20, 22]');
    expect(result).toContain('os: [ubuntu-latest, macos-latest]');
    expect(result).toContain('runs-on: ${{ matrix.os }}');
  });

  it('should generate workflow for multiple languages', async () => {
    const result = await generateGitHubActionsWorkflow({
      languages: ['nodejs', 'python', 'go'],
      testCommands: {
        nodejs: 'pnpm test',
        python: 'pytest',
        go: 'go test ./...',
      },
      matrix: {
        language: ['nodejs', 'python', 'go'],
      },
    });

    expect(result).toContain('strategy:');
    expect(result).toContain('matrix:');
    expect(result).toContain('language: [nodejs, python, go]');
  });
});

