export async function analyzeComplexity(options) {
    const { code } = options;
    // Calculate metrics
    const metrics = calculateMetrics(code);
    // Determine complexity and reasons
    const reasons = [];
    let isComplex = false;
    // Check line count
    if (metrics.lines >= 50) {
        reasons.push('Function exceeds 50 lines');
        isComplex = true;
    }
    // Check cyclomatic complexity
    if (metrics.cyclomaticComplexity >= 10) {
        reasons.push('High cyclomatic complexity');
        isComplex = true;
    }
    // Check nesting level
    if (metrics.nestingLevel >= 3) {
        reasons.push('Deep nesting level');
        isComplex = true;
    }
    // Check for external dependencies
    if (metrics.externalDependencies > 0) {
        reasons.push('External API calls');
        isComplex = true;
    }
    // Check for specific patterns
    if (code.includes('stripe') || code.includes('paypal') || code.includes('payment')) {
        reasons.push('Payment processing logic');
        isComplex = true;
    }
    if (code.includes('auth') || code.includes('jwt') || code.includes('session')) {
        reasons.push('Authentication logic');
        isComplex = true;
    }
    if (code.includes('db.transaction') || code.includes('BEGIN') || code.includes('COMMIT')) {
        reasons.push('Database transactions');
        isComplex = true;
    }
    if (code.includes('async') && code.includes('await')) {
        const awaitCount = (code.match(/await/g) || []).length;
        if (awaitCount > 3) {
            reasons.push('Multiple async operations');
            isComplex = true;
        }
    }
    return {
        complexity: isComplex ? 'complex' : 'simple',
        metrics,
        reasons,
    };
}
function calculateMetrics(code) {
    const lines = code.split('\n').filter(line => line.trim() !== '').length;
    // Calculate cyclomatic complexity (simplified)
    const cyclomaticComplexity = calculateCyclomaticComplexity(code);
    // Calculate nesting level
    const nestingLevel = calculateNestingLevel(code);
    // Count external dependencies
    const externalDependencies = countExternalDependencies(code);
    return {
        lines,
        cyclomaticComplexity,
        nestingLevel,
        externalDependencies,
    };
}
function calculateCyclomaticComplexity(code) {
    // Start with 1 (base complexity)
    let complexity = 1;
    // Count decision points
    const decisionPoints = [
        /\bif\b/g,
        /\belse\s+if\b/g,
        /\bfor\b/g,
        /\bwhile\b/g,
        /\bcase\b/g,
        /\bcatch\b/g,
        /\b\?\s*.*\s*:/g, // Ternary operator
        /\b&&\b/g,
        /\b\|\|\b/g,
    ];
    for (const pattern of decisionPoints) {
        const matches = code.match(pattern);
        if (matches) {
            complexity += matches.length;
        }
    }
    return complexity;
}
function calculateNestingLevel(code) {
    let maxNesting = 0;
    let currentNesting = 0;
    for (const char of code) {
        if (char === '{') {
            currentNesting++;
            maxNesting = Math.max(maxNesting, currentNesting);
        }
        else if (char === '}') {
            currentNesting--;
        }
    }
    return maxNesting;
}
function countExternalDependencies(code) {
    let count = 0;
    // Check for HTTP/API calls
    if (code.includes('fetch(') || code.includes('axios.') || code.includes('http.')) {
        count++;
    }
    // Check for external service SDKs
    const externalServices = ['stripe', 'aws', 'firebase', 'sendgrid', 'twilio'];
    for (const service of externalServices) {
        if (code.includes(service)) {
            count++;
        }
    }
    return count;
}
//# sourceMappingURL=complexity.js.map