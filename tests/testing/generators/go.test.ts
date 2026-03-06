import { describe, it, expect } from 'vitest';
import { generateGoTest } from '../../../src/testing/generators/go';

describe('generateGoTest', () => {
  it('should generate Go test for simple function', async () => {
    const functionCode = `
package math

func Add(a, b int) int {
    return a + b
}
`;

    const result = await generateGoTest({
      filePath: 'pkg/math/math.go',
      code: functionCode,
      packageName: 'math',
    });

    expect(result.testCode).toContain('package math');
    expect(result.testCode).toContain('import "testing"');
    expect(result.testCode).toContain('func TestAdd(t *testing.T)');
    expect(result.testFilePath).toBe('pkg/math/math_test.go');
  });

  it('should generate table-driven tests', async () => {
    const functionCode = `
package utils

func IsValid(input string) bool {
    return len(input) > 0
}
`;

    const result = await generateGoTest({
      filePath: 'pkg/utils/validation.go',
      code: functionCode,
      packageName: 'utils',
    });

    expect(result.testCode).toContain('tests := []struct');
    expect(result.testCode).toContain('t.Run(');
  });
});
