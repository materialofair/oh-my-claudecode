export async function generatePerturbationTests(options) {
    const { testCases, perturbations } = options;
    const tests = [];
    for (const testCase of testCases) {
        for (const perturbationType of perturbations) {
            const perturbed = applyPerturbation(testCase.input, perturbationType);
            tests.push({
                original: testCase.input,
                perturbed,
                perturbationType,
                expectedBehavior: `should still classify as ${testCase.expectedOutput}`,
                expectedOutput: testCase.expectedOutput,
            });
        }
    }
    return {
        tests,
        totalTests: tests.length,
    };
}
function applyPerturbation(text, type) {
    switch (type) {
        case 'typo':
            // Simple typo: swap two adjacent characters
            const pos = Math.floor(Math.random() * (text.length - 1));
            return text.slice(0, pos) + text[pos + 1] + text[pos] + text.slice(pos + 2);
        case 'negation':
            return `not ${text}`;
        case 'synonym':
            // Simple synonym replacement (in real implementation, use NLP library)
            return text.replace(/hello/gi, 'hi').replace(/goodbye/gi, 'bye');
        default:
            return text;
    }
}
export async function generateRobustnessTests(options) {
    const { modelEndpoint, testInputs, robustnessChecks } = options;
    const checks = [];
    for (const checkType of robustnessChecks) {
        const testCases = testInputs.map((input) => ({
            input: applyRobustnessTransform(input, checkType),
            expected: input, // Expected to behave same as original
        }));
        checks.push({
            type: checkType,
            testCases,
        });
    }
    return {
        checks,
        totalChecks: checks.length,
    };
}
function applyRobustnessTransform(text, type) {
    switch (type) {
        case 'case-sensitivity':
            return text.toUpperCase();
        case 'whitespace':
            return `  ${text}  `;
        case 'special-chars':
            return `${text}!!!`;
        default:
            return text;
    }
}
//# sourceMappingURL=behavioral-tests.js.map