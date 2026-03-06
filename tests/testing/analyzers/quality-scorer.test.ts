import { describe, it, expect } from 'vitest';
import { scoreTestQuality } from '../../../src/testing/analyzers/quality-scorer';

describe('Quality Scorer', () => {
  it('should score test completeness with edge cases', async () => {
    const testCode = `
      test('should add two numbers', () => {
        expect(add(1, 2)).toBe(3);
        expect(add(-1, 1)).toBe(0);
        expect(add(0, 0)).toBe(0);
      });
    `;

    const result = await scoreTestQuality({ testCode, testType: 'unit' });

    expect(result.completenessScore).toBeGreaterThan(70);
    expect(result.hasEdgeCases).toBe(true);
    expect(result.assertionCount).toBe(3);
  });

  it('should penalize tests without assertions', async () => {
    const testCode = `
      test('should do something', () => {
        const result = doSomething();
      });
    `;

    const result = await scoreTestQuality({ testCode, testType: 'unit' });

    expect(result.completenessScore).toBeLessThan(30);
    expect(result.hasAssertions).toBe(false);
  });

  it('should detect assertion quality - specific vs generic', async () => {
    const specificTest = `
      test('validates user input', () => {
        expect(validate('test@example.com')).toBe(true);
        expect(validate('invalid')).toBe(false);
        expect(validate('')).toBe(false);
      });
    `;

    const result = await scoreTestQuality({ testCode: specificTest, testType: 'unit' });

    expect(result.assertionQuality).toBeGreaterThan(70);
    expect(result.hasSpecificAssertions).toBe(true);
  });

  it('should detect test independence', async () => {
    const independentTest = `
      test('test 1', () => {
        const data = setupData();
        expect(process(data)).toBe(expected);
      });

      test('test 2', () => {
        const data = setupData();
        expect(process(data)).toBe(expected);
      });
    `;

    const result = await scoreTestQuality({ testCode: independentTest, testType: 'unit' });

    expect(result.independenceScore).toBeGreaterThan(80);
    expect(result.hasSharedState).toBe(false);
  });

  it('should evaluate naming clarity', async () => {
    const clearTest = `
      test('should return true when email format is valid', () => {
        expect(validateEmail('test@example.com')).toBe(true);
      });

      test('should return false when email format is invalid', () => {
        expect(validateEmail('invalid')).toBe(false);
      });
    `;

    const result = await scoreTestQuality({ testCode: clearTest, testType: 'unit' });

    expect(result.namingScore).toBeGreaterThan(80);
    expect(result.hasDescriptiveNames).toBe(true);
  });

  it('should calculate overall quality score', async () => {
    const goodTest = `
      describe('User validation', () => {
        test('should validate email format correctly', () => {
          expect(validateEmail('test@example.com')).toBe(true);
          expect(validateEmail('invalid')).toBe(false);
          expect(validateEmail('')).toBe(false);
          expect(validateEmail(null)).toBe(false);
        });

        test('should handle edge cases in password validation', () => {
          expect(validatePassword('short')).toBe(false);
          expect(validatePassword('ValidPass123!')).toBe(true);
          expect(validatePassword('')).toBe(false);
        });
      });
    `;

    const result = await scoreTestQuality({ testCode: goodTest, testType: 'unit' });

    expect(result.overallScore).toBeGreaterThan(75);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.recommendations).toBeInstanceOf(Array);
  });

  it('should provide actionable recommendations', async () => {
    const poorTest = `
      test('test', () => {
        doSomething();
      });
    `;

    const result = await scoreTestQuality({ testCode: poorTest, testType: 'unit' });

    expect(result.recommendations).toContain('Add assertions to verify behavior');
    expect(result.recommendations.length).toBeGreaterThan(0);
  });
});
