import { describe, it, expect, vi } from 'vitest';
import { analyzeCoverage, identifyGaps } from '../../../src/testing/analyzers/coverage';

describe('Coverage Analyzer', () => {
  it('should parse c8 coverage report', async () => {
    const mockCoverageData = {
      total: {
        lines: { total: 100, covered: 75, pct: 75 },
        statements: { total: 120, covered: 90, pct: 75 },
        functions: { total: 20, covered: 18, pct: 90 },
        branches: { total: 40, covered: 28, pct: 70 },
      },
    };

    const result = await analyzeCoverage({
      projectRoot: '/test/project',
      coverageData: mockCoverageData,
    });

    expect(result.totalCoverage).toBe(75);
    expect(result.lineCoverage).toBe(75);
    expect(result.functionCoverage).toBe(90);
  });

  it('should identify coverage gaps', async () => {
    const mockUncoveredLines = {
      'src/utils/validation.ts': [42, 43, 44, 45, 46, 47, 48, 67, 68, 69, 70, 71, 72, 89],
    };

    const result = await identifyGaps({
      projectRoot: '/test/project',
      uncoveredLines: mockUncoveredLines,
    });

    expect(result.gaps).toHaveLength(3);
    expect(result.gaps[0]).toMatchObject({
      file: 'src/utils/validation.ts',
      startLine: 42,
      endLine: 48,
      reason: expect.any(String),
    });
  });
});
