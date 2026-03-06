interface ContractTestOptions {
    spec?: any;
    apiDefinition?: any;
    framework: 'pact' | 'supertest' | 'msw';
    consumer?: string;
    provider?: string;
}
interface ContractTestResult {
    testCode: string;
    testFilePath: string;
}
export declare function generateContractTest(options: ContractTestOptions): Promise<ContractTestResult>;
export {};
//# sourceMappingURL=contract.d.ts.map