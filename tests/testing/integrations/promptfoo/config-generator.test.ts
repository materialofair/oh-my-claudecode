import { describe, it, expect } from 'vitest';
import { generatePromptfooConfig, generateTestCases } from '../../../../src/testing/integrations/promptfoo/config-generator';

describe('Promptfoo Config Generator', () => {
  it('should generate promptfoo config for LLM prompt testing', async () => {
    const result = await generatePromptfooConfig({
      promptFile: 'src/prompts/code-review.txt',
      testCases: [
        { input: 'function add(a, b) { return a + b; }', expected: 'contains:function,parameters' },
        { input: 'const x = 1;', expected: 'contains:variable,declaration' },
      ],
      provider: 'anthropic:claude-3-5-sonnet-20241022',
    });

    expect(result.prompts).toHaveLength(1);
    expect(result.prompts[0]).toBe('file://src/prompts/code-review.txt');
    expect(result.providers).toContain('anthropic:claude-3-5-sonnet-20241022');
    expect(result.tests).toHaveLength(2);
  });

  it('should generate test cases from code examples', async () => {
    const result = await generateTestCases({
      codeExamples: [
        { code: 'function multiply(a, b) { return a * b; }', language: 'javascript' },
        { code: 'def divide(a, b): return a / b', language: 'python' },
      ],
      assertionType: 'contains',
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      vars: { code: expect.any(String), language: 'javascript' },
      assert: expect.arrayContaining([{ type: 'contains', value: expect.any(String) }]),
    });
  });
});
