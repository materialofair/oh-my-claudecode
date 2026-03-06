export async function scoreTestQuality(options) {
    const { testCode } = options;
    // Count assertions
    const assertionCount = (testCode.match(/expect\(/g) || []).length;
    const hasAssertions = assertionCount > 0;
    // Check for edge cases
    const hasEdgeCases = testCode.includes('null') ||
        testCode.includes('undefined') ||
        testCode.includes('0') ||
        testCode.includes('empty') ||
        testCode.includes('-1') ||
        testCode.includes('\'\'') ||
        testCode.includes('""');
    // Check for specific assertions (toBe, toEqual, etc. vs just truthy checks)
    const specificAssertionPatterns = [
        /\.toBe\(/g,
        /\.toEqual\(/g,
        /\.toStrictEqual\(/g,
        /\.toMatch\(/g,
        /\.toContain\(/g,
        /\.toHaveLength\(/g,
    ];
    const specificAssertionCount = specificAssertionPatterns.reduce((count, pattern) => count + (testCode.match(pattern) || []).length, 0);
    const hasSpecificAssertions = specificAssertionCount > 0;
    // Check for shared state (global variables, module-level state)
    const hasSharedState = testCode.includes('let ') && !testCode.match(/test\([^)]*\)\s*=>\s*\{[^}]*let /s) ||
        testCode.includes('var ') && !testCode.match(/test\([^)]*\)\s*=>\s*\{[^}]*var /s);
    // Check for descriptive test names
    const testNames = testCode.match(/test\(['"]([^'"]+)['"]/g) || [];
    const hasDescriptiveNames = testNames.every(name => {
        const testName = name.match(/test\(['"]([^'"]+)['"]/)?.[1] || '';
        return testName.length > 15 && (testName.includes('should') || testName.includes('when'));
    });
    // Check for mocks
    const hasMocks = testCode.includes('mock') || testCode.includes('spy') || testCode.includes('stub');
    // Check for setup/teardown
    const hasSetup = testCode.includes('beforeEach') || testCode.includes('beforeAll');
    const hasTeardown = testCode.includes('afterEach') || testCode.includes('afterAll');
    const metrics = {
        assertionCount,
        hasEdgeCases,
        hasAssertions,
        hasSpecificAssertions,
        hasSharedState,
        hasDescriptiveNames,
        hasMocks,
        hasSetup,
        hasTeardown,
    };
    // Calculate completeness score (0-100)
    let completenessScore = 0;
    if (hasAssertions)
        completenessScore += 40;
    completenessScore += Math.min(assertionCount * 10, 30); // Up to 30 points for assertions
    if (hasEdgeCases)
        completenessScore += 15;
    if (hasMocks)
        completenessScore += 10;
    if (hasSetup || hasTeardown)
        completenessScore += 5;
    // Calculate assertion quality score (0-100)
    let assertionQuality = 0;
    if (hasAssertions) {
        assertionQuality += 50;
        if (hasSpecificAssertions) {
            const specificRatio = specificAssertionCount / assertionCount;
            assertionQuality += specificRatio * 50;
        }
    }
    // Calculate independence score (0-100)
    let independenceScore = 100;
    if (hasSharedState)
        independenceScore -= 40;
    if (!hasSetup && testCode.includes('const ') && testCode.split('const ').length > 3) {
        independenceScore -= 10; // Penalize if no setup but lots of constants (might be duplicated)
    }
    // Calculate naming score (0-100)
    let namingScore = 0;
    if (testNames.length > 0) {
        namingScore = hasDescriptiveNames ? 90 : 50;
        if (testNames.some(name => name.includes('should')))
            namingScore += 10;
    }
    // Calculate overall score (weighted average)
    const overallScore = Math.round(completenessScore * 0.35 +
        assertionQuality * 0.25 +
        independenceScore * 0.20 +
        namingScore * 0.20);
    // Generate recommendations
    const recommendations = [];
    if (!hasAssertions) {
        recommendations.push('Add assertions to verify behavior');
    }
    if (assertionCount < 2) {
        recommendations.push('Add more test cases to cover edge cases');
    }
    if (!hasEdgeCases) {
        recommendations.push('Test edge cases like null, undefined, empty values, and boundary conditions');
    }
    if (!hasSpecificAssertions) {
        recommendations.push('Use specific assertions (toBe, toEqual) instead of generic truthy checks');
    }
    if (hasSharedState) {
        recommendations.push('Avoid shared state between tests - use beforeEach for setup');
    }
    if (!hasDescriptiveNames) {
        recommendations.push('Use descriptive test names that explain what is being tested');
    }
    if (assertionQuality < 60) {
        recommendations.push('Improve assertion quality with more specific matchers');
    }
    return {
        completenessScore: Math.min(completenessScore, 100),
        assertionQuality: Math.min(assertionQuality, 100),
        independenceScore: Math.min(independenceScore, 100),
        namingScore: Math.min(namingScore, 100),
        overallScore: Math.min(overallScore, 100),
        assertionCount,
        hasEdgeCases,
        hasAssertions,
        hasSpecificAssertions,
        hasSharedState,
        hasDescriptiveNames,
        metrics,
        recommendations,
    };
}
//# sourceMappingURL=quality-scorer.js.map