interface ParallelGeneratorOptions {
    maxConcurrency: number;
}
interface GenerateTestsOptions {
    files: string[];
    maxConcurrency: number;
}
interface GenerationResult {
    generatedTests: Array<{
        file: string;
        success: boolean;
    }>;
    totalTime: number;
    maxConcurrentTasks: number;
}
export declare class ParallelGenerator {
    private maxConcurrency;
    constructor(options: ParallelGeneratorOptions);
    generate(files: string[]): Promise<GenerationResult>;
}
export declare function generateTestsInParallel(options: GenerateTestsOptions): Promise<GenerationResult>;
export {};
//# sourceMappingURL=parallel-generator.d.ts.map