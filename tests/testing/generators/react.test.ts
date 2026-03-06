import { describe, it, expect } from 'vitest';
import { generateReactTest } from '../../../src/testing/generators/react';

describe('generateReactTest', () => {
  it('should generate test for simple React component', async () => {
    const componentCode = `
export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
`;

    const result = await generateReactTest({
      filePath: 'src/components/Button.tsx',
      code: componentCode,
      testFramework: 'vitest',
    });

    expect(result.testCode).toContain('import { render, screen');
    expect(result.testCode).toContain('describe(\'Button\'');
    expect(result.testCode).toContain('it(\'renders children\'');
    expect(result.testFilePath).toBe('src/components/Button.test.tsx');
  });
});
