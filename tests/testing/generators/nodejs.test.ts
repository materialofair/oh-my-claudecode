import { describe, it, expect } from 'vitest';
import { generateNodeJsTest } from '../../../src/testing/generators/nodejs';

describe('generateNodeJsTest', () => {
  it('should generate test for simple function', async () => {
    const functionCode = `
export function add(a: number, b: number): number {
  return a + b;
}
`;

    const result = await generateNodeJsTest({
      filePath: 'src/utils/math.ts',
      code: functionCode,
      testFramework: 'vitest',
    });

    expect(result.testCode).toContain('import { describe, it, expect }');
    expect(result.testCode).toContain('describe(\'add\'');
    expect(result.testCode).toContain('it(\'adds two numbers\'');
    expect(result.testFilePath).toBe('src/utils/math.test.ts');
  });
});
