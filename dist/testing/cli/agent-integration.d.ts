import type { TechStack } from '../types.js';
import type { ComplexityAnalysisResult } from '../analyzers/complexity.js';
export interface TestEngineerContext {
    filePath: string;
    code: string;
    techStack: TechStack;
    complexity: 'simple' | 'complex';
    complexityMetrics: ComplexityAnalysisResult;
    suggestedApproach: 'auto-generate' | 'guided' | 'manual';
    questionsForUser?: string[];
}
interface PrepareContextOptions {
    filePath: string;
    code: string;
    projectRoot: string;
}
export declare function prepareTestEngineerContext(options: PrepareContextOptions): Promise<TestEngineerContext>;
export declare function invokeTestEngineerAgent(context: TestEngineerContext): Promise<string>;
export {};
//# sourceMappingURL=agent-integration.d.ts.map