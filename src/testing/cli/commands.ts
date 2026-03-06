import fs from 'fs/promises';
import path from 'path';
import { detectTechStack } from '../detectors/index.js';
import { generateReactTest } from '../generators/react.js';
import { generateNodeJsTest } from '../generators/nodejs.js';
import type { TechStack } from '../types.js';

interface TestGenOptions {
  filePath: string;
  output?: string;
}

interface TestGenResult {
  success: boolean;
  testFilePath?: string;
  error?: string;
}

export async function testGenCommand(options: TestGenOptions): Promise<TestGenResult> {
  try {
    const { filePath, output } = options;

    // Read source file
    const code = await fs.readFile(filePath, 'utf-8');

    // Detect tech stack
    const projectRoot = process.cwd();
    const stack = await detectTechStack(projectRoot);

    // Determine generator based on file type and stack
    let result;
    if (filePath.match(/\.(tsx|jsx)$/)) {
      // For React files, use React generator
      const detectedFramework = stack.frontend?.testFramework;
      const testFramework: 'vitest' | 'jest' =
        detectedFramework === 'jest' ? 'jest' : 'vitest';
      result = await generateReactTest({
        filePath,
        code,
        testFramework,
      });
    } else if (filePath.match(/\.ts$/)) {
      // For TypeScript files, use Node.js generator
      const detectedFramework = stack.backend?.testFramework;
      const testFramework: 'vitest' | 'jest' =
        detectedFramework === 'jest' ? 'jest' : 'vitest';
      result = await generateNodeJsTest({
        filePath,
        code,
        testFramework,
      });
    } else {
      return {
        success: false,
        error: 'Unsupported file type',
      };
    }

    // Write test file
    const testFilePath = output || result.testFilePath;
    await fs.writeFile(testFilePath, result.testCode, 'utf-8');

    return {
      success: true,
      testFilePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface DetectStackOptions {
  projectRoot: string;
}

interface DetectStackResult {
  stack: TechStack;
}

export async function testDetectStackCommand(options: DetectStackOptions): Promise<DetectStackResult> {
  const stack = await detectTechStack(options.projectRoot);
  return { stack };
}
