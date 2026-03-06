/**
 * Autopilot Testing Integration
 *
 * Integrates automatic test generation into the Autopilot workflow.
 * After code implementation, this module generates appropriate tests
 * (unit, integration, E2E) based on file types and runs them.
 */
interface AutopilotState {
    currentPhase: 'planning' | 'implementation' | 'verification' | 'deployment';
    generatedFiles: string[];
    requirements: string;
}
interface AutopilotTestingConfig {
    testingPhaseEnabled: boolean;
    testingPhase: 'post-implementation' | 'pre-verification';
    filesToTest: string[];
}
interface GenerateTestsForPhaseOptions {
    phase: string;
    generatedFiles: string[];
    requirements: string;
}
interface GeneratedTest {
    file: string;
    testFile: string;
    testType: 'unit' | 'integration' | 'e2e';
}
interface PhaseTestResult {
    tests: GeneratedTest[];
}
/**
 * Inject testing phase into Autopilot workflow.
 * Determines when and what to test based on current phase.
 */
export declare function integrateWithAutopilot(state: AutopilotState): Promise<AutopilotTestingConfig>;
/**
 * Generate tests for a specific Autopilot phase.
 * Determines test types based on file patterns and generates appropriate test files.
 */
export declare function generateTestsForPhase(options: GenerateTestsForPhaseOptions): Promise<PhaseTestResult>;
export {};
//# sourceMappingURL=autopilot.d.ts.map