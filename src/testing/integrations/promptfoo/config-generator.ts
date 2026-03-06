import { writeFile } from 'fs/promises';
import * as yaml from 'yaml';
import type {
  PromptfooConfig,
  PromptfooTestCase,
  GenerateConfigOptions,
  GenerateTestCasesOptions,
} from './types.js';

export async function generatePromptfooConfig(options: GenerateConfigOptions): Promise<PromptfooConfig> {
  const { promptFile, testCases, provider, outputPath } = options;

  const tests: PromptfooTestCase[] = testCases.map((tc: { input: string; expected: string }) => {
    const [assertType, assertValue] = tc.expected.split(':');
    return {
      vars: { input: tc.input },
      assert: [
        {
          type: assertType as any,
          value: assertValue,
        },
      ],
    };
  });

  const config: PromptfooConfig = {
    prompts: [`file://${promptFile}`],
    providers: [provider],
    tests,
    outputPath: outputPath || './promptfoo-results.json',
  };

  return config;
}

export async function generateTestCases(options: GenerateTestCasesOptions): Promise<PromptfooTestCase[]> {
  const { codeExamples, assertionType } = options;

  return codeExamples.map((example: { code: string; language: string }) => ({
    vars: {
      code: example.code,
      language: example.language,
    },
    assert: [
      {
        type: assertionType,
        value: example.language === 'javascript' ? 'function' : 'def',
      },
    ],
  }));
}

export async function savePromptfooConfig(config: PromptfooConfig, outputPath: string): Promise<void> {
  const yamlContent = yaml.stringify(config);
  await writeFile(outputPath, yamlContent, 'utf-8');
}
