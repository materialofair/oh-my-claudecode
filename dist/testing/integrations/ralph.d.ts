/**
 * Ralph Mode Testing Integration
 *
 * Integrates automated test generation and execution into Ralph's verify cycle.
 * Automatically generates tests for modified code and runs them during verification.
 */
interface RalphState {
    currentIteration: number;
    modifiedFiles: string[];
    verifyPhase: 'pre-verify' | 'post-verify' | 'fix';
}
interface RalphTestingConfig {
    testingEnabled: boolean;
    testGenerationPhase: string;
    filesToTest: string[];
}
interface GenerateTestsForIterationOptions {
    modifiedFiles: string[];
    iterationNumber: number;
    previousTestResults: {
        passed: number;
        failed: number;
    };
    coverageThreshold?: number;
}
interface IterationTestResult {
    generatedTests: Array<{
        file: string;
        testFile: string;
    }>;
    shouldRunTests: boolean;
    coverageCheck?: {
        enabled: boolean;
        threshold: number;
    };
}
interface TestExecutionResult {
    passed: number;
    failed: number;
    coverage?: number;
}
/**
 * Integrates testing into Ralph's verification cycle
 * Called at the start of Ralph's verify phase
 */
export declare function integrateWithRalph(state: RalphState): Promise<RalphTestingConfig>;
/**
 * Generates tests for the current Ralph iteration
 * Analyzes modified files and determines which tests to generate
 */
export declare function generateTestsForIteration(options: GenerateTestsForIterationOptions): Promise<IterationTestResult>;
/**
 * Runs tests during Ralph's verification cycle
 * Executes generated tests and returns results
 */
export declare function runTestsInRalphCycle(testFiles: string[]): Promise<TestExecutionResult>;
/**
 * Checks if coverage thresholds are met
 */
export declare function checkCoverageThreshold(coverage: number, threshold: number): Promise<{
    met: boolean;
    message: string;
}>;
export {};
//# sourceMappingURL=ralph.d.ts.map