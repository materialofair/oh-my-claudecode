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

export async function generateGitHubActionsWorkflow(
  config: WorkflowConfig
): Promise<string> {
  const {
    language,
    languages,
    testCommand,
    testCommands,
    nodeVersion = '20',
    pythonVersion = '3.11',
    goVersion = '1.21',
    rustVersion = 'stable',
    coverage = false,
    coverageProvider = 'codecov',
    artifacts = false,
    artifactPath = 'test-results/',
    matrix,
  } = config;

  const runsOn = matrix?.os ? '$' + '{{ matrix.os }}' : 'ubuntu-latest';

  let workflow = `name: Test

on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  test:
    runs-on: ${runsOn}
`;

  // Add matrix strategy if specified
  if (matrix) {
    workflow += `    strategy:
      matrix:
`;
    if (matrix.nodeVersion) {
      workflow += `        node-version: [${matrix.nodeVersion.join(', ')}]\n`;
    }
    if (matrix.pythonVersion) {
      workflow += `        python-version: [${matrix.pythonVersion.join(', ')}]\n`;
    }
    if (matrix.goVersion) {
      workflow += `        go-version: [${matrix.goVersion.join(', ')}]\n`;
    }
    if (matrix.os) {
      workflow += `        os: [${matrix.os.join(', ')}]\n`;
    }
    if (matrix.language) {
      workflow += `        language: [${matrix.language.join(', ')}]\n`;
    }
  }

  workflow += `    steps:
      - uses: actions/checkout@v4

`;

  // Handle multi-language setup
  if (languages && matrix?.language) {
    // Multi-language matrix build
    const matrixLang = '$' + '{{ matrix.language }}';
    workflow += `      - name: Setup Node.js
        if: matrix.language == 'nodejs'
        uses: actions/setup-node@v4
        with:
          node-version: ${nodeVersion}
          cache: 'pnpm'

      - name: Setup Python
        if: matrix.language == 'python'
        uses: actions/setup-python@v5
        with:
          python-version: ${pythonVersion}

      - name: Setup Go
        if: matrix.language == 'go'
        uses: actions/setup-go@v5
        with:
          go-version: ${goVersion}

      - name: Install Node.js dependencies
        if: matrix.language == 'nodejs'
        run: pnpm install

      - name: Install Python dependencies
        if: matrix.language == 'python'
        run: pip install -r requirements.txt

      - name: Run tests
        run: |
          if [ "${matrixLang}" == "nodejs" ]; then
            ${testCommands?.nodejs || 'pnpm test'}
          elif [ "${matrixLang}" == "python" ]; then
            ${testCommands?.python || 'pytest'}
          elif [ "${matrixLang}" == "go" ]; then
            ${testCommands?.go || 'go test ./...'}
          fi
`;
  } else {
    // Single language setup
    if (language === 'nodejs' || (!language && testCommand?.includes('pnpm'))) {
      const nodeVer = matrix?.nodeVersion ? '$' + '{{ matrix.node-version }}' : nodeVersion;
      workflow += `      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${nodeVer}
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: ${testCommand || 'pnpm test'}
`;
    } else if (language === 'python') {
      const pyVer = matrix?.pythonVersion ? '$' + '{{ matrix.python-version }}' : pythonVersion;
      workflow += `      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: ${pyVer}

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: ${testCommand || 'pytest'}
`;
    } else if (language === 'go') {
      const goVer = matrix?.goVersion ? '$' + '{{ matrix.go-version }}' : goVersion;
      workflow += `      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: ${goVer}

      - name: Run tests
        run: ${testCommand || 'go test ./...'}
`;
    } else if (language === 'rust') {
      workflow += `      - name: Setup Rust
        uses: actions-rust-lang/setup-rust-toolchain@v1
        with:
          toolchain: ${rustVersion}

      - name: Run tests
        run: ${testCommand || 'cargo test'}
`;
    }
  }

  // Add coverage reporting
  if (coverage) {
    const token = '$' + '{{ secrets.CODECOV_TOKEN }}';
    workflow += `
      - name: Upload coverage
        uses: ${coverageProvider}/codecov-action@v4
        with:
          token: ${token}
`;
  }

  // Add test artifacts
  if (artifacts) {
    workflow += `
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: ${artifactPath}
`;
  }

  return workflow;
}
