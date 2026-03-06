import { describe, it, expect } from 'vitest';
import { integrateWithAutopilot, generateTestsForPhase } from '../../../src/testing/integrations/autopilot.js';

describe('Autopilot Testing Integration', () => {
  it('should inject testing phase into Autopilot workflow', async () => {
    const mockAutopilotState = {
      currentPhase: 'implementation',
      generatedFiles: ['src/components/Button.tsx', 'src/utils/format.ts'],
      requirements: 'Build a button component with formatting utilities',
    };

    const result = await integrateWithAutopilot(mockAutopilotState);

    expect(result.testingPhaseEnabled).toBe(true);
    expect(result.testingPhase).toBe('post-implementation');
    expect(result.filesToTest).toEqual(mockAutopilotState.generatedFiles);
  });

  it('should generate tests for Autopilot phase', async () => {
    const result = await generateTestsForPhase({
      phase: 'implementation',
      generatedFiles: ['src/utils/format.ts'],
      requirements: 'Implement formatting utilities',
    });

    expect(result.tests).toHaveLength(1);
    expect(result.tests[0].file).toBe('src/utils/format.ts');
    expect(result.tests[0].testType).toBe('unit');
  });

  it('should generate E2E tests for UI components', async () => {
    const result = await generateTestsForPhase({
      phase: 'implementation',
      generatedFiles: ['src/pages/Login.tsx'],
      requirements: 'Build login page',
    });

    expect(result.tests).toHaveLength(2); // unit + e2e
    expect(result.tests.some((t) => t.testType === 'e2e')).toBe(true);
  });

  it('should generate integration tests for API files', async () => {
    const result = await generateTestsForPhase({
      phase: 'implementation',
      generatedFiles: ['src/api/users.ts'],
      requirements: 'Build user management API',
    });

    expect(result.tests).toHaveLength(2); // unit + integration
    expect(result.tests.some((t) => t.testType === 'integration')).toBe(true);
  });

  it('should handle multiple files with mixed types', async () => {
    const result = await generateTestsForPhase({
      phase: 'implementation',
      generatedFiles: [
        'src/components/Header.tsx',
        'src/api/posts.ts',
        'src/utils/validation.ts',
      ],
      requirements: 'Build blog features',
    });

    expect(result.tests.length).toBeGreaterThan(3);
    expect(result.tests.some((t) => t.testType === 'unit')).toBe(true);
    expect(result.tests.some((t) => t.testType === 'e2e')).toBe(true);
    expect(result.tests.some((t) => t.testType === 'integration')).toBe(true);
  });
});
