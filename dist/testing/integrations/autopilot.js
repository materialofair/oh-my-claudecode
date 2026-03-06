/**
 * Autopilot Testing Integration
 *
 * Integrates automatic test generation into the Autopilot workflow.
 * After code implementation, this module generates appropriate tests
 * (unit, integration, E2E) based on file types and runs them.
 */
/**
 * Inject testing phase into Autopilot workflow.
 * Determines when and what to test based on current phase.
 */
export async function integrateWithAutopilot(state) {
    return {
        testingPhaseEnabled: true,
        testingPhase: state.currentPhase === 'implementation' ? 'post-implementation' : 'pre-verification',
        filesToTest: state.generatedFiles,
    };
}
/**
 * Generate tests for a specific Autopilot phase.
 * Determines test types based on file patterns and generates appropriate test files.
 */
export async function generateTestsForPhase(options) {
    const { phase, generatedFiles, requirements } = options;
    const tests = [];
    for (const file of generatedFiles) {
        // Determine test type based on file type
        const isUIComponent = file.includes('components/') || file.includes('pages/');
        const isAPI = file.includes('api/') || file.includes('routes/');
        // Always generate unit tests
        tests.push({
            file,
            testFile: file.replace(/\.(tsx?|jsx?)$/, '.test.$1'),
            testType: 'unit',
        });
        // Generate E2E tests for UI components
        if (isUIComponent) {
            tests.push({
                file,
                testFile: file.replace(/\.(tsx?|jsx?)$/, '.e2e.spec.ts'),
                testType: 'e2e',
            });
        }
        // Generate integration tests for APIs
        if (isAPI) {
            tests.push({
                file,
                testFile: file.replace(/\.(ts|js)$/, '.integration.test.$1'),
                testType: 'integration',
            });
        }
    }
    return { tests };
}
//# sourceMappingURL=autopilot.js.map