export class ParallelGenerator {
    maxConcurrency;
    constructor(options) {
        this.maxConcurrency = options.maxConcurrency;
    }
    async generate(files) {
        const startTime = Date.now();
        const results = [];
        // Process files in batches based on maxConcurrency
        for (let i = 0; i < files.length; i += this.maxConcurrency) {
            const batch = files.slice(i, i + this.maxConcurrency);
            const batchResults = await Promise.all(batch.map(async (file) => {
                // Simulate test generation
                await new Promise((resolve) => setTimeout(resolve, 100));
                return { file, success: true };
            }));
            results.push(...batchResults);
        }
        const totalTime = Date.now() - startTime;
        return {
            generatedTests: results,
            totalTime,
            maxConcurrentTasks: this.maxConcurrency,
        };
    }
}
export async function generateTestsInParallel(options) {
    const generator = new ParallelGenerator({ maxConcurrency: options.maxConcurrency });
    return generator.generate(options.files);
}
//# sourceMappingURL=parallel-generator.js.map