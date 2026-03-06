import fs from 'fs/promises';
import path from 'path';
import { detectTechStack } from '../detectors/index.js';
import { generateReactTest } from '../generators/react.js';
import { generateNodeJsTest } from '../generators/nodejs.js';
import { generatePythonTest } from '../generators/python.js';
import { generateGoTest } from '../generators/go.js';
import { generateRustTest } from '../generators/rust.js';
import { generateContractTest } from '../generators/contract.js';
import { analyzeCoverage } from '../analyzers/coverage.js';
import { analyzeComplexity } from '../analyzers/complexity.js';
import type { TechStack } from '../types.js';
import type { CoverageAnalysisResult } from '../analyzers/types.js';
import type { ComplexityAnalysisResult } from '../analyzers/complexity.js';

type Language = 'typescript' | 'react' | 'python' | 'go' | 'rust';

interface TestGenOptions {
  filePath: string;
  output?: string;
  language?: Language;
}

interface TestGenResult {
  success: boolean;
  testFilePath?: string;
  error?: string;
}

function detectLanguage(filePath: string): Language | null {
  if (filePath.match(/\.(tsx|jsx)$/)) return 'react';
  if (filePath.match(/\.ts$/)) return 'typescript';
  if (filePath.match(/\.py$/)) return 'python';
  if (filePath.match(/\.go$/)) return 'go';
  if (filePath.match(/\.rs$/)) return 'rust';
  return null;
}

export async function testGenCommand(options: TestGenOptions): Promise<TestGenResult> {
  try {
    const { filePath, output } = options;

    // Determine language from explicit option or file extension
    const language = options.language || detectLanguage(filePath);

    if (!language) {
      return {
        success: false,
        error: 'Unsupported file type',
      };
    }

    // Read source file
    const code = await fs.readFile(filePath, 'utf-8');

    // Detect tech stack
    const projectRoot = process.cwd();
    const stack = await detectTechStack(projectRoot);

    // Determine generator based on language
    let result;
    switch (language) {
      case 'react': {
        const detectedFramework = stack.frontend?.testFramework;
        const testFramework: 'vitest' | 'jest' =
          detectedFramework === 'jest' ? 'jest' : 'vitest';
        result = await generateReactTest({ filePath, code, testFramework });
        break;
      }
      case 'typescript': {
        const detectedFramework = stack.backend?.testFramework;
        const testFramework: 'vitest' | 'jest' =
          detectedFramework === 'jest' ? 'jest' : 'vitest';
        result = await generateNodeJsTest({ filePath, code, testFramework });
        break;
      }
      case 'python': {
        const testFramework: 'pytest' | 'unittest' =
          stack.backend?.testFramework === 'unittest' ? 'unittest' : 'pytest';
        result = await generatePythonTest({ filePath, code, testFramework });
        break;
      }
      case 'go': {
        const packageName = path.basename(path.dirname(filePath));
        result = await generateGoTest({ filePath, code, packageName });
        break;
      }
      case 'rust': {
        result = await generateRustTest({ filePath, code });
        break;
      }
      default:
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

// Coverage analysis command

interface AnalyzeCoverageCommandOptions {
  projectRoot: string;
  coverageData?: any;
}

export async function testAnalyzeCoverageCommand(options: AnalyzeCoverageCommandOptions): Promise<CoverageAnalysisResult> {
  return analyzeCoverage({
    projectRoot: options.projectRoot,
    coverageData: options.coverageData,
  });
}

// Contract test command

interface ContractCommandOptions {
  specPath: string;
  spec?: any;
  framework: 'pact' | 'supertest' | 'msw';
  consumer?: string;
  provider?: string;
}

interface ContractCommandResult {
  success: boolean;
  testCode: string;
  testFilePath: string;
}

export async function testContractCommand(options: ContractCommandOptions): Promise<ContractCommandResult> {
  const { spec, specPath, framework, consumer, provider } = options;

  let specData = spec;
  if (!specData) {
    const content = await fs.readFile(specPath, 'utf-8');
    specData = JSON.parse(content);
  }

  const result = await generateContractTest({
    spec: specData,
    framework,
    consumer,
    provider,
  });

  return {
    success: true,
    testCode: result.testCode,
    testFilePath: result.testFilePath,
  };
}

// Complexity analysis command

interface ComplexityCommandOptions {
  filePath: string;
}

export async function testComplexityCommand(options: ComplexityCommandOptions): Promise<ComplexityAnalysisResult> {
  const code = await fs.readFile(options.filePath, 'utf-8');
  return analyzeComplexity({ code, filePath: options.filePath });
}
