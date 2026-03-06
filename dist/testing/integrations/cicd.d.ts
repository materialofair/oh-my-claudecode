/**
 * CI/CD Integration - GitHub Actions Workflow Generator
 */
export interface WorkflowConfig {
    language?: 'nodejs' | 'python' | 'go' | 'rust';
    languages?: string[];
    testCommand?: string;
    testCommands?: Record<string, string>;
    nodeVersion?: string;
    pythonVersion?: string;
    goVersion?: string;
    rustVersion?: string;
    coverage?: boolean;
    coverageProvider?: 'codecov' | 'coveralls';
    artifacts?: boolean;
    artifactPath?: string;
    matrix?: {
        nodeVersion?: string[];
        pythonVersion?: string[];
        goVersion?: string[];
        os?: string[];
        language?: string[];
    };
}
export declare function generateGitHubActionsWorkflow(config: WorkflowConfig): Promise<string>;
//# sourceMappingURL=cicd.d.ts.map