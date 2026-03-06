import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  testGenCommand,
  testAnalyzeCoverageCommand,
  testContractCommand,
  testComplexityCommand,
} from '../../../src/testing/cli/commands';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Multi-Language Test Generation', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-multi-lang-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should generate Python test', async () => {
    const pyFile = path.join(tmpDir, 'math.py');
    await fs.writeFile(pyFile, 'def add(a, b):\n    return a + b\n');

    const result = await testGenCommand({
      filePath: pyFile,
      language: 'python',
    });

    expect(result.success).toBe(true);
    expect(result.testFilePath).toContain('test_math.py');
  });

  it('should generate Go test', async () => {
    const goFile = path.join(tmpDir, 'math.go');
    await fs.writeFile(goFile, 'package math\n\nfunc Add(a, b int) int {\n\treturn a + b\n}\n');

    const result = await testGenCommand({
      filePath: goFile,
      language: 'go',
    });

    expect(result.success).toBe(true);
    expect(result.testFilePath).toContain('math_test.go');
  });

  it('should generate Rust test', async () => {
    const rsFile = path.join(tmpDir, 'math.rs');
    await fs.writeFile(rsFile, 'pub fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n');

    const result = await testGenCommand({
      filePath: rsFile,
      language: 'rust',
    });

    expect(result.success).toBe(true);
    expect(result.testFilePath).toBe(rsFile); // Rust tests in same file
  });

  it('should auto-detect language from file extension', async () => {
    const pyFile = path.join(tmpDir, 'utils.py');
    await fs.writeFile(pyFile, 'def greet(name):\n    return f"Hello {name}"\n');

    const pythonResult = await testGenCommand({
      filePath: pyFile,
    });
    expect(pythonResult.success).toBe(true);

    const goFile = path.join(tmpDir, 'utils.go');
    await fs.writeFile(goFile, 'package utils\n\nfunc Greet(name string) string {\n\treturn "Hello " + name\n}\n');

    const goResult = await testGenCommand({
      filePath: goFile,
    });
    expect(goResult.success).toBe(true);

    const rsFile = path.join(tmpDir, 'utils.rs');
    await fs.writeFile(rsFile, 'pub fn greet(name: &str) -> String {\n    format!("Hello {}", name)\n}\n');

    const rustResult = await testGenCommand({
      filePath: rsFile,
    });
    expect(rustResult.success).toBe(true);
  });

  it('should return error for unsupported file type', async () => {
    const result = await testGenCommand({
      filePath: 'test.java',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Unsupported file type');
  });
});

describe('Coverage Analysis Command', () => {
  it('should analyze coverage from provided data', async () => {
    const result = await testAnalyzeCoverageCommand({
      projectRoot: '/test/project',
      coverageData: {
        total: {
          lines: { total: 100, covered: 80, pct: 80 },
          statements: { total: 120, covered: 96, pct: 80 },
          functions: { total: 20, covered: 18, pct: 90 },
          branches: { total: 40, covered: 28, pct: 70 },
        },
      },
    });

    expect(result.totalCoverage).toBe(80);
    expect(result.lineCoverage).toBe(80);
    expect(result.functionCoverage).toBe(90);
    expect(result.branchCoverage).toBe(70);
  });
});

describe('Contract Test Command', () => {
  it('should generate contract test from OpenAPI spec', async () => {
    const result = await testContractCommand({
      specPath: '/test/openapi.yaml',
      spec: {
        paths: {
          '/users': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      framework: 'pact',
      consumer: 'web-app',
      provider: 'user-api',
    });

    expect(result.success).toBe(true);
    expect(result.testCode).toContain('Pact');
    expect(result.testFilePath).toContain('pact');
  });
});

describe('Complexity Analysis Command', () => {
  it('should analyze file complexity', async () => {
    let tmpDir: string;
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-complexity-'));

    const filePath = path.join(tmpDir, 'complex.ts');
    await fs.writeFile(filePath, `
function processData(input: string) {
  if (input.length > 0) {
    for (let i = 0; i < input.length; i++) {
      if (input[i] === 'a') {
        while (true) {
          break;
        }
      }
    }
  }
  return input;
}
`);

    const result = await testComplexityCommand({ filePath });

    expect(result.complexity).toBeDefined();
    expect(result.metrics).toBeDefined();
    expect(result.metrics.cyclomaticComplexity).toBeGreaterThan(1);

    await fs.rm(tmpDir, { recursive: true, force: true });
  });
});
