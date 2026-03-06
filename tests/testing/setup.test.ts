import { describe, it, expect } from 'vitest';
import { TestingModule } from '../../src/testing';

describe('TestingModule', () => {
  it('should export core testing functions', () => {
    expect(TestingModule).toBeDefined();
    expect(TestingModule.detectStack).toBeDefined();
    expect(TestingModule.generateTests).toBeDefined();
  });
});
