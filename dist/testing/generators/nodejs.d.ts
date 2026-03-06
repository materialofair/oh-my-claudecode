interface NodeJsTestOptions {
    filePath: string;
    code: string;
    testFramework: 'vitest' | 'jest';
}
interface NodeJsTestResult {
    testFilePath: string;
    testCode: string;
}
export declare function generateNodeJsTest(options: NodeJsTestOptions): Promise<NodeJsTestResult>;
export {};
//# sourceMappingURL=nodejs.d.ts.map