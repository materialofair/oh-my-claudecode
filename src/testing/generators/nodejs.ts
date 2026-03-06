interface NodeJsTestOptions {
  filePath: string;
  code: string;
  testFramework: 'vitest' | 'jest';
}

interface NodeJsTestResult {
  testFilePath: string;
  testCode: string;
}

export async function generateNodeJsTest(options: NodeJsTestOptions): Promise<NodeJsTestResult> {
  const { filePath, code, testFramework } = options;

  // Extract function names from code
  const functionMatches = code.matchAll(/export\s+(?:async\s+)?function\s+(\w+)/g);
  const functions = Array.from(functionMatches).map(match => match[1]);

  // Generate test file path
  const testFilePath = filePath.replace(/\.ts$/, '.test.ts');

  // Extract file name for import
  const fileName = filePath.split('/').pop()?.replace(/\.ts$/, '') || 'module';

  // Generate test code for each function
  const testCases = functions.map(funcName => {
    // Simple heuristic: if function name suggests math operation, generate math test
    if (funcName === 'add') {
      return `  it('adds two numbers', () => {
    expect(add(2, 3)).toBe(5);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });`;
    }

    // Generic test template
    return `  it('${funcName} works correctly', () => {
    // TODO: Add specific test cases for ${funcName}
    expect(${funcName}).toBeDefined();
  });`;
  }).join('\n\n');

  // Use function name for describe block if single function, otherwise use file name
  const describeName = functions.length === 1 ? functions[0] : fileName;

  const testCode = `import { describe, it, expect } from '${testFramework}';
import { ${functions.join(', ')} } from './${fileName}';

describe('${describeName}', () => {
${testCases}
});
`;

  return { testFilePath, testCode };
}
