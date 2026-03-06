import { detectTechStack } from '../detectors/index.js';
import { analyzeComplexity } from '../analyzers/complexity.js';
export async function prepareTestEngineerContext(options) {
    const { filePath, code, projectRoot } = options;
    const techStack = await detectTechStack(projectRoot);
    const complexityMetrics = await analyzeComplexity({ code, filePath });
    let suggestedApproach;
    let questionsForUser;
    if (complexityMetrics.complexity === 'simple') {
        suggestedApproach = 'auto-generate';
    }
    else {
        suggestedApproach = 'guided';
        questionsForUser = generateQuestionsForComplexCode(complexityMetrics);
    }
    return {
        filePath,
        code,
        techStack,
        complexity: complexityMetrics.complexity,
        complexityMetrics,
        suggestedApproach,
        questionsForUser,
    };
}
function generateQuestionsForComplexCode(metrics) {
    const questions = [];
    if (metrics.reasons.includes('Payment processing logic')) {
        questions.push('What are the expected payment flows? (success, failure, retry)');
        questions.push('Should I mock external payment provider API calls?');
        questions.push('What error scenarios should be tested?');
    }
    if (metrics.reasons.includes('Authentication logic')) {
        questions.push('What authentication methods should be tested?');
        questions.push('Should I test token expiration and refresh?');
        questions.push('What authorization scenarios should be covered?');
    }
    if (metrics.reasons.includes('Database transactions')) {
        questions.push('What database states should I test?');
        questions.push('Should I test transaction rollbacks?');
        questions.push('Are there specific edge cases for data integrity?');
    }
    if (metrics.reasons.includes('External API calls')) {
        questions.push('Should I mock external API calls?');
        questions.push('What API failure scenarios should be tested?');
        questions.push('Are there rate limiting or retry logic to test?');
    }
    if (metrics.reasons.includes('Multiple async operations')) {
        questions.push('Should I test concurrent execution scenarios?');
        questions.push('Are there race conditions to consider?');
        questions.push('What timeout scenarios should be tested?');
    }
    questions.push('Are there specific edge cases or business rules I should know about?');
    return questions;
}
export async function invokeTestEngineerAgent(context) {
    const agentCommand = `test-engineer --file="${context.filePath}" --complexity="${context.complexity}" --approach="${context.suggestedApproach}"`;
    return agentCommand;
}
//# sourceMappingURL=agent-integration.js.map