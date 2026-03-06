import type { CoverageAnalysisResult, GapAnalysisResult } from './types.js';
interface AnalyzeCoverageOptions {
    projectRoot: string;
    coverageData?: any;
}
export declare function analyzeCoverage(options: AnalyzeCoverageOptions): Promise<CoverageAnalysisResult>;
interface IdentifyGapsOptions {
    projectRoot: string;
    uncoveredLines: Record<string, number[]>;
}
export declare function identifyGaps(options: IdentifyGapsOptions): Promise<GapAnalysisResult>;
export {};
//# sourceMappingURL=coverage.d.ts.map