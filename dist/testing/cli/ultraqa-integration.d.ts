import type { CoverageGap } from '../analyzers/types.js';
export interface UltraQAOptions {
    projectRoot: string;
    changedFiles?: string[];
    coverageGaps?: CoverageGap[];
}
export interface UltraQAResult {
    filesNeedingTests: string[];
    coverageGaps?: CoverageGap[];
    generatedTests: string[];
}
export declare function enhanceUltraQAWithTestGen(options: UltraQAOptions): Promise<UltraQAResult>;
//# sourceMappingURL=ultraqa-integration.d.ts.map