export interface ComplexityMetrics {
    lines: number;
    cyclomaticComplexity: number;
    nestingLevel: number;
    externalDependencies: number;
}
export interface ComplexityAnalysisResult {
    complexity: 'simple' | 'complex';
    metrics: ComplexityMetrics;
    reasons: string[];
}
interface AnalyzeComplexityOptions {
    code: string;
    filePath: string;
}
export declare function analyzeComplexity(options: AnalyzeComplexityOptions): Promise<ComplexityAnalysisResult>;
export {};
//# sourceMappingURL=complexity.d.ts.map