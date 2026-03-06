import { describe, it, expect } from 'vitest';
import { generatePythonTest } from '../../../src/testing/generators/python';

describe('generatePythonTest', () => {
  it('should generate pytest test for simple function', async () => {
    const functionCode = `
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b
`;

    const result = await generatePythonTest({
      filePath: 'src/utils/math.py',
      code: functionCode,
      testFramework: 'pytest',
    });

    expect(result.testCode).toContain('import pytest');
    expect(result.testCode).toContain('def test_add');
    expect(result.testCode).toContain('assert add(2, 3) == 5');
    expect(result.testFilePath).toBe('tests/test_math.py');
  });

  it('should generate test for class with methods', async () => {
    const classCode = `
class Calculator:
    def add(self, a: int, b: int) -> int:
        return a + b

    def subtract(self, a: int, b: int) -> int:
        return a - b
`;

    const result = await generatePythonTest({
      filePath: 'src/calculator.py',
      code: classCode,
      testFramework: 'pytest',
    });

    expect(result.testCode).toContain('class TestCalculator');
    expect(result.testCode).toContain('def test_add');
    expect(result.testCode).toContain('def test_subtract');
  });
});
