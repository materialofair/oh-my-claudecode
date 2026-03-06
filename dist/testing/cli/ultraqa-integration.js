import fs from 'fs/promises';
import path from 'path';
import { analyzeCoverage, identifyGaps } from '../analyzers/coverage.js';
import { testGenCommand } from './commands.js';
export async function enhanceUltraQAWithTestGen(options) {
    const { projectRoot, changedFiles, coverageGaps } = options;
    const filesNeedingTests = [];
    const generatedTests = [];
    // If changed files provided, check which ones need tests
    if (changedFiles) {
        for (const file of changedFiles) {
            const needsTest = await checkIfNeedsTest(file, projectRoot);
            if (needsTest) {
                filesNeedingTests.push(file);
            }
        }
    }
    // If coverage gaps provided, generate tests for them
    if (coverageGaps) {
        for (const gap of coverageGaps) {
            try {
                const result = await testGenCommand({
                    filePath: path.join(projectRoot, gap.file),
                });
                if (result.success && result.testFilePath) {
                    generatedTests.push(result.testFilePath);
                }
            }
            catch (error) {
                console.error(`Failed to generate test for ${gap.file}:`, error);
            }
        }
    }
    // Analyze coverage if no gaps provided
    let gaps;
    if (!coverageGaps) {
        try {
            const coverageResult = await analyzeCoverage({ projectRoot });
            if (coverageResult.totalCoverage < 80) {
                const gapResult = await identifyGaps({
                    projectRoot,
                    uncoveredLines: {},
                });
                gaps = gapResult.gaps;
            }
        }
        catch (error) {
            // Coverage not available
        }
    }
    return {
        filesNeedingTests,
        coverageGaps: gaps,
        generatedTests,
    };
}
async function checkIfNeedsTest(filePath, projectRoot) {
    const testFilePath = filePath.replace(/\.(ts|js|tsx|jsx)$/, '.test.$1');
    const fullTestPath = path.join(projectRoot, testFilePath);
    try {
        await fs.access(fullTestPath);
        return false;
    }
    catch {
        return true;
    }
}
//# sourceMappingURL=ultraqa-integration.js.map