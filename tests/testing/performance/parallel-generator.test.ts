import { describe, it, expect } from 'vitest';
import { generateTestsInParallel, ParallelGenerator } from '../../../src/testing/performance/parallel-generator';

describe('Parallel Test Generator', () => {
  it('should generate tests for multiple files in parallel', async () => {
    const files = [
      'src/utils/format.ts',
      'src/utils/validation.ts',
      'src/api/users.ts',
      'src/api/auth.ts',
    ];

    const result = await generateTestsInParallel({
      files,
      maxConcurrency: 2,
    });

    expect(result.generatedTests).toHaveLength(4);
    expect(result.totalTime).toBeLessThan(10000); // Should be faster than sequential
  });

  it('should respect max concurrency limit', async () => {
    const generator = new ParallelGenerator({ maxConcurrency: 2 });
    const files = ['file1.ts', 'file2.ts', 'file3.ts', 'file4.ts'];

    const result = await generator.generate(files);

    expect(result.maxConcurrentTasks).toBe(2);
  });
});
