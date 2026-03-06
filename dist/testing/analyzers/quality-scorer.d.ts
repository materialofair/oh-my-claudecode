import type { TestQualityScore } from './types.js';
interface ScoreTestQualityOptions {
    testCode: string;
    testType: 'unit' | 'integration' | 'e2e';
}
export declare function scoreTestQuality(options: ScoreTestQualityOptions): Promise<TestQualityScore>;
export {};
//# sourceMappingURL=quality-scorer.d.ts.map