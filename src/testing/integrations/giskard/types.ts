export interface PerturbationTest {
  original: string;
  perturbed: string;
  perturbationType: 'typo' | 'negation' | 'synonym' | 'paraphrase';
  expectedBehavior: string;
  expectedOutput?: string;
}

export interface PerturbationTestSuite {
  tests: PerturbationTest[];
  totalTests: number;
}

export interface RobustnessCheck {
  type: 'case-sensitivity' | 'whitespace' | 'special-chars' | 'unicode';
  testCases: Array<{ input: string; expected: string }>;
}

export interface RobustnessTestSuite {
  checks: RobustnessCheck[];
  totalChecks: number;
}

export interface GeneratePerturbationOptions {
  testCases: Array<{ input: string; expectedOutput: string }>;
  perturbations: Array<'typo' | 'negation' | 'synonym' | 'paraphrase'>;
}

export interface GenerateRobustnessOptions {
  modelEndpoint: string;
  testInputs: string[];
  robustnessChecks: Array<'case-sensitivity' | 'whitespace' | 'special-chars' | 'unicode'>;
}
