interface PythonTestOptions {
    filePath: string;
    code: string;
    testFramework: 'pytest' | 'unittest';
}
interface PythonTestResult {
    testFilePath: string;
    testCode: string;
}
export declare function generatePythonTest(options: PythonTestOptions): Promise<PythonTestResult>;
export {};
//# sourceMappingURL=python.d.ts.map