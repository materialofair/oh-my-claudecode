interface RustTestOptions {
    filePath: string;
    code: string;
}
interface RustTestResult {
    testCode: string;
    testFilePath: string;
}
export declare function generateRustTest(options: RustTestOptions): Promise<RustTestResult>;
export {};
//# sourceMappingURL=rust.d.ts.map