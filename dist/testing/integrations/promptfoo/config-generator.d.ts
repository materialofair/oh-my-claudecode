import type { PromptfooConfig, PromptfooTestCase, GenerateConfigOptions, GenerateTestCasesOptions } from './types.js';
export declare function generatePromptfooConfig(options: GenerateConfigOptions): Promise<PromptfooConfig>;
export declare function generateTestCases(options: GenerateTestCasesOptions): Promise<PromptfooTestCase[]>;
export declare function savePromptfooConfig(config: PromptfooConfig, outputPath: string): Promise<void>;
//# sourceMappingURL=config-generator.d.ts.map