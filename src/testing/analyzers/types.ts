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

export interface CoverageGap {
  file: string;
  startLine: number;
  endLine: number;
  reason: string;
  codeSnippet?: string;
}

export interface GapAnalysisResult {
  gaps: CoverageGap[];
  totalGaps: number;
}
