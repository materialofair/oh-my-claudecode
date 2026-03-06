import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { testGenCommand, testDetectStackCommand } from '../../../src/testing/cli/commands';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('CLI Commands', () => {
  let tmpDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test files
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'test-cli-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('testGenCommand should generate tests for a file', async () => {
    // Create a temporary React component file
    const componentPath = path.join(tmpDir, 'Button.tsx');
    const componentCode = `
export function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
`;
    await fs.writeFile(componentPath, componentCode);

    const result = await testGenCommand({
      filePath: componentPath,
      output: path.join(tmpDir, 'Button.test.tsx'),
    });

    if (!result.success) {
      console.error('Test generation failed:', result.error);
    }

    expect(result.success).toBe(true);
    expect(result.testFilePath).toBeDefined();

    // Verify test file was created
    if (result.testFilePath) {
      const testContent = await fs.readFile(result.testFilePath, 'utf-8');
      expect(testContent).toContain('describe');
      expect(testContent).toContain('Button');
    }
  });

  it('testDetectStackCommand should detect tech stack', async () => {
    const result = await testDetectStackCommand({
      projectRoot: process.cwd(),
    });

    expect(result.stack).toBeDefined();
  });
});
