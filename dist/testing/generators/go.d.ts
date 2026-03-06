interface GoTestOptions {
    filePath: string;
    code: string;
    packageName: string;
}
interface GoTestResult {
    testFilePath: string;
    testCode: string;
}
export declare function generateGoTest(options: GoTestOptions): Promise<GoTestResult>;
export {};
//# sourceMappingURL=go.d.ts.map