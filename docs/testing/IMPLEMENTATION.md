# LLM Testing System - 实现文档

> 本文档为 oh-my-claudecode LLM 测试系统的完整实现参考，供其他项目（如 oh-my-codex）快速集成使用。

## 目录

- [系统概述](#系统概述)
- [架构设计](#架构设计)
- [核心模块](#核心模块)
- [集成指南](#集成指南)
- [API 参考](#api-参考)
- [CLI 命令](#cli-命令)
- [扩展开发](#扩展开发)

---

## 系统概述

### 设计目标

1. **零配置测试生成**：自动检测技术栈，无需手动配置即可生成测试
2. **多语言支持**：React / Node.js / Python / Go / Rust
3. **智能复杂度路由**：简单代码自动生成，复杂代码委托 AI Agent
4. **持续迭代集成**：与 Ralph / Autopilot / UltraQA 工作流深度集成
5. **质量闭环**：覆盖率分析 → 测试生成 → 质量评分 → 持续改进

### 核心能力矩阵

| 能力 | 模块 | 说明 |
|------|------|------|
| 技术栈检测 | `detectors/` | 从配置文件自动识别语言、框架、数据库、API 类型 |
| 测试生成 | `generators/` | 针对不同语言生成符合惯例的测试代码 |
| 复杂度分析 | `analyzers/complexity.ts` | 圈复杂度、嵌套深度、外部依赖分析 |
| 覆盖率分析 | `analyzers/coverage.ts` | 解析 c8/nyc 报告，识别未覆盖代码 |
| 质量评分 | `analyzers/quality-scorer.ts` | 0-100 分多维度测试质量评估 |
| 合约测试 | `generators/contract.ts` | 从 OpenAPI 规范生成 Pact/Supertest/MSW 测试 |
| E2E 测试 | `generators/e2e.ts` | 从用户流程描述生成 Playwright 测试 |
| 行为测试 | `integrations/giskard/` | 扰动测试和鲁棒性测试 |
| LLM 提示测试 | `integrations/promptfoo/` | Promptfoo 配置生成 |
| CI/CD 自动化 | `integrations/cicd.ts` | GitHub Actions 工作流生成 |
| 性能优化 | `performance/` | TTL 缓存 + 并行生成 |

---

## 架构设计

### 目录结构

```
src/testing/
├── index.ts                          # 模块入口，导出 TestingModule
├── types.ts                          # 核心类型定义
│
├── detectors/                        # 技术栈检测层
│   ├── index.ts                      # 多语言检测编排器
│   ├── package-json.ts               # Node.js 生态检测
│   ├── python.ts                     # Python 生态检测
│   ├── go.ts                         # Go 生态检测
│   └── rust.ts                       # Rust 生态检测
│
├── analyzers/                        # 分析层
│   ├── types.ts                      # 分析器类型定义
│   ├── complexity.ts                 # 代码复杂度分析
│   ├── coverage.ts                   # 覆盖率分析
│   └── quality-scorer.ts             # 测试质量评分
│
├── generators/                       # 测试生成层
│   ├── react.ts                      # React 组件测试
│   ├── nodejs.ts                     # Node.js 函数测试
│   ├── python.ts                     # Python pytest/unittest
│   ├── go.ts                         # Go table-driven 测试
│   ├── rust.ts                       # Rust #[test] 测试
│   ├── contract.ts                   # API 合约测试
│   └── e2e.ts                        # Playwright E2E 测试
│
├── cli/                              # CLI 集成层
│   ├── commands.ts                   # CLI 命令实现
│   ├── agent-integration.ts          # test-engineer Agent 集成
│   └── ultraqa-integration.ts        # UltraQA 集成
│
├── integrations/                     # 外部集成层
│   ├── autopilot.ts                  # Autopilot 工作流集成
│   ├── ralph.ts                      # Ralph 模式集成
│   ├── cicd.ts                       # CI/CD 工作流生成
│   ├── promptfoo/
│   │   ├── types.ts                  # Promptfoo 类型
│   │   └── config-generator.ts       # Promptfoo 配置生成
│   └── giskard/
│       ├── types.ts                  # Giskard 类型
│       └── behavioral-tests.ts       # 行为测试生成
│
└── performance/                      # 性能优化层
    ├── cache-manager.ts              # TTL 缓存管理
    └── parallel-generator.ts         # 并行测试生成
```

### 数据流

```
用户输入 (/test-gen 或 omc test gen)
    │
    ▼
┌─────────────────────┐
│   CLI Command Layer  │  commands.ts
│   (路由 & 编排)       │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌──────────┐
│Detector│  │Complexity │
│(检测)   │  │Analyzer   │
└───┬────┘  └─────┬────┘
    │             │
    ▼             ▼
┌─────────────────────┐
│   Route Decision     │
│ simple → Generator   │
│ complex → Agent      │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌────────┐  ┌──────────────┐
│Generator│  │Agent         │
│(生成)   │  │Integration   │
└───┬────┘  └──────┬───────┘
    │              │
    ▼              ▼
┌─────────────────────┐
│   Test File Output   │
│   + Quality Score    │
└──────────────────────┘
```


---

## 核心模块

### 1. 类型系统

#### TechStack（技术栈描述）

```typescript
// src/testing/types.ts
export interface TechStack {
  frontend?: {
    framework: 'react' | 'vue' | 'svelte' | 'none';
    testFramework?: 'vitest' | 'jest' | 'none';
  };
  backend?: {
    language: 'nodejs' | 'python' | 'go' | 'rust';
    testFramework?: string;  // vitest, jest, pytest, unittest, testing, cargo
  };
  databases?: string[];       // postgresql, mysql, mongodb
  apis?: ('rest' | 'graphql' | 'grpc')[];
}
```

#### 分析器类型

```typescript
// src/testing/analyzers/types.ts

// 覆盖率指标
export interface CoverageMetrics {
  total: number;
  covered: number;
  pct: number;
}

export interface CoverageReport {
  lines: CoverageMetrics;
  statements: CoverageMetrics;
  functions: CoverageMetrics;
  branches: CoverageMetrics;
}

export interface CoverageAnalysisResult {
  totalCoverage: number;
  lineCoverage: number;
  functionCoverage: number;
  branchCoverage: number;
  statementCoverage: number;
}

// 覆盖率缺口
export interface CoverageGap {
  file: string;
  startLine: number;
  endLine: number;
  reason: string;
  codeSnippet?: string;
}

// 测试质量评分
export interface TestQualityScore {
  completenessScore: number;     // 完整性 0-100
  assertionQuality: number;      // 断言质量 0-100
  independenceScore: number;     // 独立性 0-100
  namingScore: number;           // 命名质量 0-100
  overallScore: number;          // 综合评分 0-100
  assertionCount: number;
  hasEdgeCases: boolean;
  hasAssertions: boolean;
  hasSpecificAssertions: boolean;
  hasSharedState: boolean;
  hasDescriptiveNames: boolean;
  metrics: TestQualityMetrics;
  recommendations: string[];     // 改进建议
}
```

### 2. 技术栈检测器（Detectors）

检测器负责从项目配置文件中自动识别技术栈。

#### 检测编排器

```typescript
// src/testing/detectors/index.ts
import { detectFromPackageJson } from './package-json.js';

export async function detectTechStack(projectRoot: string): Promise<TechStack> {
  // 按优先级依次尝试：Node.js → Python → Go → Rust
  // 1. 检查 package.json
  // 2. 检查 requirements.txt / pyproject.toml
  // 3. 检查 go.mod
  // 4. 检查 Cargo.toml
  // 返回合并后的 TechStack
}
```

#### 各语言检测逻辑

| 检测器 | 配置文件 | 检测内容 |
|--------|----------|----------|
| `package-json.ts` | `package.json` | React/Vue/Svelte, Express/Fastify/Koa, Vitest/Jest, pg/mysql/mongodb, GraphQL/gRPC |
| `python.ts` | `requirements.txt` | Flask/FastAPI/Django, pytest/unittest, psycopg2/mysql/pymongo, GraphQL |
| `go.ts` | `go.mod` | Gin/Gorilla/Echo, database drivers, gRPC, GraphQL |
| `rust.ts` | `Cargo.toml` | Actix/Rocket/Axum, diesel/sqlx, tonic gRPC, async-graphql |

**集成要点：** 新项目只需实现对应的检测器函数，签名为：

```typescript
async function detectFromXxx(configContent: any): Promise<TechStack>
```

### 3. 测试生成器（Generators）

每个生成器接收源代码和配置，输出测试文件内容。

#### 统一接口模式

```typescript
// 所有生成器遵循相同模式
interface GeneratorOptions {
  filePath: string;           // 源文件路径
  code: string;               // 源代码内容
  testFramework: string;      // 测试框架
}

interface GeneratorResult {
  testFilePath: string;       // 生成的测试文件路径
  testCode: string;           // 生成的测试代码
}
```

#### 各语言生成器特性

| 生成器 | 输入 | 输出 | 特性 |
|--------|------|------|------|
| `react.ts` | `.tsx/.jsx` | `*.test.tsx` | 检测 onClick/children props，生成 RTL 测试 |
| `nodejs.ts` | `.ts` | `*.test.ts` | 正则提取导出函数，生成 Vitest/Jest 测试 |
| `python.ts` | `.py` | `test_*.py` | 提取函数/类，生成 pytest 参数化测试 |
| `go.ts` | `.go` | `*_test.go` | 提取导出函数，生成 table-driven 测试 |
| `rust.ts` | `.rs` | 内嵌 `#[cfg(test)]` | 提取 fn/struct/impl，生成 `#[test]` 测试 |
| `contract.ts` | OpenAPI spec | `*.pact.test.ts` | 支持 Pact/Supertest/MSW 三种框架 |
| `e2e.ts` | 流程描述 | `*.spec.ts` | 解析自然语言步骤，生成 Playwright 测试 |

#### React 生成器示例

```typescript
// src/testing/generators/react.ts
export async function generateReactTest(options: {
  filePath: string;
  code: string;
  testFramework: 'vitest' | 'jest';
}): Promise<{ testFilePath: string; testCode: string }> {
  // 1. 从文件路径提取组件名
  const fileName = filePath.split('/').pop()?.replace(/\.(tsx?|jsx?)$/, '');

  // 2. 分析代码特征
  const hasOnClick = code.includes('onClick');
  const hasChildren = code.includes('children');

  // 3. 生成测试代码
  // - import { render, screen } from '@testing-library/react'
  // - describe('ComponentName', () => { ... })
  // - it('renders children', () => { ... })
  // - it('calls onClick when clicked', () => { ... })  // 如果有 onClick

  // 4. 返回测试文件路径和代码
  return { testFilePath, testCode };
}
```

### 4. 分析器（Analyzers）

#### 复杂度分析

```typescript
// src/testing/analyzers/complexity.ts
export interface ComplexityAnalysisResult {
  complexity: 'simple' | 'complex';
  metrics: {
    lines: number;
    cyclomaticComplexity: number;
    nestingLevel: number;
    externalDependencies: number;
  };
  reasons: string[];
}

export async function analyzeComplexity(options: {
  code: string;
  filePath: string;
}): Promise<ComplexityAnalysisResult>
```

**复杂度判定规则：**

| 指标 | 简单阈值 | 复杂标记 |
|------|----------|----------|
| 代码行数 | < 50 | ≥ 50 |
| 圈复杂度 | < 10 | ≥ 10 |
| 嵌套深度 | < 3 | ≥ 3 |
| 外部依赖 | 0 | > 0 |
| 特殊模式 | 无 | payment/auth/transaction/async |

#### 覆盖率分析

```typescript
// src/testing/analyzers/coverage.ts
export async function analyzeCoverage(options: {
  coverageReportPath: string;
}): Promise<CoverageAnalysisResult>

export async function identifyGaps(options: {
  coverageReportPath: string;
}): Promise<GapAnalysisResult>
```

#### 质量评分

```typescript
// src/testing/analyzers/quality-scorer.ts
export async function scoreTestQuality(options: {
  testCode: string;
  testType: 'unit' | 'integration' | 'e2e';
}): Promise<TestQualityScore>
```

**评分维度：**

| 维度 | 权重 | 检测内容 |
|------|------|----------|
| completenessScore | 25% | 断言数量、边界用例、mock 使用 |
| assertionQuality | 25% | 具体断言（toBe/toEqual vs toBeTruthy） |
| independenceScore | 25% | 是否有共享状态、setup/teardown |
| namingScore | 25% | 描述性测试名称（包含 should/when/returns） |


### 5. CLI 命令层

#### 命令路由逻辑

```typescript
// src/testing/cli/commands.ts

// 语言检测（文件扩展名 → 语言）
function detectLanguage(filePath: string): Language | null {
  if (filePath.match(/\.(tsx|jsx)$/)) return 'react';
  if (filePath.match(/\.ts$/))        return 'typescript';
  if (filePath.match(/\.py$/))        return 'python';
  if (filePath.match(/\.go$/))        return 'go';
  if (filePath.match(/\.rs$/))        return 'rust';
  return null;
}

// 主命令：测试生成
export async function testGenCommand(options: {
  filePath: string;
  output?: string;
  language?: Language;
}): Promise<{ success: boolean; testFilePath?: string; error?: string }>

// 技术栈检测
export async function testDetectStackCommand(options: {
  projectRoot: string;
}): Promise<{ stack: TechStack }>

// 覆盖率分析
export async function testAnalyzeCoverageCommand(options: {
  projectRoot: string;
}): Promise<CoverageAnalysisResult>

// 复杂度分析
export async function testComplexityCommand(options: {
  filePath: string;
}): Promise<ComplexityAnalysisResult & { complexity: string; reasons: string[] }>

// 合约测试生成
export async function testContractCommand(options: {
  specPath: string;
  framework: 'pact' | 'supertest' | 'msw';
  consumer?: string;
  provider?: string;
}): Promise<{ success: boolean; testFilePath?: string }>

// Promptfoo 配置生成
export async function testPromptfooCommand(options: {
  promptFile: string;
  provider?: string;
  output?: string;
}): Promise<{ success: boolean; configPath?: string; error?: string }>

// E2E 测试生成
export async function testE2ECommand(options: {
  flowDescription: string;
  baseUrl?: string;
  testName?: string;
  output?: string;
}): Promise<{ success: boolean; testFilePath?: string; error?: string }>

// Giskard 行为测试
export async function testGiskardCommand(options: {
  filePath: string;
  testType?: 'perturbation' | 'robustness';
  output?: string;
}): Promise<{ success: boolean; testFilePath?: string; error?: string }>

// CI/CD 工作流生成
export async function testCICDCommand(options: {
  language?: 'nodejs' | 'python' | 'go' | 'rust';
  output?: string;
}): Promise<{ success: boolean; workflowPath?: string; error?: string }>

// 测试质量评分
export async function testQualityCommand(options: {
  testFilePath: string;
  testType?: 'unit' | 'integration' | 'e2e';
}): Promise<{ success: boolean; score?: TestQualityScore; error?: string }>
```

### 6. Agent 集成层

#### test-engineer Agent 上下文增强

```typescript
// src/testing/cli/agent-integration.ts

export interface TestEngineerContext {
  filePath: string;
  code: string;
  techStack: TechStack;
  complexity: 'simple' | 'complex';
  complexityMetrics: {
    lines: number;
    cyclomaticComplexity: number;
    nestingLevel: number;
    externalDependencies: number;
  };
  suggestedApproach: 'auto-generate' | 'guided' | 'manual';
  questionsForUser: string[];
}

// 准备上下文
export async function prepareTestEngineerContext(options: {
  filePath: string;
  code: string;
  projectRoot: string;
}): Promise<TestEngineerContext>

// 生成 Agent 调用命令
export function invokeTestEngineerAgent(context: TestEngineerContext): string
```

**路由策略：**

| 复杂度 | 方法 | 说明 |
|--------|------|------|
| `simple` | `auto-generate` | 直接调用 Generator 生成 |
| `complex` (圈复杂度 < 15) | `guided` | 生成框架 + 向用户提问 |
| `complex` (圈复杂度 ≥ 15) | `manual` | 仅提供框架和指导 |

#### UltraQA 集成

```typescript
// src/testing/cli/ultraqa-integration.ts

export interface UltraQATestResult {
  filesProcessed: number;
  testsGenerated: number;
  coverageBefore?: number;
  coverageAfter?: number;
  errors: string[];
}

// 增强 UltraQA 工作流
export async function enhanceUltraQAWithTestGen(options: {
  changedFiles: string[];
  projectRoot: string;
  coverageThreshold?: number;
  generateTests?: (filePath: string) => Promise<{ testFilePath: string }>;
}): Promise<UltraQATestResult>
```

### 7. 工作流集成

#### Ralph 模式集成

```typescript
// src/testing/integrations/ralph.ts

export interface RalphTestConfig {
  enabled: boolean;
  coverageThreshold: number;
  maxIterations: number;
  testCommand: string;
}

// 集成到 Ralph 验证循环
export async function integrateWithRalph(config: RalphTestConfig): Promise<{
  shouldContinue: boolean;
  coverageMet: boolean;
  testsPassed: boolean;
}>

// 为修改的文件生成测试
export async function generateTestsForIteration(options: {
  modifiedFiles: string[];
  projectRoot: string;
}): Promise<{ generatedTests: string[]; errors: string[] }>

// 执行测试
export async function runTestsInRalphCycle(options: {
  testCommand: string;
  projectRoot: string;
}): Promise<{ passed: boolean; output: string }>

// 检查覆盖率阈值
export async function checkCoverageThreshold(options: {
  threshold: number;
  projectRoot: string;
}): Promise<{ met: boolean; current: number }>
```

**Ralph 集成流程：**

```
Ralph 验证循环
    │
    ▼
检测修改的文件
    │
    ▼
为修改文件生成测试 (generateTestsForIteration)
    │
    ▼
执行测试 (runTestsInRalphCycle)
    │
    ├── 测试失败 → 返回 Ralph 修复循环
    │
    ▼
检查覆盖率 (checkCoverageThreshold)
    │
    ├── 未达标 → 生成补充测试 → 重新执行
    │
    ▼
验证通过 → 继续 Ralph 下一步
```

#### Autopilot 集成

```typescript
// src/testing/integrations/autopilot.ts

export type TestPhase = 'unit' | 'integration' | 'e2e';

// 集成到 Autopilot 工作流
export async function integrateWithAutopilot(options: {
  phase: TestPhase;
  files: string[];
  projectRoot: string;
}): Promise<{
  phase: TestPhase;
  testsGenerated: number;
  testsPassed: boolean;
}>

// 根据文件模式确定测试阶段
export async function generateTestsForPhase(options: {
  phase: TestPhase;
  files: string[];
  projectRoot: string;
}): Promise<{ generatedTests: string[]; errors: string[] }>
```

**Autopilot 测试阶段：**

| 阶段 | 文件模式 | 生成内容 |
|------|----------|----------|
| `unit` | `src/**/*.ts`, `src/**/*.py` | 单元测试 |
| `integration` | `src/services/**`, `src/api/**` | 集成测试 |
| `e2e` | `src/pages/**`, `src/routes/**` | Playwright E2E 测试 |


### 8. 性能优化层

#### 缓存管理

```typescript
// src/testing/performance/cache-manager.ts

export class CacheManager {
  private cache: Map<string, { value: any; expiresAt: number }>;
  private ttl: number;  // 默认 300000ms (5分钟)

  constructor(ttlMs?: number);
  get(key: string): any | undefined;
  set(key: string, value: any): void;
  has(key: string): boolean;
  clear(): void;
}

// 全局缓存实例
export function getCachedAnalysis(key: string): any | undefined;
export function setCachedAnalysis(key: string, value: any): void;
```

#### 并行生成

```typescript
// src/testing/performance/parallel-generator.ts

export class ParallelGenerator {
  private concurrency: number;  // 默认 3

  constructor(concurrency?: number);

  // 并行生成多个文件的测试
  async generateTestsInParallel(options: {
    files: string[];
    projectRoot: string;
    generator: (filePath: string) => Promise<{ testFilePath: string }>;
  }): Promise<{
    results: Array<{ file: string; testFilePath: string }>;
    errors: Array<{ file: string; error: string }>;
  }>;
}
```

---

## 集成指南

### 快速集成到新项目（如 oh-my-codex）

#### 步骤 1：安装依赖

```bash
npm install claudecode-omc@4.8.0
```

#### 步骤 2：引入核心模块

```typescript
import { detectTechStack } from 'claudecode-omc/dist/testing/detectors/index.js';
import { analyzeComplexity } from 'claudecode-omc/dist/testing/analyzers/complexity.js';
import { generateReactTest } from 'claudecode-omc/dist/testing/generators/react.js';
import { generateNodeJsTest } from 'claudecode-omc/dist/testing/generators/nodejs.js';
import { generatePythonTest } from 'claudecode-omc/dist/testing/generators/python.js';
import { generateGoTest } from 'claudecode-omc/dist/testing/generators/go.js';
import { generateRustTest } from 'claudecode-omc/dist/testing/generators/rust.js';
import { scoreTestQuality } from 'claudecode-omc/dist/testing/analyzers/quality-scorer.js';
```

#### 步骤 3：实现测试生成流程

```typescript
async function generateTestForFile(filePath: string) {
  // 1. 检测技术栈
  const stack = await detectTechStack(process.cwd());

  // 2. 读取源代码
  const code = await fs.readFile(filePath, 'utf-8');

  // 3. 分析复杂度
  const complexity = await analyzeComplexity({ code, filePath });

  // 4. 根据语言选择生成器
  if (filePath.endsWith('.tsx')) {
    return generateReactTest({
      filePath, code,
      testFramework: stack.frontend?.testFramework || 'vitest'
    });
  }
  if (filePath.endsWith('.ts')) {
    return generateNodeJsTest({
      filePath, code,
      testFramework: stack.backend?.testFramework || 'vitest'
    });
  }
  if (filePath.endsWith('.py')) {
    return generatePythonTest({
      filePath, code,
      testFramework: stack.backend?.testFramework || 'pytest'
    });
  }
  // ... 其他语言
}
```

#### 步骤 4：集成到 CI/CD

```typescript
import { generateGitHubActionsWorkflow } from 'claudecode-omc/dist/testing/integrations/cicd.js';

const workflow = await generateGitHubActionsWorkflow({
  language: 'nodejs',
  coverage: true,
  artifacts: true,
});
await fs.writeFile('.github/workflows/test.yml', workflow);
```

### 自定义检测器

如果需要支持新的语言或框架：

```typescript
// my-detector.ts
import type { TechStack } from 'claudecode-omc/dist/testing/types.js';

export async function detectFromMyConfig(config: any): Promise<TechStack> {
  const stack: TechStack = {};

  // 检测前端框架
  if (config.dependencies?.['my-framework']) {
    stack.frontend = {
      framework: 'react',  // 映射到已知框架
      testFramework: config.devDependencies?.vitest ? 'vitest' : 'jest',
    };
  }

  // 检测后端
  if (config.dependencies?.['my-server']) {
    stack.backend = {
      language: 'nodejs',
      testFramework: 'vitest',
    };
  }

  return stack;
}
```

### 自定义生成器

```typescript
// my-generator.ts
export async function generateMyFrameworkTest(options: {
  filePath: string;
  code: string;
  testFramework: string;
}): Promise<{ testFilePath: string; testCode: string }> {
  const { filePath, code, testFramework } = options;

  // 1. 解析源代码，提取函数/类
  const functions = extractFunctions(code);

  // 2. 生成测试文件路径
  const testFilePath = filePath.replace(/\.ts$/, '.test.ts');

  // 3. 生成测试代码
  const testCode = `
import { describe, it, expect } from '${testFramework}';
import { ${functions.join(', ')} } from './${path.basename(filePath, '.ts')}';

describe('${path.basename(filePath, '.ts')}', () => {
  ${functions.map(fn => `
  it('${fn} works correctly', () => {
    // TODO: Add test cases
    expect(${fn}).toBeDefined();
  });`).join('\n')}
});
`;

  return { testFilePath, testCode };
}
```

