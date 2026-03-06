import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { enhanceUltraQAWithTestGen } from '../../../src/testing/cli/ultraqa-integration';

// Mock the dependencies
vi.mock('../../../src/testing/analyzers/coverage', () => ({
  analyzeCoverage: vi.fn().mockResolvedValue({
    totalCoverage: 60,
    lineCoverage: 60,
    functionCoverage: 70,
    branchCoverage: 50,
    statementCoverage: 65,
  }),
  identifyGaps: vi.fn().mockResolvedValue({
    gaps: [
      { file: 'src/utils/math.ts', startLine: 10, endLine: 15, reason: 'Error handling not covered' },
    ],
    totalGaps: 1,
  }),
}));

vi.mock('../../../src/testing/cli/commands', () => ({
  testGenCommand: vi.fn().mockResolvedValue({
    success: true,
    testFilePath: 'src/utils/validation.test.ts',
  }),
}));

describe('UltraQA Integration', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-ultraqa-'));
    vi.clearAllMocks();
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('should identify files needing tests', async () => {
    // Create source files without corresponding test files
    const srcDir = path.join(tmpDir, 'src', 'utils');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'math.ts'), 'export function add(a: number, b: number) { return a + b; }');
    await fs.writeFile(path.join(srcDir, 'payment.ts'), 'export function pay() {}');

    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      changedFiles: ['src/utils/math.ts', 'src/utils/payment.ts'],
    });

    expect(result.filesNeedingTests).toHaveLength(2);
    expect(result.coverageGaps).toBeDefined();
  });

  it('should not flag files that already have tests', async () => {
    // Create source file and its test file
    const srcDir = path.join(tmpDir, 'src', 'utils');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'math.ts'), 'export function add(a: number, b: number) { return a + b; }');
    await fs.writeFile(path.join(srcDir, 'math.test.ts'), 'test("add", () => {})');

    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      changedFiles: ['src/utils/math.ts'],
    });

    expect(result.filesNeedingTests).toHaveLength(0);
  });

  it('should generate tests for coverage gaps', async () => {
    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      coverageGaps: [
        { file: 'src/utils/validation.ts', startLine: 42, endLine: 48, reason: 'Error handling not covered' },
      ],
    });

    expect(result.generatedTests).toHaveLength(1);
    expect(result.generatedTests[0]).toBe('src/utils/validation.test.ts');
  });

  it('should analyze coverage when no gaps provided', async () => {
    const srcDir = path.join(tmpDir, 'src', 'utils');
    await fs.mkdir(srcDir, { recursive: true });
    await fs.writeFile(path.join(srcDir, 'math.ts'), 'export function add(a: number, b: number) { return a + b; }');

    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      changedFiles: ['src/utils/math.ts'],
    });

    // Coverage is mocked at 60% (below 80% threshold), so gaps should be populated
    expect(result.coverageGaps).toBeDefined();
    expect(result.coverageGaps!.length).toBeGreaterThan(0);
  });

  it('should handle empty changed files list', async () => {
    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      changedFiles: [],
    });

    expect(result.filesNeedingTests).toHaveLength(0);
    expect(result.generatedTests).toHaveLength(0);
  });

  it('should handle test generation failures gracefully', async () => {
    const { testGenCommand } = await import('../../../src/testing/cli/commands');
    vi.mocked(testGenCommand).mockRejectedValueOnce(new Error('Generation failed'));

    const result = await enhanceUltraQAWithTestGen({
      projectRoot: tmpDir,
      coverageGaps: [
        { file: 'src/broken.ts', startLine: 1, endLine: 5, reason: 'Code path not covered' },
      ],
    });

    // Should not crash, just skip the failed file
    expect(result.generatedTests).toHaveLength(0);
  });
});
