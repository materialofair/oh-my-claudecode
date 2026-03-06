import { describe, it, expect } from 'vitest';
import { generateRustTest } from '../../../src/testing/generators/rust';

describe('generateRustTest', () => {
  it('should generate Rust test for simple function', async () => {
    const functionCode = `
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}
`;

    const result = await generateRustTest({
      filePath: 'src/math.rs',
      code: functionCode,
    });

    expect(result.testCode).toContain('#[cfg(test)]');
    expect(result.testCode).toContain('mod tests');
    expect(result.testCode).toContain('#[test]');
    expect(result.testCode).toContain('fn test_add()');
    expect(result.testCode).toContain('assert_eq!');
  });

  it('should generate tests for struct methods', async () => {
    const structCode = `
pub struct Calculator {
    value: i32,
}

impl Calculator {
    pub fn new() -> Self {
        Calculator { value: 0 }
    }

    pub fn add(&mut self, n: i32) {
        self.value += n;
    }
}
`;

    const result = await generateRustTest({
      filePath: 'src/calculator.rs',
      code: structCode,
    });

    expect(result.testCode).toContain('fn test_new()');
    expect(result.testCode).toContain('fn test_add()');
  });
});
