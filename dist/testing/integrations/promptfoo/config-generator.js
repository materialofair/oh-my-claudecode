import { writeFile } from 'fs/promises';
import * as yaml from 'yaml';
export async function generatePromptfooConfig(options) {
    const { promptFile, testCases, provider, outputPath } = options;
    const tests = testCases.map((tc) => {
        const [assertType, assertValue] = tc.expected.split(':');
        return {
            vars: { input: tc.input },
            assert: [
                {
                    type: assertType,
                    value: assertValue,
                },
            ],
        };
    });
    const config = {
        prompts: [`file://${promptFile}`],
        providers: [provider],
        tests,
        outputPath: outputPath || './promptfoo-results.json',
    };
    return config;
}
export async function generateTestCases(options) {
    const { codeExamples, assertionType } = options;
    return codeExamples.map((example) => ({
        vars: {
            code: example.code,
            language: example.language,
        },
        assert: [
            {
                type: assertionType,
                value: example.language === 'javascript' ? 'function' : 'def',
            },
        ],
    }));
}
export async function savePromptfooConfig(config, outputPath) {
    const yamlContent = yaml.stringify(config);
    await writeFile(outputPath, yamlContent, 'utf-8');
}
//# sourceMappingURL=config-generator.js.map