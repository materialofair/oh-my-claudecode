interface ReactTestOptions {
    filePath: string;
    code: string;
    testFramework: 'vitest' | 'jest';
}
interface ReactTestResult {
    testFilePath: string;
    testCode: string;
}
export declare function generateReactTest(options: ReactTestOptions): Promise<ReactTestResult>;
export {};
//# sourceMappingURL=react.d.ts.map