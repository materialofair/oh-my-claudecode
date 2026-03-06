import { describe, it, expect } from 'vitest';
import { detectFromPackageJson } from '../../../src/testing/detectors/package-json';

describe('detectFromPackageJson', () => {
  it('should detect React + Vitest stack', async () => {
    const mockPackageJson = {
      dependencies: { react: '^18.0.0' },
      devDependencies: { vitest: '^1.0.0', '@testing-library/react': '^14.0.0' },
    };

    const result = await detectFromPackageJson(mockPackageJson);

    expect(result.frontend?.framework).toBe('react');
    expect(result.frontend?.testFramework).toBe('vitest');
  });

  it('should detect Node.js backend', async () => {
    const mockPackageJson = {
      dependencies: { express: '^4.18.0' },
      devDependencies: { jest: '^29.0.0' },
    };

    const result = await detectFromPackageJson(mockPackageJson);

    expect(result.backend?.language).toBe('nodejs');
    expect(result.backend?.testFramework).toBe('jest');
  });
});
