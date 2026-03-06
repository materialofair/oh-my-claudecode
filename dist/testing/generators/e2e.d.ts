/**
 * E2E Test Generator for Playwright
 * Generates Playwright test files from user flow descriptions
 */
export interface E2EStep {
    action: 'goto' | 'click' | 'fill' | 'expect' | 'waitFor' | 'screenshot';
    target: string;
    value?: string;
    assertion?: string;
}
export interface GeneratePlaywrightTestOptions {
    steps: E2EStep[];
    testName: string;
    testSuite?: string;
}
export interface GenerateFromUserFlowOptions {
    flowDescription: string;
    baseUrl: string;
    testName: string;
}
export interface UserFlowResult {
    testCode: string;
    steps: E2EStep[];
}
/**
 * Generate Playwright test code from structured steps
 */
export declare function generatePlaywrightTest(options: GeneratePlaywrightTestOptions): Promise<string>;
/**
 * Parse user flow description and generate Playwright test
 * This is a simplified implementation - in production, use LLM for better parsing
 */
export declare function generateFromUserFlow(options: GenerateFromUserFlowOptions): Promise<UserFlowResult>;
//# sourceMappingURL=e2e.d.ts.map