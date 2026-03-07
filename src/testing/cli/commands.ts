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

// Phase 3: E2E test generation command

interface E2ECommandOptions {
  flowDescription: string;
  baseUrl?: string;
  testName?: string;
  output?: string;
}

interface E2ECommandResult {
  success: boolean;
  testFilePath?: string;
  error?: string;
}

export async function testE2ECommand(options: E2ECommandOptions): Promise<E2ECommandResult> {
  try {
    const { generateFromUserFlow } = await import('../generators/e2e.js');

    const result = await generateFromUserFlow({
      flowDescription: options.flowDescription,
      baseUrl: options.baseUrl || 'http://localhost:3000',
      testName: options.testName || 'User flow test',
    });

    const testFilePath = options.output || './tests/e2e/user-flow.spec.ts';
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

// Phase 3: Giskard behavioral test generation command

interface GiskardCommandOptions {
  filePath: string;
  testType?: 'perturbation' | 'robustness';
  output?: string;
}

interface GiskardCommandResult {
  success: boolean;
  testFilePath?: string;
  error?: string;
}

export async function testGiskardCommand(options: GiskardCommandOptions): Promise<GiskardCommandResult> {
  try {
    const { generatePerturbationTests } = await import('../integrations/giskard/behavioral-tests.js');

    const code = await fs.readFile(options.filePath, 'utf-8');

    // Generate perturbation tests
    const result = await generatePerturbationTests({
      testCases: [
        { input: 'sample input', expectedOutput: 'expected' }
      ],
      perturbations: ['typo', 'negation', 'synonym'],
    });

    const testFilePath = options.output || './tests/behavioral/perturbation.test.ts';
    const testCode = `// Generated Giskard behavioral tests
import { describe, it, expect } from 'vitest';

describe('Behavioral Tests', () => {
${result.tests.map(test => `
  it('${test.expectedBehavior}', async () => {
    // Original: ${test.original}
    // Perturbed (${test.perturbationType}): ${test.perturbed}
    // TODO: Add test implementation
  });
`).join('')}
});
`;

    await fs.writeFile(testFilePath, testCode, 'utf-8');

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

// Phase 3: CI/CD workflow generation command

interface CICDCommandOptions {
  language?: 'nodejs' | 'python' | 'go' | 'rust';
  output?: string;
}

interface CICDCommandResult {
  success: boolean;
  workflowPath?: string;
  error?: string;
}

export async function testCICDCommand(options: CICDCommandOptions): Promise<CICDCommandResult> {
  try {
    const { generateGitHubActionsWorkflow } = await import('../integrations/cicd.js');

    const workflow = await generateGitHubActionsWorkflow({
      language: options.language || 'nodejs',
      coverage: true,
      artifacts: true,
    });

    const workflowPath = options.output || './.github/workflows/test.yml';
    const dir = path.dirname(workflowPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(workflowPath, workflow, 'utf-8');

    return {
      success: true,
      workflowPath,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Phase 3: Test quality scoring command

interface QualityCommandOptions {
  testFilePath: string;
  testType?: 'unit' | 'integration' | 'e2e';
}

interface QualityCommandResult {
  success: boolean;
  score?: any;
  error?: string;
}

export async function testQualityCommand(options: QualityCommandOptions): Promise<QualityCommandResult> {
  try {
    const { scoreTestQuality } = await import('../analyzers/quality-scorer.js');

    const testCode = await fs.readFile(options.testFilePath, 'utf-8');
    const score = await scoreTestQuality({
      testCode,
      testType: options.testType || 'unit',
    });

    return {
      success: true,
      score,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
