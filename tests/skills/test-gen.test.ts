import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

describe('test-gen skill integration', () => {
  it('should generate tests via CLI', async () => {
    // Create a temporary test file
    const tmpDir = path.join(process.cwd(), 'tmp-test-gen');
    await fs.mkdir(tmpDir, { recursive: true });

    const componentPath = path.join(tmpDir, 'Button.tsx');
    await fs.writeFile(componentPath, `
export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
    `);

    // Run CLI command
    const result = execSync(`pnpm omc test gen ${componentPath}`, {
      encoding: 'utf-8',
    });

    expect(result).toContain('✅ Test generated');

    // Verify test file exists
    const testPath = path.join(tmpDir, 'Button.test.tsx');
    const testContent = await fs.readFile(testPath, 'utf-8');
    expect(testContent).toContain("describe('Button'");

    // Cleanup
    await fs.rm(tmpDir, { recursive: true });
  });
});
