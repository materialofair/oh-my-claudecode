export interface TechStack {
  frontend?: {
    framework: 'react' | 'vue' | 'svelte' | 'none';
    testFramework?: 'vitest' | 'jest' | 'none';
  };
  backend?: {
    language: 'nodejs' | 'python' | 'go' | 'rust';
    testFramework?: string;
  };
  databases?: string[];
  apis?: ('rest' | 'graphql' | 'grpc')[];
}

export interface TestGenerationOptions {
  filePath: string;
  techStack: TechStack;
  complexity?: 'simple' | 'complex';
}

export interface TestGenerationResult {
  testFilePath: string;
  testCode: string;
  framework: string;
}
