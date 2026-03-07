import type { TechStack } from '../types.js';
import type { CoverageAnalysisResult } from '../analyzers/types.js';
import type { ComplexityAnalysisResult } from '../analyzers/complexity.js';
type Language = 'typescript' | 'react' | 'python' | 'go' | 'rust';
interface TestGenOptions {
    filePath: string;
    output?: string;
    language?: Language;
}
interface TestGenResult {
    success: boolean;
    testFilePath?: string;
    error?: string;
}
export declare function testGenCommand(options: TestGenOptions): Promise<TestGenResult>;
interface DetectStackOptions {
    projectRoot: string;
}
interface DetectStackResult {
    stack: TechStack;
}
export declare function testDetectStackCommand(options: DetectStackOptions): Promise<DetectStackResult>;
interface AnalyzeCoverageCommandOptions {
    projectRoot: string;
    coverageData?: any;
}
export declare function testAnalyzeCoverageCommand(options: AnalyzeCoverageCommandOptions): Promise<CoverageAnalysisResult>;
interface ContractCommandOptions {
    specPath: string;
    spec?: any;
    framework: 'pact' | 'supertest' | 'msw';
    consumer?: string;
    provider?: string;
}
interface ContractCommandResult {
    success: boolean;
    testCode: string;
    testFilePath: string;
}
export declare function testContractCommand(options: ContractCommandOptions): Promise<ContractCommandResult>;
interface ComplexityCommandOptions {
    filePath: string;
}
export declare function testComplexityCommand(options: ComplexityCommandOptions): Promise<ComplexityAnalysisResult>;
interface E2ECommandOptions {
    flowDescription: string;
    baseUrl?: string;
    testName?: string;
    output?: string;
}
interface E2ECommandResult {
    success: boolean;
    testFilePath?: string;
    error?: string;
}
export declare function testE2ECommand(options: E2ECommandOptions): Promise<E2ECommandResult>;
interface GiskardCommandOptions {
    filePath: string;
    testType?: 'perturbation' | 'robustness';
    output?: string;
}
interface GiskardCommandResult {
    success: boolean;
    testFilePath?: string;
    error?: string;
}
export declare function testGiskardCommand(options: GiskardCommandOptions): Promise<GiskardCommandResult>;
interface CICDCommandOptions {
    language?: 'nodejs' | 'python' | 'go' | 'rust';
    output?: string;
}
interface CICDCommandResult {
    success: boolean;
    workflowPath?: string;
    error?: string;
}
export declare function testCICDCommand(options: CICDCommandOptions): Promise<CICDCommandResult>;
interface QualityCommandOptions {
    testFilePath: string;
    testType?: 'unit' | 'integration' | 'e2e';
}
interface QualityCommandResult {
    success: boolean;
    score?: any;
    error?: string;
}
export declare function testQualityCommand(options: QualityCommandOptions): Promise<QualityCommandResult>;
export {};
//# sourceMappingURL=commands.d.ts.map