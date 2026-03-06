import { describe, it, expect } from 'vitest';
import { generatePerturbationTests, generateRobustnessTests } from '../../../../src/testing/integrations/giskard/behavioral-tests';

describe('Giskard Behavioral Tests', () => {
  it('should generate perturbation tests for text inputs', async () => {
    const result = await generatePerturbationTests({
      testCases: [
        { input: 'Hello world', expectedOutput: 'greeting' },
        { input: 'Goodbye friend', expectedOutput: 'farewell' },
      ],
      perturbations: ['typo', 'negation', 'synonym'],
    });

    expect(result.tests).toHaveLength(6); // 2 inputs × 3 perturbations
    expect(result.tests[0]).toMatchObject({
      original: 'Hello world',
      perturbed: expect.any(String),
      perturbationType: 'typo',
      expectedBehavior: 'should still classify as greeting',
    });
  });

  it('should generate robustness tests', async () => {
    const result = await generateRobustnessTests({
      modelEndpoint: '/api/classify',
      testInputs: ['Test input 1', 'Test input 2'],
      robustnessChecks: ['case-sensitivity', 'whitespace', 'special-chars'],
    });

    expect(result.checks).toHaveLength(3);
    expect(result.checks[0].type).toBe('case-sensitivity');
  });
});
