export interface PromptfooConfig {
    prompts: string[];
    providers: string[];
    tests: PromptfooTestCase[];
    defaultTest?: {
        assert?: PromptfooAssertion[];
    };
    outputPath?: string;
}
export interface PromptfooTestCase {
    vars?: Record<string, any>;
    assert?: PromptfooAssertion[];
    description?: string;
}
export interface PromptfooAssertion {
    type: 'equals' | 'contains' | 'not-contains' | 'regex' | 'javascript' | 'llm-rubric';
    value?: string;
    threshold?: number;
}
export interface GenerateConfigOptions {
    promptFile: string;
    testCases: Array<{
        input: string;
        expected: string;
    }>;
    provider: string;
    outputPath?: string;
}
export interface GenerateTestCasesOptions {
    codeExamples: Array<{
        code: string;
        language: string;
    }>;
    assertionType: 'contains' | 'equals' | 'regex';
}
//# sourceMappingURL=types.d.ts.map